"use client";

import { motion } from "framer-motion";
import { Paperclip, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailMensaje } from "@/data/types";

export interface CorrespondenciaThreadProps {
  mensajes: EmailMensaje[];
  empresaNombre: string;
}

function initials(name: string): string {
  const parts = name.split(/[\s·]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CorrespondenciaThread({ mensajes, empresaNombre }: CorrespondenciaThreadProps) {
  if (mensajes.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-5 py-4">
        <Mail className="w-4 h-4 text-muted flex-shrink-0" />
        <p className="text-sm text-muted">Sin correspondencia — no se han enviado consultas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {mensajes.map((msg, i) => {
        const isAgent = msg.de === "agente";
        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
            className={cn(
              "rounded-xl border border-line p-5",
              isAgent
                ? "border-l-2 border-l-brand bg-brand-tint mr-8"
                : "border-l-2 border-l-line bg-surface ml-8"
            )}
          >
            {/* Sender chip */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                    isAgent ? "bg-brand-soft text-brand-dark" : "bg-line text-ink-soft"
                  )}
                >
                  {initials(msg.remitente)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{msg.remitente}</p>
                  <p className="text-[11px] text-muted">{formatDate(msg.fecha)}</p>
                </div>
              </div>
            </div>

            {/* Subject */}
            <p className="text-[11px] font-semibold text-muted uppercase tracking-[0.12em] mb-2">
              {msg.asunto}
            </p>

            {/* Body */}
            <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap text-pretty">
              {msg.cuerpo}
            </p>

            {/* Attachments */}
            {msg.adjuntos && msg.adjuntos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.adjuntos.map((adj) => (
                  <span
                    key={adj}
                    className="inline-flex items-center gap-1 text-[11px] bg-canvas border border-line rounded px-2 py-0.5 text-muted"
                  >
                    <Paperclip className="w-3 h-3 flex-shrink-0" />
                    {adj}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
