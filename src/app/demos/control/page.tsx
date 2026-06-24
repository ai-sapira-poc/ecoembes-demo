"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { StepLayout, StepAsideSection, StepAsideList, StepAsideMeta, type Step } from "@/components/layout/StepLayout";
import { FadeUp } from "@/components/motion/Reveal";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR, revisionItems } from "@/data/index";
import type { ConciliacionRecord } from "@/data/types";
import { formatEUR, formatNum } from "@/lib/utils";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import {
  ArrowRight,
  Bot,
  Database,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DISCREPANCY_RECORDS = bpoMes.records.filter((r) => r.estado !== "ok");
const DISCREPANCY_COUNT = DISCREPANCY_RECORDS.length;          // 6
const IMPORTE_EN_RIESGO = BPO_IMPORTE_EN_RIESGO_EUR;           // 26_900
const CONFIDENCE_THRESHOLD = 0.8;
const AUTO_DICTAMEN_COUNT = bpoMes.totalDeclaraciones - DISCREPANCY_COUNT; // 431 OK autónomos
const HITL_COUNT = DISCREPANCY_COUNT; // 6 — toda discrepancia va a revisión humana
const AUTO_OK_COUNT = AUTO_DICTAMEN_COUNT;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CIERRE_FEED_IDS = ["001", "002", "088", "103"];
const CIERRE_FEED_RECORDS = CIERRE_FEED_IDS.map(
  (id) => bpoMes.records.find((r) => r.id === id)!
);
const CONTROL_HITL = revisionItems.filter((item) => item.origen === "control");

const REVISION_BY_RECORD_ID: Record<string, (typeof CONTROL_HITL)[0]> = {
  "402": CONTROL_HITL.find((i) => i.id === "REV-003")!,
  "158": CONTROL_HITL.find((i) => i.id === "REV-004")!,
};

const DISCREPANCY_CONFIDENCE: Record<number, number> = {
  45: 0.92,
  103: 0.89,
  158: 0.58,
  299: 0.94,
  402: 0.71,
  430: 0.87,
};

function recordConfianza(id: number, estado: ConciliacionRecord["estado"]): number {
  if (DISCREPANCY_CONFIDENCE[id] != null) return DISCREPANCY_CONFIDENCE[id];
  if (estado !== "ok") return 0.85;
  return 0.97;
}

const CONFIDENCIA_BY_ID = Object.fromEntries(
  bpoMes.records.map((r) => [r.id, recordConfianza(Number(r.id), r.estado)])
);

/** Demo sample: 3 OK + 6 incidencias + 1 extra OK */
const DEMO_TABLE_RECORDS = ["001", "012", "088", "045", "103", "158", "299", "402", "430", "377"].map(
  (id) => bpoMes.records.find((r) => r.id === id)!
);

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
      <div className="space-y-4 px-5 py-8">
        <Skeleton className="mx-auto h-3 w-36" />
        <div className="flex items-end justify-center gap-8 pt-2">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-14 w-24" />
            <Skeleton className="mx-auto h-3 w-28" />
          </div>
          <Skeleton className="mb-3 h-6 w-2" />
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-12 w-32" />
            <Skeleton className="mx-auto h-3 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-3.5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-0 border-t border-line">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-line px-5 py-3 last:border-0">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </>
  );
}

function CierreEntradasFeed() {
  const restantes = bpoMes.totalDeclaraciones - CIERRE_FEED_RECORDS.length;

  return (
    <div className="border-t border-line">
      <p className="px-5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Entradas del cierre
      </p>
      {CIERRE_FEED_RECORDS.map((row, i) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 + i * 0.05, ease: EASE_OUT }}
          className="flex items-center justify-between gap-4 border-t border-line px-5 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{row.empresa}</p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">
              {row.id} · {row.cif}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium tabular-nums text-ink">
              {formatEUR(row.importeOrigenEur)}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">Recibida</p>
          </div>
        </motion.div>
      ))}
      <p className="border-t border-line px-5 py-2.5 text-[11px] text-muted">
        + {formatNum(restantes)} registros más · {formatEUR(bpoMes.importeTotalEur)} en total
      </p>
    </div>
  );
}

function CierreMensualVisual() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <FadeUp>
      <div className="mx-auto w-full max-w-xl space-y-3">
        <article className="overflow-hidden rounded-xl border border-line bg-surface">
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
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                <div className="px-5 py-8">
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Cierre registrado
                  </p>
                  <div className="mt-6 flex items-end justify-center gap-8">
                    <div className="text-center">
                      <CountUp
                        to={bpoMes.totalDeclaraciones}
                        duration={0.9}
                        delay={0.08}
                        className="block text-5xl font-medium leading-none tracking-tight text-ink tabular-nums md:text-6xl"
                      />
                      <p className="mt-2 text-sm text-muted">declaraciones recibidas</p>
                    </div>
                    <span className="mb-4 text-2xl text-line">&middot;</span>
                    <div className="text-center">
                      <p className="text-4xl font-medium tabular-nums leading-none tracking-tight text-ink md:text-5xl">
                        {formatEUR(bpoMes.importeTotalEur)}
                      </p>
                      <p className="mt-2 text-sm text-muted">importe total declarado</p>
                    </div>
                  </div>
                </div>

                <motion.dl
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.12 }}
                  className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-3.5 text-xs"
                >
                  <div>
                    <dt className="text-muted">Período</dt>
                    <dd className="mt-0.5 font-medium text-ink">{bpoMes.periodo}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Empresas declarantes</dt>
                    <dd className="mt-0.5 font-medium text-ink">
                      {formatNum(bpoMes.totalDeclaraciones)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Conciliación</dt>
                    <dd className="mt-0.5 font-medium text-ink">Origen → SGA</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Estado</dt>
                    <dd className="mt-0.5 font-medium text-ink">Pendiente</dd>
                  </div>
                </motion.dl>

                <CierreEntradasFeed />
              </motion.div>
            )}
          </AnimatePresence>
        </article>

        <AnimatePresence>
          {phase === "ready" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft">
                <span
                  className="h-2 w-2 rounded-full bg-brand"
                  style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
                />
              </span>
              <p className="flex-1 text-sm text-ink-soft">
                El agente recibe el cierre de {formatNum(bpoMes.totalDeclaraciones)} declaraciones e{" "}
                <strong className="font-semibold text-ink">inicia la conciliación</strong> campo a
                campo con el SGA.
              </p>
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
                En curso
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeUp>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Conciliación + enrutamiento (tablas)
// ─────────────────────────────────────────────────────────────────────────────
function HitlQueueTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_2px_12px_-4px_rgba(20,32,26,0.08)]">
      <div className="border-b border-line px-5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Cola de revisión humana — Control BPO
        </p>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>ID</TH>
            <TH>Caso</TH>
            <TH className="text-center">Confianza</TH>
            <TH className="text-right">Impacto</TH>
            <TH>Acción sugerida</TH>
          </TR>
        </THead>
        <TBody>
          {DISCREPANCY_RECORDS.map((record) => {
            const rev = REVISION_BY_RECORD_ID[record.id];
            const confianza = CONFIDENCIA_BY_ID[record.id];
            return (
              <TR key={record.id}>
                <TD className="font-mono text-xs text-muted">{rev?.id ?? record.id}</TD>
                <TD className="max-w-[220px]">
                  <p
                    className="truncate text-sm font-medium text-ink"
                    title={rev?.titulo ?? record.empresa}
                  >
                    {rev?.titulo ?? `${record.empresa} · registro ${record.id}`}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                    {rev?.resumen ?? record.detalle}
                  </p>
                </TD>
                <TD className="text-center">
                  <ConfidenceBadge value={confianza} />
                </TD>
                <TD className="text-right tabular-nums font-medium text-ink">
                  {formatEUR(rev?.impactoEur ?? record.importeOrigenEur)}
                </TD>
                <TD className="max-w-[240px] text-xs text-ink-soft leading-relaxed">
                  {rev?.accionSugerida ??
                    "Revisar conciliación campo a campo y confirmar acción correctiva."}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}

function ConciliacionAgenteVisual() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <article className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
          <span className="flex items-center gap-2 text-xs text-muted">
            <Bot className="h-3.5 w-3.5" />
            Agente Sapira · Conciliación y enrutamiento
          </span>
          {!ready ? (
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <Loader2 className="h-3 w-3 animate-spin" />
              Conciliando {formatNum(bpoMes.totalDeclaraciones)} registros…
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-ok">
              Completado · umbral {CONFIDENCE_THRESHOLD * 100} %
            </span>
          )}
        </div>

        {!ready ? (
          <div className="grid grid-cols-4 gap-4 px-5 py-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
            {[
              { value: formatNum(bpoMes.totalDeclaraciones), label: "conciliados" },
              { value: formatNum(AUTO_OK_COUNT), label: "sin incidencia" },
              { value: String(DISCREPANCY_COUNT), label: "incidencias" },
              { value: String(HITL_COUNT), label: "en cola HITL" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-surface px-4 py-3 text-center">
                <p className="text-lg font-semibold tabular-nums text-ink">{value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>

      {ready && (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <ReconciliationTable
            variant="agent"
            records={DEMO_TABLE_RECORDS}
            confianzaById={CONFIDENCIA_BY_ID}
            confidenceThreshold={CONFIDENCE_THRESHOLD}
            title="Registros conciliados"
          />
          <p className="text-center text-xs text-muted">
            Muestra de {DEMO_TABLE_RECORDS.length} registros ·{" "}
            <Link href="/plataforma/control" className="font-medium text-brand hover:underline">
              {formatNum(bpoMes.totalDeclaraciones)} en plataforma
            </Link>
          </p>
          <HitlQueueTable />
          <Link
            href="/plataforma/revision"
            className="inline-flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand/30 hover:text-brand"
          >
            <Users className="h-4 w-4 shrink-0" />
            Abrir cola de revisión humana
            <ArrowRight className="ml-auto h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Cierre y plataforma
// ─────────────────────────────────────────────────────────────────────────────
const CIERRE_TRAZA = [
  { ts: "23:58:47", msg: "Conciliación completada · 431 OK · 6 incidencias" },
  { ts: "23:58:48", msg: "6 casos escalados a revisión humana" },
  { ts: "23:58:49", msg: "Informe de control firmado y archivado" },
];

function CierrePlataformaVisual() {
  return (
    <FadeUp>
      <div className="mx-auto w-full max-w-xl space-y-3">
        <article className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
            <span className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" />
              Control de Integridad BPO · Cierre
            </span>
            <span className="text-[11px] font-semibold text-ok">Completado</span>
          </div>

          <div className="px-5 py-8">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {bpoMes.periodo}
            </p>
            <div className="mt-6 flex items-end justify-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-medium tabular-nums leading-none tracking-tight text-ink">
                  {DISCREPANCY_COUNT}
                </p>
                <p className="mt-2 text-sm text-muted">incidencias en HITL</p>
              </div>
              <span className="mb-4 text-2xl text-line">&middot;</span>
              <div className="text-center">
                <p className="text-4xl font-medium tabular-nums leading-none tracking-tight text-ink">
                  {formatEUR(IMPORTE_EN_RIESGO)}
                </p>
                <p className="mt-2 text-sm text-muted">importe en riesgo</p>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-3.5 text-xs">
            <div>
              <dt className="text-muted">Conciliados</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-ink">
                {formatNum(bpoMes.totalDeclaraciones)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Cierre autónomo</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-ink">
                {formatNum(AUTO_DICTAMEN_COUNT)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Cola humana</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-ink">{HITL_COUNT} casos</dd>
            </div>
            <div>
              <dt className="text-muted">Cobertura</dt>
              <dd className="mt-0.5 font-medium text-ink">100 %</dd>
            </div>
          </dl>
        </article>

        <article className="overflow-hidden rounded-xl border border-line bg-surface">
          <p className="border-b border-line px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Traza del cierre
          </p>
          {CIERRE_TRAZA.map(({ ts, msg }) => (
            <div
              key={ts}
              className="flex items-start gap-3 border-t border-line px-5 py-2.5 text-xs first:border-t-0"
            >
              <span className="shrink-0 font-mono text-muted">{ts}</span>
              <span className="text-ink-soft leading-relaxed">{msg}</span>
            </div>
          ))}
        </article>

        <div className="space-y-2">
          <Link
            href="/plataforma/control"
            className="inline-flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand/30 hover:text-brand"
          >
            Abrir módulo Control en la plataforma
            <ArrowRight className="ml-auto h-4 w-4" />
          </Link>
          <Link
            href="/plataforma/revision"
            className="inline-flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand/30 hover:text-brand"
          >
            <Users className="h-4 w-4 shrink-0" />
            {HITL_COUNT} casos en cola de revisión humana
            <ArrowRight className="ml-auto h-4 w-4" />
          </Link>
        </div>
      </div>
    </FadeUp>
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
            Cada registro debe conciliarse con el SGA — importe, CIF, estado de carga y campos
            clave — antes de cerrar el mes.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Con el agente">
          <StepAsideList
            items={[
              "Toma el cierre mensual como entrada automática.",
              "Concilia los 437 registros campo a campo con el SGA.",
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
    nombre: "Conciliación",
    titulo: "Conciliación y enrutamiento",
    explicacion: (
      <>
        <StepAsideSection title="Qué hace el agente">
          <p>
            Cruza origen y SGA campo a campo para los{" "}
            <strong className="text-ink">{formatNum(bpoMes.totalDeclaraciones)} registros</strong>{" "}
            del cierre. Cada dictamen recibe una puntuación de confianza.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Enrutamiento automático">
          <StepAsideList
            items={[
              `Sin incidencia y confianza ≥ ${CONFIDENCE_THRESHOLD * 100} % → cierre autónomo (${formatNum(AUTO_DICTAMEN_COUNT)} registros).`,
              `Cualquier discrepancia → cola de revisión humana (${HITL_COUNT} casos).`,
              "La confianza indica cuánto detalle prepara el agente; no sustituye la revisión humana.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="En la plataforma">
          <StepAsideList
            items={[
              "Tabla de registros con confianza y enrutamiento.",
              `${DISCREPANCY_COUNT} incidencias · ${formatEUR(IMPORTE_EN_RIESGO)} en riesgo.`,
              "100 % del volumen conciliado sin muestreo.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Umbral autónomo: {CONFIDENCE_THRESHOLD * 100} % · {HITL_COUNT} casos escalados
        </StepAsideMeta>
      </>
    ),
    visual: <ConciliacionAgenteVisual />,
  },
  {
    n: 3,
    nombre: "Cierre",
    titulo: "Cierre y plataforma",
    explicacion: (
      <>
        <StepAsideSection title="Resultado del cierre">
          <p>
            El agente concilia el 100 % del volumen, cierra{" "}
            <strong className="text-ink">{formatNum(AUTO_DICTAMEN_COUNT)} registros</strong> de
            forma autónoma y escala{" "}
            <strong className="text-ink">{HITL_COUNT} incidencias</strong> a revisión humana.
          </p>
        </StepAsideSection>
        <StepAsideSection title="La plataforma real">
          <StepAsideList
            items={[
              "Informe de control en /plataforma/control.",
              "Cola HITL unificada en /plataforma/revision.",
              "Trazabilidad completa: conciliación, incidencias y firma digital.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          {bpoMes.periodo} · {DISCREPANCY_COUNT} incidencias ·{" "}
          {formatEUR(IMPORTE_EN_RIESGO)} en riesgo
        </StepAsideMeta>
      </>
    ),
    visual: <CierrePlataformaVisual />,
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
