import type { Declaracion, Material, SigLine, Hallazgo, Formato, EmailMensaje } from "@/data/types";

export const tarifas: Record<Material, number> = {
  "PET":           0.471,
  "PEAD":          0.389,
  "PVC":           0.519,
  "Film plástico": 0.508,
  "Papel/Cartón":  0.110,
  "Vidrio":        0.0145,
  "Acero":         0.073,
  "Aluminio":      0.114,
  "Madera":        0.049,
  "Brik":          0.423,
};

function line(
  id: string,
  material: Material,
  unidades: number,
  pesoG: number,
  tarifaOverride?: number,
): SigLine {
  const kg = (unidades * pesoG) / 1000;
  const tarifa = tarifaOverride ?? tarifas[material];
  return {
    id,
    material,
    unidades,
    pesoUnitarioG: pesoG,
    kgTotales: Math.round(kg),
    tarifaEurKg: tarifa,
    importeEur: Math.round(kg * tarifa),
  };
}

function sum(lines: SigLine[]): number {
  return lines.reduce((acc, l) => acc + l.importeEur, 0);
}

// ─────────────────────────────────────────────────────────────
// DEC-001 — Conservas del Cantábrico S.A. — VERIFICADA
// ─────────────────────────────────────────────────────────────
const lines001: SigLine[] = [
  line("001-L1", "Vidrio",        4_800_000, 380, undefined),   // tarros vidrio 380g
  line("001-L2", "Papel/Cartón",  4_800_000,  18, undefined),   // etiquetas + cajas
  line("001-L3", "Acero",           240_000,  45, undefined),   // tapas metálicas
  line("001-L4", "Film plástico",    96_000,  12, undefined),   // retractilado
];
const cuota001 = sum(lines001);

// ─────────────────────────────────────────────────────────────
// DEC-002 — Lácteos Valle Verde S.L. — VERIFICADA
// ─────────────────────────────────────────────────────────────
const lines002: SigLine[] = [
  line("002-L1", "PEAD",           3_600_000,  38, undefined),  // botellas leche 1 L
  line("002-L2", "Papel/Cartón",   3_600_000,  22, undefined),  // cajas agrupación
  line("002-L3", "Aluminio",         720_000,   4, undefined),  // tapones
  line("002-L4", "Film plástico",    180_000,   9, undefined),  // film retractilado
  line("002-L5", "Brik",           1_200_000,  32, undefined),  // brik de nata
];
const cuota002 = sum(lines002);

// ─────────────────────────────────────────────────────────────
// DEC-003 — Aguas de Sierra Azul S.A. — VERIFICADA
// ─────────────────────────────────────────────────────────────
const lines003: SigLine[] = [
  line("003-L1", "PET",            8_400_000,  28, undefined),  // botella agua 500 ml
  line("003-L2", "Papel/Cartón",   8_400_000,  14, undefined),  // etiquetas
  line("003-L3", "Film plástico",    700_000,  18, undefined),  // retractilado pack 6
  line("003-L4", "PEAD",             350_000,  12, undefined),  // tapones
];
const cuota003 = sum(lines003);

// ─────────────────────────────────────────────────────────────
// DEC-004 — Bodegas Marqués de Tordella S.L. — CON HALLAZGOS
// Hallazgo: Infra-declaración de material (PET <envases secundarios>)
//           La empresa declaró 420.000 PET pero ventas implican 680.000
// ─────────────────────────────────────────────────────────────
const lines004: SigLine[] = [
  line("004-L1", "Vidrio",         2_400_000, 560, undefined),  // botella vino 75 cl
  line("004-L2", "Papel/Cartón",   2_400_000,  24, undefined),  // etiquetas + cajas
  line("004-L3", "Acero",          2_400_000,   8, undefined),  // cápsulas aluminio/acero
  line("004-L4", "PET",              420_000,  35, undefined),  // cápsulas PET INFRADECLARADO (real: 680.000)
];
const cuota004Declarada = sum(lines004);
// hallazgo: diferencia por 260.000 unidades PET a 35g = 9.1 kg real diff = impacto
const petDeltaKg = Math.round((260_000 * 35) / 1000); // 9.100 kg
const hallazgos004: Hallazgo[] = [
  {
    id: "H004-1",
    tipo: "Infra-declaración de material",
    severidad: "alta",
    descripcion:
      `Se declaran 420.000 unidades de envase secundario PET (cápsula), pero el cruce ` +
      `con el volumen de ventas registrado (2.400.000 botellas) implica un consumo de ` +
      `680.000 unidades. Diferencia: 260.000 ud. (${petDeltaKg.toLocaleString("es-ES")} kg).`,
    impactoEur: Math.round(petDeltaKg * tarifas["PET"]),
    lineaId: "004-L4",
  },
];
// cuotaCalculada incluye el volumen real
const lines004Real: SigLine[] = [
  line("004-L1", "Vidrio",         2_400_000, 560, undefined),
  line("004-L2", "Papel/Cartón",   2_400_000,  24, undefined),
  line("004-L3", "Acero",          2_400_000,   8, undefined),
  line("004-L4", "PET",              680_000,  35, undefined),
];
const cuota004Calculada = sum(lines004Real);

// ─────────────────────────────────────────────────────────────
// DEC-005 — Higiene Natura Iberia S.A. — CON HALLAZGOS
// Hallazgo: Tarifa incorrecta aplicada (PEAD → declarada como Madera €0.049 vs €0.389)
// ─────────────────────────────────────────────────────────────
const lines005: SigLine[] = [
  line("005-L1", "PEAD",           1_800_000,  52, undefined),  // bote champú 500 ml
  line("005-L2", "Papel/Cartón",   1_800_000,  16, undefined),  // etiquetas
  line("005-L3", "PEAD",             900_000,  18, undefined),  // tapones/dispensadores
  line("005-L4", "PEAD",             360_000,  70, 0.049),      // envase gel TARIFA INCORRECTA (se usó tarifa Madera)
  line("005-L5", "Film plástico",    180_000,  14, undefined),  // retractilado
];
const cuota005Declarada = sum(lines005);
const kgLineaTarifa = Math.round((360_000 * 70) / 1000); // 25.200 kg
const impactoTarifa = Math.round(kgLineaTarifa * (tarifas["PEAD"] - 0.049));
const hallazgos005: Hallazgo[] = [
  {
    id: "H005-1",
    tipo: "Tarifa incorrecta aplicada",
    severidad: "alta",
    descripcion:
      `La línea 005-L4 (envase gel ducha PEAD, 360.000 ud.) aplica una tarifa de ` +
      `0,049 €/kg correspondiente a Madera en lugar de la tarifa PEAD vigente (0,389 €/kg). ` +
      `Diferencia de tarifa: 0,340 €/kg × ${kgLineaTarifa.toLocaleString("es-ES")} kg.`,
    impactoEur: impactoTarifa,
    lineaId: "005-L4",
  },
];
// cuotaCalculada con tarifa correcta
const lines005Correctas: SigLine[] = [
  line("005-L1", "PEAD",           1_800_000,  52, undefined),
  line("005-L2", "Papel/Cartón",   1_800_000,  16, undefined),
  line("005-L3", "PEAD",             900_000,  18, undefined),
  line("005-L4", "PEAD",             360_000,  70, undefined),  // tarifa corregida
  line("005-L5", "Film plástico",    180_000,  14, undefined),
];
const cuota005Calculada = sum(lines005Correctas);

// ─────────────────────────────────────────────────────────────
// DEC-006 — Cosmética Piel Viva S.L. — CON HALLAZGOS
// Hallazgo: Envase no declarado (Film plástico omitido)
// ─────────────────────────────────────────────────────────────
const lines006: SigLine[] = [
  line("006-L1", "PET",            2_160_000,  42, undefined),  // bote crema 200 ml
  line("006-L2", "Papel/Cartón",   2_160_000,  20, undefined),  // estuche exterior
  line("006-L3", "Aluminio",         540_000,   6, undefined),  // tubos aluminio
  // Film plástico (blisters sellado) omitido en declaración
];
const cuota006Declarada = sum(lines006);
const filmOmitidoKg = Math.round((2_160_000 * 8) / 1000); // 17.280 kg
const hallazgos006: Hallazgo[] = [
  {
    id: "H006-1",
    tipo: "Envase no declarado",
    severidad: "media",
    descripcion:
      `El cruce con la ficha técnica de producto detecta el uso de film plástico de sellado ` +
      `(blister, 8 g/ud.) para 2.160.000 unidades (${filmOmitidoKg.toLocaleString("es-ES")} kg). ` +
      `Este material no figura en la declaración SIG presentada.`,
    impactoEur: Math.round(filmOmitidoKg * tarifas["Film plástico"]),
  },
];
const lines006Real: SigLine[] = [
  line("006-L1", "PET",            2_160_000,  42, undefined),
  line("006-L2", "Papel/Cartón",   2_160_000,  20, undefined),
  line("006-L3", "Aluminio",         540_000,   6, undefined),
  line("006-L4", "Film plástico",  2_160_000,   8, undefined),  // línea omitida
];
const cuota006Calculada = sum(lines006Real);

// ─────────────────────────────────────────────────────────────
// DEC-007 — Galletas y Cereales del Sur S.L. — CON HALLAZGOS
// Hallazgo: Incoherencia peso/unidades
// ─────────────────────────────────────────────────────────────
const lines007: SigLine[] = [
  line("007-L1", "Papel/Cartón",   3_000_000,  65, undefined),  // caja cartón 500g
  line("007-L2", "Film plástico",  3_000_000,  11, undefined),  // bolsa interior film
  // línea con error: el declarante usa 185g como peso unitario en vez de 18.5g (decimal desplazado)
  line("007-L3", "PEAD",             600_000, 185, undefined),  // tapón/precinto INCORRECTO (debería ser 18.5g)
  line("007-L4", "Papel/Cartón",     300_000,  30, undefined),  // display exterior
];
const cuota007Declarada = sum(lines007);
// valor correcto de la línea con error
const kgCorrecto = Math.round((600_000 * 18.5) / 1000);         // 11.100 kg (correcto)
const kgDeclarado = Math.round((600_000 * 185) / 1000);          // 111.000 kg (erróneo)
const hallazgos007: Hallazgo[] = [
  {
    id: "H007-1",
    tipo: "Incoherencia peso/unidades",
    severidad: "alta",
    descripcion:
      `La línea PEAD (tapón/precinto) declara 600.000 unidades a 185 g/ud. ` +
      `(${kgDeclarado.toLocaleString("es-ES")} kg en total). El benchmark sectorial ` +
      `y la ficha técnica del proveedor indican un peso real de 18,5 g/ud. ` +
      `(${kgCorrecto.toLocaleString("es-ES")} kg). Probable desplazamiento decimal.`,
    impactoEur: Math.round((kgDeclarado - kgCorrecto) * tarifas["PEAD"]),
    lineaId: "007-L3",
  },
];
const lines007Correctas: SigLine[] = [
  line("007-L1", "Papel/Cartón",   3_000_000,  65, undefined),
  line("007-L2", "Film plástico",  3_000_000,  11, undefined),
  line("007-L3", "PEAD",             600_000,  18, undefined),  // 18 g/ud corregido
  line("007-L4", "Papel/Cartón",     300_000,  30, undefined),
];
const cuota007Calculada = sum(lines007Correctas);

// ─────────────────────────────────────────────────────────────
// DEC-008 — Zumos Naturales Ibéricos S.A. — EN REVISIÓN
// Hallazgo: Salto interanual anómalo (Brik −43% sin causa justificada)
// ─────────────────────────────────────────────────────────────
const lines008: SigLine[] = [
  line("008-L1", "Brik",           1_440_000,  38, undefined),  // brik zumo 1 L (actual 2025)
  line("008-L2", "Papel/Cartón",   1_440_000,  22, undefined),  // cajas agrupación
  line("008-L3", "Film plástico",    240_000,  15, undefined),  // retractilado pack 6
  line("008-L4", "Aluminio",         720_000,   3, undefined),  // tapón
];
const cuota008 = sum(lines008);
const hallazgos008: Hallazgo[] = [
  {
    id: "H008-1",
    tipo: "Salto interanual anómalo",
    severidad: "media",
    descripcion:
      `Las unidades de Brik declaradas para 2025 (1.440.000) suponen una caída del 43% ` +
      `respecto a 2024 (2.520.000 ud.) sin que conste ningún cambio de formato, línea de ` +
      `producto o descontinuación en el sistema de ventas. Se requiere justificación documental.`,
    impactoEur: Math.round(
      ((2_520_000 - 1_440_000) * 38 / 1000) * tarifas["Brik"],
    ),
  },
];

// ─────────────────────────────────────────────────────────────
// DEC-009 — Distribuidora Central Peninsular S.A. — EN REVISIÓN
// Hallazgo combinado: Envase no declarado + datos incompletos
// ─────────────────────────────────────────────────────────────
const lines009: SigLine[] = [
  line("009-L1", "Papel/Cartón",   9_600_000,  35, undefined),  // caja de envío
  line("009-L2", "Film plástico",  2_400_000,  22, undefined),  // palé retractil
  line("009-L3", "Madera",           120_000, 850, undefined),  // palé madera
  // PVC (flejes precinto) omitido
];
const cuota009Declarada = sum(lines009);
const pvcOmitidoKg = Math.round((9_600_000 * 3) / 1000); // 28.800 kg
const hallazgos009: Hallazgo[] = [
  {
    id: "H009-1",
    tipo: "Envase no declarado",
    severidad: "baja",
    descripcion:
      `El sistema detecta el uso de flejes PVC de precinto de palé (3 g/ud. estimado, ` +
      `9.600.000 referencias expedidas) no incluidos en la declaración. ` +
      `Impacto estimado: ${pvcOmitidoKg.toLocaleString("es-ES")} kg.`,
    impactoEur: Math.round(pvcOmitidoKg * tarifas["PVC"]),
  },
];
const lines009Real: SigLine[] = [
  line("009-L1", "Papel/Cartón",   9_600_000,  35, undefined),
  line("009-L2", "Film plástico",  2_400_000,  22, undefined),
  line("009-L3", "Madera",           120_000, 850, undefined),
  line("009-L4", "PVC",            9_600_000,   3, undefined),
];
const cuota009Calculada = sum(lines009Real);

// ─────────────────────────────────────────────────────────────
// Formatos y correspondencia para el pipeline de agente
// ─────────────────────────────────────────────────────────────

const formatos001: Formato[] = [
  {
    id: 1, nombre: "Tarro Cristal 500g Conserva", producto: "conservas", ventas: 2_400_000, destino: "Doméstico",
    componentes: [
      { id: "001-F1-C1", envase: "Botella/Garrafa", material: "Vidrio", color: "Transparente o Light Blue", rigidez: "Rígido", grEnvase: 380, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.00551, puntoVerdeDef: 13224 },
      { id: "001-F1-C2", envase: "Tapones, tapas", material: "Acero", color: "Color", rigidez: "Rígido", grEnvase: 45, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.003285, puntoVerdeDef: 7884 },
      { id: "001-F1-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 18, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.00198, puntoVerdeDef: 4752 },
    ],
  },
  {
    id: 2, nombre: "Tarro Cristal 280g Conserva", producto: "conservas", ventas: 2_400_000, destino: "Doméstico",
    componentes: [
      { id: "001-F2-C1", envase: "Botella/Garrafa", material: "Vidrio", color: "Transparente o Light Blue", rigidez: "Rígido", grEnvase: 320, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.00464, puntoVerdeDef: 11136 },
      { id: "001-F2-C2", envase: "Tapones, tapas", material: "Acero", color: "Color", rigidez: "Rígido", grEnvase: 45, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.003285, puntoVerdeDef: 7884 },
      { id: "001-F2-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 18, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.00198, puntoVerdeDef: 4752 },
    ],
  },
];

const formatos002: Formato[] = [
  {
    id: 1, nombre: "Botella Leche PEAD 1L", producto: "lácteos", ventas: 3_600_000, destino: "Doméstico",
    componentes: [
      { id: "002-F1-C1", envase: "Botella/Garrafa", material: "HDPE", color: "Sin Color", rigidez: "Rígido", grEnvase: 38, unidades: 1, unidadesTotales: 3_600_000, costeUnitDef: 0.014782, puntoVerdeDef: 53215.2 },
      { id: "002-F1-C2", envase: "Tapones, tapas", material: "Aluminio", color: "Color", rigidez: "Rígido", grEnvase: 4, unidades: 1, unidadesTotales: 3_600_000, costeUnitDef: 0.000456, puntoVerdeDef: 1641.6 },
      { id: "002-F1-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 22, unidades: 1, unidadesTotales: 3_600_000, costeUnitDef: 0.00242, puntoVerdeDef: 8712 },
    ],
  },
  {
    id: 2, nombre: "Brik Nata Cocinar 200ml", producto: "lácteos", ventas: 1_200_000, destino: "Doméstico",
    componentes: [
      { id: "002-F2-C1", envase: "Botella/Garrafa", material: "Brik", color: "Color", rigidez: "Rígido", grEnvase: 32, unidades: 1, unidadesTotales: 1_200_000, costeUnitDef: 0.013536, puntoVerdeDef: 16243.2 },
      { id: "002-F2-C2", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 9, unidades: 1, unidadesTotales: 180_000, costeUnitDef: 0.004572, puntoVerdeDef: 822.96 },
    ],
  },
];

const formatos003: Formato[] = [
  {
    id: 1, nombre: "Botella PET Agua 500ml", producto: "agua mineral", ventas: 8_400_000, destino: "Doméstico",
    componentes: [
      { id: "003-F1-C1", envase: "Botella/Garrafa", material: "PET", color: "Transparente o Light Blue", rigidez: "Rígido", grEnvase: 28, unidades: 1, unidadesTotales: 8_400_000, costeUnitDef: 0.013188, puntoVerdeDef: 110779.2 },
      { id: "003-F1-C2", envase: "Tapones, tapas", material: "HDPE", color: "Sin Color", rigidez: "Rígido", grEnvase: 12, unidades: 1, unidadesTotales: 8_400_000, costeUnitDef: 0.004668, puntoVerdeDef: 39211.2 },
      { id: "003-F1-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 14, unidades: 1, unidadesTotales: 8_400_000, costeUnitDef: 0.00154, puntoVerdeDef: 12936 },
      { id: "003-F1-C4", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 18, unidades: 1, unidadesTotales: 700_000, costeUnitDef: 0.009144, puntoVerdeDef: 6400.8 },
    ],
  },
  {
    id: 2, nombre: "Botella PET Agua 1,5L", producto: "agua mineral", ventas: 1_200_000, destino: "Doméstico",
    componentes: [
      { id: "003-F2-C1", envase: "Botella/Garrafa", material: "PET", color: "Transparente o Light Blue", rigidez: "Rígido", grEnvase: 42, unidades: 1, unidadesTotales: 1_200_000, costeUnitDef: 0.019782, puntoVerdeDef: 23738.4 },
      { id: "003-F2-C2", envase: "Tapones, tapas", material: "HDPE", color: "Sin Color", rigidez: "Rígido", grEnvase: 12, unidades: 1, unidadesTotales: 1_200_000, costeUnitDef: 0.004668, puntoVerdeDef: 5601.6 },
      { id: "003-F2-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 14, unidades: 1, unidadesTotales: 1_200_000, costeUnitDef: 0.00154, puntoVerdeDef: 1848 },
    ],
  },
];

const formatos004: Formato[] = [
  {
    id: 1, nombre: "Botella Vino Tinto 75cl Vidrio", producto: "vinos", ventas: 2_400_000, destino: "Doméstico",
    componentes: [
      { id: "004-F1-C1", envase: "Botella/Garrafa", material: "Vidrio", color: "Color", rigidez: "Rígido", grEnvase: 560, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.00812, puntoVerdeDef: 19488 },
      { id: "004-F1-C2", envase: "Tapones, tapas", material: "Acero", color: "Color", rigidez: "Rígido", grEnvase: 8, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.000584, puntoVerdeDef: 1401.6 },
      { id: "004-F1-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 24, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.00264, puntoVerdeDef: 6336 },
    ],
  },
  {
    id: 2, nombre: "Cápsula PET Protección Botella", producto: "vinos", ventas: 2_400_000, destino: "Comercial",
    componentes: [
      { id: "004-F2-C1", envase: "Elementos para la seguridad y uso del producto (asa, aplicador, dosificador, precinto, cápsula..)", material: "PET", color: "Color", rigidez: "Rígido", grEnvase: 35, unidades: 1, unidadesTotales: 420_000, costeUnitDef: 0.016485, puntoVerdeDef: 6923.7 },
    ],
  },
];

const correspondencia004: EmailMensaje[] = [
  {
    id: "004-M1",
    de: "agente",
    remitente: "Agente Auditor · Ecoembes",
    asunto: "Declaración Período 56 — Revisión componentes PET Cápsula (Formato 2)",
    fecha: "2025-04-28",
    cuerpo: "Estimados Sres. de Bodegas Marqués de Tordella S.L.,\n\nEn el marco del análisis monográfico de su declaración correspondiente al período 56, se ha detectado una posible inconsistencia en el Formato 2 (Cápsula PET Protección Botella).\n\nSe ha detectado que el Formato 2 (Cápsula PET Protección Botella) declara 420.000 unidades de un elemento de seguridad fabricado en material PET. Sin embargo, el volumen de ventas registrado en el sistema asciende a 2.400.000 unidades de botella, lo que implica un consumo equivalente de cápsulas. La diferencia (1.980.000 unidades no declaradas) puede suponer una infra-declaración de material PET significativa.\n\nSe solicita que aporten documentación que justifique el número de unidades de cápsulas efectivamente puestas en el mercado durante el período 56, incluyendo albaranes de compra o fichas de consumo de envases.\n\nAtentamente,\nAgente Auditor · Ecoembes",
    adjuntos: [],
  },
  {
    id: "004-M2",
    de: "cliente",
    remitente: "María González · Bodegas Marqués de Tordella S.L.",
    asunto: "RE: Declaración Período 56 — Revisión componentes PET Cápsula (Formato 2)",
    fecha: "2025-05-06",
    cuerpo: "Estimado equipo de Ecoembes,\n\nRecibimos su comunicación y comprendemos la discrepancia detectada. La razón de la diferencia es que durante el período 56 se realizó un cambio de proveedor de cápsulas y se redujo el uso de cápsulas PET en favor del corchotaponado para el 75% de la producción.\n\nAdjuntamos la ficha técnica del nuevo tapón de corcho, así como los albaranes de compra de cápsulas PET del período que confirman las 420.000 unidades declaradas. Quedamos a disposición para cualquier aclaración adicional.\n\nAtentamente,\nMaría González\nResponsable de Medioambiente · Bodegas Marqués de Tordella S.L.",
    adjuntos: ["albaranes_capsulas_PET_periodo56.pdf", "ficha_tecnica_tapon_corcho.pdf"],
  },
];

const formatos005: Formato[] = [
  {
    id: 1, nombre: "Bote Champú PEAD 500ml", producto: "higiene personal", ventas: 1_800_000, destino: "Doméstico",
    componentes: [
      { id: "005-F1-C1", envase: "Botella/Garrafa", material: "HDPE", color: "Color", rigidez: "Rígido", grEnvase: 52, unidades: 1, unidadesTotales: 1_800_000, costeUnitDef: 0.020228, puntoVerdeDef: 36410.4 },
      { id: "005-F1-C2", envase: "Tapones, tapas", material: "HDPE", color: "Sin Color", rigidez: "Rígido", grEnvase: 18, unidades: 1, unidadesTotales: 900_000, costeUnitDef: 0.007002, puntoVerdeDef: 6301.8 },
      { id: "005-F1-C3", envase: "Etiqueta < 2/3", material: "Papel/Cartón", color: "Color", rigidez: "Flexible", grEnvase: 16, unidades: 1, unidadesTotales: 1_800_000, costeUnitDef: 0.00176, puntoVerdeDef: 3168 },
    ],
  },
  {
    id: 2, nombre: "Envase Gel Ducha PEAD 400ml", producto: "higiene personal", ventas: 360_000, destino: "Doméstico",
    componentes: [
      { id: "005-F2-C1", envase: "Botella/Garrafa", material: "HDPE", color: "Color", rigidez: "Rígido", grEnvase: 70, unidades: 1, unidadesTotales: 360_000, costeUnitDef: 0.027230, puntoVerdeDef: 9802.8 },
      { id: "005-F2-C2", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 14, unidades: 1, unidadesTotales: 180_000, costeUnitDef: 0.007112, puntoVerdeDef: 1280.16 },
    ],
  },
];

const correspondencia005: EmailMensaje[] = [
  {
    id: "005-M1",
    de: "agente",
    remitente: "Agente Auditor · Ecoembes",
    asunto: "Declaración Período 56 — Error tarifa línea Gel Ducha PEAD",
    fecha: "2025-04-14",
    cuerpo: "Estimados Sres. de Higiene Natura Iberia S.A.,\n\nDurante el análisis monográfico de la declaración correspondiente al período 56, se ha detectado que la línea de envase principal del formato Gel Ducha PEAD 400ml (referencia 005-L4) aplica una tarifa de 0,049 €/kg, correspondiente al material Madera, en lugar de la tarifa vigente para PEAD (0,389 €/kg). Esta diferencia de 0,340 €/kg aplicada sobre 25.200 kg resulta en una cuota infra-calculada.\n\nSe solicita que confirmen si se trata de un error de captura o si existe alguna justificación para la tarifa aplicada.\n\nAtentamente,\nAgente Auditor · Ecoembes",
    adjuntos: [],
  },
  {
    id: "005-M2",
    de: "cliente",
    remitente: "Carlos Ruiz · Higiene Natura Iberia S.A.",
    asunto: "RE: Declaración Período 56 — Error tarifa línea Gel Ducha PEAD",
    fecha: "2025-04-22",
    cuerpo: "Estimado equipo de Ecoembes,\n\nRevisada la declaración internamente, confirmamos que se trató de un error de selección en la plataforma al asignar el material. El envase gel ducha es efectivamente PEAD y la tarifa correcta es 0,389 €/kg.\n\nPresentaremos una declaración complementaria con la corrección.\n\nAtentamente,\nCarlos Ruiz\nDpto. Sostenibilidad · Higiene Natura Iberia S.A.",
    adjuntos: ["confirmacion_material_PEAD.pdf"],
  },
  {
    id: "005-M3",
    de: "agente",
    remitente: "Agente Auditor · Ecoembes",
    asunto: "RE: Declaración Período 56 — Resolución hallazgo tarifa",
    fecha: "2025-05-02",
    cuerpo: "Estimados Sres. de Higiene Natura Iberia S.A.,\n\nAcusamos recibo de la confirmación y de la documentación aportada. Dado que el error de tarifa ha sido reconocido por la empresa y la corrección está en curso mediante declaración complementaria, se procede a marcar la declaración original como NO APTA.\n\nLa declaración complementaria corregida deberá ser presentada antes del 30 de junio de 2025.\n\nAtentamente,\nAgente Auditor · Ecoembes",
    adjuntos: [],
  },
];

const formatos006: Formato[] = [
  {
    id: 1, nombre: "Bote Crema PET 200ml", producto: "cosmética", ventas: 2_160_000, destino: "Doméstico",
    componentes: [
      { id: "006-F1-C1", envase: "Botella/Garrafa", material: "PET", color: "Color", rigidez: "Rígido", grEnvase: 42, unidades: 1, unidadesTotales: 2_160_000, costeUnitDef: 0.019782, puntoVerdeDef: 42729.12 },
      { id: "006-F1-C2", envase: "Caja, bandeja", material: "Papel/Cartón", color: "Color", rigidez: "Rígido", grEnvase: 20, unidades: 1, unidadesTotales: 2_160_000, costeUnitDef: 0.0022, puntoVerdeDef: 4752 },
    ],
  },
  {
    id: 2, nombre: "Tubo Aluminio Crema 75ml", producto: "cosmética", ventas: 540_000, destino: "Doméstico",
    componentes: [
      { id: "006-F2-C1", envase: "Botella/Garrafa", material: "Aluminio", color: "Color", rigidez: "Rígido", grEnvase: 6, unidades: 1, unidadesTotales: 540_000, costeUnitDef: 0.000684, puntoVerdeDef: 369.36 },
      { id: "006-F2-C2", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 8, unidades: 1, unidadesTotales: 2_160_000, costeUnitDef: 0.004064, puntoVerdeDef: 8778.24 },
    ],
  },
];

const correspondencia006: EmailMensaje[] = [
  {
    id: "006-M1",
    de: "agente",
    remitente: "Agente Auditor · Ecoembes",
    asunto: "Declaración Período 56 — Posible omisión Film plástico (blister sellado)",
    fecha: "2025-04-18",
    cuerpo: "Estimados Sres. de Cosmética Piel Viva S.L.,\n\nEn el análisis del Formato 1 (Bote Crema PET 200ml), la declaración no incluye ningún componente de film plástico o blister de sellado. De acuerdo con la ficha técnica del producto disponible en el catálogo público de la empresa, este formato incorpora un blister de film LDPE de sellado (peso aproximado 8 g/ud.) en el 100% de las unidades vendidas.\n\nSe solicita que confirmen si dicho componente fue declarado bajo otra referencia o, en caso contrario, aporten documentación que justifique su no inclusión en la declaración SIG.\n\nAtentamente,\nAgente Auditor · Ecoembes",
    adjuntos: [],
  },
  {
    id: "006-M2",
    de: "cliente",
    remitente: "Ana Martínez · Cosmética Piel Viva S.L.",
    asunto: "RE: Declaración Período 56 — Posible omisión Film plástico (blister sellado)",
    fecha: "2025-04-30",
    cuerpo: "Estimado equipo de Ecoembes,\n\nGracias por su comunicación. Tras revisar internamente la declaración, confirmamos que el film LDPE del blister de sellado del Formato Bote Crema PET 200ml no fue incluido en la declaración original por un error en el proceso de volcado de datos. El componente existe y está documentado.\n\nAdjuntamos la ficha técnica del film utilizado (8,2 g/ud.) y confirmaremos la cifra exacta con nuestro proveedor antes de proceder a la corrección.\n\nAtentamente,\nAna Martínez\nDpto. Cumplimiento Medioambiental · Cosmética Piel Viva S.L.",
    adjuntos: ["ficha_tecnica_film_ldpe_blister.pdf"],
  },
];

const formatos007: Formato[] = [
  {
    id: 1, nombre: "Caja Cartón Galletas 500g", producto: "galletas", ventas: 3_000_000, destino: "Doméstico",
    componentes: [
      { id: "007-F1-C1", envase: "Caja, bandeja", material: "Papel/Cartón", color: "Color", rigidez: "Rígido", grEnvase: 65, unidades: 1, unidadesTotales: 3_000_000, costeUnitDef: 0.00715, puntoVerdeDef: 21450 },
      { id: "007-F1-C2", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 11, unidades: 1, unidadesTotales: 3_000_000, costeUnitDef: 0.005588, puntoVerdeDef: 16764 },
      { id: "007-F1-C3", envase: "Tapones, tapas", material: "HDPE", color: "Sin Color", rigidez: "Rígido", grEnvase: 185, unidades: 1, unidadesTotales: 600_000, costeUnitDef: 0.071965, puntoVerdeDef: 43179 },
    ],
  },
  {
    id: 2, nombre: "Display Cartón 12 uds", producto: "galletas", ventas: 300_000, destino: "Comercial",
    componentes: [
      { id: "007-F2-C1", envase: "Caja, bandeja", material: "Papel/Cartón", color: "Color", rigidez: "Rígido", grEnvase: 30, unidades: 1, unidadesTotales: 300_000, costeUnitDef: 0.0033, puntoVerdeDef: 990 },
    ],
  },
];

const formatos008: Formato[] = [
  {
    id: 1, nombre: "Brik Zumo 1L", producto: "zumos", ventas: 1_440_000, destino: "Doméstico",
    componentes: [
      { id: "008-F1-C1", envase: "Botella/Garrafa", material: "Brik", color: "Color", rigidez: "Rígido", grEnvase: 38, unidades: 1, unidadesTotales: 1_440_000, costeUnitDef: 0.016074, puntoVerdeDef: 23146.56 },
      { id: "008-F1-C2", envase: "Tapones, tapas", material: "Aluminio", color: "Sin Color", rigidez: "Rígido", grEnvase: 3, unidades: 1, unidadesTotales: 720_000, costeUnitDef: 0.000342, puntoVerdeDef: 246.24 },
      { id: "008-F1-C3", envase: "Caja, bandeja", material: "Papel/Cartón", color: "Color", rigidez: "Rígido", grEnvase: 22, unidades: 1, unidadesTotales: 1_440_000, costeUnitDef: 0.00242, puntoVerdeDef: 3484.8 },
    ],
  },
  {
    id: 2, nombre: "Pack 6x1L Brik Zumo Film", producto: "zumos", ventas: 240_000, destino: "Doméstico",
    componentes: [
      { id: "008-F2-C1", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 15, unidades: 1, unidadesTotales: 240_000, costeUnitDef: 0.00762, puntoVerdeDef: 1828.8 },
    ],
  },
];

const correspondencia008: EmailMensaje[] = [
  {
    id: "008-M1",
    de: "agente",
    remitente: "Agente Auditor · Ecoembes",
    asunto: "Declaración Período 56 — Variación significativa unidades Brik vs período anterior",
    fecha: "2025-05-08",
    cuerpo: "Estimados Sres. de Zumos Naturales Ibéricos S.A.,\n\nEn el análisis comparativo período 54 vs período 56, se ha detectado una reducción del 43% en las unidades de Brik declaradas (1.440.000 ud. en período 56 vs 2.520.000 ud. en período 54). Esta variación no está asociada a ningún cambio de formato, descatalogación de producto ni fusión empresarial registrada en el sistema.\n\nPara poder emitir dictamen sobre la declaración, se requiere que aporten justificación documental de la variación: informe de ventas del período, cambios en la cartera de productos o cualquier otro documento que explique la reducción.\n\nAtentamente,\nAgente Auditor · Ecoembes",
    adjuntos: [],
  },
];

const formatos009: Formato[] = [
  {
    id: 1, nombre: "Caja Cartón Transporte 1/2", producto: "distribución", ventas: 9_600_000, destino: "Comercial",
    componentes: [
      { id: "009-F1-C1", envase: "Caja, bandeja", material: "Papel/Cartón", color: "Sin Color", rigidez: "Rígido", grEnvase: 35, unidades: 1, unidadesTotales: 9_600_000, costeUnitDef: 0.003850, puntoVerdeDef: 36960 },
    ],
  },
  {
    id: 2, nombre: "Film Retractil Palé", producto: "distribución", ventas: 2_400_000, destino: "Comercial",
    componentes: [
      { id: "009-F2-C1", envase: "Lámina, film, flow pack", material: "LDPE", color: "Transparente o Light Blue", rigidez: "Flexible", grEnvase: 22, unidades: 1, unidadesTotales: 2_400_000, costeUnitDef: 0.011176, puntoVerdeDef: 26822.4 },
    ],
  },
  {
    id: 3, nombre: "Palé Madera Transporte", producto: "distribución", ventas: 120_000, destino: "Comercial",
    componentes: [
      { id: "009-F3-C1", envase: "Caja, bandeja", material: "Madera", color: "Sin Color", rigidez: "Rígido", grEnvase: 850, unidades: 1, unidadesTotales: 120_000, costeUnitDef: 0.04165, puntoVerdeDef: 4998 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Final export
// ─────────────────────────────────────────────────────────────
export const declaraciones: Declaracion[] = [
  {
    id: "DEC-001",
    empresa: "Conservas del Cantábrico S.A.",
    cif: "A28541367",
    sector: "Alimentación",
    ejercicio: 2025,
    fechaRecepcion: "2025-03-12",
    sigLines: lines001,
    cuotaDeclaradaEur: cuota001,
    cuotaCalculadaEur: cuota001,
    hallazgos: [],
    estado: "verificada",
    confianza: 0.98,
    dictamen:
      "Declaración conforme. Todas las líneas SIG presentan coherencia interna con las fichas técnicas de envase y el volumen de ventas registrado. No se detectan anomalías.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota001,
    formatos: formatos001,
    estadoAgente: "apto",
    correspondencia: [],
    consultasAbiertas: 0,
    veredicto: "apto",
  },
  {
    id: "DEC-002",
    empresa: "Lácteos Valle Verde S.L.",
    cif: "B31204985",
    sector: "Alimentación",
    ejercicio: 2025,
    fechaRecepcion: "2025-03-18",
    sigLines: lines002,
    cuotaDeclaradaEur: cuota002,
    cuotaCalculadaEur: cuota002,
    hallazgos: [],
    estado: "verificada",
    confianza: 0.97,
    dictamen:
      "Declaración verificada sin incidencias. Los materiales declarados (PEAD, Papel/Cartón, Aluminio, Film plástico, Brik) se ajustan al mix de envase de la gama láctea. Tarifa correcta en todas las líneas.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota002,
    formatos: formatos002,
    estadoAgente: "apto",
    correspondencia: [],
    consultasAbiertas: 0,
    veredicto: "apto",
  },
  {
    id: "DEC-003",
    empresa: "Aguas de Sierra Azul S.A.",
    cif: "A46739210",
    sector: "Bebidas",
    ejercicio: 2025,
    fechaRecepcion: "2025-03-25",
    sigLines: lines003,
    cuotaDeclaradaEur: cuota003,
    cuotaCalculadaEur: cuota003,
    hallazgos: [],
    estado: "verificada",
    confianza: 0.99,
    dictamen:
      "Declaración conforme. Relación PET/tapones coherente con la producción de botella 500 ml. Etiquetado e importe SIG calculados correctamente.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota003,
    formatos: formatos003,
    estadoAgente: "apto",
    correspondencia: [],
    consultasAbiertas: 0,
    veredicto: "apto",
  },
  {
    id: "DEC-004",
    empresa: "Bodegas Marqués de Tordella S.L.",
    cif: "B26083741",
    sector: "Bebidas",
    ejercicio: 2025,
    fechaRecepcion: "2025-04-02",
    sigLines: lines004,
    cuotaDeclaradaEur: cuota004Declarada,
    cuotaCalculadaEur: cuota004Calculada,
    hallazgos: hallazgos004,
    estado: "con_hallazgos",
    confianza: 0.91,
    dictamen:
      "Declaración con hallazgo de alta severidad. Las unidades de envase PET declaradas son significativamente inferiores a las que se derivan del volumen de ventas auditado. Se requiere corrección y aportación de evidencia documental del sistema de compras de envases.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota004Declarada,
    formatos: formatos004,
    estadoAgente: "consulta_enviada",
    correspondencia: correspondencia004,
    consultasAbiertas: 1,
    veredicto: null,
  },
  {
    id: "DEC-005",
    empresa: "Higiene Natura Iberia S.A.",
    cif: "A80127654",
    sector: "Droguería y perfumería",
    ejercicio: 2025,
    fechaRecepcion: "2025-04-08",
    sigLines: lines005,
    cuotaDeclaradaEur: cuota005Declarada,
    cuotaCalculadaEur: cuota005Calculada,
    hallazgos: hallazgos005,
    estado: "con_hallazgos",
    confianza: 0.88,
    dictamen:
      "Declaración con error de tarifa en la línea de envase gel ducha (PEAD). Se ha aplicado la tarifa de Madera (0,049 €/kg) en lugar de la tarifa PEAD vigente (0,389 €/kg). La cuota resultante está infra-calculada. Se requiere corrección inmediata.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota005Declarada,
    formatos: formatos005,
    estadoAgente: "no_apto",
    correspondencia: correspondencia005,
    consultasAbiertas: 0,
    veredicto: "no_apto",
  },
  {
    id: "DEC-006",
    empresa: "Cosmética Piel Viva S.L.",
    cif: "B58392014",
    sector: "Cosmética",
    ejercicio: 2025,
    fechaRecepcion: "2025-04-15",
    sigLines: lines006,
    cuotaDeclaradaEur: cuota006Declarada,
    cuotaCalculadaEur: cuota006Calculada,
    hallazgos: hallazgos006,
    estado: "con_hallazgos",
    confianza: 0.84,
    dictamen:
      "Declaración incompleta: el material Film plástico (blister de sellado) no ha sido declarado. El cruce con la ficha técnica del producto lo identifica como material de envasado sujeto a cuota. Severidad media; pendiente de regularización.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota006Declarada,
    formatos: formatos006,
    estadoAgente: "respuesta_recibida",
    correspondencia: correspondencia006,
    consultasAbiertas: 0,
    veredicto: null,
  },
  {
    id: "DEC-007",
    empresa: "Galletas y Cereales del Sur S.L.",
    cif: "B41672309",
    sector: "Alimentación",
    ejercicio: 2025,
    fechaRecepcion: "2025-04-22",
    sigLines: lines007,
    cuotaDeclaradaEur: cuota007Declarada,
    cuotaCalculadaEur: cuota007Calculada,
    hallazgos: hallazgos007,
    estado: "con_hallazgos",
    confianza: 0.79,
    dictamen:
      "Declaración con anomalía en la línea de tapones PEAD: el peso unitario declarado (185 g) excede en un orden de magnitud el benchmark sectorial para este tipo de envase. Probable error de captura (desplazamiento decimal). Cuota sobredeclarada de forma material.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota007Declarada,
    formatos: formatos007,
    estadoAgente: "en_analisis",
    correspondencia: [],
    consultasAbiertas: 0,
    veredicto: null,
  },
  {
    id: "DEC-008",
    empresa: "Zumos Naturales Ibéricos S.A.",
    cif: "A50817423",
    sector: "Bebidas",
    ejercicio: 2025,
    fechaRecepcion: "2025-05-05",
    sigLines: lines008,
    cuotaDeclaradaEur: cuota008,
    cuotaCalculadaEur: cuota008,
    hallazgos: hallazgos008,
    estado: "en_revision",
    confianza: 0.67,
    dictamen:
      "Declaración en revisión. Se detecta una caída del 43% en unidades de Brik respecto al ejercicio anterior sin justificación en el sistema de ventas. La confianza del agente es insuficiente para emitir dictamen definitivo. Se remite a revisión humana para contraste con el equipo comercial.",
    periodo: 56,
    canal: "PLATAFORMA 2.0",
    importeDaeEur: cuota008,
    formatos: formatos008,
    estadoAgente: "consulta_enviada",
    correspondencia: correspondencia008,
    consultasAbiertas: 1,
    veredicto: null,
  },
  {
    id: "DEC-009",
    empresa: "Distribuidora Central Peninsular S.A.",
    cif: "A63095482",
    sector: "Distribución",
    ejercicio: 2025,
    fechaRecepcion: "2025-05-12",
    sigLines: lines009,
    cuotaDeclaradaEur: cuota009Declarada,
    cuotaCalculadaEur: cuota009Calculada,
    hallazgos: hallazgos009,
    estado: "en_revision",
    confianza: 0.62,
    dictamen:
      "Declaración incompleta con elementos de baja confianza. Se detecta omisión de flejes PVC y posibles discrepancias en el volumen de unidades de Papel/Cartón respecto al sistema logístico. Se remite a revisión humana por la complejidad del perfil de distribuidor multicliente.",
    periodo: 54,
    canal: "Ficticias Tipo Carta",
    importeDaeEur: cuota009Declarada,
    formatos: formatos009,
    estadoAgente: "en_revision",
    correspondencia: [],
    consultasAbiertas: 0,
    veredicto: null,
  },
];
