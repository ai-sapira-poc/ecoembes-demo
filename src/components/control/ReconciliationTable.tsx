"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  // Surface canal and periodo if at least one record has them
  const hasCanal = records.some((r) => r.canal != null);
  const hasPeriodo = records.some((r) => r.periodo != null);

  return (
    <div className="rounded-xl border border-line bg-white shadow-[0_2px_12px_-4px_rgba(20,32,26,0.08)] overflow-hidden">
      {/* Filter toolbar */}
      <div className="px-5 py-3.5 border-b border-line bg-canvas flex flex-wrap items-center gap-4">
        {/* Estado filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="estado-filter"
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted whitespace-nowrap"
          >
            Estado
          </label>
          <select
            id="estado-filter"
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as EstadoConciliacion | "todos")
            }
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="todos">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {estadoLabel[e]}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle: solo discrepancias */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloDiscrepancias}
            onChange={(e) => setSoloDiscrepancias(e.target.checked)}
            className="rounded border-line text-brand focus:ring-brand/40"
          />
          <span className="text-xs text-ink-soft">Solo discrepancias</span>
        </label>

        {/* Toggle: solo muestreadas */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloMuestreadas}
            onChange={(e) => setSoloMuestreadas(e.target.checked)}
            className="rounded border-line text-brand focus:ring-brand/40"
          />
          <span className="text-xs text-ink-soft">Solo muestreadas</span>
        </label>

        <span className="ml-auto text-[11px] text-muted tabular-nums">
          {filtered.length} de {records.length} registros
        </span>
      </div>

      {/* Table */}
      <Table>
        <THead>
          <TR>
            <TH className="w-8 pl-4" />
            <TH>Empresa</TH>
            <TH>CIF</TH>
            {hasCanal && <TH>Canal</TH>}
            {hasPeriodo && <TH className="text-right">Período</TH>}
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
              <Fragment key={record.id}>
                <TR
                  className={cn(
                    "cursor-pointer",
                    isDiscrepancy && "bg-danger/[0.03] hover:bg-danger/[0.07]"
                  )}
                  onClick={() => toggleRow(record.id)}
                >
                  {/* Expand toggle */}
                  <TD className="pl-4 text-muted">
                    {isExpanded ? (
                      <ChevronDown size={13} />
                    ) : (
                      <ChevronRight size={13} />
                    )}
                  </TD>

                  {/* Empresa */}
                  <TD
                    className={cn(
                      "font-medium max-w-[200px] truncate",
                      isDiscrepancy ? "text-ink" : "text-ink-soft"
                    )}
                    title={record.empresa}
                  >
                    {record.empresa}
                  </TD>

                  {/* CIF */}
                  <TD className="font-mono text-xs text-muted">{record.cif}</TD>

                  {/* Canal (optional) */}
                  {hasCanal && (
                    <TD className="text-xs text-muted">{record.canal ?? "—"}</TD>
                  )}

                  {/* Período (optional) */}
                  {hasPeriodo && (
                    <TD className="text-right text-xs text-muted tabular-nums">
                      {record.periodo ?? "—"}
                    </TD>
                  )}

                  {/* Importe origen */}
                  <TD className="text-right tabular-nums font-medium text-ink">
                    {formatEUR(record.importeOrigenEur)}
                  </TD>

                  {/* Importe SGA */}
                  <TD className="text-right tabular-nums">
                    {record.importeSgaEur !== null ? (
                      <span
                        className={cn(
                          "font-medium",
                          isDiscrepancy
                            ? record.importeSgaEur !== record.importeOrigenEur
                              ? "text-danger"
                              : "text-ink"
                            : "text-ink-soft"
                        )}
                      >
                        {formatEUR(record.importeSgaEur)}
                      </span>
                    ) : (
                      <span className="text-danger font-semibold">—</span>
                    )}
                  </TD>

                  {/* Muestreada */}
                  <TD className="text-center">
                    {record.muestreada ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10">
                        <Check size={11} className="text-brand" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-line">
                        <X size={11} className="text-muted" />
                      </span>
                    )}
                  </TD>

                  {/* Estado */}
                  <TD className="text-center">
                    <Badge color={estadoColor[record.estado]}>
                      {estadoLabel[record.estado]}
                    </Badge>
                  </TD>
                </TR>

                {/* Expandable detail row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.tr
                      key={`detail-${record.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(isDiscrepancy && "bg-danger/[0.03]")}
                    >
                      <td
                        colSpan={5 + (hasCanal ? 1 : 0) + (hasPeriodo ? 1 : 0) + 2}
                        className="px-6 py-3"
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-3 text-xs py-1">
                            <span className="font-semibold uppercase tracking-[0.12em] text-muted whitespace-nowrap pt-0.5">
                              Detalle
                            </span>
                            <span
                              className={cn(
                                "leading-relaxed",
                                isDiscrepancy
                                  ? "text-danger font-medium"
                                  : "text-ink-soft"
                              )}
                            >
                              {record.detalle}
                            </span>
                            {record.fechaRecepcion && (
                              <span className="ml-auto font-mono text-muted whitespace-nowrap">
                                {record.fechaRecepcion}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </Fragment>
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
