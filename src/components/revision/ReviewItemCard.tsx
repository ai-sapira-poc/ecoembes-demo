"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Pencil, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";
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
    <Card
      className={
        resuelto
          ? "opacity-60 transition-opacity duration-300"
          : "transition-opacity duration-300"
      }
    >
      <CardContent className="pt-5">
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

          {/* Resolution state indicator */}
          {resolucion === "aprobado" && (
            <span className="flex items-center gap-1 text-xs font-medium text-ok shrink-0">
              <CheckCircle2 size={14} />
              Aprobado
            </span>
          )}
          {resolucion === "rechazado" && (
            <span className="flex items-center gap-1 text-xs font-medium text-danger shrink-0">
              <XCircle size={14} />
              Rechazado
            </span>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-muted mb-4 leading-relaxed">{item.resumen}</p>

        {/* Razonamiento del agente — collapsible */}
        <div className="mb-4 rounded-lg bg-canvas border border-black/5">
          <button
            type="button"
            onClick={() => setRazonamientoAbierto((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <BrainCircuit size={14} className="text-brand shrink-0" />
            <span>Razonamiento del agente</span>
            <span className="ml-auto">
              {razonamientoAbierto ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </span>
          </button>
          {razonamientoAbierto && (
            <div className="px-4 pb-3 pt-0">
              <p className="text-xs text-muted leading-relaxed">{item.razonamiento}</p>
            </div>
          )}
        </div>

        {/* Metrics row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Confianza:</span>
            <ConfidenceBadge value={item.confianza} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Impacto:</span>
            <span className="text-xs font-semibold text-ink">{formatEUR(item.impactoEur)}</span>
          </div>
        </div>

        {/* Acción sugerida */}
        <div className="mb-5 rounded-lg bg-brand-soft px-4 py-3">
          <p className="text-xs font-medium text-brand-dark mb-0.5">Acción sugerida</p>
          <p className="text-xs text-ink leading-relaxed">{item.accionSugerida}</p>
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
              className="ml-auto text-xs text-muted hover:text-ink underline underline-offset-2 transition-colors"
            >
              Deshacer
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
