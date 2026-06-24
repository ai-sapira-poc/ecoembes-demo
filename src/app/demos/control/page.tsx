"use client";

import React from "react";
import { StepLayout, type Step } from "@/components/layout/StepLayout";
import { CoverageMeter } from "@/components/control/CoverageMeter";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { EvidenceCard } from "@/components/control/EvidenceCard";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/index";
import { formatEUR, formatNum } from "@/lib/utils";
import { AlertTriangle, Building2, CalendarDays, CheckCircle2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants derived from the BPO dataset
// ─────────────────────────────────────────────────────────────────────────────
const DISCREPANCY_RECORDS = bpoMes.records.filter((r) => r.estado !== "ok");
const DISCREPANCY_COUNT = DISCREPANCY_RECORDS.length; // 6
const IMPORTE_EN_RIESGO = BPO_IMPORTE_EN_RIESGO_EUR;  // 26_900
const MANUAL_PCT = (bpoMes.muestreadas / bpoMes.totalDeclaraciones) * 100; // ~1.14 → use the spec's 1.6 for display
const MANUAL_PCT_DISPLAY = 1.6; // spec-mandated display value (importe-based: 37_367 / 2_338_519)

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 Visual — Cierre mensual: big stat panel
// ─────────────────────────────────────────────────────────────────────────────
function CierreMensualVisual() {
  return (
    <div className="space-y-6">
      {/* Hero stat */}
      <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
          Sistema Origen — Cierre Septiembre 2025
        </p>
        <div className="flex items-end justify-center gap-6 mb-4">
          <div>
            <p className="text-7xl font-extrabold text-ink tabular-nums leading-none">
              {formatNum(bpoMes.totalDeclaraciones)}
            </p>
            <p className="text-base text-muted mt-2">declaraciones recibidas</p>
          </div>
          <span className="text-4xl text-black/20 mb-2">·</span>
          <div>
            <p className="text-5xl font-extrabold text-brand tabular-nums leading-none">
              {formatEUR(bpoMes.importeTotalEur)}
            </p>
            <p className="text-base text-muted mt-2">importe total declarado</p>
          </div>
        </div>
      </div>

      {/* Source system metadata */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-black/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-xs text-muted">Período</p>
            <p className="text-sm font-semibold text-ink">{bpoMes.periodo}</p>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-black/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-xs text-muted">Empresas declarantes</p>
            <p className="text-sm font-semibold text-ink">
              {formatNum(bpoMes.totalDeclaraciones)} empresas
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-black/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-xs text-muted">Fuente</p>
            <p className="text-sm font-semibold text-ink">Sistema origen → SGA</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DotGrid — 437 small dots, 5 brand-green (muestreadas), rest grey
// Optional: pass discrepancyIds to colour those red
// ─────────────────────────────────────────────────────────────────────────────
interface DotGridProps {
  showDiscrepancies?: boolean;
}

// Positions of sampled cases (1-indexed, from MUESTREADAS_IDS)
const SAMPLED_IDS = new Set([12, 88, 191, 264, 377]);
// Positions of discrepancy cases (1-indexed, from SEEDED)
const DISCREPANCY_IDS = new Set([45, 103, 158, 299, 402, 430]);

function DotGrid({ showDiscrepancies = false }: DotGridProps) {
  const TOTAL = bpoMes.totalDeclaraciones; // 437

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand inline-block" />
          Muestreada ({bpoMes.muestreadas} de {TOTAL})
        </span>
        {showDiscrepancies && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-danger inline-block" />
            Discrepancia ({DISCREPANCY_COUNT} casos — fuera de la muestra)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-black/15 inline-block" />
          No muestreada ({TOTAL - bpoMes.muestreadas} de {TOTAL})
        </span>
      </div>

      {/* Dot grid */}
      <div
        className="flex flex-wrap gap-1"
        style={{ maxWidth: "100%" }}
        aria-label={`${TOTAL} declaraciones — 5 muestreadas`}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const id = i + 1;
          const isSampled = SAMPLED_IDS.has(id);
          const isDiscrepancy = showDiscrepancies && DISCREPANCY_IDS.has(id);

          let colorClass: string;
          if (isSampled) {
            colorClass = "bg-brand";
          } else if (isDiscrepancy) {
            colorClass = "bg-danger";
          } else {
            colorClass = "bg-black/15";
          }

          return (
            <span
              key={id}
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`}
              title={
                isSampled
                  ? `Caso ${id} — muestreada`
                  : isDiscrepancy
                  ? `Caso ${id} — discrepancia (no muestreada)`
                  : `Caso ${id}`
              }
            />
          );
        })}
      </div>

      {/* Caption */}
      <p className="mt-4 text-xs text-muted italic">
        Muestreo manual: {bpoMes.muestreadas} de {formatNum(TOTAL)} casos ·{" "}
        {formatEUR(bpoMes.importeMuestreadoEur)} · {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % del importe
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 Visual — El control de hoy: dot grid only, 5 green
// ─────────────────────────────────────────────────────────────────────────────
function ControlHoyVisual() {
  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-8 space-y-2">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-ink">Control manual actual</h3>
        <p className="text-sm text-muted mt-1">
          Septiembre 2025 — {formatNum(bpoMes.totalDeclaraciones)} declaraciones en el sistema
        </p>
      </div>

      <DotGrid showDiscrepancies={false} />

      {/* Callout */}
      <div className="mt-6 rounded-lg bg-warning/5 border border-warning/20 px-5 py-4">
        <p className="text-sm font-semibold text-warning">
          Solo 5 casos revisados de 437
        </p>
        <p className="text-xs text-muted mt-1">
          El muestreo manual cubre {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % del importe total.
          El <span className="font-semibold text-ink">
            {(100 - MANUAL_PCT_DISPLAY).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %
          </span> restante — {formatEUR(bpoMes.importeTotalEur - bpoMes.importeMuestreadoEur)} — no se verifica.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 Visual — Conciliación del agente: CoverageMeter
// ─────────────────────────────────────────────────────────────────────────────
function ConciliacionVisual() {
  return (
    <div className="space-y-4">
      <CoverageMeter
        manualPct={MANUAL_PCT_DISPLAY}
        fullPct={100}
        manualEur={bpoMes.importeMuestreadoEur}
        totalEur={bpoMes.importeTotalEur}
        manualCount={bpoMes.muestreadas}
        totalCount={bpoMes.totalDeclaraciones}
      />
      {/* Process banner */}
      <div className="rounded-xl bg-white border border-black/5 shadow-sm p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
          Proceso de conciliación automática
        </p>
        <div className="flex items-center gap-3 text-sm text-ink">
          <span className="rounded-lg bg-brand-soft px-3 py-2 font-medium text-brand-dark">
            Sistema Origen
          </span>
          <span className="text-muted font-semibold">↔</span>
          <span className="rounded-lg bg-brand-soft px-3 py-2 font-medium text-brand-dark">
            SGA
          </span>
          <span className="text-muted ml-2 text-xs">campo a campo · {formatNum(bpoMes.totalDeclaraciones)} registros · {bpoMes.periodo}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 Visual — Discrepancias: table + dot grid + callout
// ─────────────────────────────────────────────────────────────────────────────
function DiscrepanciasVisual() {
  return (
    <div className="space-y-5">
      {/* Callout */}
      <div className="rounded-xl bg-danger/5 border border-danger/20 px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-danger">
            Ninguna de las {DISCREPANCY_COUNT} discrepancias estaba en la muestra manual —{" "}
            {formatEUR(IMPORTE_EN_RIESGO)} en riesgo
          </p>
          <p className="text-xs text-muted mt-1">
            Los {bpoMes.muestreadas} casos muestreados son correctos. Las anomalías se esconden en el 98,4 % no revisado.
          </p>
        </div>
      </div>

      {/* Dot grid with discrepancies highlighted */}
      <div className="rounded-2xl bg-white border border-black/5 shadow-sm px-6 py-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
          Distribución visual — {formatNum(bpoMes.totalDeclaraciones)} declaraciones
        </p>
        <DotGrid showDiscrepancies={true} />
      </div>

      {/* Discrepancy table */}
      <ReconciliationTable records={DISCREPANCY_RECORDS} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps definition
// ─────────────────────────────────────────────────────────────────────────────
const steps: Step[] = [
  {
    n: 1,
    nombre: "Cierre mensual",
    titulo: "Cierre mensual",
    explicacion: (
      <>
        <p>
          A final de mes, el sistema origen registra{" "}
          <strong>{formatNum(bpoMes.totalDeclaraciones)} declaraciones</strong> de
          empresas declarantes por un total de{" "}
          <strong>{formatEUR(bpoMes.importeTotalEur)}</strong>.
        </p>
        <p>
          Cada una de estas declaraciones debe conciliarse con el sistema de gestión
          de cobros (SGA): importe, CIF, estado de carga y campos clave, registro a registro.
        </p>
        <p>
          Con el proceso manual, es imposible revisar los {formatNum(bpoMes.totalDeclaraciones)} registros
          cada mes. Se recurre al muestreo.
        </p>
      </>
    ),
    visual: <CierreMensualVisual />,
  },
  {
    n: 2,
    nombre: "Control actual",
    titulo: "El control de hoy",
    explicacion: (
      <>
        <p>
          El control manual actual selecciona{" "}
          <strong>{bpoMes.muestreadas} casos</strong> de los{" "}
          {formatNum(bpoMes.totalDeclaraciones)}: el{" "}
          <strong>{MANUAL_PCT_DISPLAY.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % del importe</strong>.
        </p>
        <p>
          Cada punto del gráfico es una declaración. Los{" "}
          <span className="font-semibold text-brand">5 puntos verdes</span> son los
          únicos que se revisan. Los{" "}
          <span className="font-semibold text-ink">432 grises</span> no se tocan.
        </p>
        <p>
          Si hay un error en cualquiera de esos 432 registros,{" "}
          <strong>nadie lo verá</strong> hasta que llegue una reclamación o una
          auditoría externa.
        </p>
      </>
    ),
    visual: <ControlHoyVisual />,
  },
  {
    n: 3,
    nombre: "Agente IA",
    titulo: "Conciliación del agente",
    explicacion: (
      <>
        <p>
          El agente cruza origen y SGA campo a campo para los{" "}
          <strong>{formatNum(bpoMes.totalDeclaraciones)} registros</strong> en
          cuestión de minutos.
        </p>
        <p>
          La cobertura pasa del{" "}
          <strong className="text-warning">{MANUAL_PCT_DISPLAY.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</strong>{" "}
          del muestreo manual al{" "}
          <strong className="text-brand">100 %</strong> automático. Sin excepción.
        </p>
        <p>
          Cada campo — importe, CIF, estado de carga, datos de empresa — se verifica
          en cada registro. El agente no muestrea: revisa todo.
        </p>
      </>
    ),
    visual: <ConciliacionVisual />,
  },
  {
    n: 4,
    nombre: "Discrepancias",
    titulo: "Discrepancias detectadas",
    explicacion: (
      <>
        <p>
          El agente encuentra{" "}
          <strong>{DISCREPANCY_COUNT} discrepancias</strong>:{" "}
          importes distintos entre origen y SGA, registros no cargados y duplicados.
        </p>
        <p>
          <strong>Ninguna de las {DISCREPANCY_COUNT} estaba entre los {bpoMes.muestreadas} casos
          muestreados.</strong> El control manual habría cerrado el mes sin detectarlas.
        </p>
        <p>
          El importe en riesgo asciende a{" "}
          <strong>{formatEUR(IMPORTE_EN_RIESGO)}</strong> —
          invisible para el proceso actual.
        </p>
      </>
    ),
    visual: <DiscrepanciasVisual />,
  },
  {
    n: 5,
    nombre: "Evidencia",
    titulo: "Evidencia y traza",
    explicacion: (
      <>
        <p>
          El agente genera automáticamente el informe de control con trazabilidad
          completa: cada registro revisado, cada anomalía detectada, marca de tiempo
          y firma digital.
        </p>
        <p>
          El equipo BPO recibe el informe listo para actuar:{" "}
          <strong>{DISCREPANCY_COUNT} incidencias</strong> priorizadas,{" "}
          <strong>{formatEUR(IMPORTE_EN_RIESGO)}</strong> a recuperar,
          evidencia auditable.
        </p>
        <p>
          Sin el agente, este informe no existiría — el muestreo del{" "}
          {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % no habría detectado nada.
        </p>
      </>
    ),
    visual: (
      <EvidenceCard
        mes={bpoMes}
        discrepancias={DISCREPANCY_COUNT}
        importeEnRiesgoEur={IMPORTE_EN_RIESGO}
      />
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ControlActoPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 border-b border-black/5 bg-white flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand bg-brand-soft px-2.5 py-1 rounded-full">
          Acto 2
        </span>
        <h1 className="text-base font-semibold text-ink">
          Control de Integridad BPO — Cuentas a Cobrar
        </h1>
        <span className="text-muted text-sm hidden md:inline">
          — {bpoMes.periodo} · {formatNum(bpoMes.totalDeclaraciones)} declaraciones
        </span>
      </div>

      <StepLayout steps={steps} />
    </div>
  );
}
