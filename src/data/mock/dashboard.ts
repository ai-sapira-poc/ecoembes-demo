import type { DashboardKpis, TrendPoint } from "@/data/types";
import type { Declaracion } from "@/data/types";
import type { DateRange } from "react-day-picker";
import { declaraciones } from "@/data/mock/declaraciones";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/mock/bpo";
import { revisionItems } from "@/data/mock/revision";
import { isDateInRange, toISODate } from "@/lib/date-range";

// ─────────────────────────────────────────────────────────────
// Derived KPIs — do not hardcode where derivable from mocks.
// ─────────────────────────────────────────────────────────────

export function importeEnRiesgoForRange(range: DateRange): number {
  if (!range.from || !range.to) return BPO_IMPORTE_EN_RIESGO_EUR;

  const total = bpoMes.records
    .filter(
      (r) =>
        r.estado !== "ok" &&
        r.fechaRecepcion &&
        isDateInRange(r.fechaRecepcion, range),
    )
    .reduce((acc, r) => {
      if (r.estado === "importe_distinto") {
        return acc + Math.abs(r.importeOrigenEur - (r.importeSgaEur ?? 0));
      }
      return acc + r.importeOrigenEur;
    }, 0);

  const fullMonthApril =
    toISODate(range.from) === "2025-04-01" && toISODate(range.to) === "2025-04-30";

  return total > 0 ? total : fullMonthApril ? BPO_IMPORTE_EN_RIESGO_EUR : 0;
}

export function computeDashboardKpis(
  decls: Declaracion[],
  importeEnRiesgoEur: number,
): DashboardKpis {
  const declaracionesAuditadas = decls.length;
  const importeAuditadoEur = decls.reduce((acc, d) => acc + d.cuotaDeclaradaEur, 0);
  const hallazgosTotales = decls.reduce((acc, d) => acc + d.hallazgos.length, 0);
  const impactoDetectadoEur = decls.reduce(
    (acc, d) => acc + d.hallazgos.reduce((a, h) => a + h.impactoEur, 0),
    0,
  );
  const declaracionesAptas = decls.filter((d) => d.estadoAgente === "apto").length;
  const declaracionesNoAptas = decls.filter((d) => d.estadoAgente === "no_apto").length;
  const consultasAbiertas = decls.reduce((acc, d) => acc + (d.consultasAbiertas ?? 0), 0);
  const enDialogo = decls.filter(
    (d) => d.estadoAgente === "consulta_enviada" || d.estadoAgente === "respuesta_recibida",
  ).length;

  const coberturaManualPct =
    Math.round((bpoMes.muestreadas / bpoMes.totalDeclaraciones) * 1000) / 10;

  return {
    declaracionesAuditadas,
    importeAuditadoEur,
    hallazgosTotales,
    impactoDetectadoEur,
    casosEnRevision: revisionItems.length,
    coberturaControlPct: 100,
    coberturaManualPct,
    importeEnRiesgoEur,
    declaracionesAptas,
    declaracionesNoAptas,
    consultasAbiertas,
    enDialogo,
  };
}

export const dashboardKpis: DashboardKpis = computeDashboardKpis(
  declaraciones,
  BPO_IMPORTE_EN_RIESGO_EUR,
);

// ─────────────────────────────────────────────────────────────
// Monthly trend (6 months) — plausibly increasing coverage
// Used by the recharts AreaChart in the dashboard.
// ─────────────────────────────────────────────────────────────
export const trendData: TrendPoint[] = [
  { mes: "Abr", declaraciones: 412, importeEur: 2_184_300, coberturaPct: 100 },
  { mes: "May", declaraciones: 428, importeEur: 2_251_700, coberturaPct: 100 },
  { mes: "Jun", declaraciones: 419, importeEur: 2_210_500, coberturaPct: 100 },
  { mes: "Jul", declaraciones: 441, importeEur: 2_318_800, coberturaPct: 100 },
  { mes: "Ago", declaraciones: 433, importeEur: 2_291_400, coberturaPct: 100 },
  { mes: "Sep", declaraciones: bpoMes.totalDeclaraciones, importeEur: bpoMes.importeTotalEur, coberturaPct: 100 },
];
