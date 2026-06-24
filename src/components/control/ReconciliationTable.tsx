"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { formatEUR, cn } from "@/lib/utils";
import type { ConciliacionRecord, EstadoConciliacion } from "@/data/types";

interface ReconciliationTableProps {
  records: ConciliacionRecord[];
}

const estadoLabel: Record<EstadoConciliacion, string> = {
  ok:               "OK",
  no_cargada:       "No cargada",
  importe_distinto: "Importe distinto",
  duplicada:        "Duplicada",
  campos_distintos: "Campos distintos",
};

type BadgeColor = "ok" | "warning" | "danger" | "muted" | "brand";

const estadoColor: Record<EstadoConciliacion, BadgeColor> = {
  ok:               "ok",
  no_cargada:       "danger",
  importe_distinto: "danger",
  duplicada:        "warning",
  campos_distintos: "warning",
};

const ESTADOS: EstadoConciliacion[] = [
  "ok",
  "no_cargada",
  "importe_distinto",
  "duplicada",
  "campos_distintos",
];

export function ReconciliationTable({ records }: ReconciliationTableProps) {
  const [filterEstado, setFilterEstado] = useState<EstadoConciliacion | "todos">("todos");
  const [soloDiscrepancias, setSoloDiscrepancias] = useState(false);
  const [soloMuestreadas, setSoloMuestreadas] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    if (filterEstado !== "todos" && r.estado !== filterEstado) return false;
    if (soloDiscrepancias && r.estado === "ok") return false;
    if (soloMuestreadas && !r.muestreada) return false;
    return true;
  });

  const toggleRow = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
      {/* Filter toolbar */}
      <div className="px-6 py-4 border-b border-black/5 bg-canvas flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="estado-filter" className="text-xs font-medium text-muted whitespace-nowrap">
            Estado
          </label>
          <select
            id="estado-filter"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as EstadoConciliacion | "todos")}
            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="todos">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{estadoLabel[e]}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloDiscrepancias}
            onChange={(e) => setSoloDiscrepancias(e.target.checked)}
            className="rounded border-black/20 text-brand focus:ring-brand"
          />
          <span className="text-xs font-medium text-ink">Solo discrepancias</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloMuestreadas}
            onChange={(e) => setSoloMuestreadas(e.target.checked)}
            className="rounded border-black/20 text-brand focus:ring-brand"
          />
          <span className="text-xs font-medium text-ink">Solo muestreadas</span>
        </label>

        <span className="ml-auto text-xs text-muted">
          {filtered.length} de {records.length} registros
        </span>
      </div>

      {/* Table */}
      <Table>
        <THead>
          <TR>
            <TH className="w-8" />
            <TH>Empresa</TH>
            <TH>CIF</TH>
            <TH className="text-right">Importe origen</TH>
            <TH className="text-right">Importe SGA</TH>
            <TH className="text-center">Muestreada</TH>
            <TH className="text-center">Estado</TH>
          </TR>
        </THead>
        <TBody>
          {filtered.map((record) => {
            const isDiscrepancy = record.estado !== "ok";
            const isExpanded = expandedId === record.id;

            return (
              <>
                <TR
                  key={record.id}
                  className={cn(
                    "cursor-pointer",
                    isDiscrepancy && "bg-danger/5 hover:bg-danger/10"
                  )}
                  onClick={() => toggleRow(record.id)}
                >
                  <TD className="text-muted pl-4">
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </TD>
                  <TD className={cn("font-medium", isDiscrepancy && "text-ink")}>
                    {record.empresa}
                  </TD>
                  <TD className="font-mono text-xs text-muted">{record.cif}</TD>
                  <TD className="text-right tabular-nums">
                    {formatEUR(record.importeOrigenEur)}
                  </TD>
                  <TD className="text-right tabular-nums">
                    {record.importeSgaEur !== null
                      ? formatEUR(record.importeSgaEur)
                      : <span className="text-danger font-medium">—</span>}
                  </TD>
                  <TD className="text-center">
                    {record.muestreada ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10">
                        <Check size={11} className="text-brand" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/5">
                        <X size={11} className="text-muted" />
                      </span>
                    )}
                  </TD>
                  <TD className="text-center">
                    <Badge color={estadoColor[record.estado]}>
                      {estadoLabel[record.estado]}
                    </Badge>
                  </TD>
                </TR>
                {isExpanded && (
                  <tr key={`${record.id}-detail`} className={cn(isDiscrepancy && "bg-danger/5")}>
                    <td colSpan={7} className="px-6 py-3">
                      <div className="flex items-start gap-3 text-sm">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                          Detalle
                        </span>
                        <span className={cn("text-ink", isDiscrepancy && "font-medium text-danger")}>
                          {record.detalle}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </TBody>
      </Table>

      {filtered.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-muted">
          No se encontraron registros con los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
