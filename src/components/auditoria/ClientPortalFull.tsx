"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ArrowLeft,
  Send,
  ArrowRight,
  Sparkles,
  MessageSquare,
  X,
  AlertTriangle,
} from "lucide-react";
import type { ChatMensaje, Hallazgo, Formato } from "@/data/types";
import { Logo } from "@/components/layout/Logo";
import { FormatosBreakdown } from "@/components/auditoria/FormatosBreakdown";

// es-ES Intl only groups at 5+ digits by default, so 4-digit amounts like
// 8568 render as "8568 €". Force grouping so they read "8.568 €" like the
// larger cuotas. (Local — does not alter the shared formatEUR used elsewhere.)
const eurGrouped = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: "always",
});
const formatEurGrouped = (n: number) => eurGrouped.format(n);

function initials(name: string): string {
  const parts = name.split(/[\s·]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export interface ClientPortalFullProps {
  empresa: string;
  declaracionId: string;
  periodo: number | undefined;
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  hallazgos: Hallazgo[];
  formatos: Formato[];
  /** Componente(s) afectado(s) a resaltar en la tabla de formatos. */
  flaggedComponenteIds?: string[];
  mensajes: ChatMensaje[];
  agente: string;
  /** Nombre del declarante para los mensajes del composer. */
  declarante: string;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Light text formatting (no markdown lib): **bold** inline + "• "/"- " bullets.
// ─────────────────────────────────────────────────────────────────────────────
function renderInline(text: string, keyPrefix: string) {
  // Split on **bold** spans; odd indices are the emphasized parts.
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-bold text-ink">
        {part}
      </strong>
    ) : (
      <span key={`${keyPrefix}-t${i}`}>{part}</span>
    )
  );
}

function TextoFormateado({ texto }: { texto: string }) {
  const lines = texto.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={`ul-${key++}`} className="my-1 space-y-0.5">
        {items.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span aria-hidden className="select-none">
              •
            </span>
            <span className="min-w-0">{renderInline(b, `li-${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const m = /^\s*[•-]\s+(.*)$/.exec(line);
    if (m) {
      bullets.push(m[1]);
    } else {
      flushBullets();
      if (line.trim() !== "") {
        blocks.push(
          <p key={`p-${key++}`}>{renderInline(line, `p-${key}`)}</p>
        );
      }
    }
  }
  flushBullets();

  return <div className="space-y-1.5">{blocks}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat bubble + conversation pane — modelled on Nuzoa's PantallaVisitaChat,
// mapped to our tokens (dark header, soft-tint client bubble, reserve-the-green).
// ─────────────────────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: ChatMensaje }) {
  const isAgente = msg.de === "agente";

  if (isAgente) {
    // Agent identity lives in the chat header — no per-bubble name, so
    // consecutive turns read as one sender, not separate people.
    return (
      <div className="flex items-end justify-start gap-2">
        <span className="mb-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-dark ring-1 ring-brand/15">
          <Sparkles className="h-3 w-3" />
        </span>
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-canvas px-3.5 py-2.5 shadow-sm">
          <div className="text-[13.5px] leading-snug text-ink-soft">
            <TextoFormateado texto={msg.texto} />
          </div>
          <p className="mt-1 text-right text-[10px] text-muted">{msg.hora}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-soft px-3.5 py-2.5 text-ink shadow-sm">
        <div className="text-[13.5px] leading-snug">
          <TextoFormateado texto={msg.texto} />
        </div>
        <p className="mt-1 text-right text-[10px] text-muted">{msg.hora}</p>
      </div>
    </div>
  );
}

function nowHora(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// Canned, on-topic agent replies (frontend-only — no API). Cycled per client turn.
const respuestasAgente = [
  "Le confirmo que el borrador de la declaración complementaria, con la tarifa PEAD ya aplicada, queda disponible en el portal para su validación.",
  "Quedo a su disposición para cualquier consulta sobre la corrección. Le recuerdo que el plazo de presentación finaliza el 30 de junio.",
];

function ChatPane({
  mensajes,
  agente,
  declarante,
  onMinimize,
}: {
  mensajes: ChatMensaje[];
  agente: string;
  declarante: string;
  onMinimize: () => void;
}) {
  // Staged reveal of the scripted conversation, then live composer appends.
  const [shown, setShown] = useState(1);
  const [extra, setExtra] = useState<ChatMensaje[]>([]);
  const [draft, setDraft] = useState("");
  const [agenteEscribiendo, setAgenteEscribiendo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shown >= mensajes.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 1100);
    return () => clearTimeout(t);
  }, [shown, mensajes.length]);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  const scriptedTyping = shown < mensajes.length;
  const typing = scriptedTyping || agenteEscribiendo;
  const visible = [...mensajes.slice(0, shown), ...extra];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, extra.length, typing]);

  const handleSend = () => {
    const texto = draft.trim();
    if (!texto || scriptedTyping) return;
    seq.current += 1;
    const turno = seq.current;
    setExtra((prev) => [
      ...prev,
      { id: `cli-${turno}`, de: "cliente", autor: declarante, texto, hora: nowHora() },
    ]);
    setDraft("");

    // Scripted, on-topic agent reply (no network).
    setAgenteEscribiendo(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const reply = respuestasAgente[(turno - 1) % respuestasAgente.length];
      setExtra((prev) => [
        ...prev,
        { id: `ag-${turno}`, de: "agente", autor: agente, texto: reply, hora: nowHora() },
      ]);
      setAgenteEscribiendo(false);
    }, 950);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Agent header — dark bar (our restrained equivalent of Nuzoa's navy) */}
      <header className="flex shrink-0 items-center gap-2.5 bg-brand-darker px-4 py-3.5 text-white">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
          {initials(agente)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold leading-tight">
            {agente.split("·")[0].trim()}
          </p>
          <p className="flex items-center gap-1.5 text-[11.5px] text-white/75">
            <span
              className="h-1.5 w-1.5 rounded-full bg-white/90"
              style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
            />
            Agente de soporte · en línea
          </p>
        </div>
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Cerrar la conversación"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </header>

      {/* Thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-canvas/40 px-4 py-4">
        <p className="mx-auto mb-4 w-fit rounded-full bg-canvas px-3 py-1 text-[11px] text-muted">
          Conversación segura con su agente de soporte
        </p>

        <div className="space-y-2">
          {visible.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Bubble msg={m} />
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-end justify-start gap-2"
              >
                <span className="mb-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-dark ring-1 ring-brand/15">
                  <Sparkles className="h-3 w-3" />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-canvas px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted/70"
                      style={{ animation: `soft-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer footer */}
      <div className="shrink-0 border-t border-line bg-surface px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe un mensaje…"
            aria-label="Mensaje para el agente de caso"
            className="h-10 min-w-0 flex-1 rounded-full border border-line bg-canvas px-4 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || scriptedTyping}
            aria-label="Enviar mensaje"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-all duration-150 hover:bg-brand-dark active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing body — the self-service portal page for this declaración.
// ─────────────────────────────────────────────────────────────────────────────
function LandingBody({
  periodo,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  hallazgos,
  formatos,
  flaggedComponenteIds,
  onOpenChat,
}: {
  periodo: number | undefined;
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  hallazgos: Hallazgo[];
  formatos: Formato[];
  flaggedComponenteIds?: string[];
  onOpenChat: () => void;
}) {
  const delta = cuotaCalculadaEur - cuotaDeclaradaEur;
  const principal = hallazgos[0];
  const periodoTxt = periodo != null ? `del período ${periodo}` : "presentada";

  return (
    <div className="w-full px-5 py-7 md:px-10 md:py-9">
      {/* 1 — Lede: status + plain-language situation */}
      <section className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          Requiere subsanación
        </span>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-ink text-balance">
          Hemos revisado su declaración SIG {periodoTxt} y hay una incidencia que conviene
          corregir.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft text-pretty">
          Es un ajuste sencillo. A continuación tiene el detalle de la incidencia, el efecto
          sobre su cuota y los formatos declarados. Su agente de soporte puede ayudarle a
          presentar la corrección.
        </p>
      </section>

      {/* 2 — The incidence in focus */}
      {principal && (
        <section className="mt-8">
          <h3 className="text-base font-semibold text-ink">{principal.tipo}</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft text-pretty">
            {principal.descripcion}
          </p>

          <div className="mt-4 flex flex-wrap items-stretch gap-3">
            <div className="rounded-xl border border-line bg-surface px-4 py-3">
              <p className="text-xs text-muted">Tarifa aplicada</p>
              <p className="mt-0.5 text-sm font-semibold text-ink-soft">Madera</p>
              <p className="text-sm tabular-nums text-ink-soft">0,049 €/kg</p>
            </div>
            <div className="flex items-center text-muted" aria-hidden>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="rounded-xl border border-brand/30 bg-brand-soft/40 px-4 py-3">
              <p className="text-xs text-muted">Tarifa correcta</p>
              <p className="mt-0.5 text-sm font-semibold text-brand-dark">PEAD</p>
              <p className="text-sm font-semibold tabular-nums text-brand-dark">0,389 €/kg</p>
            </div>
            <div className="flex flex-col justify-center sm:ml-auto sm:text-right">
              <p className="text-xs text-muted">Impacto en la cuota</p>
              <p className="text-xl font-bold tabular-nums text-warning">
                +{formatEurGrouped(principal.impactoEur)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3 — Cuota summary: one compact figure row */}
      <section className="mt-8 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-sm">
          <span className="text-muted">Cuota declarada</span>
          <span className="font-semibold tabular-nums text-ink-soft line-through decoration-muted/40">
            {formatEurGrouped(cuotaDeclaradaEur)}
          </span>
          <ArrowRight className="h-4 w-4 self-center text-muted" aria-hidden />
          <span className="text-muted">corregida</span>
          <span className="font-semibold tabular-nums text-ink">
            {formatEurGrouped(cuotaCalculadaEur)}
          </span>
          {delta !== 0 && (
            <span className="ml-1 inline-flex items-baseline gap-1.5">
              <span className="text-muted">·</span>
              <span className="font-semibold tabular-nums text-warning">
                {delta > 0 ? "+" : ""}
                {formatEurGrouped(delta)}
              </span>
            </span>
          )}
        </div>
      </section>

      {/* 4 — Formatos declarados (real tabular data, full width) */}
      {formatos.length > 0 && (
        <section className="mt-8">
          <h3 className="text-base font-semibold text-ink">Formatos declarados</h3>
          <p className="mt-1 text-sm text-muted">La línea afectada aparece resaltada.</p>
          <div className="mt-3">
            <FormatosBreakdown
              formatos={formatos}
              flaggedComponenteIds={flaggedComponenteIds}
            />
          </div>
        </section>
      )}

      {/* 5 — Action */}
      <section className="mt-9 flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={onOpenChat}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <MessageSquare className="h-4 w-4" />
          Chatear con tu agente de soporte
        </button>
        <p className="text-xs text-muted">
          Le atiende un agente de soporte que le acompaña paso a paso para presentar la
          corrección.
        </p>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portal — fills the Step 3 right column (not an overlay): the left prose rail
// and the StepBar navigation stay visible. Opens as a self-service landing for
// the declaración; the chat is a floating widget (CTA + bottom-right FAB) over
// the full-width landing. Volver (ArrowLeft) / Esc returns to the operator.
// ─────────────────────────────────────────────────────────────────────────────
export function ClientPortalFull({
  empresa,
  declaracionId,
  periodo,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  hallazgos,
  formatos,
  flaggedComponenteIds,
  mensajes,
  agente,
  declarante,
  onClose,
}: ClientPortalFullProps) {
  const [chatOpen, setChatOpen] = useState(false);

  // Esc: close the chat first if open, otherwise return to the operator.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (chatOpen) setChatOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, onClose]);

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_2px_20px_-6px_rgba(20,32,26,0.18)]"
      aria-label={`Portal del declarante · ${empresa}`}
    >
      {/* Branded top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo variant="horizontal" tone="color" className="h-6 w-auto shrink-0" />
          <span className="hidden h-6 w-px shrink-0 bg-line sm:block" aria-hidden />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-ink">
              Portal del declarante · {empresa}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="h-3 w-3" />
              <span className="font-mono">{declaracionId}</span> · Acceso seguro por enlace
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </header>

      {/* Body: full-width landing; chat is a floating widget over it */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Landing — always full width; never reflows for the chat */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-surface">
          <LandingBody
            periodo={periodo}
            cuotaDeclaradaEur={cuotaDeclaradaEur}
            cuotaCalculadaEur={cuotaCalculadaEur}
            hallazgos={hallazgos}
            formatos={formatos}
            flaggedComponenteIds={flaggedComponenteIds}
            onOpenChat={() => setChatOpen(true)}
          />
        </div>

        {/* Floating chat FAB (live-chat widget) — shown when the window is closed */}
        <AnimatePresence>
          {!chatOpen && (
            <motion.button
              key="fab"
              type="button"
              onClick={() => setChatOpen(true)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_30px_-8px_rgba(10,88,39,0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Chatear con tu agente de soporte"
            >
              <MessageSquare className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating chat window (md+) / full-height sheet over a scrim (mobile) */}
        <AnimatePresence>
          {chatOpen && (
            <>
              <motion.div
                key="scrim"
                className="absolute inset-0 z-20 bg-ink/20 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setChatOpen(false)}
                aria-hidden
              />
              <motion.aside
                key="chat"
                className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-surface md:inset-auto md:bottom-5 md:right-5 md:h-[560px] md:max-h-[80%] md:w-[380px] md:rounded-2xl md:border md:border-line md:shadow-[0_20px_50px_-12px_rgba(20,32,26,0.45)]"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                aria-label="Conversación con el agente de soporte"
              >
                <ChatPane
                  mensajes={mensajes}
                  agente={agente}
                  declarante={declarante}
                  onMinimize={() => setChatOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
