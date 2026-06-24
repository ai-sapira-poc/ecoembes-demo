"use client";

import React, { useEffect, useState } from "react";
import { StepLayout, type Step } from "@/components/layout/StepLayout";
import { SigLinesTable } from "@/components/auditoria/SigLinesTable";
import { DictamenCard } from "@/components/auditoria/DictamenCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { declaraciones } from "@/data/index";
import { formatEUR } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";

// Pick DEC-004 — Bodegas Marqués de Tordella (con_hallazgos, seeded hallazgos)
const dec = declaraciones.find((d) => d.id === "DEC-004")!;

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 Visual — "raw" SIG data styled like a messy Excel sheet
// ─────────────────────────────────────────────────────────────────────────────
function RawSigTab() {
  // The raw source has deliberate inconsistencies: merged cells header, wrong column names,
  // Spanish date format, inconsistent number formatting (commas vs dots)
  const rawRows = [
    ["004-L1", "Vidrio (envase)", "2.400.000", "380g", "1.824.000", "€0,0145", "26.448 €"],
    ["004-L2", "Papel carton (etiq+caja)", "2.400.000", "24 g", "57.600", "0,110 €", "6.336 €"],
    ["004-L3", "Acero - capsulas", "2.400.000", "8g", "19200", "0.073", "1.401,6 €"],
    ["004-L4", "PET caps secundario", "420000", "35 g", "14.700", "€0,471", "6.923 €"],
  ];

  return (
    <div className="rounded-xl border border-black/10 overflow-hidden bg-white shadow-sm">
      {/* Excel-like header bar */}
      <div className="bg-[#217346] text-white px-4 py-2 flex items-center gap-3 text-xs font-medium">
        <span className="opacity-80">Microsoft Excel</span>
        <span className="opacity-50">—</span>
        <span>Declaracion_SIG_Bodegas_Marques_Tordella_2025_FINAL_v3.xlsx</span>
      </div>

      {/* Toolbar mock */}
      <div className="bg-[#f3f3f3] border-b border-black/10 px-3 py-1 flex items-center gap-4 text-[10px] text-muted">
        <span>Inicio</span>
        <span>Insertar</span>
        <span>Diseño de página</span>
        <span>Fórmulas</span>
        <span>Datos</span>
        <span className="ml-auto text-[10px]">Hoja: DECLARACION_SIG_2025</span>
      </div>

      {/* Spreadsheet content */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-[#d9e1f2]">
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-left font-semibold text-[#1f3864] w-8">
                #
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-left font-semibold text-[#1f3864]">
                A — ID LÍNEA
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-left font-semibold text-[#1f3864]">
                B — TIPO ENVASE/MATERIAL
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-right font-semibold text-[#1f3864]">
                C — UNIDADES COMERCIALIZADAS
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-right font-semibold text-[#1f3864]">
                D — PESO UNIT.
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-right font-semibold text-[#1f3864]">
                E — KG TOTALES DECLARADOS
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-right font-semibold text-[#1f3864]">
                F — TARIFA ECOEMBES
              </th>
              <th className="border border-[#bfc7e0] px-3 py-1.5 text-right font-semibold text-[#1f3864]">
                G — IMPORTE SIG
              </th>
            </tr>
          </thead>
          <tbody>
            {rawRows.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
              >
                <td className="border border-[#d0d0d0] px-3 py-1.5 text-muted text-center">
                  {i + 2}
                </td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`border border-[#d0d0d0] px-3 py-1.5 ${
                      j >= 2 ? "text-right" : "text-left"
                    } ${j === 0 ? "text-muted" : "text-ink"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {/* Totals row */}
            <tr className="bg-[#e2efda] font-semibold">
              <td className="border border-[#bfc7e0] px-3 py-1.5"></td>
              <td className="border border-[#bfc7e0] px-3 py-1.5 text-[#375623]" colSpan={4}>
                TOTAL DECLARADO EJERCICIO 2025
              </td>
              <td className="border border-[#bfc7e0] px-3 py-1.5 text-right text-[#375623]">
                1.915.500
              </td>
              <td className="border border-[#bfc7e0] px-3 py-1.5"></td>
              <td className="border border-[#bfc7e0] px-3 py-1.5 text-right text-[#375623]">
                {formatEUR(dec.cuotaDeclaradaEur)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="bg-[#f3f3f3] border-t border-black/5 px-4 py-2 text-[10px] text-muted">
        Recibido por correo electrónico · 02/04/2025 · Firmado: J. Marqués (responsable SIG) · Formato: XLSX (sin validación automática)
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 Visual — Skeleton → SigLinesTable reveal
// ─────────────────────────────────────────────────────────────────────────────
function ExtractionReveal() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1600);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
          <span>Extrayendo y normalizando líneas SIG…</span>
        </div>
        {/* Table skeleton */}
        <div className="rounded-xl border border-black/5 overflow-hidden bg-white">
          <div className="p-4 border-b border-black/5 flex gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-4 border-b border-black/5 flex gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-18" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4 text-sm text-ok font-medium">
        <CheckCircle2 className="w-4 h-4" />
        <span>4 líneas SIG extraídas y normalizadas correctamente</span>
      </div>
      <SigLinesTable lines={dec.sigLines} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 Visual — Validation checklist
// ─────────────────────────────────────────────────────────────────────────────
type ValidationStatus = "ok" | "flag" | "running";

interface ValidationRow {
  label: string;
  detalle: string;
  status: ValidationStatus;
}

const validaciones: ValidationRow[] = [
  {
    label: "Coherencia peso/unidades",
    detalle: "kgTotales = unidades × pesoUnitarioG / 1.000 — todas las líneas cuadran",
    status: "ok",
  },
  {
    label: "Tarifa por material",
    detalle: "Tarifas declaradas coinciden con tabla vigente Ecoembes 2025",
    status: "ok",
  },
  {
    label: "Cruce interanual (2024 → 2025)",
    detalle: "Variaciones dentro de umbrales sectoriales — sin saltos anómalos",
    status: "ok",
  },
  {
    label: "Cruce ventas / facturación",
    detalle:
      "PET declarado (420.000 ud.) vs. volumen de ventas auditado (2.400.000 botellas) → implica 680.000 cápsulas",
    status: "flag",
  },
  {
    label: "Benchmark de sector (Bebidas)",
    detalle: "Ratio PET/unidades de botella fuera del rango p10–p90 del sector",
    status: "flag",
  },
];

function ValidationChecklist() {
  return (
    <div className="rounded-xl border border-black/5 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-black/5">
        <p className="text-sm font-semibold text-ink">
          Validaciones automáticas — DEC-004
        </p>
        <p className="text-xs text-muted mt-0.5">
          {dec.empresa} · Ejercicio {dec.ejercicio}
        </p>
      </div>
      <ul className="divide-y divide-black/5">
        {validaciones.map((v, i) => (
          <li key={i} className="flex items-start gap-4 px-5 py-4">
            <div className="mt-0.5 flex-shrink-0">
              {v.status === "ok" && (
                <CheckCircle2 className="w-5 h-5 text-ok" />
              )}
              {v.status === "flag" && (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
              {v.status === "running" && (
                <Loader2 className="w-5 h-5 text-muted animate-spin" />
              )}
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-medium ${
                  v.status === "flag" ? "text-warning" : "text-ink"
                }`}
              >
                {v.label}
              </p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                {v.detalle}
              </p>
            </div>
            <div className="ml-auto flex-shrink-0">
              {v.status === "ok" && (
                <span className="text-xs bg-ok/10 text-ok font-medium px-2 py-0.5 rounded-full">
                  OK
                </span>
              )}
              {v.status === "flag" && (
                <span className="text-xs bg-warning/10 text-warning font-medium px-2 py-0.5 rounded-full">
                  Alerta
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="px-5 py-3 bg-warning/5 border-t border-warning/20 flex items-center gap-2">
        <XCircle className="w-4 h-4 text-warning flex-shrink-0" />
        <p className="text-xs text-warning font-medium">
          2 validaciones con alerta — se generan hallazgos para revisión
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 Visual — DictamenCard + "enviado a Revisión Humana" note
// ─────────────────────────────────────────────────────────────────────────────
function DictamenStep() {
  return (
    <div className="space-y-4">
      <DictamenCard declaracion={dec} />
      <div className="rounded-lg border border-brand/20 bg-brand-soft px-5 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-brand flex-shrink-0" />
        <p className="text-sm font-medium text-brand-dark">
          → Declaración enviada a la cola de Revisión Humana para validación final
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps definition
// ─────────────────────────────────────────────────────────────────────────────
const steps: Step[] = [
  {
    n: 1,
    nombre: "Recepción",
    titulo: "Declaración recibida",
    explicacion: (
      <>
        <p>
          La empresa <strong>{dec.empresa}</strong> envía su declaración SIG anual
          por correo electrónico en formato Excel, como viene haciendo desde 2018.
        </p>
        <p>
          El fichero llega sin validación automática: formatos inconsistentes,
          abreviaturas de materiales no normalizadas y totales calculados
          manualmente. El proceso manual requeriría horas de revisión.
        </p>
        <p>
          El agente recibe el adjunto y comienza la extracción estructurada.
        </p>
      </>
    ),
    visual: <RawSigTab />,
  },
  {
    n: 2,
    nombre: "Extracción IA",
    titulo: "Extracción estructurada",
    explicacion: (
      <>
        <p>
          El agente analiza el Excel y extrae cada línea SIG: material normalizado
          según el catálogo Ecoembes, unidades, peso unitario, kilogramos totales,
          tarifa y cuota.
        </p>
        <p>
          En segundos, los datos caóticos del Excel se convierten en una tabla
          estructurada y normalizada lista para validar automáticamente.
        </p>
        <p className="text-xs text-muted italic">
          (La animación de esqueleto simula el tiempo de procesamiento del agente.)
        </p>
      </>
    ),
    visual: <ExtractionReveal />,
  },
  {
    n: 3,
    nombre: "Validaciones",
    titulo: "Validaciones automáticas",
    explicacion: (
      <>
        <p>
          Sobre los datos extraídos, el agente ejecuta un conjunto de validaciones
          cruzadas: coherencia interna, tarifas vigentes, comparativa interanual
          y cruce con el volumen de ventas declarado.
        </p>
        <p>
          En esta declaración, el cruce de ventas detecta una anomalía en el
          volumen de envases PET: se han declarado{" "}
          <strong>420.000 unidades</strong> cuando el sistema de ventas implica{" "}
          <strong>680.000</strong>.
        </p>
      </>
    ),
    visual: <ValidationChecklist />,
  },
  {
    n: 4,
    nombre: "Hallazgos",
    titulo: "Hallazgos identificados",
    explicacion: (
      <>
        <p>
          Las alertas de validación se convierten en hallazgos formales, con
          tipología, severidad y estimación del impacto económico.
        </p>
        <p>
          Para {dec.empresa} se ha identificado un hallazgo de{" "}
          <strong>alta severidad</strong>: infra-declaración del material PET con
          un impacto estimado de{" "}
          <strong>{formatEUR(dec.hallazgos[0]?.impactoEur ?? 0)}</strong>.
        </p>
        <p>
          Este proceso ocurre para <em>cada una</em> de las declaraciones recibidas,
          de forma simultánea, sin muestreo.
        </p>
      </>
    ),
    visual: (
      <SigLinesTable
        lines={dec.sigLines}
        flaggedLineIds={dec.hallazgos
          .filter((h) => h.lineaId)
          .map((h) => h.lineaId!)}
      />
    ),
  },
  {
    n: 5,
    nombre: "Dictamen",
    titulo: "Dictamen del agente",
    explicacion: (
      <>
        <p>
          El agente emite un dictamen estructurado: cuota declarada, cuota
          calculada, diferencia y recomendación.
        </p>
        <p>
          Cuando la confianza es suficiente, el dictamen es definitivo. En casos
          como este — con hallazgo de alta severidad — la declaración se remite
          a un auditor humano para validación final.
        </p>
        <p>
          El auditor humano solo interviene en los casos que lo requieren. El
          agente gestiona el resto de forma autónoma.
        </p>
      </>
    ),
    visual: <DictamenStep />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AuditoriaActoPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 border-b border-black/5 bg-white flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">
          Acto 1
        </span>
        <h1 className="text-base font-semibold text-ink">
          Auditoría de Declaraciones SIG
        </h1>
        <span className="text-muted text-sm hidden md:inline">
          — {dec.empresa} · Ejercicio {dec.ejercicio}
        </span>
      </div>

      <StepLayout steps={steps} />
    </div>
  );
}
