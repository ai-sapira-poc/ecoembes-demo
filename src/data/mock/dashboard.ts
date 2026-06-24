import type { DashboardKpis, TrendPoint } from "@/data/types";
import { declaraciones } from "@/data/mock/declaraciones";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/mock/bpo";
import { revisionItems } from "@/data/mock/revision";

// ─────────────────────────────────────────────────────────────
// Derived KPIs — do not hardcode where derivable from mocks.
// ─────────────────────────────────────────────────────────────

const declaracionesAuditadas = declaraciones.length;

const importeAuditadoEur = declaraciones.reduce(
  (acc, d) => acc + d.cuotaDeclaradaEur,
  0,
);

const hallazgosTotales = declaraciones.reduce(
  (acc, d) => acc + d.hallazgos.length,
  0,
);

const impactoDetectadoEur = declaraciones.reduce(
  (acc, d) =>
    acc + d.hallazgos.reduce((a, h) => a + h.impactoEur, 0),
  0,
);

const casosEnRevision = revisionItems.length;

// BPO coverage: the agent checks 100% vs the manual 1.6% sample
const coberturaControlPct = 100;
const coberturaManualPct =
  Math.round(
    (bpoMes.muestreadas / bpoMes.totalDeclaraciones) * 1000,
  ) / 10; // rounds to 1 decimal → 1.1% but plan says 1.6% ≈ 5/437*100 = 1.144...
          // The plan states 1.6% as a narrative number; we expose the exact figure here.

// importeEnRiesgoEur: sum of monetary deltas from BPO discrepancies
// (no_cargada → full importe, importe_distinto → delta, duplicada → full importe;
//  campos_distintos has no direct monetary delta, excluded)
// This value MUST match the EvidenceCard total in the control module.
const importeEnRiesgoEur = BPO_IMPORTE_EN_RIESGO_EUR; // 26_900

const declaracionesAptas = declaraciones.filter(d => d.estadoAgente === "apto").length;
const declaracionesNoAptas = declaraciones.filter(d => d.estadoAgente === "no_apto").length;
const consultasAbiertas = declaraciones.reduce((acc, d) => acc + (d.consultasAbiertas ?? 0), 0);
const enDialogo = declaraciones.filter(d => d.estadoAgente === "consulta_enviada" || d.estadoAgente === "respuesta_recibida").length;

export const dashboardKpis: DashboardKpis = {
  declaracionesAuditadas,
  importeAuditadoEur,
  hallazgosTotales,
  impactoDetectadoEur,
  casosEnRevision,
  coberturaControlPct,
  coberturaManualPct,
  importeEnRiesgoEur,
  declaracionesAptas,
  declaracionesNoAptas,
  consultasAbiertas,
  enDialogo,
};

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
