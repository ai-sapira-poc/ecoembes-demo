"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, X, Send, ArrowRight } from "lucide-react";
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
// Chat bubble + conversation pane
// ─────────────────────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: ChatMensaje }) {
  const isAgente = msg.de === "agente";
  return (
    <div className={cn("flex w-full gap-2.5", isAgente ? "justify-start" : "justify-end")}>
      {isAgente && (
        <span className="grid h-7 w-7 shrink-0 place-items-center self-end rounded-full bg-brand-soft text-[10px] font-semibold text-brand-dark ring-1 ring-brand/15">
          {initials(msg.autor)}
        </span>
      )}
      <div className={cn("flex max-w-[78%] flex-col", isAgente ? "items-start" : "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isAgente
              ? "rounded-bl-sm bg-canvas text-ink-soft ring-1 ring-line"
              : "rounded-br-sm bg-brand text-white"
          )}
        >
          {msg.texto}
        </div>
        <p className={cn("mt-1 text-[10px] text-muted", isAgente ? "text-left" : "text-right")}>
          {msg.autor.split("·")[0].trim()} · {msg.hora}
        </p>
      </div>
      {!isAgente && (
        <span className="grid h-7 w-7 shrink-0 place-items-center self-end rounded-full bg-surface text-[10px] font-semibold text-ink-soft ring-1 ring-line">
          {initials(msg.autor)}
        </span>
      )}
    </div>
  );
}

function nowHora(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (shown >= mensajes.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 1100);
    return () => clearTimeout(t);
  }, [shown, mensajes.length]);

  const scriptedDone = shown >= mensajes.length;
  const typing = !scriptedDone;
  const visible = [...mensajes.slice(0, shown), ...extra];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, extra.length, typing]);

  const handleSend = () => {
    const texto = draft.trim();
    if (!texto) return;
    seq.current += 1;
    setExtra((prev) => [
      ...prev,
      {
        id: `live-${seq.current}`,
        de: "cliente",
        autor: declarante,
        texto,
        hora: nowHora(),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      {/* Agent header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-5 py-3.5">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
          {initials(agente)}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-ok" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{agente.split("·")[0].trim()}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-ok">
            <span
              className="h-1.5 w-1.5 rounded-full bg-ok"
              style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
            />
            Agente de caso asignado · en línea
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-5">
        {visible.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
              className="flex items-center gap-1.5 pl-10"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted/60"
                  style={{ animation: `soft-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line px-4 py-3">
        <div className="flex items-end gap-2 rounded-xl border border-line bg-canvas px-3 py-2 focus-within:ring-2 focus-within:ring-brand/40">
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
            placeholder="Escribe un mensaje a tu agente…"
            aria-label="Mensaje para el agente de caso"
            className="min-w-0 flex-1 bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Enviar mensaje"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-white transition-all duration-150 hover:bg-brand-dark active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Portal del declarante · ${empresa}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.99, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_70px_-20px_rgba(20,32,26,0.45)]"
      >
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3.5">
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
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        {/* Two-pane body */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="flex min-h-0 flex-1 flex-col border-b border-line md:max-w-md md:border-b-0 md:border-r">
            <InfoPane
              declaracionId={declaracionId}
              periodo={periodo}
              cuotaDeclaradaEur={cuotaDeclaradaEur}
              cuotaCalculadaEur={cuotaCalculadaEur}
              hallazgos={hallazgos}
            />
          </div>
          <div className="flex min-h-0 flex-[1.3] flex-col">
            <ChatPane mensajes={mensajes} agente={agente} declarante={declarante} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
