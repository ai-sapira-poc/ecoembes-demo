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
  periodo?: number;
  canal?: string;
  importeDaeEur?: number;
  formatos?: Formato[];
  estadoAgente?: EstadoAgente;
  correspondencia?: EmailMensaje[];
  consultasAbiertas?: number;
  veredicto?: Veredicto;
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
  canal?: string;
  periodo?: number;
  fechaRecepcion?: string;
}

export interface BpoMes {
  periodo: string;
  totalDeclaraciones: number;
  importeTotalEur: number;
  muestreadas: number;
  importeMuestreadoEur: number;
  records: ConciliacionRecord[];
}

export interface RevisionPaso {
  etapa: "Señal" | "Análisis" | "Conclusión" | "Escalado";
  detalle: string;
}

export interface RevisionEvidencia {
  fuente: string;
  detalle: string;
}

export interface RevisionItem {
  id: string;
  origen: "auditoria" | "control";
  prioridad: "alta" | "media";
  creadoHace: string;
  titulo: string;
  resumen: string;
  razonamiento: string;
  pasos: RevisionPaso[];
  evidencia: RevisionEvidencia[];
  confianza: number;
  decisionRequerida: string;
  accionSugerida: string;
  impactoEur: number;
  resolucion?: "aprobado" | "rechazado" | "solicitar_datos" | null;
  /** For control-origin tickets: the ConciliacionRecord id this ticket resolves. */
  registroId?: string;
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
  declaracionesAptas?: number;
  declaracionesNoAptas?: number;
  consultasAbiertas?: number;
  enDialogo?: number;
}

export interface TrendPoint {
  mes: string;
  declaraciones: number;
  importeEur: number;
  coberturaPct: number;
}

export type EstadoAgente = "recibida" | "en_analisis" | "consulta_enviada" | "respuesta_recibida" | "apto" | "no_apto" | "en_revision";
export type Veredicto = "apto" | "no_apto" | null;
export type Destino = "Doméstico" | "Comercial" | "Industrial";

export interface ComponenteEnvase {
  id: string;
  envase: string;
  material: string;
  color: string;
  rigidez: "Rígido" | "Flexible";
  grEnvase: number;
  unidades: number;
  unidadesTotales: number;
  costeUnitDef: number;
  puntoVerdeDef: number;
}

export interface Formato {
  id: number;
  nombre: string;
  producto: string;
  ventas: number;
  destino: Destino;
  componentes: ComponenteEnvase[];
}

export interface EmailMensaje {
  id: string;
  de: "agente" | "cliente";
  remitente: string;
  asunto: string;
  cuerpo: string;
  fecha: string;
  adjuntos?: string[];
}

// ============================================================
// APPEND-ONLY (wt-bpo) — Acto 2 Control BPO detail types.
// Added below the original block; never reorder the above.
// ============================================================

/** A single line of the cierre desglose (by material, sector or estado). */
export interface DesgloseLinea {
  clave: string;
  declaraciones: number;
  importeEur: number;
}

/** Full breakdown of the monthly cierre, derived from bpoMes.records. */
export interface BpoDesglose {
  porMaterial: DesgloseLinea[];
  porSector: DesgloseLinea[];
  porEstado: DesgloseLinea[];
}

/** ERP import metadata shown in the Step 1 sync workspace. */
export interface ErpSyncMeta {
  sistema: string;
  modulo: string;
  conector: string;
  periodo: string;
  ejercicio: number;
  ultimaSync: string;
  lotes: number;
}

/**
 * Per-case conciliation detail for the Step 2 case-by-case view:
 * the three values the agent compares plus the supporting fields.
 */
export interface CasoConciliacion {
  record: ConciliacionRecord;
  material: Material;
  pesoKg: number;
  tarifaEurKg: number;
  importeDeclaradoEur: number;
  importeErpEur: number | null;
  importeCalculadoEur: number;
  confianza: number;
}

// APPENDED (wt-auditoria) — deeper Acto 1 analysis + client portal.
// Append-only; do not reorder the canonical types above.
// ============================================================

/** A single deep check the auditor agent runs against a declaration. */
export interface AnalisisCheck {
  id: string;
  /** What the agent verified, e.g. "Cruce de tarifas por material". */
  titulo: string;
  /** The concrete thing the agent compared — short imperative phrase. */
  comprobacion: string;
  /** Evidence consulted (catalogue, ficha técnica, benchmark…). */
  evidencia: string;
  /** Computed economic delta in EUR (0 when the check is clean). */
  deltaEur: number;
  /** Per-check confidence 0–1. */
  confianza: number;
  estado: "ok" | "alerta";
}

/** A staged chat turn between the client and their assigned case agent. */
export interface ChatMensaje {
  id: string;
  de: "agente" | "cliente";
  /** Display name of the speaker. */
  autor: string;
  texto: string;
  hora: string;
}
