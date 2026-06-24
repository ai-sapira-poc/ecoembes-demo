// ─────────────────────────────────────────────────────────────
// Ecoembes Demo — data layer public API
// Import everything from here, not from the individual mock files.
// ─────────────────────────────────────────────────────────────

// Types
export type {
  Material,
  SigLine,
  Severidad,
  Hallazgo,
  EstadoAuditoria,
  Declaracion,
  EstadoConciliacion,
  ConciliacionRecord,
  BpoMes,
  RevisionItem,
  DashboardKpis,
  TrendPoint,
  EstadoAgente,
  Veredicto,
  Destino,
  ComponenteEnvase,
  Formato,
  EmailMensaje,
} from "@/data/types";

// Mock arrays
export { empresas } from "@/data/mock/empresas";
export type { Empresa } from "@/data/mock/empresas";

export { declaraciones, tarifas } from "@/data/mock/declaraciones";

export {
  bpoMes,
  BPO_DISCREPANCIAS,
  BPO_IMPORTE_EN_RIESGO_EUR,
} from "@/data/mock/bpo";

export { revisionItems } from "@/data/mock/revision";

export { dashboardKpis, trendData } from "@/data/mock/dashboard";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

import { declaraciones as _declaraciones } from "@/data/mock/declaraciones";
import type { Declaracion, EstadoAuditoria, EstadoAgente } from "@/data/types";

/** Look up a single declaration by id. Returns undefined if not found. */
export function getDeclaracion(id: string): Declaracion | undefined {
  return _declaraciones.find((d) => d.id === id);
}

/** Count declarations by estado. */
export function auditoriaResumen(): Record<EstadoAuditoria, number> {
  const counts: Record<EstadoAuditoria, number> = {
    verificada: 0,
    con_hallazgos: 0,
    en_revision: 0,
  };
  for (const d of _declaraciones) {
    counts[d.estado]++;
  }
  return counts;
}

/** Group declarations by estadoAgente. Returns an object keyed by EstadoAgente. */
export function auditoriaPipeline(): Record<EstadoAgente, Declaracion[]> {
  const estados: EstadoAgente[] = ["recibida", "en_analisis", "consulta_enviada", "respuesta_recibida", "apto", "no_apto", "en_revision"];
  const groups = Object.fromEntries(estados.map(e => [e, [] as Declaracion[]])) as Record<EstadoAgente, Declaracion[]>;
  for (const d of _declaraciones) {
    if (d.estadoAgente) groups[d.estadoAgente].push(d);
  }
  return groups;
}

// ─────────────────────────────────────────────────────────────
// Format helpers — re-exported from @/lib/utils for convenience
// ─────────────────────────────────────────────────────────────
export { cn, formatEUR, formatEUR2, formatNum, formatPct } from "@/lib/utils";
