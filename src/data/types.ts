// ============================================================
// Ecoembes Demo — Data types
// ALL type names, fields, and enum values are canonical;
// every other module in this project depends on these verbatim.
// ============================================================

export type Material =
  | "PET"
  | "PEAD"
  | "PVC"
  | "Film plástico"
  | "Papel/Cartón"
  | "Vidrio"
  | "Acero"
  | "Aluminio"
  | "Madera"
  | "Brik";

export interface SigLine {
  id: string;
  material: Material;
  unidades: number;
  pesoUnitarioG: number;
  kgTotales: number;
  tarifaEurKg: number;
  importeEur: number;
}

export type Severidad = "alta" | "media" | "baja";

export interface Hallazgo {
  id: string;
  tipo: string;
  severidad: Severidad;
  descripcion: string;
  impactoEur: number;
  lineaId?: string;
}

export type EstadoAuditoria = "verificada" | "con_hallazgos" | "en_revision";

export interface Declaracion {
  id: string;
  empresa: string;
  cif: string;
  sector: string;
  ejercicio: number;
  fechaRecepcion: string;
  sigLines: SigLine[];
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  hallazgos: Hallazgo[];
  estado: EstadoAuditoria;
  confianza: number;
  dictamen: string;
}

export type EstadoConciliacion =
  | "ok"
  | "no_cargada"
  | "importe_distinto"
  | "duplicada"
  | "campos_distintos";

export interface ConciliacionRecord {
  id: string;
  empresa: string;
  cif: string;
  importeOrigenEur: number;
  importeSgaEur: number | null;
  muestreada: boolean;
  estado: EstadoConciliacion;
  detalle: string;
}

export interface BpoMes {
  periodo: string;
  totalDeclaraciones: number;
  importeTotalEur: number;
  muestreadas: number;
  importeMuestreadoEur: number;
  records: ConciliacionRecord[];
}

export interface RevisionItem {
  id: string;
  origen: "auditoria" | "control";
  titulo: string;
  resumen: string;
  razonamiento: string;
  confianza: number;
  accionSugerida: string;
  impactoEur: number;
}

export interface DashboardKpis {
  declaracionesAuditadas: number;
  importeAuditadoEur: number;
  hallazgosTotales: number;
  impactoDetectadoEur: number;
  casosEnRevision: number;
  coberturaControlPct: number;
  coberturaManualPct: number;
  importeEnRiesgoEur: number;
}

export interface TrendPoint {
  mes: string;
  declaraciones: number;
  importeEur: number;
  coberturaPct: number;
}
