import type { RevisionItem } from "@/data/types";

export const revisionItems: RevisionItem[] = [
  {
    id: "REV-001",
    origen: "auditoria",
    prioridad: "alta",
    creadoHace: "2 h",
    titulo: "Salto interanual anómalo — Brik · Zumos Naturales Ibéricos S.A.",
    resumen:
      "Las unidades de Brik declaradas para 2025 cayeron un 43% respecto a 2024 sin cambio " +
      "comercial documentado. El agente no encuentra justificación en los datos de ventas disponibles.",
    razonamiento:
      "Comparativa interanual: 2024 → 2.520.000 ud. Brik; 2025 → 1.440.000 ud. El ratio de " +
      "variación (−43%) supera en 4,2 desviaciones estándar el comportamiento histórico del sector " +
      "Bebidas. No se registra descontinuación de línea ni cambio de formato en el ERP. Confianza " +
      "insuficiente para dictamen automático.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Caída del 43% en unidades Brik (2024 → 2025) sin evento comercial registrado.",
      },
      {
        etapa: "Análisis",
        detalle:
          "La variación supera 4,2 σ del histórico del sector Bebidas; el ERP no muestra descontinuación ni cambio de formato.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 67 % — por debajo del umbral de dictamen autónomo.",
      },
      {
        etapa: "Escalado",
        detalle: "Ticket abierto para validación humana antes de emitir dictamen.",
      },
    ],
    evidencia: [
      {
        fuente: "Declaración 2025",
        detalle: "1.440.000 unidades Brik declaradas para el período actual.",
      },
      {
        fuente: "Histórico 2024",
        detalle: "2.520.000 unidades Brik declaradas en el período comparable.",
      },
      {
        fuente: "ERP comercial",
        detalle: "Sin baja de referencia ni cambio de formato registrado.",
      },
    ],
    confianza: 0.67,
    decisionRequerida: "Confirmar si el descenso responde a un cambio comercial real o a una reclasificación.",
    accionSugerida:
      "Contrastar con el equipo comercial si hubo cambio de formato, descontinuación de referencia " +
      "o reclasificación del material Brik a otro tipo de envase en el período.",
    impactoEur: 17_420,
  },
  {
    id: "REV-002",
    origen: "auditoria",
    prioridad: "media",
    creadoHace: "4 h",
    titulo: "Envase no declarado — Film plástico · Cosmética Piel Viva S.L.",
    resumen:
      "El agente detecta film plástico de sellado (blister) en la ficha técnica del producto " +
      "que no aparece en la declaración SIG presentada.",
    razonamiento:
      "La ficha técnica de producto (Crema Facial Día SPF30, ref. CPV-2210) incluye un " +
      "blister de sellado de film plástico de 8 g/ud. La declaración cubre 2.160.000 unidades " +
      "de este SKU sin incluir dicho material. Regla aplicada: cruce ficha técnica × líneas SIG.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Blister de film plástico (8 g/ud.) en ficha técnica CPV-2210 ausente en la declaración SIG.",
      },
      {
        etapa: "Análisis",
        detalle: "2.160.000 uds. declaradas del SKU sin línea de material blister; regla ficha × SIG activada.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 76 % — material probablemente omitido, pero requiere confirmación de packaging.",
      },
      {
        etapa: "Escalado",
        detalle: "Escalado a revisión humana por posible sustitución de envase no reflejada en SIG.",
      },
    ],
    evidencia: [
      {
        fuente: "Ficha técnica CPV-2210",
        detalle: "Blister de sellado de film plástico de 8 g/ud.",
      },
      {
        fuente: "Declaración SIG",
        detalle: "SKU declarado sin línea de material asociada al blister.",
      },
      {
        fuente: "Regla aplicada",
        detalle: "Cruce ficha técnica × líneas SIG para materiales secundarios.",
      },
    ],
    confianza: 0.76,
    decisionRequerida: "Validar si el blister estuvo vigente en 2025 y debe incluirse retroactivamente.",
    accionSugerida:
      "Verificar con el equipo de packaging si el blister fue substituido durante 2025 o si " +
      "el material debe incluirse retroactivamente en la declaración.",
    impactoEur: 8_782,
  },
  {
    id: "REV-003",
    origen: "control",
    prioridad: "media",
    creadoHace: "5 h",
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
    pasos: [
      {
        etapa: "Señal",
        detalle: "CIF en SGA (A80127653) difiere del sistema de origen (A80127654) en registro 402.",
      },
      {
        etapa: "Análisis",
        detalle: "Validación algorítmica NIE/CIF: solo uno de los dos valores es formalmente válido.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 71 % — discrepancia formal sin bloqueo de cobro, pero con riesgo de reclamación.",
      },
      {
        etapa: "Escalado",
        detalle: "Corrección manual en SGA recomendada antes del cierre de período.",
      },
    ],
    evidencia: [
      {
        fuente: "Sistema origen",
        detalle: "CIF A80127654 asociado a Higiene Natura Iberia S.A.",
      },
      {
        fuente: "SGA",
        detalle: "Registro 402 cargado con CIF A80127653.",
      },
      {
        fuente: "Validador NIF/CIF",
        detalle: "Dígito de control inconsistente en uno de los valores.",
      },
    ],
    confianza: 0.71,
    decisionRequerida: "Confirmar el NIF oficial y autorizar la corrección en SGA.",
    accionSugerida:
      "Corregir el CIF en SGA antes del cierre del período. Solicitar a la empresa " +
      "confirmación del NIF oficial mediante certificado de la AEAT.",
    impactoEur: 5_650,
    registroId: "402",
  },
  {
    id: "REV-004",
    origen: "control",
    prioridad: "alta",
    creadoHace: "1 d",
    titulo: "Declaración sin registro SGA — ID 158 · Distribuidora Central Peninsular S.A.",
    resumen:
      "La declaración 158 aparece en el sistema de origen pero no tiene contrapartida " +
      "en SGA. Importe en riesgo: 6.210 €.",
    razonamiento:
      "El registro de origen (período Septiembre 2025, ID 158, empresa 'Distribuidora " +
      "Central Peninsular S.A.') está marcado como recibido y procesado en el sistema " +
      "declarante. No existe ningún registro en SGA con ese identificador ni con el CIF " +
      "y periodo coincidentes. Podría ser un fallo de integración o un rechazo silencioso.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Declaración ID 158 presente en origen (Sept 2025) sin match en SGA por ID, CIF o período.",
      },
      {
        etapa: "Análisis",
        detalle: "Estado en origen: recibido y procesado; logs de integración no muestran confirmación en SGA.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 58 % — posible fallo de integración o rechazo silencioso; 6.210 € en riesgo.",
      },
      {
        etapa: "Escalado",
        detalle: "Revisión humana para trazar la carga en SGA y decidir reintento o escalado a IT.",
      },
    ],
    evidencia: [
      {
        fuente: "Sistema origen",
        detalle: "Declaración ID 158 recibida y procesada para Septiembre 2025.",
      },
      {
        fuente: "Búsqueda SGA",
        detalle: "Sin coincidencia por ID, CIF ni período.",
      },
      {
        fuente: "Conciliación BPO",
        detalle: "Importe pendiente de 6.210 € sin contrapartida operativa.",
      },
    ],
    confianza: 0.58,
    decisionRequerida: "Decidir si se reintenta la carga, se corrige manualmente o se escala a IT.",
    accionSugerida:
      "Verificar los logs de integración entre el sistema de origen y SGA para el rango " +
      "temporal de Septiembre 2025. Comprobar si existió un rechazo de carga no notificado.",
    impactoEur: 6_210,
    registroId: "158",
  },
  {
    id: "REV-005",
    origen: "auditoria",
    prioridad: "media",
    creadoHace: "1 d",
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
    pasos: [
      {
        etapa: "Señal",
        detalle: "Omisión confirmada de flejes PVC; divergencia probable en Papel/Cartón vs. logística.",
      },
      {
        etapa: "Análisis",
        detalle: ">9,6 M referencias expedidas; datos logísticos por referencia no disponibles en el lote actual.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 62 % — hallazgo parcial seguro, volumen restante no verificable automáticamente.",
      },
      {
        etapa: "Escalado",
        detalle: "Solicitud de datos adicionales al cliente antes de dictamen final.",
      },
    ],
    evidencia: [
      {
        fuente: "Declaración DEC-009",
        detalle: "Omisión de flejes PVC detectada con alta certeza.",
      },
      {
        fuente: "Sistema logístico",
        detalle: "Faltan expediciones por referencia para cerrar Papel/Cartón.",
      },
      {
        fuente: "Perfil declarante",
        detalle: "Distribuidor multicliente con más de 9,6 M referencias expedidas.",
      },
    ],
    confianza: 0.62,
    decisionRequerida: "Solicitar datos logísticos adicionales antes de emitir dictamen final.",
    accionSugerida:
      "Solicitar al cliente el desglose de referencias expedidas por tipo de envase " +
      "y el albarán de compra de flejes del ejercicio 2025.",
    impactoEur: 14_949,
  },
  {
    id: "REV-006",
    origen: "control",
    prioridad: "alta",
    creadoHace: "3 h",
    titulo: "Declaración sin registro SGA — ID 045 · Aguas de Sierra Azul S.A.",
    resumen:
      "La declaración 045 figura como recibida en el sistema de origen pero no tiene " +
      "contrapartida en SGA. Importe en riesgo: 5.840 €.",
    razonamiento:
      "El registro de origen (período Septiembre 2025, ID 045, 'Aguas de Sierra Azul S.A.') " +
      "consta como recibido y procesado. No existe ningún registro en SGA con ese identificador " +
      "ni con el CIF y período coincidentes. El patrón es idéntico a otros fallos de integración " +
      "detectados este período, lo que sugiere un rechazo silencioso en la carga.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Declaración ID 045 presente en origen (Sept 2025) sin match en SGA por ID, CIF o período.",
      },
      {
        etapa: "Análisis",
        detalle: "Estado en origen: recibido y procesado; los logs de integración no muestran confirmación en SGA.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 60 % — probable fallo de integración; 5.840 € sin contrapartida operativa.",
      },
      {
        etapa: "Escalado",
        detalle: "Revisión humana para decidir reintento de carga o escalado a IT.",
      },
    ],
    evidencia: [
      {
        fuente: "Sistema origen",
        detalle: "Declaración ID 045 recibida y procesada para Septiembre 2025.",
      },
      {
        fuente: "Búsqueda SGA",
        detalle: "Sin coincidencia por ID, CIF ni período.",
      },
      {
        fuente: "Conciliación BPO",
        detalle: "Importe pendiente de 5.840 € sin registro en SGA.",
      },
    ],
    confianza: 0.6,
    decisionRequerida: "Decidir si se reintenta la carga en SGA o se escala a IT.",
    accionSugerida:
      "Revisar los logs de integración de Septiembre 2025 para el ID 045 y reintentar " +
      "la carga si se confirma un rechazo no notificado.",
    impactoEur: 5_840,
    registroId: "045",
  },
  {
    id: "REV-007",
    origen: "control",
    prioridad: "media",
    creadoHace: "6 h",
    titulo: "Importe SGA inferior al origen — ID 103 · Conservas del Cantábrico S.A.",
    resumen:
      "El importe cargado en SGA (18.420 €) es 3.520 € inferior al declarado en origen " +
      "(21.940 €) para la declaración 103.",
    razonamiento:
      "La conciliación detecta una diferencia de −3.520 € entre el importe del sistema de origen " +
      "(21.940 €) y el cargado en SGA (18.420 €). No hay nota de abono ni ajuste documentado que " +
      "justifique la diferencia. El delta podría deberse a un truncamiento de líneas en la carga.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Importe SGA (18.420 €) ≠ importe origen (21.940 €) en el registro 103.",
      },
      {
        etapa: "Análisis",
        detalle: "Diferencia de −3.520 € sin nota de abono ni ajuste documentado en SGA.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 74 % — probable truncamiento de líneas en la carga a SGA.",
      },
      {
        etapa: "Escalado",
        detalle: "Revisión humana para confirmar el importe correcto antes del cierre.",
      },
    ],
    evidencia: [
      {
        fuente: "Sistema origen",
        detalle: "Importe declarado de 21.940 € para la declaración 103.",
      },
      {
        fuente: "SGA",
        detalle: "Importe cargado de 18.420 € (−3.520 €).",
      },
      {
        fuente: "Conciliación BPO",
        detalle: "Sin documento de ajuste que justifique la diferencia.",
      },
    ],
    confianza: 0.74,
    decisionRequerida: "Confirmar el importe correcto y autorizar el ajuste en SGA.",
    accionSugerida:
      "Cotejar el detalle de líneas de la declaración 103 en origen frente a SGA y corregir " +
      "el importe cargado si se confirma el truncamiento.",
    impactoEur: 3_520,
    registroId: "103",
  },
  {
    id: "REV-008",
    origen: "control",
    prioridad: "alta",
    creadoHace: "8 h",
    titulo: "Declaración duplicada en SGA — ID 299 · Galletas y Cereales del Sur S.L.",
    resumen:
      "La declaración 299 aparece cargada dos veces en SGA, con riesgo de doble cobro " +
      "de 7.780 €.",
    razonamiento:
      "Se detectan dos registros en SGA con el mismo CIF, período e importe (7.780 €) para la " +
      "declaración 299, mientras que en origen solo consta una declaración. La duplicidad genera " +
      "un doble cobro potencial si no se anula el registro repetido antes de la facturación.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Dos registros idénticos en SGA (mismo CIF, período e importe) para el ID 299.",
      },
      {
        etapa: "Análisis",
        detalle: "El sistema de origen solo contiene una declaración; la segunda carga es redundante.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 69 % — duplicidad confirmada; 7.780 € de doble cobro potencial.",
      },
      {
        etapa: "Escalado",
        detalle: "Revisión humana para anular el registro repetido antes de facturar.",
      },
    ],
    evidencia: [
      {
        fuente: "SGA",
        detalle: "Dos registros con CIF B41672309, mismo período e importe de 7.780 €.",
      },
      {
        fuente: "Sistema origen",
        detalle: "Una única declaración 299 para el período.",
      },
      {
        fuente: "Conciliación BPO",
        detalle: "Doble cobro potencial de 7.780 € si no se corrige.",
      },
    ],
    confianza: 0.69,
    decisionRequerida: "Confirmar la duplicidad y anular el registro repetido.",
    accionSugerida:
      "Verificar cuál de los dos registros SGA es el válido y anular el duplicado antes " +
      "del cierre de facturación.",
    impactoEur: 7_780,
    registroId: "299",
  },
  {
    id: "REV-009",
    origen: "control",
    prioridad: "media",
    creadoHace: "1 d",
    titulo: "Importe SGA inferior al origen — ID 430 · Bodegas Marqués de Tordella S.L.",
    resumen:
      "El importe en SGA (9.110 €) es 3.550 € inferior al declarado en origen (12.660 €) " +
      "para la declaración 430.",
    razonamiento:
      "La conciliación detecta una diferencia de −3.550 € entre el importe del sistema de origen " +
      "(12.660 €) y el cargado en SGA (9.110 €). No existe ajuste ni nota de abono documentada. " +
      "El patrón coincide con cargas parciales por error de mapeo de líneas.",
    pasos: [
      {
        etapa: "Señal",
        detalle: "Importe SGA (9.110 €) ≠ importe origen (12.660 €) en el registro 430.",
      },
      {
        etapa: "Análisis",
        detalle: "Diferencia de −3.550 € sin ajuste ni nota de abono documentada.",
      },
      {
        etapa: "Conclusión",
        detalle: "Confianza 72 % — probable carga parcial por error de mapeo de líneas.",
      },
      {
        etapa: "Escalado",
        detalle: "Revisión humana para confirmar el importe correcto antes del cierre.",
      },
    ],
    evidencia: [
      {
        fuente: "Sistema origen",
        detalle: "Importe declarado de 12.660 € para la declaración 430.",
      },
      {
        fuente: "SGA",
        detalle: "Importe cargado de 9.110 € (−3.550 €).",
      },
      {
        fuente: "Conciliación BPO",
        detalle: "Sin documento de ajuste que justifique la diferencia.",
      },
    ],
    confianza: 0.72,
    decisionRequerida: "Confirmar el importe correcto y autorizar el ajuste en SGA.",
    accionSugerida:
      "Cotejar el detalle de líneas de la declaración 430 en origen frente a SGA y corregir " +
      "el importe cargado si se confirma la carga parcial.",
    impactoEur: 3_550,
    registroId: "430",
  },
];
