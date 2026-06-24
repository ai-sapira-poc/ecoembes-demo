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

export function FormatosBreakdown({ formatos, flaggedComponenteIds = [] }: FormatosBreakdownProps) {
  const flaggedSet = new Set(flaggedComponenteIds);

  if (formatos.length === 0) {
    return <p className="text-sm text-muted italic">No hay formatos declarados.</p>;
  }

  const total = formatos.reduce(
    (a, f) => a + f.componentes.reduce((s, c) => s + c.puntoVerdeDef, 0),
    0
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-xs tabular-nums">
        <thead>
          <tr className="bg-canvas text-[10px] uppercase tracking-wider text-muted sticky top-0 z-10 shadow-[0_1px_0_0_var(--color-line)]">
            {COLS.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "border-b border-line px-3 py-2 font-semibold whitespace-nowrap",
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
                  <td className="px-3 py-1.5 text-muted">{isFirst ? fmt.id : ""}</td>
                  <td className="px-3 py-1.5 font-medium text-ink max-w-[180px] truncate" title={fmt.nombre}>
                    {isFirst ? fmt.nombre : ""}
                  </td>
                  <td className="px-3 py-1.5 text-ink-soft max-w-[180px] truncate" title={c.envase}>
                    <span className="flex items-center gap-1.5">
                      {flagged && <AlertTriangle className="h-3 w-3 shrink-0 text-warning" />}
                      {c.envase}
                    </span>
                  </td>
                  <td className={cn("px-3 py-1.5", flagged ? "font-semibold text-warning" : "text-ink-soft")}>
                    {c.material}
                  </td>
                  <td className="px-3 py-1.5 text-muted">{c.color}</td>
                  <td className="px-3 py-1.5 text-muted">{c.rigidez}</td>
                  <td className="px-3 py-1.5 text-right text-ink-soft">{formatNum(c.grEnvase)}</td>
                  <td className="px-3 py-1.5 text-right text-muted">{formatNum(c.unidadesTotales)}</td>
                  <td className="px-3 py-1.5">
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
                  <td className="px-3 py-1.5 text-right font-medium text-ink">{formatEUR2(c.puntoVerdeDef)}</td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-line bg-canvas/70">
            <td colSpan={9} className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
              Total Punto Verde declarado
            </td>
            <td className="px-3 py-2 text-right font-semibold text-ink">{formatEUR2(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
