"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { ChatMensaje } from "@/data/types";
import { cn } from "@/lib/utils";

export interface ClientPortalChatProps {
  mensajes: ChatMensaje[];
  agente: string;
  /** ms between staged turns appearing (default 900). */
  cadence?: number;
}

function initials(name: string): string {
  const parts = name.split(/[\s·]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function Bubble({ msg }: { msg: ChatMensaje }) {
  const isAgente = msg.de === "agente";
  return (
    <div className={cn("flex w-full gap-2.5", isAgente ? "justify-start" : "justify-end")}>
      {isAgente && (
        <span className="grid h-7 w-7 shrink-0 place-items-center self-end rounded-full bg-brand-soft text-[10px] font-semibold text-brand-dark ring-1 ring-brand/15">
          {initials(msg.autor)}
        </span>
      )}
      <div className={cn("max-w-[80%]", isAgente ? "items-start" : "items-end")}>
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
        <p
          className={cn(
            "mt-1 text-[10px] text-muted",
            isAgente ? "text-left" : "text-right"
          )}
        >
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

export function ClientPortalChat({ mensajes, agente, cadence = 900 }: ClientPortalChatProps) {
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown >= mensajes.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), cadence);
    return () => clearTimeout(t);
  }, [shown, mensajes.length, cadence]);

  const typing = shown < mensajes.length;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-dark">
          {initials(agente)}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-ok" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{agente.split("·")[0].trim()}</p>
          <p className="flex items-center gap-1 text-[11px] text-ok">
            <MessageSquare className="h-3 w-3" />
            Agente de caso asignado · en línea
          </p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {mensajes.slice(0, shown).map((m) => (
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
    </div>
  );
}
