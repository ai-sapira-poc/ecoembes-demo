"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstadoAgente } from "@/data/types";

export interface EstadoPipelineProps {
  estadoAgente: EstadoAgente;
  compact?: boolean;
}

const STAGES = [
  { label: "Recibida" },
  { label: "Análisis" },
  { label: "Diálogo con cliente" },
  { label: "Veredicto" },
];

function getActiveStage(estado: EstadoAgente): number {
  switch (estado) {
    case "recibida":           return 0;
    case "en_analisis":        return 1;
    case "consulta_enviada":
    case "respuesta_recibida": return 2;
    case "apto":
    case "no_apto":
    case "en_revision":        return 3;
  }
}

export function EstadoPipeline({ estadoAgente, compact = false }: EstadoPipelineProps) {
  const active = getActiveStage(estadoAgente);
  const dot = compact ? "w-7 h-7 text-[11px]" : "w-8 h-8 text-xs";

  return (
    <div className={cn("flex w-full", compact ? "items-center" : "items-start py-1")}>
      {STAGES.map((stage, i) => {
        const isPast = i < active;
        const isActive = i === active;

        return (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <div
              className={cn(
                "flex min-w-0",
                compact ? "items-center gap-1.5" : "flex-col items-center gap-1.5 px-1"
              )}
            >
              {isActive ? (
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={cn(
                    "shrink-0 rounded-full bg-brand text-white flex items-center justify-center font-semibold shadow-[0_0_0_3px_rgba(0,161,58,0.18)]",
                    dot
                  )}
                >
                  {i + 1}
                </motion.div>
              ) : isPast ? (
                <div className={cn("shrink-0 rounded-full bg-ok-soft text-ok flex items-center justify-center", dot)}>
                  <Check className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                </div>
              ) : (
                <div className={cn("shrink-0 rounded-full bg-line text-muted flex items-center justify-center font-medium", dot)}>
                  {i + 1}
                </div>
              )}
              <span
                className={cn(
                  "font-medium leading-tight",
                  compact
                    ? "truncate text-xs"
                    : "text-center text-[11px] max-w-[5.75rem] text-pretty",
                  isActive ? "text-brand-dark" : isPast ? "text-ok" : "text-muted"
                )}
                title={compact ? stage.label : undefined}
              >
                {stage.label}
              </span>
            </div>

            {i < STAGES.length - 1 && (
              <div className={cn("flex-1", compact ? "mx-1.5 self-center" : "mx-1 mt-4")}>
                <div className={cn("h-px w-full", i < active ? "bg-ok" : "bg-line")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
