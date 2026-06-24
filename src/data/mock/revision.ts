import type { RevisionItem } from "@/data/types";

export const revisionItems: RevisionItem[] = [
  {
    id: "REV-001",
    origen: "auditoria",
    titulo: "Salto interanual anómalo — Brik · Zumos Naturales Ibéricos S.A.",
    resumen:
      "Las unidades de Brik declaradas para 2025 cayeron un 43% respecto a 2024 sin cambio " +
      "comercial documentado. El agente no encuentra justificación en los datos de ventas disponibles.",
    razonamiento:
      "Comparativa interanual: 2024 → 2.520.000 ud. Brik; 2025 → 1.440.000 ud. El ratio de " +
      "variación (−43%) supera en 4,2 desviaciones estándar el comportamiento histórico del sector " +
      "Bebidas. No se registra descontinuación de línea ni cambio de formato en el ERP. Confianza " +
      "insuficiente para dictamen automático.",
    confianza: 0.67,
    accionSugerida:
      "Contrastar con el equipo comercial si hubo cambio de formato, descontinuación de referencia " +
      "o reclasificación del material Brik a otro tipo de envase en el período.",
    impactoEur: 17_420,
  },
  {
    id: "REV-002",
    origen: "auditoria",
    titulo: "Envase no declarado — Film plástico · Cosmética Piel Viva S.L.",
    resumen:
      "El agente detecta film plástico de sellado (blister) en la ficha técnica del producto " +
      "que no aparece en la declaración SIG presentada.",
    razonamiento:
      "La ficha técnica de producto (Crema Facial Día SPF30, ref. CPV-2210) incluye un " +
      "blister de sellado de film plástico de 8 g/ud. La declaración cubre 2.160.000 unidades " +
      "de este SKU sin incluir dicho material. Regla aplicada: cruce ficha técnica × líneas SIG.",
    confianza: 0.76,
    accionSugerida:
      "Verificar con el equipo de packaging si el blister fue substituido durante 2025 o si " +
      "el material debe incluirse retroactivamente en la declaración.",
    impactoEur: 8_782,
  },
  {
    id: "REV-003",
    origen: "control",
    titulo: "CIF con dígito de control erróneo — ID 402 · Higiene Natura Iberia S.A.",
    resumen:
      "El registro 402 en SGA contiene el CIF de la empresa con un dígito de control " +
      "incorrecto (A80127654 vs A80127653). No bloquea el cobro pero genera riesgo de " +
      "reclamación y potencial expediente sancionador.",
    razonamiento:
      "El campo CIF del registro SGA 402 presenta el valor 'A80127653' frente al valor " +
      "en el sistema de origen 'A80127654'. El algoritmo de verificación del dígito de " +
      "control NIE/CIF indica que solo uno de los dos valores es válido. Esta discrepancia " +
      "no impide el cargo pero puede generar invalidez formal del documento de cobro.",
    confianza: 0.71,
    accionSugerida:
      "Corregir el CIF en SGA antes del cierre del período. Solicitar a la empresa " +
      "confirmación del NIF oficial mediante certificado de la AEAT.",
    impactoEur: 5_650,
  },
  {
    id: "REV-004",
    origen: "control",
    titulo: "Declaración sin registro SGA — ID 158 · Distribuidora Central Peninsular S.A.",
    resumen:
      "La declaración 158 aparece en el sistema de origen pero no tiene contrapartida " +
      "en SGA. Importe en riesgo: 6.210 €.",
    razonamiento:
      "El registro de origen (período Septiembre 2025, ID 158, empresa 'Distribuidora " +
      "Central Peninsular S.A.') está marcado como recibido y procesado en el sistema " +
      "declarante. No existe ningún registro en SGA con ese identificador ni con el CIF " +
      "y periodo coincidentes. Podría ser un fallo de integración o un rechazo silencioso.",
    confianza: 0.58,
    accionSugerida:
      "Verificar los logs de integración entre el sistema de origen y SGA para el rango " +
      "temporal de Septiembre 2025. Comprobar si existió un rechazo de carga no notificado.",
    impactoEur: 6_210,
  },
  {
    id: "REV-005",
    origen: "auditoria",
    titulo: "Datos incompletos — Declaración DEC-009 · Distribuidora Central Peninsular S.A.",
    resumen:
      "La declaración de la distribuidora presenta omisión de flejes PVC y posibles " +
      "inconsistencias en el volumen de Papel/Cartón frente al sistema logístico.",
    razonamiento:
      "El perfil de declarante corresponde a un distribuidor multicliente con más de " +
      "9.600.000 referencias expedidas. El agente detecta con certeza la omisión de " +
      "flejes PVC pero la reconciliación del volumen de Papel/Cartón requiere acceso a " +
      "datos del sistema logístico (expediciones por referencia) que no están disponibles " +
      "en el conjunto de datos actual.",
    confianza: 0.62,
    accionSugerida:
      "Solicitar al cliente el desglose de referencias expedidas por tipo de envase " +
      "y el albarán de compra de flejes del ejercicio 2025.",
    impactoEur: 14_949,
  },
];
