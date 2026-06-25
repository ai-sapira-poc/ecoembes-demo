"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { CheckCircle2, Database, Loader2, Server } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { FadeUp } from "@/components/motion/Reveal";
import { bpoMes, bpoDesglose, bpoErpMeta } from "@/data/index";
import { formatEUR, formatNum, formatPct } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const TOTAL = bpoMes.totalDeclaraciones;

// ── Count-up integer ──────────────────────────────────────────────────────────
function CountUp({
  to,
  duration = 1.0,
  delay = 0.2,
  className,
  prefix = "",
}: {
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
}) {
  const v = useMotionValue(0);
  const display = useTransform(v, (x) => prefix + Math.round(x).toLocaleString("es-ES"));
  const run = useRef(false);
  useEffect(() => {
    if (run.current) return;
    run.current = true;
    animate(v, to, { duration, delay, ease: EASE_OUT });
  }, [v, to, duration, delay]);
  return <motion.span className={className}>{display}</motion.span>;
}

// ── Import progress (importing → 437/437) ──────────────────────────────────────
function ImportProgress({ onDone }: { onDone: () => void }) {
  const count = useMotionValue(0);
  const label = useTransform(count, (x) => `${Math.round(x).toLocaleString("es-ES")} / ${formatNum(TOTAL)}`);
  const width = useTransform(count, [0, TOTAL], ["0%", "100%"]);
  useEffect(() => {
    // No ref guard: in React 19 Strict Mode the effect mounts → cleanup stops
    // the animation → remounts; a guard would skip the restart and freeze at 0.
    const controls = animate(count, TOTAL, {
      duration: 1.6,
      delay: 0.2,
      ease: EASE_OUT,
      onComplete: () => setTimeout(onDone, 400),
    });
    return () => controls.stop();
  }, [count, onDone]);

  return (
    <div className="px-5 py-7">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
          Importando registros desde {bpoErpMeta.sistema}…
        </span>
        <motion.span className="font-mono tabular-nums text-ink">{label}</motion.span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-brand" style={{ width }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Conector", value: bpoErpMeta.conector },
          { label: "Módulo", value: bpoErpMeta.modulo },
          { label: "Lotes", value: `${bpoErpMeta.lotes} lotes` },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-line bg-canvas px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{m.label}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-ink" title={m.value}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desglose card (material / sector / estado) ─────────────────────────────────
type DimKey = "porMaterial" | "porSector" | "porEstado";
const DIMS: { key: DimKey; label: string }[] = [
  { key: "porMaterial", label: "Por material" },
  { key: "porSector", label: "Por sector" },
  { key: "porEstado", label: "Por estado" },
];

function DesgloseBreakdown() {
  const [dim, setDim] = useState<DimKey>("porMaterial");
  const lineas = bpoDesglose[dim];
  const max = Math.max(...lineas.map((l) => l.importeEur));

  return (
    <Card className="shrink-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-6 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Desglose del cierre
        </p>
        <div className="flex items-center gap-1 rounded-lg bg-canvas p-0.5">
          {DIMS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDim(d.key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                dim === d.key ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink-soft"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-line">
        <AnimatePresence mode="wait">
          <motion.div
            key={dim}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            {lineas.map((l, i) => (
              <div key={l.clave} className="px-5 py-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{l.clave}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {formatNum(l.declaraciones)} · {formatEUR(l.importeEur)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <motion.div
                    className="h-full rounded-full bg-brand/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${(l.importeEur / max) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.05 * i, ease: EASE_OUT }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}

export function ErpSyncWorkspace() {
  const [phase, setPhase] = useState<"loading" | "importing" | "ready">("loading");

  useEffect(() => {
    const t = setTimeout(() => setPhase("importing"), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      <FadeUp>
        <Card className="shrink-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-3">
            <span className="flex items-center gap-2 text-xs text-muted">
              <Server className="h-3.5 w-3.5" />
              Sincronización con el ERP · {bpoErpMeta.sistema}
            </span>
            <AnimatePresence mode="wait">
              {phase === "ready" ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-ok"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Importación completada
                </motion.span>
              ) : (
                <motion.span key="busy" exit={{ opacity: 0 }} className="text-[11px] text-muted">
                  {bpoErpMeta.periodo}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {phase === "loading" && (
              <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-3 px-5 py-7">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </motion.div>
            )}
            {phase === "importing" && (
              <motion.div key="imp" exit={{ opacity: 0 }}>
                <ImportProgress onDone={() => setPhase("ready")} />
              </motion.div>
            )}
            {phase === "ready" && (
              <motion.div
                key="rd"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <div className="px-5 py-7">
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Cierre importado · {bpoErpMeta.periodo}
                  </p>
                  <div className="mt-5 flex items-end justify-center gap-8">
                    <div className="text-center">
                      <CountUp
                        to={TOTAL}
                        duration={0.8}
                        className="block text-5xl font-medium leading-none tracking-tight text-ink tabular-nums md:text-6xl"
                      />
                      <p className="mt-2 text-sm text-muted">declaraciones</p>
                    </div>
                    <span className="mb-4 text-2xl text-line">&middot;</span>
                    <div className="text-center">
                      <CountUp
                        to={bpoMes.importeTotalEur}
                        duration={1.1}
                        prefix="€"
                        className="block text-4xl font-medium leading-none tracking-tight text-ink tabular-nums md:text-5xl"
                      />
                      <p className="mt-2 text-sm text-muted">importe total</p>
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-3.5 text-xs sm:grid-cols-4">
                  {[
                    { k: "Período", v: bpoErpMeta.periodo },
                    { k: "Origen", v: bpoErpMeta.modulo },
                    { k: "Última sync", v: bpoErpMeta.ultimaSync },
                    { k: "Cobertura previa", v: formatPct((bpoMes.importeMuestreadoEur / bpoMes.importeTotalEur) * 100) },
                  ].map((m) => (
                    <div key={m.k}>
                      <dt className="text-muted">{m.k}</dt>
                      <dd className="mt-0.5 truncate font-medium text-ink" title={m.v}>
                        {m.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </FadeUp>

      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.1 }}
            className="shrink-0"
          >
            <DesgloseBreakdown />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.2 }}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3.5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft">
              <span
                className="h-2 w-2 rounded-full bg-brand"
                style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
              />
            </span>
            <p className="flex-1 text-sm text-ink-soft">
              El agente recibe el cierre de <strong className="font-semibold text-ink">{formatNum(TOTAL)} declaraciones</strong>{" "}
              e <strong className="font-semibold text-ink">inicia la conciliación</strong> campo a campo con el SGA.
            </p>
            <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted sm:flex">
              <Database className="h-3.5 w-3.5" />
              SGA listo
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
