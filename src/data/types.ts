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
