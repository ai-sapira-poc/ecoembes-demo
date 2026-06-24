"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { StepLayout, StepAsideSection, StepAsideList, StepAsideMeta, type Step } from "@/components/layout/StepLayout";
import { FadeUp } from "@/components/motion/Reveal";
import { CoverageMeter } from "@/components/control/CoverageMeter";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { EvidenceCard } from "@/components/control/EvidenceCard";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/index";
import { formatEUR, formatNum } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Building2, CalendarDays, Database, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DISCREPANCY_RECORDS = bpoMes.records.filter((r) => r.estado !== "ok");
const DISCREPANCY_COUNT = DISCREPANCY_RECORDS.length;          // 6
const IMPORTE_EN_RIESGO = BPO_IMPORTE_EN_RIESGO_EUR;           // 26_900
const MANUAL_PCT_DISPLAY = 1.6;
const MANUAL_PCT_LABEL = MANUAL_PCT_DISPLAY.toLocaleString("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const REST_PCT_LABEL = (100 - MANUAL_PCT_DISPLAY).toLocaleString("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CIERRE_PREVIEW_IDS = ["001", "002", "003", "012", "045", "088", "103", "191"];
const CIERRE_PREVIEW_RECORDS = CIERRE_PREVIEW_IDS.map(
  (id) => bpoMes.records.find((r) => r.id === id)!
);
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
function CierreMensualSkeleton() {
  return (
    <>
      <div className="space-y-3 px-5 py-6">
        <Skeleton className="mx-auto h-3 w-40" />
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-end justify-center gap-8 pt-2">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-16 w-28" />
            <Skeleton className="mx-auto h-3 w-32" />
          </div>
          <Skeleton className="mb-4 h-8 w-3" />
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-14 w-36" />
            <Skeleton className="mx-auto h-3 w-36" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-line px-5 py-3.5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2 border-t border-line px-5 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      <div className="border-t border-line px-5 py-4">
        <Skeleton className="mb-3 h-3 w-48" />
        <Skeleton className="h-16 w-full" />
      </div>
    </>
  );
}

function CierreColaPreview() {
  const restantes = bpoMes.totalDeclaraciones - CIERRE_PREVIEW_RECORDS.length;

  return (
    <div className="border-t border-line">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Cola del cierre
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            {formatNum(bpoMes.totalDeclaraciones)} registros entrantes
          </p>
        </div>
        <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-semibold text-muted">
          Pendiente conciliación
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              <th className="px-5 py-2.5 font-semibold">ID</th>
              <th className="px-3 py-2.5 font-semibold">Empresa</th>
              <th className="px-3 py-2.5 font-semibold">CIF</th>
              <th className="px-3 py-2.5 font-semibold text-right">Importe</th>
              <th className="px-3 py-2.5 font-semibold">Canal</th>
              <th className="px-5 py-2.5 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {CIERRE_PREVIEW_RECORDS.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + i * 0.04, ease: EASE_OUT }}
                className="border-b border-line/70 last:border-0"
              >
                <td className="px-5 py-2.5 font-mono text-muted">{row.id}</td>
                <td className="max-w-[11rem] truncate px-3 py-2.5 font-medium text-ink">
                  {row.empresa}
                </td>
                <td className="px-3 py-2.5 font-mono text-muted">{row.cif}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-ink">
                  {formatEUR(row.importeOrigenEur)}
                </td>
                <td className="px-3 py-2.5 text-muted">{row.canal ?? "—"}</td>
                <td className="px-5 py-2.5">
                  <span className="inline-flex rounded-full border border-line bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted">
                    Recibida
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-line px-5 py-2.5 text-[11px] text-muted">
        + {formatNum(restantes)} registros más en cola · importe acumulado{" "}
        {formatEUR(bpoMes.importeTotalEur)}
      </p>
    </div>
  );
}

function CierreVolumePreview() {
  const TOTAL = bpoMes.totalDeclaraciones;

  return (
    <div className="border-t border-line px-5 py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Volumen del cierre
        </p>
        <span className="text-[11px] text-muted">
          Cada punto = 1 declaración · {formatNum(TOTAL)} en total
        </span>
      </div>
      <div
        className="flex flex-wrap gap-1"
        aria-label={`${TOTAL} declaraciones en el cierre mensual`}
      >
        {Array.from({ length: TOTAL }, (_, i) => (
          <motion.span
            key={i + 1}
            className="h-2 w-2 shrink-0 rounded-full bg-line"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.35 + i * 0.0015,
              duration: 0.15,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CierreMensualVisual() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <FadeUp className="shrink-0">
        <article className="w-full overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
            <span className="flex items-center gap-2 text-xs text-muted">
              <Database className="h-3.5 w-3.5" />
              Sistema origen · Cierre mensual
            </span>
            <AnimatePresence mode="wait">
              {phase === "loading" ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-[11px] text-muted"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Consolidando cierre…
                </motion.span>
              ) : (
                <motion.span
                  key="ready"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="text-[11px] text-muted"
                >
                  {bpoMes.periodo}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {phase === "loading" ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CierreMensualSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <div className="px-5 py-6">
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Cierre registrado
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[
                      `${formatNum(bpoMes.totalDeclaraciones)} declaraciones`,
                      formatEUR(bpoMes.importeTotalEur),
                      "Período 56",
                    ].map((label) => (
                      <span
                        key={label}
                        className="inline-flex rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-end justify-center gap-10">
                    <div className="text-center">
                      <CountUp
                        to={bpoMes.totalDeclaraciones}
                        duration={0.9}
                        delay={0.1}
                        className="block text-6xl font-medium leading-none tracking-tight text-ink tabular-nums"
                      />
                      <p className="mt-2 text-sm text-muted">declaraciones recibidas</p>
                    </div>
                    <span className="mb-5 text-3xl text-line">&middot;</span>
                    <div className="text-center">
                      <p className="text-5xl font-medium tabular-nums leading-none tracking-tight text-ink">
                        {formatEUR(bpoMes.importeTotalEur)}
                      </p>
                      <p className="mt-2 text-sm text-muted">importe total declarado</p>
                    </div>
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-x-4 gap-y-2 border-t border-line px-5 py-3.5 text-xs">
                  <div>
                    <dt className="flex items-center gap-1.5 text-muted">
                      <CalendarDays className="h-3 w-3" />
                      Período
                    </dt>
                    <dd className="mt-0.5 font-medium text-ink">{bpoMes.periodo}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-muted">
                      <Building2 className="h-3 w-3" />
                      Empresas declarantes
                    </dt>
                    <dd className="mt-0.5 font-medium text-ink">
                      {formatNum(bpoMes.totalDeclaraciones)} empresas
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Destino de conciliación</dt>
                    <dd className="mt-0.5 font-medium text-ink">Sistema origen → SGA</dd>
                  </div>
                </dl>

                <CierreColaPreview />
                <CierreVolumePreview />
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </FadeUp>

      <AnimatePresence>
        {phase === "ready" && (
          <FadeUp delay={0.2} className="shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3.5">
                <span className="rounded-lg bg-canvas px-3 py-2 text-xs font-semibold text-ink">
                  Sistema origen
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className="rounded-lg bg-canvas px-3 py-2 text-xs font-semibold text-ink">
                  SGA
                </span>
                <p className="ml-1 text-xs text-muted">
                  {formatNum(bpoMes.totalDeclaraciones)} registros · conciliación pendiente
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3.5 sm:max-w-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft">
                  <span
                    className="h-2 w-2 rounded-full bg-brand"
                    style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
                  />
                </span>
                <p className="flex-1 text-sm text-ink-soft">
                  El agente recibe el cierre completo y{" "}
                  <strong className="font-semibold text-ink">prepara la conciliación</strong>{" "}
                  campo a campo con el SGA.
                </p>
              </div>
            </div>
          </FadeUp>
        )}
      </AnimatePresence>
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
        {formatEUR(bpoMes.importeMuestreadoEur)} &middot; {MANUAL_PCT_LABEL} % del importe
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
          El muestreo manual cubre {MANUAL_PCT_LABEL} % del importe total. El{" "}
          <span className="font-semibold text-ink">{REST_PCT_LABEL} %</span> restante —{" "}
          {formatEUR(bpoMes.importeTotalEur - bpoMes.importeMuestreadoEur)} — no se verifica.
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
        <StepAsideSection title="Qué ocurre">
          <p>
            A final de mes, el sistema origen consolida{" "}
            <strong className="text-ink">{formatNum(bpoMes.totalDeclaraciones)} declaraciones</strong>{" "}
            por un total de{" "}
            <strong className="text-ink">{formatEUR(bpoMes.importeTotalEur)}</strong>.
          </p>
          <p className="mt-2">
            Cada registro debe conciliarse con el SGA: importe, CIF, estado de carga y campos
            clave, uno a uno.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Proceso tradicional">
          <StepAsideList
            items={[
              "El equipo BPO recibe el cierre completo al cerrar el mes.",
              "Revisar 437 registros a mano cada mes es inviable.",
              "Se recurre al muestreo: un subconjunto representativo del importe.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="Con el agente">
          <StepAsideList
            items={[
              "Toma el cierre mensual como entrada automática.",
              "Prepara la conciliación campo a campo sin selección manual.",
              "El análisis arranca en cuanto el mes queda registrado.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Período: <span className="font-medium not-italic text-ink">{bpoMes.periodo}</span> ·{" "}
          {formatNum(bpoMes.totalDeclaraciones)} empresas declarantes
        </StepAsideMeta>
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
        <StepAsideSection title="Qué ocurre">
          <p>
            El control manual actual selecciona{" "}
            <strong className="text-ink">{bpoMes.muestreadas} casos</strong> de los{" "}
            {formatNum(bpoMes.totalDeclaraciones)}: el{" "}
            <strong className="text-ink">{MANUAL_PCT_LABEL} % del importe</strong>.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Proceso tradicional">
          <StepAsideList
            items={[
              "Cada punto del gráfico es una declaración del cierre.",
              "Solo los 5 casos muestreados se revisan campo a campo.",
              "Los 432 restantes no se tocan hasta una reclamación o auditoría externa.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="Con el agente">
          <StepAsideList
            items={[
              "Sustituye la selección manual por cobertura del 100 %.",
              "Mismo criterio de conciliación, aplicado a todos los registros.",
              "Las discrepancias dejan de depender del azar del muestreo.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Muestreo actual: {bpoMes.muestreadas} casos · {formatEUR(bpoMes.importeMuestreadoEur)}{" "}
          revisados
        </StepAsideMeta>
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
        <StepAsideSection title="Qué hace el agente">
          <p>
            Cruza origen y SGA campo a campo para los{" "}
            <strong className="text-ink">{formatNum(bpoMes.totalDeclaraciones)} registros</strong>{" "}
            en cuestión de minutos.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Cobertura">
          <StepAsideList
            items={[
              `Del ${MANUAL_PCT_LABEL} % del muestreo manual al 100 % automático.`,
              "Importe, CIF, estado de carga y datos de empresa en cada registro.",
              "El agente no muestrea: revisa todo el cierre.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="Por qué importa">
          <StepAsideList
            items={[
              "Elimina la ventana ciega del 98,4 % no revisado.",
              "Mismo flujo origen ↔ SGA, sin intervención del equipo BPO.",
              "El resultado alimenta directamente el informe de control.",
            ]}
          />
        </StepAsideSection>
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
        <StepAsideSection title="Hallazgo">
          <p>
            El agente encuentra{" "}
            <strong className="text-ink">{DISCREPANCY_COUNT} discrepancias</strong>: importes
            distintos entre origen y SGA, registros no cargados y duplicados.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Fuera de la muestra">
          <p>
            <strong className="text-ink">
              Ninguna estaba entre los {bpoMes.muestreadas} casos muestreados.
            </strong>{" "}
            El control manual habría cerrado el mes sin detectarlas.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Impacto">
          <StepAsideList
            items={[
              `${formatEUR(IMPORTE_EN_RIESGO)} en riesgo — invisible para el proceso actual.`,
              "Los 5 casos muestreados son correctos; las anomalías están en el 98,4 % no revisado.",
              "Cada incidencia queda priorizada con evidencia de conciliación.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Importe en riesgo:{" "}
          <span className="font-medium not-italic text-ink">{formatEUR(IMPORTE_EN_RIESGO)}</span>
        </StepAsideMeta>
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
        <StepAsideSection title="Qué genera el agente">
          <p>
            Informe de control con trazabilidad completa: cada registro revisado, cada anomalía
            detectada, marca de tiempo y firma digital.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Entrega al equipo BPO">
          <StepAsideList
            items={[
              `${DISCREPANCY_COUNT} incidencias priorizadas listas para actuar.`,
              `${formatEUR(IMPORTE_EN_RIESGO)} a recuperar con evidencia auditable.`,
              "Sin el agente, el muestreo del 1,6 % no habría detectado nada.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="La plataforma real">
          <StepAsideList
            items={[
              "El informe vive en el módulo Control de la plataforma.",
              "Historial mensual, discrepancias y exportación en un solo lugar.",
              "En el siguiente paso del acto verás la vista de plataforma.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Cierre: {bpoMes.periodo} · {DISCREPANCY_COUNT} incidencias ·{" "}
          {formatEUR(IMPORTE_EN_RIESGO)} en riesgo
        </StepAsideMeta>
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
