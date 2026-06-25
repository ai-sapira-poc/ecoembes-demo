"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, X, Send, ArrowRight, Sparkles } from "lucide-react";
import type { ChatMensaje, Hallazgo } from "@/data/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatEUR } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
function Bubble({ msg, agente }: { msg: ChatMensaje; agente: string }) {
  const isAgente = msg.de === "agente";

  if (isAgente) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-canvas px-3.5 py-2.5 shadow-sm">
          <p className="mb-0.5 flex items-center gap-1 text-[11px] font-bold text-brand-dark">
            <Sparkles className="h-3 w-3" /> {agente.split("·")[0].trim()}
          </p>
          <p className="text-[13.5px] leading-snug text-ink-soft">{msg.texto}</p>
          <p className="mt-1 text-right text-[10px] text-muted">{msg.hora}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-soft px-3.5 py-2.5 text-ink shadow-sm">
        <p className="text-[13.5px] leading-snug">{msg.texto}</p>
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
  "Perfecto. Os dejo el borrador de la declaración complementaria ya cumplimentado con la tarifa PEAD correcta; solo tenéis que validarlo desde el portal.",
  "Genial. Si te surge cualquier duda con la corrección, sigo por aquí para ayudarte. Tenéis hasta el 30 de junio, con margen de sobra.",
];

function ChatPane({
  mensajes,
  agente,
  declarante,
}: {
  mensajes: ChatMensaje[];
  agente: string;
  declarante: string;
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
            Agente de caso · en línea
          </p>
        </div>
      </header>

      {/* Thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-canvas/40 px-4 py-4">
        <p className="mx-auto mb-4 w-fit rounded-full bg-canvas px-3 py-1 text-[11px] text-muted">
          Conversación segura con tu agente de caso
        </p>

        <div className="space-y-2">
          {visible.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Bubble msg={m} agente={agente} />
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-canvas px-4 py-3 shadow-sm">
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
// Info pane — declaration summary + bulleted findings
// ─────────────────────────────────────────────────────────────────────────────
function InfoPane({
  declaracionId,
  periodo,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  hallazgos,
}: {
  declaracionId: string;
  periodo: number | undefined;
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  hallazgos: Hallazgo[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas px-5 py-6 md:px-7 md:py-7">
      {/* Declaration summary */}
      <section>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          <FileText className="h-3.5 w-3.5" />
          Tu declaración · {declaracionId}
        </div>

        <div className="mt-3 rounded-xl border border-line bg-surface p-4">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted">Período</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            {periodo != null ? `Período ${periodo}` : "—"}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-muted">Cuota declarada</p>
              <p className="mt-0.5 text-base font-semibold tabular-nums text-ink-soft line-through decoration-muted/50">
                {formatEUR(cuotaDeclaradaEur)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <div className="min-w-0">
              <p className="text-[11px] text-muted">Cuota corregida</p>
              <p className="mt-0.5 text-base font-semibold tabular-nums text-brand-dark">
                {formatEUR(cuotaCalculadaEur)}
              </p>
            </div>
          </div>
        </div>
      </section>

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
                    Impacto en cuota: {formatEUR(h.impactoEur)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-screen overlay
// ─────────────────────────────────────────────────────────────────────────────
export function ClientPortalFull({
  empresa,
  declaracionId,
  periodo,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  hallazgos,
  mensajes,
  agente,
  declarante,
  onClose,
}: ClientPortalFullProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={`Portal del declarante · ${empresa}`}
    >
      {/* Top bar — full width */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3.5 md:px-7">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-dark ring-1 ring-brand/15">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              Portal del declarante · {empresa}
            </p>
            <p className="text-[11px] text-muted">Acceso seguro por enlace</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar el portal"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Two-pane body — fills the rest of the viewport */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <div className="flex min-h-0 shrink-0 flex-col border-b border-line md:w-[26rem] md:flex-1 md:max-w-lg md:border-b-0 md:border-r lg:w-[30rem]">
          <InfoPane
            declaracionId={declaracionId}
            periodo={periodo}
            cuotaDeclaradaEur={cuotaDeclaradaEur}
            cuotaCalculadaEur={cuotaCalculadaEur}
            hallazgos={hallazgos}
          />
        </div>
        <div className="flex min-h-[24rem] flex-1 flex-col md:min-h-0 md:flex-[1.4]">
          <ChatPane mensajes={mensajes} agente={agente} declarante={declarante} />
        </div>
      </div>
    </motion.div>
  );
}
