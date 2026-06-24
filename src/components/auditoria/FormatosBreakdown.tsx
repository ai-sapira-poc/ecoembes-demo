import type { Formato } from "@/data/types";
import { formatNum, formatEUR2 } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface FormatosBreakdownProps {
  formatos: Formato[];
  flaggedComponenteIds?: string[];
}

const DESTINO_CLASSES: Record<string, string> = {
  "Doméstico":  "bg-brand-soft text-brand-dark",
  "Comercial":  "bg-info-soft text-info",
  "Industrial": "bg-warning-soft text-warning",
};

export function FormatosBreakdown({ formatos, flaggedComponenteIds = [] }: FormatosBreakdownProps) {
  const flaggedSet = new Set(flaggedComponenteIds);

  if (formatos.length === 0) {
    return (
      <p className="text-sm text-muted italic">No hay formatos declarados.</p>
    );
  }

  return (
    <div className="divide-y divide-line">
      {formatos.map((fmt) => (
        <div key={fmt.id} className="py-4 first:pt-0 last:pb-0">
          {/* Formato header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-ink">
              {fmt.id}. {fmt.nombre}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
                DESTINO_CLASSES[fmt.destino] ?? "bg-line text-muted"
              )}
            >
              {fmt.destino}
            </span>
            <span className="text-xs text-muted ml-auto tabular-nums">
              {formatNum(fmt.ventas)} uds. vendidas
            </span>
          </div>

          {/* Componentes table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-1.5 pr-3 text-left font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Componente</th>
                  <th className="pb-1.5 pr-3 text-left font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Material</th>
                  <th className="pb-1.5 pr-3 text-left font-semibold text-muted uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Color</th>
                  <th className="pb-1.5 pr-3 text-left font-semibold text-muted uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Rigidez</th>
                  <th className="pb-1.5 pr-3 text-right font-semibold text-muted uppercase tracking-wider whitespace-nowrap">g/ud</th>
                  <th className="pb-1.5 pr-3 text-right font-semibold text-muted uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Uds. tot.</th>
                  <th className="pb-1.5 text-right font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Punto Verde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {fmt.componentes.map((c) => {
                  const flagged = flaggedSet.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "transition-colors",
                        flagged ? "bg-warning/5" : "hover:bg-canvas/60"
                      )}
                    >
                      <td className="py-1.5 pr-3 text-ink-soft">
                        <span className="flex items-center gap-1.5">
                          {flagged && (
                            <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
                          )}
                          <span className="max-w-[180px] truncate" title={c.envase}>
                            {c.envase}
                          </span>
                        </span>
                      </td>
                      <td className={cn("py-1.5 pr-3", flagged ? "text-warning font-medium" : "text-ink-soft")}>
                        {c.material}
                      </td>
                      <td className="py-1.5 pr-3 text-muted hidden sm:table-cell">{c.color}</td>
                      <td className="py-1.5 pr-3 text-muted hidden md:table-cell">{c.rigidez}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums text-ink-soft">{formatNum(c.grEnvase)}</td>
                      <td className="py-1.5 pr-3 text-right tabular-nums text-muted hidden sm:table-cell">{formatNum(c.unidadesTotales)}</td>
                      <td className="py-1.5 text-right tabular-nums text-ink-soft">{formatEUR2(c.puntoVerdeDef)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
