import type { Formato } from "@/data/types";
import { formatNum, formatEUR2, cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface FormatosBreakdownProps {
  formatos: Formato[];
  flaggedComponenteIds?: string[];
  /** Tighter rows for split-view (e.g. step 2 with validations visible). */
  compact?: boolean;
}

const DESTINO_CLASSES: Record<string, string> = {
  "Doméstico": "bg-canvas text-ink-soft ring-1 ring-line",
  "Comercial": "bg-info-soft text-info",
  "Industrial": "bg-warning-soft text-warning",
};

const COLS = [
  { key: "fmt", label: "Nº", align: "left" },
  { key: "forma", label: "Formato", align: "left" },
  { key: "envase", label: "Envase", align: "left" },
  { key: "material", label: "Material", align: "left" },
  { key: "color", label: "Color", align: "left" },
  { key: "rigidez", label: "Rigidez", align: "left" },
  { key: "gr", label: "g/ud", align: "right" },
  { key: "uds", label: "Uds. totales", align: "right" },
  { key: "destino", label: "Destino", align: "left" },
  { key: "pv", label: "Punto Verde", align: "right" },
] as const;

export function FormatosBreakdown({
  formatos,
  flaggedComponenteIds = [],
  compact = false,
}: FormatosBreakdownProps) {
  const flaggedSet = new Set(flaggedComponenteIds);
  const cell = compact ? "px-2 py-0.5" : "px-3 py-1.5";
  const headCell = compact ? "px-2 py-1" : "px-3 py-2";

  if (formatos.length === 0) {
    return <p className="text-sm text-muted italic">No hay formatos declarados.</p>;
  }

  const total = formatos.reduce(
    (a, f) => a + f.componentes.reduce((s, c) => s + c.puntoVerdeDef, 0),
    0
  );

  const visibleCols = compact
    ? COLS.filter((c) => !["color", "rigidez", "gr", "uds", "destino"].includes(c.key))
    : COLS;

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className={cn("w-full border-collapse tabular-nums", compact ? "text-[11px]" : "text-xs")}>
        <thead>
          <tr className="bg-canvas text-[10px] uppercase tracking-wider text-muted sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-line)]">
            {visibleCols.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "border-b border-line font-semibold whitespace-nowrap",
                  headCell,
                  c.align === "right" ? "text-right" : "text-left"
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formatos.map((fmt) =>
            fmt.componentes.map((c, idx) => {
              const flagged = flaggedSet.has(c.id);
              const isFirst = idx === 0;
              return (
                <tr
                  key={c.id}
                  className={cn(
                    isFirst && "border-t border-line",
                    flagged ? "bg-warning-soft/60" : "hover:bg-canvas/50"
                  )}
                >
                  {visibleCols.map((col) => {
                    switch (col.key) {
                      case "fmt":
                        return (
                          <td key={col.key} className={cn(cell, "text-muted")}>
                            {isFirst ? fmt.id : ""}
                          </td>
                        );
                      case "forma":
                        return (
                          <td
                            key={col.key}
                            className={cn(cell, "font-medium text-ink max-w-[140px] truncate")}
                            title={fmt.nombre}
                          >
                            {isFirst ? fmt.nombre : ""}
                          </td>
                        );
                      case "envase":
                        return (
                          <td
                            key={col.key}
                            className={cn(cell, "text-ink-soft max-w-[120px] truncate")}
                            title={c.envase}
                          >
                            <span className="flex items-center gap-1">
                              {flagged && <AlertTriangle className="h-2.5 w-2.5 shrink-0 text-warning" />}
                              {c.envase}
                            </span>
                          </td>
                        );
                      case "material":
                        return (
                          <td
                            key={col.key}
                            className={cn(cell, flagged ? "font-semibold text-warning" : "text-ink-soft")}
                          >
                            {c.material}
                          </td>
                        );
                      case "color":
                        return (
                          <td key={col.key} className={cn(cell, "text-muted")}>
                            {c.color}
                          </td>
                        );
                      case "rigidez":
                        return (
                          <td key={col.key} className={cn(cell, "text-muted")}>
                            {c.rigidez}
                          </td>
                        );
                      case "gr":
                        return (
                          <td key={col.key} className={cn(cell, "text-right text-ink-soft")}>
                            {formatNum(c.grEnvase)}
                          </td>
                        );
                      case "uds":
                        return (
                          <td key={col.key} className={cn(cell, "text-right text-muted")}>
                            {formatNum(c.unidadesTotales)}
                          </td>
                        );
                      case "destino":
                        return (
                          <td key={col.key} className={cell}>
                            {isFirst && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
                                  DESTINO_CLASSES[fmt.destino] ?? "bg-canvas text-muted ring-1 ring-line"
                                )}
                              >
                                {fmt.destino}
                              </span>
                            )}
                          </td>
                        );
                      case "pv":
                        return (
                          <td key={col.key} className={cn(cell, "text-right font-medium text-ink")}>
                            {formatEUR2(c.puntoVerdeDef)}
                          </td>
                        );
                      default:
                        return null;
                    }
                  })}
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-line bg-canvas/70">
            <td
              colSpan={visibleCols.length - 1}
              className={cn(
                compact ? "px-2 py-1" : "px-3 py-2",
                "text-right text-[10px] font-semibold uppercase tracking-wider text-muted"
              )}
            >
              Total Punto Verde declarado
            </td>
            <td
              className={cn(
                compact ? "px-2 py-1" : "px-3 py-2",
                "text-right font-semibold text-ink"
              )}
            >
              {formatEUR2(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
