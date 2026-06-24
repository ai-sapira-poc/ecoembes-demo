import type { Formato } from "@/data/types";
import { formatNum, formatEUR2, cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface FormatosBreakdownProps {
  formatos: Formato[];
  flaggedComponenteIds?: string[];
}

const DESTINO_CLASSES: Record<string, string> = {
  "Doméstico": "bg-canvas text-ink-soft ring-1 ring-line",
  "Comercial": "bg-info-soft text-info",
  "Industrial": "bg-warning-soft text-warning",
};

export function FormatosBreakdown({ formatos, flaggedComponenteIds = [] }: FormatosBreakdownProps) {
  const flaggedSet = new Set(flaggedComponenteIds);

  if (formatos.length === 0) {
    return <p className="text-sm text-muted italic">No hay formatos declarados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
            <th className="py-2 pl-1 pr-3 text-left font-semibold">Componente</th>
            <th className="py-2 pr-3 text-left font-semibold">Material</th>
            <th className="py-2 pr-3 text-left font-semibold hidden sm:table-cell">Color</th>
            <th className="py-2 pr-3 text-right font-semibold whitespace-nowrap">g/ud</th>
            <th className="py-2 pr-3 text-right font-semibold whitespace-nowrap hidden md:table-cell">Uds. totales</th>
            <th className="py-2 pr-1 text-right font-semibold whitespace-nowrap">Punto Verde</th>
          </tr>
        </thead>
        <tbody>
          {formatos.map((fmt) => (
            <FormatoGroup key={fmt.id} fmt={fmt} flaggedSet={flaggedSet} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormatoGroup({ fmt, flaggedSet }: { fmt: Formato; flaggedSet: Set<string> }) {
  return (
    <>
      {/* Group header — the formato */}
      <tr className="bg-canvas/70">
        <td colSpan={6} className="px-1 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink">
              {fmt.id}. {fmt.nombre}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
                DESTINO_CLASSES[fmt.destino] ?? "bg-canvas text-muted ring-1 ring-line"
              )}
            >
              {fmt.destino}
            </span>
            <span className="ml-auto text-xs text-muted tabular-nums">
              {formatNum(fmt.ventas)} uds. vendidas
            </span>
          </div>
        </td>
      </tr>

      {/* Component rows */}
      {fmt.componentes.map((c) => {
        const flagged = flaggedSet.has(c.id);
        return (
          <tr
            key={c.id}
            className={cn(
              "border-b border-line/60 last:border-0",
              flagged ? "bg-warning-soft/60" : "hover:bg-canvas/50"
            )}
          >
            <td className="py-2 pl-1 pr-3">
              <span className="flex items-center gap-1.5">
                {flagged && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />}
                <span className="truncate text-ink-soft" title={c.envase}>{c.envase}</span>
              </span>
            </td>
            <td className={cn("py-2 pr-3", flagged ? "font-medium text-warning" : "text-ink-soft")}>
              {c.material}
            </td>
            <td className="py-2 pr-3 text-muted hidden sm:table-cell">{c.color}</td>
            <td className="py-2 pr-3 text-right tabular-nums text-ink-soft">{formatNum(c.grEnvase)}</td>
            <td className="py-2 pr-3 text-right tabular-nums text-muted hidden md:table-cell">
              {formatNum(c.unidadesTotales)}
            </td>
            <td className="py-2 pr-1 text-right tabular-nums font-medium text-ink">
              {formatEUR2(c.puntoVerdeDef)}
            </td>
          </tr>
        );
      })}
    </>
  );
}
