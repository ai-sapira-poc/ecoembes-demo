"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Pencil, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { formatEUR } from "@/lib/utils";
import type { RevisionItem } from "@/data/types";

type Resolucion = "aprobado" | "rechazado" | null;

interface ReviewItemCardProps {
  item: RevisionItem;
}

export function ReviewItemCard({ item }: ReviewItemCardProps) {
  const [resolucion, setResolucion] = useState<Resolucion>(null);
  const [razonamientoAbierto, setRazonamientoAbierto] = useState(false);

  const resuelto = resolucion !== null;

  const origenLabel = item.origen === "auditoria" ? "Auditoría" : "Control BPO";
  const origenColor: "brand" | "warning" = item.origen === "auditoria" ? "brand" : "warning";

  return (
    <motion.div
      animate={{ opacity: resuelto ? 0.55 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-5 pb-5">
          {/* Header row */}
          <div className="flex items-start gap-3 mb-3">
            <Badge color={origenColor} className="shrink-0 mt-0.5">
              {origenLabel}
            </Badge>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-ink leading-snug">
                {item.titulo}
              </h3>
            </div>

            {resolucion === "aprobado" && (
              <span className="flex items-center gap-1 text-xs font-semibold text-ok shrink-0 bg-ok-soft px-2.5 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                Aprobado
              </span>
            )}
            {resolucion === "rechazado" && (
              <span className="flex items-center gap-1 text-xs font-semibold text-danger shrink-0 bg-danger-soft px-2.5 py-0.5 rounded-full">
                <XCircle size={12} />
                Rechazado
              </span>
            )}
          </div>

          {/* Summary */}
          <p className="text-sm text-ink-soft mb-4 leading-relaxed">{item.resumen}</p>

          {/* Razonamiento del agente — collapsible */}
          <div className="mb-4 rounded-lg border border-line overflow-hidden">
            <button
              type="button"
              onClick={() => setRazonamientoAbierto((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-muted hover:text-ink-soft hover:bg-canvas transition-colors"
              aria-expanded={razonamientoAbierto}
            >
              <BrainCircuit size={13} className="text-brand shrink-0" />
              <span className="uppercase tracking-[0.1em]">Razonamiento del agente</span>
              <span className="ml-auto">
                {razonamientoAbierto ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {razonamientoAbierto && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 bg-canvas border-t border-line">
                    <p className="text-xs text-ink-soft leading-relaxed font-mono">
                      {item.razonamiento}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap items-center gap-5 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Confianza</span>
              <ConfidenceBadge value={item.confianza} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Impacto estimado</span>
              <span className="text-xs font-semibold text-ink tabular-nums">{formatEUR(item.impactoEur)}</span>
            </div>
          </div>

          {/* Acción sugerida */}
          <div className="mb-5 rounded-lg bg-brand-soft px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-dark mb-1.5">
              Acción sugerida
            </p>
            <p className="text-xs text-ink-soft leading-relaxed">{item.accionSugerida}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={resuelto}
              onClick={() => setResolucion("aprobado")}
              className={
                resolucion === "aprobado"
                  ? "bg-ok hover:bg-ok border-0"
                  : ""
              }
            >
              <CheckCircle2 size={14} />
              Aprobar
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={resuelto}
              onClick={() => setResolucion("rechazado")}
              className={
                resolucion === "rechazado"
                  ? "border-danger text-danger hover:bg-danger/10"
                  : "border-danger/40 text-danger hover:bg-danger/10"
              }
            >
              <XCircle size={14} />
              Rechazar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={resuelto}
            >
              <Pencil size={14} />
              Editar
            </Button>

            {resuelto && (
              <button
                type="button"
                onClick={() => setResolucion(null)}
                className="ml-auto text-xs text-muted hover:text-ink transition-colors underline underline-offset-2"
              >
                Deshacer
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
