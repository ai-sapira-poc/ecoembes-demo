import type { SigLine } from "@/data/types";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import { formatEUR2, formatNum } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface SigLinesTableProps {
  lines: SigLine[];
  flaggedLineIds?: string[];
}

export function SigLinesTable({ lines, flaggedLineIds = [] }: SigLinesTableProps) {
  const flaggedSet = new Set(flaggedLineIds);

  return (
    <Table>
      <THead>
        <TR>
          <TH>Material</TH>
          <TH className="text-right">Unidades</TH>
          <TH className="text-right">Peso unit. (g)</TH>
          <TH className="text-right">Kg totales</TH>
          <TH className="text-right">Tarifa €/kg</TH>
          <TH className="text-right">Importe</TH>
        </TR>
      </THead>
      <TBody>
        {lines.map((line) => {
          const isFlagged = flaggedSet.has(line.id);
          return (
            <TR
              key={line.id}
              className={cn(isFlagged && "bg-warning/10 hover:bg-warning/20")}
            >
              <TD>
                <span className="flex items-center gap-1.5">
                  {isFlagged && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                  )}
                  {line.material}
                </span>
              </TD>
              <TD className="text-right tabular-nums">{formatNum(line.unidades)}</TD>
              <TD className="text-right tabular-nums">{formatNum(line.pesoUnitarioG)}</TD>
              <TD className="text-right tabular-nums">{formatNum(line.kgTotales)}</TD>
              <TD className="text-right tabular-nums">
                {line.tarifaEurKg.toLocaleString("es-ES", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}{" "}
                €
              </TD>
              <TD className={cn("text-right tabular-nums font-medium", isFlagged && "text-warning")}>
                {formatEUR2(line.importeEur)}
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
