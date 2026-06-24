"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { InlineFilter } from "@/components/ui/InlineFilter";
import { ToolbarSearchField } from "@/components/ui/ToolbarSearchField";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { revisionItems } from "@/data/index";
import { formatEUR, cn } from "@/lib/utils";
import type { ConciliacionRecord, EstadoConciliacion } from "@/data/types";

interface ReconciliationTableProps {
  records: ConciliacionRecord[];
  /** platform = conciliación operativa; agent = confianza + enrutamiento */
  variant?: "platform" | "agent";
  confianzaById?: Record<string, number>;
  confidenceThreshold?: number;
  title?: string;
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

const ESTADO_FILTER_OPTIONS = ESTADOS.map((e) => ({
  value: e,
  label: estadoLabel[e],
}));

const ENRUTAMIENTO_OPTIONS = [
  { value: "autonomo", label: "Autónomo" },
  { value: "revision", label: "Revisión humana" },
] as const;

export function ReconciliationTable({
  records,
  variant = "platform",
  confianzaById,
  confidenceThreshold = 0.8,
  title,
}: ReconciliationTableProps) {
  const isAgent = variant === "agent";
  const router = useRouter();
  const [filterEstado, setFilterEstado] = useState("");
  const [soloDiscrepancias, setSoloDiscrepancias] = useState(false);
  const [filterEnrutamiento, setFilterEnrutamiento] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /** Map each ConciliacionRecord id to its open revision ticket (control origin). */
  const ticketByRecordId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of revisionItems) {
      if (t.origen === "control" && t.registroId) map[t.registroId] = t.id;
    }
    return map;
  }, []);

  const getConfianza = (record: ConciliacionRecord) => confianzaById?.[record.id] ?? 0;

  /** OK + confianza ≥ umbral → autónomo; cualquier discrepancia → revisión humana */
  const isAutonomo = (record: ConciliacionRecord) =>
    record.estado === "ok" && getConfianza(record) >= confidenceThreshold;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (filterEstado && r.estado !== filterEstado) return false;
      if (soloDiscrepancias && r.estado === "ok") return false;
      if (isAgent && filterEnrutamiento === "autonomo" && !isAutonomo(r)) return false;
      if (isAgent && filterEnrutamiento === "revision" && isAutonomo(r)) return false;
      if (q && !r.empresa.toLowerCase().includes(q) && !r.cif.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [
    records,
    filterEstado,
    soloDiscrepancias,
    filterEnrutamiento,
    search,
    isAgent,
    confianzaById,
    confidenceThreshold,
  ]);

  const toggleRow = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  // Surface canal and periodo if at least one record has them
  const hasCanal = records.some((r) => r.canal != null);
  const hasPeriodo = records.some((r) => r.periodo != null);

  const colSpan =
    6 +
    (hasCanal ? 1 : 0) +
    (hasPeriodo ? 1 : 0) +
    (isAgent ? 2 : 0);

  return (
    <div className="rounded-xl border border-line bg-white shadow-[0_2px_12px_-4px_rgba(20,32,26,0.08)] overflow-hidden">
      {(title || isAgent) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {title ?? "Registros conciliados"}
          </p>
          {isAgent && (
            <p className="text-[11px] text-muted">
              Sin incidencia · ≥ {confidenceThreshold * 100} % → autónomo · incidencia → revisión
              humana
            </p>
          )}
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center border-b border-line bg-surface">
        <ToolbarSearchField value={search} onChange={setSearch} className="min-w-[200px]" />
        <div className="hidden sm:block h-7 w-px bg-line shrink-0" />
        <div className="flex flex-wrap items-center gap-1 px-2 sm:px-4 sm:pr-3 shrink-0">
          <Filter className="hidden sm:block h-4 w-4 shrink-0 text-muted" />
          <InlineFilter
            label="Estado"
            value={filterEstado}
            options={ESTADO_FILTER_OPTIONS}
            onChange={setFilterEstado}
          />
          {isAgent && (
            <InlineFilter
              label="Enrutamiento"
              value={filterEnrutamiento}
              options={ENRUTAMIENTO_OPTIONS}
              onChange={setFilterEnrutamiento}
            />
          )}
          <label className="flex cursor-pointer select-none items-center gap-2 whitespace-nowrap px-3 py-3.5">
            <input
              type="checkbox"
              checked={soloDiscrepancias}
              onChange={(e) => setSoloDiscrepancias(e.target.checked)}
              className="rounded border-line text-brand focus:ring-brand/40"
            />
            <span className="text-sm text-ink-soft">Solo discrepancias</span>
          </label>
        </div>
        <span className="w-full border-t border-line px-4 py-2 text-[11px] text-muted tabular-nums sm:w-auto sm:border-t-0 sm:ml-auto sm:px-5 sm:py-3.5">
          {filtered.length} de {records.length} registros
          {isAgent && <> · umbral {confidenceThreshold * 100} %</>}
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
            {isAgent ? (
              <>
                <TH className="text-center">Confianza</TH>
                <TH className="text-center">Enrutamiento</TH>
              </>
            ) : null}
            <TH className="text-center">Estado</TH>
          </TR>
        </THead>
        <TBody>
          {filtered.map((record) => {
            const isDiscrepancy = record.estado !== "ok";
            const isExpanded = expandedId === record.id;
            const confianza = getConfianza(record);
            const autonomo = isAutonomo(record);
            const needsHuman = isAgent && !autonomo;
            const ticketId =
              isDiscrepancy && !isAgent ? ticketByRecordId[record.id] : undefined;

            const rowClass = needsHuman
              ? isDiscrepancy
                ? "bg-warning/[0.08] hover:bg-warning/[0.14]"
                : "bg-warning/[0.05] hover:bg-warning/[0.1]"
              : undefined;

            return (
              <Fragment key={record.id}>
                <TR
                  className={cn("cursor-pointer", rowClass)}
                  onClick={() =>
                    ticketId
                      ? router.push(`/plataforma/revision/${ticketId}`)
                      : toggleRow(record.id)
                  }
                >
                  {/* Leading affordance: navigate to ticket vs expand inline */}
                  <TD className="pl-4 text-muted">
                    {ticketId ? (
                      <ArrowUpRight size={14} className="text-brand" />
                    ) : isExpanded ? (
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

                  {isAgent && (
                    <>
                      <TD className="text-center">
                        <ConfidenceBadge value={confianza} />
                      </TD>
                      <TD className="text-center">
                        <Badge color={autonomo ? "ok" : "warning"}>
                          {autonomo ? "Autónomo" : "Revisión humana"}
                        </Badge>
                      </TD>
                    </>
                  )}

                  {/* Estado */}
                  <TD className="text-center">
                    <span className="inline-flex items-center gap-1.5">
                      <Badge color={estadoColor[record.estado]}>
                        {estadoLabel[record.estado]}
                      </Badge>
                      {ticketId && (
                        <span className="hidden items-center gap-0.5 text-[11px] font-medium text-brand-dark sm:inline-flex">
                          Ver ticket
                          <ArrowUpRight size={12} aria-hidden />
                        </span>
                      )}
                    </span>
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
                      className={cn(
                        needsHuman &&
                          (isDiscrepancy ? "bg-warning/[0.08]" : "bg-warning/[0.05]")
                      )}
                    >
                      <td colSpan={colSpan} className="px-6 py-3">
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
