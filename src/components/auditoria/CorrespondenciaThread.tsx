"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Mail, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailMensaje } from "@/data/types";

export interface CorrespondenciaThreadProps {
  mensajes: EmailMensaje[];
  empresaNombre: string;
  animateEntry?: boolean;
  bandejaLabel?: string;
  senderDomain?: string;
  showThreadSummary?: boolean;
  /** Stack = full-width inbox rows; chat = left/right bubbles (1 in + 1 out). */
  layout?: "stack" | "chat";
  /** Render without the outer Card chrome (own border + bandeja header) —
   *  for embedding inside a platform <Card>. */
  frameless?: boolean;
}

/** First outbound + first inbound — the core exchange for demo steps. */
export function pickExchangePair(mensajes: EmailMensaje[]): EmailMensaje[] {
  const outbound = mensajes.find((m) => m.de === "agente");
  const inbound = mensajes.find((m) => m.de === "cliente");
  return [outbound, inbound].filter((m): m is EmailMensaje => !!m);
}

function initials(name: string): string {
  const parts = name.split(/[\s·]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatEmailDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function threadSubject(mensajes: EmailMensaje[]): string {
  const first = mensajes[0]?.asunto ?? "";
  return first.replace(/^RE:\s*/i, "");
}

function InboxMessage({
  msg,
  index,
  total,
  empresaNombre,
  senderDomain,
}: {
  msg: EmailMensaje;
  index: number;
  total: number;
  empresaNombre: string;
  senderDomain?: string;
}) {
  const isOutbound = msg.de === "agente";

  return (
    <div
      className={cn(
        "relative border-l-[3px]",
        index > 0 && "border-t border-line",
        isOutbound ? "border-l-muted/35 bg-canvas/70" : "border-l-info bg-surface"
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            isOutbound
              ? "bg-surface text-muted ring-1 ring-line"
              : "bg-info-soft text-info"
          )}
        >
          {isOutbound ? (
            <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
          ) : (
            <ArrowDownLeft className="h-3 w-3 shrink-0" aria-hidden />
          )}
          {isOutbound ? "Salida" : "Entrada"}
          <span className="font-normal normal-case tracking-normal opacity-80">
            · {formatEmailDate(msg.fecha)}
          </span>
        </span>
        {total > 1 && (
          <span className="text-[10px] tabular-nums text-muted">
            {index + 1} / {total}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 px-5 pt-1">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1",
            isOutbound
              ? "bg-surface text-ink-soft ring-line"
              : "bg-info-soft text-info ring-info/20"
          )}
        >
          {initials(msg.remitente)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{msg.remitente}</p>
          {isOutbound ? (
            <>
              <p className="mt-0.5 truncate text-xs text-muted">
                Para: Dpto. de Cumplimiento · {empresaNombre}
              </p>
              {senderDomain && (
                <p className="truncate text-xs text-muted">cumplimiento@{senderDomain}</p>
              )}
            </>
          ) : (
            <>
              <p className="mt-0.5 truncate text-xs text-muted">
                Para: Agente Auditor · Ecoembes
              </p>
              {senderDomain && (
                <p className="truncate text-xs text-muted">auditoría@ecoembes.es</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <p className="text-sm font-semibold text-ink">{msg.asunto}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft text-pretty">
          {msg.cuerpo}
        </p>
        {msg.adjuntos && msg.adjuntos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {msg.adjuntos.map((adj) => (
              <span
                key={adj}
                className="inline-flex items-center gap-1 rounded border border-line bg-surface px-2 py-0.5 text-[11px] text-muted"
              >
                <Paperclip className="h-3 w-3 shrink-0" />
                {adj}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({
  msg,
  empresaNombre,
  senderDomain,
}: {
  msg: EmailMensaje;
  empresaNombre: string;
  senderDomain?: string;
}) {
  const isOutbound = msg.de === "agente";

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-line px-5 py-4",
        isOutbound ? "bg-canvas" : "bg-surface"
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            isOutbound ? "text-muted" : "text-info"
          )}
        >
          {isOutbound ? (
            <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
          ) : (
            <ArrowDownLeft className="h-3 w-3 shrink-0" aria-hidden />
          )}
          {isOutbound ? "Salida" : "Entrada"}
        </span>
        <span className="text-[10px] text-muted">{formatEmailDate(msg.fecha)}</span>
      </div>

      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1",
            isOutbound
              ? "bg-surface text-ink-soft ring-line"
              : "bg-info-soft text-info ring-info/20"
          )}
        >
          {initials(msg.remitente)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{msg.remitente}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {isOutbound
              ? `Para: Dpto. de Cumplimiento · ${empresaNombre}`
              : "Para: Agente Auditor · Ecoembes"}
          </p>
          {senderDomain && (
            <p className="truncate text-xs text-muted">
              {isOutbound
                ? `cumplimiento@${senderDomain}`
                : "auditoría@ecoembes.es"}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-ink">{msg.asunto}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft text-pretty">
        {msg.cuerpo}
      </p>

      {msg.adjuntos && msg.adjuntos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {msg.adjuntos.map((adj) => (
            <span
              key={adj}
              className="inline-flex items-center gap-1 rounded border border-line bg-surface px-2 py-0.5 text-[11px] text-muted"
            >
              <Paperclip className="h-3 w-3 shrink-0" />
              {adj}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CorrespondenciaThread({
  mensajes,
  empresaNombre,
  animateEntry = true,
  bandejaLabel = "Expediente · trazabilidad de intercambios",
  senderDomain,
  showThreadSummary = true,
  layout = "stack",
  frameless = false,
}: CorrespondenciaThreadProps) {
  if (mensajes.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-5 py-4">
        <Mail className="h-4 w-4 shrink-0 text-muted" />
        <p className="text-sm text-muted">Sin correspondencia — no se han enviado consultas.</p>
      </div>
    );
  }

  const subject = threadSubject(mensajes);
  const firstDate = formatEmailDate(mensajes[0].fecha);
  const lastDate = formatEmailDate(mensajes[mensajes.length - 1].fecha);
  const dateRange =
    mensajes.length === 1 ? firstDate : `${firstDate} — ${lastDate}`;
  const salidas = mensajes.filter((m) => m.de === "agente").length;
  const entradas = mensajes.filter((m) => m.de === "cliente").length;
  const headerMeta =
    !showThreadSummary && mensajes.length === 1
      ? "Salida · Enviado"
      : layout === "chat"
        ? "1 salida · 1 entrada"
        : `${salidas} salida${salidas !== 1 ? "s" : ""} · ${entradas} entrada${entradas !== 1 ? "s" : ""}`;

  const body = (
    <>
      {!frameless && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5">
          <span className="flex items-center gap-2 text-xs text-muted">
            <Mail className="h-3.5 w-3.5" />
            {bandejaLabel}
          </span>
          <span className="text-[11px] text-muted">{headerMeta}</span>
        </div>
      )}

      {showThreadSummary && (
        <div className={cn("border-b border-line bg-canvas/40 px-5 py-3", frameless && "border-t")}>
          <p className="text-sm font-semibold text-ink">{subject}</p>
          <p className="mt-0.5 text-xs text-muted">{dateRange}</p>
        </div>
      )}

      {layout === "chat"
        ? mensajes.map((msg, i) => {
            const bubble = (
              <ChatBubble
                msg={msg}
                empresaNombre={empresaNombre}
                senderDomain={senderDomain}
              />
            );
            const rowClass = cn(
              "px-5 py-4",
              i > 0 && "border-t border-line",
              msg.de === "agente" ? "pl-10" : "pr-10"
            );
            const bubbleWrapClass = cn(
              "w-full",
              msg.de === "agente" ? "ml-auto max-w-[94%]" : "mr-auto max-w-[94%]"
            );

            if (!animateEntry) {
              return (
                <div key={msg.id} className={rowClass}>
                  <div className={bubbleWrapClass}>{bubble}</div>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                  delay: i * 0.12,
                }}
                className={rowClass}
              >
                <div className={bubbleWrapClass}>{bubble}</div>
              </motion.div>
            );
          })
        : mensajes.map((msg, i) => {
          const content = (
            <InboxMessage
              msg={msg}
              index={i}
              total={mensajes.length}
              empresaNombre={empresaNombre}
              senderDomain={senderDomain}
            />
          );

          if (!animateEntry) {
            return <div key={msg.id}>{content}</div>;
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.12,
              }}
            >
              {content}
            </motion.div>
          );
        })}
    </>
  );

  if (frameless) {
    return body;
  }

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface">
      {body}
    </article>
  );
}
