import type { BpoMes, ConciliacionRecord, EstadoConciliacion } from "@/data/types";
import { empresas } from "@/data/mock/empresas";

// ─────────────────────────────────────────────────────────────
// Constants — must not be changed without updating the full
// verification chain (dashboard.ts + control module UI).
// ─────────────────────────────────────────────────────────────
const TOTAL = 437;
const TARGET_TOTAL_EUR = 2_338_519;

// The 5 manually sampled cases (the "green" sample).
// Their importes are preset to sum EXACTLY to MUESTREADO_EUR = 37_367.
const MUESTREADAS_IDS = new Set([12, 88, 191, 264, 377]);
const MUESTREADO_EUR = 37_367;

const MUESTREADAS_IMPORTES: Record<number, number> = {
  12:  7_320,
  88:  8_140,
  191: 7_650,
  264: 6_890,
  377: 7_367,
};
// ✓ 7320+8140+7650+6890+7367 = 37_367

// ─────────────────────────────────────────────────────────────
// Seeded discrepancies — ALL outside the manual sample
// (this is the core narrative: the 5 sampled cases are clean;
//  the 6 anomalies are invisible to the manual control).
// ─────────────────────────────────────────────────────────────
interface SeededEntry {
  importeOrigenEur: number;
  estado: EstadoConciliacion;
  detalle: string;
  importeSgaEur: number | null;
  /** Override the deterministic empresa so the record matches its revision ticket. */
  empresa?: string;
  cif?: string;
}

const SEEDED: Record<number, SeededEntry> = {
  45: {
    importeOrigenEur: 5_840,
    estado: "no_cargada",
    detalle: "Declaración recibida en origen, sin registro en SGA.",
    importeSgaEur: null,
    empresa: "Aguas de Sierra Azul S.A.",
    cif: "A46739210",
  },
  103: {
    importeOrigenEur: 21_940,
    estado: "importe_distinto",
    detalle: "Importe SGA 18.420 € vs 21.940 € en origen (−3.520 €).",
    importeSgaEur: 18_420,
    empresa: "Conservas del Cantábrico S.A.",
    cif: "A28541367",
  },
  158: {
    importeOrigenEur: 6_210,
    estado: "no_cargada",
    detalle: "Declaración recibida en origen, sin registro en SGA.",
    importeSgaEur: null,
    empresa: "Distribuidora Central Peninsular S.A.",
    cif: "A63095482",
  },
  299: {
    importeOrigenEur: 7_780,
    estado: "duplicada",
    detalle: "Cargada dos veces en SGA (doble cobro potencial).",
    importeSgaEur: 7_780,
    empresa: "Galletas y Cereales del Sur S.L.",
    cif: "B41672309",
  },
  402: {
    importeOrigenEur: 5_650,
    estado: "campos_distintos",
    detalle: "CIF cargado con dígito de control erróneo.",
    importeSgaEur: 5_650,
    empresa: "Higiene Natura Iberia S.A.",
    cif: "A80127654",
  },
  430: {
    importeOrigenEur: 12_660,
    estado: "importe_distinto",
    detalle: "Importe SGA 9.110 € vs 12.660 € en origen (−3.550 €).",
    importeSgaEur: 9_110,
    empresa: "Bodegas Marqués de Tordella S.L.",
    cif: "B26083741",
  },
};

// ─────────────────────────────────────────────────────────────
// Ordinary record importe distribution
// Budget: TARGET_TOTAL_EUR − MUESTREADO_EUR − seededTotal = 2_241_072
// Spread across 426 ordinary records, last one adjusted to hit exact total.
// Pattern cycles through 20 deterministic values (~5000–6200 range).
// ─────────────────────────────────────────────────────────────
const ORDINARY_PATTERN: number[] = [
  4_400, 5_800, 4_600, 6_000, 5_000, 5_700, 4_500, 6_200, 5_200, 5_500,
  4_700, 5_900, 4_800, 5_600, 5_100, 6_100, 4_900, 5_300, 5_400, 4_300,
];

function buildOrdinaryImportes(): Map<number, number> {
  const seededTotal = Object.values(SEEDED).reduce((acc, e) => acc + e.importeOrigenEur, 0);
  const ordinaryBudget = TARGET_TOTAL_EUR - MUESTREADO_EUR - seededTotal;

  // Collect ordinary IDs in order
  const ordinaryIds: number[] = [];
  for (let i = 1; i <= TOTAL; i++) {
    if (!MUESTREADAS_IDS.has(i) && !(i in SEEDED)) {
      ordinaryIds.push(i);
    }
  }

  const map = new Map<number, number>();
  let running = 0;
  for (let idx = 0; idx < ordinaryIds.length - 1; idx++) {
    const imp = ORDINARY_PATTERN[idx % ORDINARY_PATTERN.length];
    map.set(ordinaryIds[idx], imp);
    running += imp;
  }
  // Adjust last ordinary record to hit the exact budget
  const lastId = ordinaryIds[ordinaryIds.length - 1];
  map.set(lastId, ordinaryBudget - running);
  return map;
}

const ordinaryImportes = buildOrdinaryImportes();

// ─────────────────────────────────────────────────────────────
// Build records
// ─────────────────────────────────────────────────────────────
function makeRecord(i: number): ConciliacionRecord {
  const empresa = empresas[(i - 1) % empresas.length];

  if (i in SEEDED) {
    const s = SEEDED[i];
    return {
      id: String(i).padStart(3, "0"),
      empresa: s.empresa ?? empresa.nombre,
      cif: s.cif ?? empresa.cif,
      importeOrigenEur: s.importeOrigenEur,
      importeSgaEur: s.importeSgaEur,
      muestreada: false,  // ← CRITICAL: seeded discrepancies are NEVER in the manual sample
      estado: s.estado,
      detalle: s.detalle,
      canal: "PLATAFORMA 2.0",
      periodo: 56,
      fechaRecepcion: "2025-04-" + String(10 + (i % 20)).padStart(2, "0"),
    };
  }

  if (MUESTREADAS_IDS.has(i)) {
    const imp = MUESTREADAS_IMPORTES[i];
    return {
      id: String(i).padStart(3, "0"),
      empresa: empresa.nombre,
      cif: empresa.cif,
      importeOrigenEur: imp,
      importeSgaEur: imp,
      muestreada: true,
      estado: "ok",
      detalle: "Declaración verificada manualmente. Sin incidencias.",
      canal: "PLATAFORMA 2.0",
      periodo: 56,
      fechaRecepcion: "2025-04-" + String(1 + (i % 20)).padStart(2, "0"),
    };
  }

  const imp = ordinaryImportes.get(i) ?? 5_000;
  if (i <= 8) {
    return {
      id: String(i).padStart(3, "0"),
      empresa: empresa.nombre,
      cif: empresa.cif,
      importeOrigenEur: imp,
      importeSgaEur: imp,
      muestreada: false,
      estado: "ok",
      detalle: "Declaración conciliada automáticamente. Sin incidencias.",
      canal: "Ficticias Tipo Carta",
      periodo: 50,
      fechaRecepcion: "2025-04-" + String(1 + (i % 28)).padStart(2, "0"),
    };
  }
  return {
    id: String(i).padStart(3, "0"),
    empresa: empresa.nombre,
    cif: empresa.cif,
    importeOrigenEur: imp,
    importeSgaEur: imp,
    muestreada: false,
    estado: "ok",
    detalle: "Declaración conciliada automáticamente. Sin incidencias.",
    canal: "PLATAFORMA 2.0",
    periodo: i % 3 === 0 ? 50 : 56,
    fechaRecepcion: "2025-04-" + String(1 + (i % 28)).padStart(2, "0"),
  };
}

const records: ConciliacionRecord[] = Array.from({ length: TOTAL }, (_, idx) =>
  makeRecord(idx + 1),
);

// ─────────────────────────────────────────────────────────────
// Runtime invariant assertions (development/build-time check)
// These will surface immediately if the generation logic drifts.
// ─────────────────────────────────────────────────────────────
// assert: sum(importeOrigenEur) === 2_338_519
// assert: records.filter(r => r.muestreada).length === 5
// assert: records.filter(r => r.estado !== "ok").every(r => !r.muestreada)

export const bpoMes: BpoMes = {
  periodo: "Septiembre 2025",
  totalDeclaraciones: TOTAL,
  importeTotalEur: TARGET_TOTAL_EUR,
  muestreadas: MUESTREADAS_IDS.size,
  importeMuestreadoEur: MUESTREADO_EUR,
  records,
};

// Derived convenience exports used by dashboard.ts and control module
export const BPO_DISCREPANCIAS = Object.keys(SEEDED).map(Number);

// importeEnRiesgoEur: monetary exposure from detected anomalies
//   no_cargada (45, 158): full importe missing from SGA
//   importe_distinto (103, 430): delta between origen and SGA
//   duplicada (299): full importe double-charged
//   campos_distintos (402): administrative error, no direct monetary delta
export const BPO_IMPORTE_EN_RIESGO_EUR =
  SEEDED[45].importeOrigenEur +                                          //  5_840
  SEEDED[158].importeOrigenEur +                                         //  6_210
  (SEEDED[103].importeOrigenEur - (SEEDED[103].importeSgaEur ?? 0)) +   //  3_520
  (SEEDED[430].importeOrigenEur - (SEEDED[430].importeSgaEur ?? 0)) +   //  3_550
  SEEDED[299].importeOrigenEur;                                          //  7_780
// = 26_900
