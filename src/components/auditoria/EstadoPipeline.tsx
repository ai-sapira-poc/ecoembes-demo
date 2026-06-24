"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstadoAgente } from "@/data/types";

export interface EstadoPipelineProps {
  estadoAgente: EstadoAgente;
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

export function EstadoPipeline({ estadoAgente }: EstadoPipelineProps) {
  const active = getActiveStage(estadoAgente);

  return (
    <div className="flex items-center w-full py-2">
      {STAGES.map((stage, i) => {
        const isPast   = i < active;
        const isActive = i === active;
        const isFuture = i > active;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Stage node */}
            <div className="flex flex-col items-center gap-1.5">
              {isActive ? (
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold shadow-[0_0_0_3px_rgba(26,168,75,0.18)]"
                >
                  {i + 1}
                </motion.div>
              ) : isPast ? (
                <div className="w-8 h-8 rounded-full bg-ok-soft text-ok flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-line text-muted flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </div>
              )}
              <span
                className={cn(
                  "hidden sm:block text-[11px] font-medium whitespace-nowrap",
                  isActive ? "text-brand" : isPast ? "text-ok" : "text-muted"
                )}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector */}
            {i < STAGES.length - 1 && (
              <div className="flex-1 mx-2 h-px">
                <div
                  className={cn(
                    "h-px w-full",
                    i < active ? "bg-ok" : "bg-line"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
