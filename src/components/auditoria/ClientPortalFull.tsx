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
import { TextoFormateado } from "@/components/auditoria/textoFormateado";
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

function initials(name: string): string {
  const parts = name.split(/[\s·]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export interface ClientPortalFullProps {
  empresa: string;
  declaracionId: string;
  periodo: number | undefined;
  ejercicio: number;
  /** Fecha de emisión del requerimiento, formateada (es-ES). */
  emitidoEl: string;
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
  // Comfortable reading pace: ~2.2s per message, with the typing indicator on
  // for the last ~1.3s before each new message appears.
  const REVEAL_MS = 2200;
  const TYPING_LEAD_MS = 1300;
  const [shown, setShown] = useState(1);
  const [extra, setExtra] = useState<ChatMensaje[]>([]);
  const [draft, setDraft] = useState("");
  const [scriptedTypingNext, setScriptedTypingNext] = useState(false);
  const [agenteEscribiendo, setAgenteEscribiendo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shown >= mensajes.length) return;
    // Show the typing indicator for the lead-in before the next message lands.
    const typeAt = setTimeout(() => setScriptedTypingNext(true), REVEAL_MS - TYPING_LEAD_MS);
    const revealAt = setTimeout(() => setShown((n) => n + 1), REVEAL_MS);
    return () => {
      clearTimeout(typeAt);
      clearTimeout(revealAt);
      // Reset the lead-in indicator for the next message (runs before re-run).
      setScriptedTypingNext(false);
    };
  }, [shown, mensajes.length]);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  const scriptedTyping = shown < mensajes.length;
  const typing = (scriptedTyping && scriptedTypingNext) || agenteEscribiendo;
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
    }, TYPING_LEAD_MS);
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
// Landing body — an official "Requerimiento de subsanación" notice for the
// declaración. Formal administrative register (es-ES, "usted"), document-grade.
// ─────────────────────────────────────────────────────────────────────────────
function DatoFila({
  label,
  children,
  emphasis,
}: {
  label: string;
  children: ReactNode;
  emphasis?: "brand" | "warning";
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="text-xs text-muted sm:w-52 sm:shrink-0">{label}</dt>
      <dd
        className={cn(
          "text-sm tabular-nums",
          emphasis === "brand"
            ? "font-semibold text-brand-dark"
            : emphasis === "warning"
              ? "font-bold text-warning"
              : "text-ink"
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function LandingBody({
  declaracionId,
  periodo,
  ejercicio,
  emitidoEl,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  formatos,
  flaggedComponenteIds,
}: {
  declaracionId: string;
  periodo: number | undefined;
  ejercicio: number;
  emitidoEl: string;
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  formatos: Formato[];
  flaggedComponenteIds?: string[];
}) {
  const delta = cuotaCalculadaEur - cuotaDeclaradaEur;
  const periodoRef = periodo != null ? `Período ${periodo}` : "Período —";

  return (
    <div className="w-full px-5 py-7 md:px-10 md:py-9">
      {/* 1 — Notice header */}
      <section className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line pb-5">
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight text-ink text-balance md:text-2xl">
            Requerimiento de subsanación
          </h2>
          <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
            Expediente {declaracionId} · Declaración SIG · {periodoRef} · Ejercicio {ejercicio}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted">Emitido el {emitidoEl}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-warning/30 bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          Requiere subsanación
        </span>
      </section>

      {/* 2 — Formal statement */}
      <section className="mt-5 max-w-2xl">
        <p className="text-sm leading-relaxed text-ink-soft text-pretty">
          En la revisión de su declaración SIG correspondiente al {periodoRef.toLowerCase()} se ha
          identificado una discrepancia en la tarifa aplicada a uno de los formatos declarados. A
          continuación se detallan los hechos y la subsanación requerida.
        </p>
      </section>

      {/* 3 — Detalle de la incidencia (official finding, definition block) */}
      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Detalle de la incidencia</h3>
        <dl className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          <DatoFila label="Formato afectado">
            <span className="font-sans">Envase Gel Ducha PEAD 400 ml</span>{" "}
            <span className="text-muted">(línea 005-L4)</span>
          </DatoFila>
          <DatoFila label="Material declarado">
            <span className="font-sans">PEAD</span>
          </DatoFila>
          <DatoFila label="Tarifa aplicada">
            <span className="font-sans">Madera</span> — 0,0490 €/kg
          </DatoFila>
          <DatoFila label="Tarifa vigente (correcta)" emphasis="brand">
            <span className="font-sans">PEAD</span> — 0,3890 €/kg
          </DatoFila>
          <DatoFila label="Unidades declaradas">360.000 ud · 25.200 kg</DatoFila>
          <DatoFila label="Diferencia de tarifa">0,3400 €/kg</DatoFila>
          <DatoFila label="Impacto en la cuota" emphasis="warning">
            +{formatEurGrouped(delta)}
          </DatoFila>
        </dl>
      </section>

      {/* 4 — Efecto sobre la cuota */}
      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Efecto sobre la cuota</h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2 text-sm">
          <span className="text-muted">Cuota declarada</span>
          <span className="font-semibold tabular-nums text-ink-soft line-through decoration-muted/40">
            {formatEurGrouped(cuotaDeclaradaEur)}
          </span>
          <ArrowRight className="h-4 w-4 self-center text-muted" aria-hidden />
          <span className="text-muted">Cuota corregida</span>
          <span className="font-semibold tabular-nums text-ink">
            {formatEurGrouped(cuotaCalculadaEur)}
          </span>
          {delta !== 0 && (
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-muted">·</span>
              <span className="text-muted">Diferencia</span>
              <span className="font-semibold tabular-nums text-warning">
                {delta > 0 ? "+" : ""}
                {formatEurGrouped(delta)}
              </span>
            </span>
          )}
        </div>
      </section>

      {/* 5 — Declaración presentada (real tabular data, full width) */}
      {formatos.length > 0 && (
        <section className="mt-8">
          <h3 className="text-sm font-semibold text-ink">Declaración presentada</h3>
          <p className="mt-1 text-sm text-muted">La línea afectada aparece resaltada.</p>
          <div className="mt-3">
            <FormatosBreakdown
              formatos={formatos}
              flaggedComponenteIds={flaggedComponenteIds}
            />
          </div>
        </section>
      )}

      {/* 6 — Subsanación requerida */}
      <section className="mt-8 border-t border-line pt-6">
        <h3 className="text-sm font-semibold text-ink">Subsanación requerida</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft text-pretty">
          Para regularizar su declaración deberá presentar una declaración complementaria del{" "}
          {periodoRef.toLowerCase()} aplicando la tarifa vigente de PEAD en la línea indicada. El
          plazo de subsanación finaliza el 30 de junio de 2025. Su agente asignado ha preparado el
          borrador correspondiente.
        </p>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portal — fills the Step 3 right column (not an overlay): the left prose rail
// and the StepBar navigation stay visible. Opens as an official "Requerimiento
// de subsanación" notice; the chat opens as a floating window over the
// full-width landing from the single "Chatear con su agente asignado" button.
// Volver (ArrowLeft) / Esc returns to the operator (Esc closes the chat first).
// ─────────────────────────────────────────────────────────────────────────────
export function ClientPortalFull({
  empresa,
  declaracionId,
  periodo,
  ejercicio,
  emitidoEl,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
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
            declaracionId={declaracionId}
            periodo={periodo}
            ejercicio={ejercicio}
            emitidoEl={emitidoEl}
            cuotaDeclaradaEur={cuotaDeclaradaEur}
            cuotaCalculadaEur={cuotaCalculadaEur}
            formatos={formatos}
            flaggedComponenteIds={flaggedComponenteIds}
          />
        </div>

        {/* Floating chat FAB — the single trigger; shown when the chat is closed */}
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
              aria-label="Chatear con su agente asignado"
            >
              <MessageSquare className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating chat window (md+) / full-height sheet over a scrim (mobile).
            Opened from the floating chat button; collapses back to it on close. */}
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
