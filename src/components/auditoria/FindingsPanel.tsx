import type { Hallazgo } from "@/data/types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatEUR } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

export interface FindingsPanelProps {
  hallazgos: Hallazgo[];
}

export function FindingsPanel({ hallazgos }: FindingsPanelProps) {
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
      {hallazgos.map((h) => (
        <div
          key={h.id}
          className="rounded-lg border border-black/5 bg-surface p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <span className="text-sm font-semibold text-ink truncate">{h.tipo}</span>
            </div>
            <SeverityBadge severidad={h.severidad} className="flex-shrink-0" />
          </div>
          <p className="mt-2 text-sm text-muted leading-relaxed pl-6">
            {h.descripcion}
          </p>
          <p className="mt-2 pl-6 text-sm font-medium text-ink">
            Impacto:{" "}
            <span className="text-danger">{formatEUR(h.impactoEur)}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
