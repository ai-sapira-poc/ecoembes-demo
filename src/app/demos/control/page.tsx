"use client";

import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { StepLayout, type Step } from "@/components/layout/StepLayout";
import { CoverageMeter } from "@/components/control/CoverageMeter";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { EvidenceCard } from "@/components/control/EvidenceCard";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/index";
import { formatEUR, formatNum } from "@/lib/utils";
import { AlertTriangle, Building2, CalendarDays, CheckCircle2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DISCREPANCY_RECORDS = bpoMes.records.filter((r) => r.estado !== "ok");
const DISCREPANCY_COUNT = DISCREPANCY_RECORDS.length;          // 6
const IMPORTE_EN_RIESGO = BPO_IMPORTE_EN_RIESGO_EUR;           // 26_900
const MANUAL_PCT_DISPLAY = 1.6;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Dot positions (1-indexed)
const SAMPLED_IDS = new Set([12, 88, 191, 264, 377]);
const DISCREPANCY_IDS = new Set([45, 103, 158, 299, 402, 430]);

// ─────────────────────────────────────────────────────────────────────────────
// Animated count-up helper
// ─────────────────────────────────────────────────────────────────────────────
function CountUp({
  to,
  duration = 1.0,
  delay = 0.3,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const v = useMotionValue(0);
  const display = useTransform(v, (x) =>
    x.toLocaleString("es-ES", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    animate(v, to, { duration, delay, ease: EASE_OUT });
  }, [v, to, duration, delay]);

  return (
    <motion.span className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Cierre mensual
// ─────────────────────────────────────────────────────────────────────────────
function CierreMensualVisual() {
  return (
    <div className="space-y-5">
      {/* Hero stat panel */}
      <div className="rounded-xl bg-white border border-line shadow-[0_2px_20px_-6px_rgba(20,32,26,0.10)] p-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-6 text-center">
          Sistema Origen — Cierre Septiembre 2025
        </p>
        <div className="flex items-end justify-center gap-8 mb-2">
          <div className="text-center">
            <CountUp
              to={bpoMes.totalDeclaraciones}
              duration={0.9}
              delay={0.2}
              className="block text-[5.5rem] font-medium leading-none tracking-tight text-ink tabular-nums"
            />
            <p className="text-sm text-muted mt-3">declaraciones recibidas</p>
          </div>
          <span className="text-4xl text-line mb-6">&middot;</span>
          <div className="text-center">
            <p className="text-5xl font-medium text-brand tabular-nums leading-none tracking-tight">
              {formatEUR(bpoMes.importeTotalEur)}
            </p>
            <p className="text-sm text-muted mt-3">importe total declarado</p>
          </div>
        </div>
      </div>

      {/* Metadata tiles */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: <CalendarDays className="w-4 h-4 text-brand" />,
            label: "Período",
            value: bpoMes.periodo,
          },
          {
            icon: <Building2 className="w-4 h-4 text-brand" />,
            label: "Empresas declarantes",
            value: `${formatNum(bpoMes.totalDeclaraciones)} empresas`,
          },
          {
            icon: <CheckCircle2 className="w-4 h-4 text-brand" />,
            label: "Fuente",
            value: "Sistema origen → SGA",
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-white border border-line p-5 flex items-center gap-4"
          >
            <div className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted mb-0.5">
                {label}
              </p>
              <p className="text-sm font-semibold text-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DotGrid — 437 dots, staggered reveal
// ─────────────────────────────────────────────────────────────────────────────
interface DotGridProps {
  showDiscrepancies?: boolean;
  animate?: boolean;
}

function DotGrid({
  showDiscrepancies = false,
  animate: shouldAnimate = false,
}: DotGridProps) {
  const TOTAL = bpoMes.totalDeclaraciones;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mb-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block" />
          Muestreada ({bpoMes.muestreadas} de {TOTAL})
        </span>
        {showDiscrepancies && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
            Discrepancia ({DISCREPANCY_COUNT} casos — fuera de la muestra)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-line inline-block" />
          No muestreada ({TOTAL - bpoMes.muestreadas} de {TOTAL})
        </span>
      </div>

      {/* Grid */}
      <div
        className="flex flex-wrap gap-1"
        aria-label={`${TOTAL} declaraciones — 5 muestreadas`}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const id = i + 1;
          const isSampled = SAMPLED_IDS.has(id);
          const isDiscrepancy = showDiscrepancies && DISCREPANCY_IDS.has(id);

          const colorClass = isSampled
            ? "bg-brand"
            : isDiscrepancy
            ? "bg-danger"
            : "bg-line";

          if (shouldAnimate) {
            return (
              <motion.span
                key={id}
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.002,
                  duration: 0.2,
                  ease: "easeOut",
                }}
                title={
                  isSampled
                    ? `Caso ${id} — muestreada`
                    : isDiscrepancy
                    ? `Caso ${id} — discrepancia`
                    : `Caso ${id}`
                }
              />
            );
          }

          return (
            <span
              key={id}
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`}
              title={
                isSampled
                  ? `Caso ${id} — muestreada`
                  : isDiscrepancy
                  ? `Caso ${id} — discrepancia`
                  : `Caso ${id}`
              }
            />
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted">
        Muestreo manual: {bpoMes.muestreadas} de {formatNum(TOTAL)} casos &middot;{" "}
        {formatEUR(bpoMes.importeMuestreadoEur)} &middot;{" "}
        {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}{" "}
        % del importe
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Control actual (dot grid, no discrepancies)
// ─────────────────────────────────────────────────────────────────────────────
function ControlHoyVisual() {
  return (
    <div className="rounded-xl bg-white border border-line shadow-[0_2px_20px_-6px_rgba(20,32,26,0.10)] p-8 space-y-4">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-1">
          Control manual actual
        </p>
        <h3 className="text-base font-semibold text-ink">
          Septiembre 2025 — {formatNum(bpoMes.totalDeclaraciones)} declaraciones en el sistema
        </h3>
      </div>

      <DotGrid showDiscrepancies={false} animate={true} />

      {/* Warning callout */}
      <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 px-5 py-4">
        <p className="text-sm font-semibold text-warning">
          Solo 5 casos revisados de 437
        </p>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          El muestreo manual cubre{" "}
          {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          % del importe total. El{" "}
          <span className="font-semibold text-ink">
            {(100 - MANUAL_PCT_DISPLAY).toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            %
          </span>{" "}
          restante — {formatEUR(bpoMes.importeTotalEur - bpoMes.importeMuestreadoEur)} — no
          se verifica.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Conciliación agente: CoverageMeter
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

      {/* Process diagram */}
      <div className="rounded-xl bg-white border border-line p-5 flex items-center gap-3 shadow-[0_2px_12px_-4px_rgba(20,32,26,0.08)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted whitespace-nowrap">
          Proceso
        </p>
        <div className="flex items-center gap-3 text-sm text-ink">
          <span className="rounded-lg bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-dark">
            Sistema Origen
          </span>
          <span className="text-muted font-medium text-base">↔</span>
          <span className="rounded-lg bg-brand-soft px-3 py-2 text-xs font-semibold text-brand-dark">
            SGA
          </span>
          <span className="text-muted ml-1 text-xs">
            campo a campo · {formatNum(bpoMes.totalDeclaraciones)} registros · {bpoMes.periodo}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Discrepancias
// ─────────────────────────────────────────────────────────────────────────────
function DiscrepanciasVisual() {
  return (
    <div className="space-y-5">
      {/* Alert */}
      <div className="rounded-xl bg-danger/5 border border-danger/20 px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-danger leading-snug">
            Ninguna de las {DISCREPANCY_COUNT} discrepancias estaba en la muestra manual —{" "}
            {formatEUR(IMPORTE_EN_RIESGO)} en riesgo
          </p>
          <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">
            Los {bpoMes.muestreadas} casos muestreados son correctos. Las anomalías se
            esconden en el 98,4 % no revisado.
          </p>
        </div>
      </div>

      {/* Dot grid with discrepancies */}
      <div className="rounded-xl bg-white border border-line shadow-[0_2px_12px_-4px_rgba(20,32,26,0.08)] px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-4">
          Distribución visual — {formatNum(bpoMes.totalDeclaraciones)} declaraciones
        </p>
        <DotGrid showDiscrepancies={true} animate={true} />
      </div>

      {/* Filtered table — discrepancy records only */}
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
          Cada una debe conciliarse con el sistema de gestión de cobros (SGA):
          importe, CIF, estado de carga y campos clave, registro a registro.
        </p>
        <p>
          Con el proceso manual, es imposible revisar los{" "}
          {formatNum(bpoMes.totalDeclaraciones)} registros cada mes. Se recurre al
          muestreo.
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
          <strong>
            {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            % del importe
          </strong>
          .
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
          <strong className="text-warning">
            {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            %
          </strong>{" "}
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
          <strong>{DISCREPANCY_COUNT} discrepancias</strong>: importes distintos
          entre origen y SGA, registros no cargados y duplicados.
        </p>
        <p>
          <strong>
            Ninguna de las {DISCREPANCY_COUNT} estaba entre los{" "}
            {bpoMes.muestreadas} casos muestreados.
          </strong>{" "}
          El control manual habría cerrado el mes sin detectarlas.
        </p>
        <p>
          El importe en riesgo asciende a{" "}
          <strong>{formatEUR(IMPORTE_EN_RIESGO)}</strong> — invisible para el
          proceso actual.
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
          <strong>{formatEUR(IMPORTE_EN_RIESGO)}</strong> a recuperar, evidencia
          auditable.
        </p>
        <p>
          Sin el agente, este informe no existiría — el muestreo del{" "}
          {MANUAL_PCT_DISPLAY.toLocaleString("es-ES", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          % no habría detectado nada.
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
    <StepLayout
      steps={steps}
      actLabel="Acto 2 · Control de Integridad BPO"
      actMeta={`${bpoMes.periodo} · ${formatNum(bpoMes.totalDeclaraciones)} declaraciones`}
    />
  );
}
