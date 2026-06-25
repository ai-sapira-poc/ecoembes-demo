import type { Hallazgo } from "@/data/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatEUR, cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Check, X } from "lucide-react";

export type FindingDecision = "aprobado" | "rechazado" | null;

export interface FindingsPanelProps {
  hallazgos: Hallazgo[];
  /** When set, shows a green "confirmado" ribbon on each finding. */
  confirmed?: boolean;
  /** When provided, renders approve/reject controls per finding. */
  decisions?: Record<string, FindingDecision>;
  onDecide?: (id: string, decision: FindingDecision) => void;
}

function ImpactNote({ hallazgo }: { hallazgo: Hallazgo }) {
  return (
    <p className="mt-2 pl-6 text-sm font-medium text-ink">
      Impacto en la cuota:{" "}
      <span className="text-danger tabular-nums">{formatEUR(hallazgo.impactoEur)}</span>
    </p>
  );
}

export function FindingsPanel({ hallazgos, confirmed, decisions, onDecide }: FindingsPanelProps) {
  if (hallazgos.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-ok/20 bg-ok/5 px-5 py-4">
        <CheckCircle className="w-5 h-5 text-ok flex-shrink-0" />
        <p className="text-sm text-ok font-medium">
          Sin hallazgos — declaración coherente
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {hallazgos.map((h) => {
        const decision = decisions?.[h.id] ?? null;
        return (
          <div
            key={h.id}
            className={cn(
              "rounded-lg border bg-surface p-4 shadow-sm transition-colors",
              decision === "aprobado"
                ? "border-ok/40"
                : decision === "rechazado"
                  ? "border-line opacity-70"
                  : "border-black/5"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold text-ink truncate">{h.tipo}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {confirmed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ok">
                    <CheckCircle className="h-3 w-3" />
                    Confirmado
                  </span>
                )}
                <SeverityBadge severidad={h.severidad} />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted leading-relaxed pl-6 text-pretty">
              {h.descripcion}
            </p>
            <ImpactNote hallazgo={h} />

            {onDecide && (
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 pl-6">
                <button
                  type="button"
                  onClick={() => onDecide(h.id, decision === "aprobado" ? null : "aprobado")}
                  aria-pressed={decision === "aprobado"}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    decision === "aprobado"
                      ? "bg-brand text-white"
                      : "border border-line bg-surface text-ink-soft hover:border-brand/40 hover:text-brand"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  Aprobar hallazgo
                </button>
                <button
                  type="button"
                  onClick={() => onDecide(h.id, decision === "rechazado" ? null : "rechazado")}
                  aria-pressed={decision === "rechazado"}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    decision === "rechazado"
                      ? "bg-danger text-white"
                      : "border border-line bg-surface text-ink-soft hover:border-danger/40 hover:text-danger"
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  Descartar
                </button>
                {decision && (
                  <span
                    className={cn(
                      "ml-auto text-[11px] font-medium",
                      decision === "aprobado" ? "text-ok" : "text-muted"
                    )}
                  >
                    {decision === "aprobado" ? "Incluido en el veredicto" : "Excluido del veredicto"}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
