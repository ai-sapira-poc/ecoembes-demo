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
  const dot = compact ? "w-5 h-5 text-[10px]" : "w-8 h-8 text-xs";

  return (
    <div className={cn("flex items-center w-full", compact ? "py-0" : "py-2")}>
      {STAGES.map((stage, i) => {
        const isPast = i < active;
        const isActive = i === active;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={cn("flex items-center gap-2", !compact && "flex-col gap-1.5")}>
              {isActive ? (
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={cn(
                    "rounded-full bg-brand text-white flex items-center justify-center font-semibold shadow-[0_0_0_3px_rgba(0,161,58,0.18)]",
                    dot
                  )}
                >
                  {i + 1}
                </motion.div>
              ) : isPast ? (
                <div className={cn("rounded-full bg-ok-soft text-ok flex items-center justify-center", dot)}>
                  <Check className={compact ? "w-3 h-3" : "w-4 h-4"} />
                </div>
              ) : (
                <div className={cn("rounded-full bg-line text-muted flex items-center justify-center font-medium", dot)}>
                  {i + 1}
                </div>
              )}
              <span
                className={cn(
                  "font-medium whitespace-nowrap",
                  compact ? "text-[11px]" : "hidden sm:block text-[11px]",
                  isActive ? "text-brand-dark" : isPast ? "text-ok" : "text-muted"
                )}
              >
                {stage.label}
              </span>
            </div>

            {i < STAGES.length - 1 && (
              <div className={cn("flex-1 h-px", compact ? "mx-2" : "mx-2")}>
                <div className={cn("h-px w-full", i < active ? "bg-ok" : "bg-line")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
