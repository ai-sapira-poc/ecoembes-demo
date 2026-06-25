"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  ArrowLeft,
  Send,
  ArrowRight,
  Sparkles,
  MessageSquare,
  X,
  AlertTriangle,
  Layers,
} from "lucide-react";
import type { ChatMensaje, Hallazgo, Formato } from "@/data/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Logo } from "@/components/layout/Logo";
import { FormatosBreakdown } from "@/components/auditoria/FormatosBreakdown";
import { cn } from "@/lib/utils";

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

const severidadDot: Record<Hallazgo["severidad"], string> = {
  alta: "bg-danger",
  media: "bg-warning",
  baja: "bg-muted",
};

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
  empresa,
  declaracionId,
  periodo,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  hallazgos,
  formatos,
  flaggedComponenteIds,
  onOpenChat,
}: {
  empresa: string;
  declaracionId: string;
  periodo: number | undefined;
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  hallazgos: Hallazgo[];
  formatos: Formato[];
  flaggedComponenteIds?: string[];
  onOpenChat: () => void;
}) {
  const delta = cuotaCalculadaEur - cuotaDeclaradaEur;

  return (
    <div className="w-full px-5 py-6 md:px-8 md:py-8">
      {/* Welcome + status */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Portal del declarante
          </p>
          <h2 className="mt-1 text-xl font-bold leading-tight text-ink text-balance">
            Hola, {empresa}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted" />
              Su declaración SIG
            </span>
            <span className="text-muted">·</span>
            <span>Período {periodo != null ? periodo : "—"}</span>
            <span className="text-muted">·</span>
            <span className="font-mono text-xs text-muted">{declaracionId}</span>
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold text-warning">
          <AlertTriangle className="h-3 w-3" />
          Requiere subsanación
        </span>
      </section>

      {/* Cuota summary */}
      <section className="mt-6 rounded-xl border border-line bg-canvas p-4 md:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Resumen de la cuota
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted">Cuota declarada</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink-soft line-through decoration-muted/50">
              {formatEurGrouped(cuotaDeclaradaEur)}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0">
            <p className="text-[11px] text-muted">Cuota corregida</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-brand-dark">
              {formatEurGrouped(cuotaCalculadaEur)}
            </p>
          </div>
          {delta !== 0 && (
            <div className="min-w-0 sm:ml-auto sm:text-right">
              <p className="text-[11px] text-muted">Diferencia</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-warning">
                {delta > 0 ? "+" : ""}
                {formatEurGrouped(delta)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Declared formats */}
      {formatos.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            <Layers className="h-3.5 w-3.5" />
            Formatos declarados
          </div>
          <p className="mt-1 text-xs text-muted text-pretty">
            La línea afectada aparece resaltada.
          </p>
          <div className="mt-3">
            <FormatosBreakdown
              formatos={formatos}
              flaggedComponenteIds={flaggedComponenteIds}
            />
          </div>
        </section>
      )}

      {/* Findings as scannable bullets */}
      {hallazgos.length > 0 && (
        <section className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Lo que hemos detectado
          </p>
          <ul className="mt-3 space-y-2.5">
            {hallazgos.map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <span
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", severidadDot[h.severidad])}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{h.tipo}</p>
                    <SeverityBadge severidad={h.severidad} className="shrink-0" />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft leading-relaxed text-pretty">
                    {h.descripcion}
                  </p>
                  <p className="mt-2 text-sm font-semibold tabular-nums text-brand-dark">
                    Impacto en la cuota: {formatEurGrouped(h.impactoEur)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Primary CTA */}
      <section className="mt-7 rounded-xl border border-brand/25 bg-brand-soft/40 px-5 py-5 text-center">
        <p className="text-sm font-semibold text-ink">¿Necesita ayuda para subsanarlo?</p>
        <p className="mt-1 text-xs text-ink-soft text-pretty">
          Su agente de soporte le acompaña paso a paso para presentar la corrección.
        </p>
        <button
          type="button"
          onClick={onOpenChat}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <MessageSquare className="h-4 w-4" />
          Chatear con tu agente de soporte
        </button>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portal — fills the Step 3 right column (not an overlay): the left prose rail
// and the StepBar navigation stay visible. Opens as a self-service landing for
// the declaración; the chat is a right-docked panel opened from the CTA.
// Volver (ArrowLeft) / Esc returns to the operator.
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
            <p className="truncate text-sm font-semibold text-ink">Portal del declarante</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="h-3 w-3" />
              {empresa} · Acceso seguro por enlace
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
            empresa={empresa}
            declaracionId={declaracionId}
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
