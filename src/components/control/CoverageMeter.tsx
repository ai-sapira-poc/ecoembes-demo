"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { formatEUR, formatPct } from "@/lib/utils";

interface CoverageMeterProps {
  manualPct: number;   // e.g. 1.6
  fullPct: number;     // e.g. 100
  manualEur: number;   // e.g. 37_367
  totalEur: number;    // e.g. 2_338_519
  manualCount: number; // e.g. 5
  totalCount: number;  // e.g. 437
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CoverageMeter({
  manualPct,
  fullPct,
  manualEur,
  totalEur,
  manualCount,
  totalCount,
}: CoverageMeterProps) {
  const pct = useMotionValue(manualPct);
  const eur = useMotionValue(manualEur);
  const count = useMotionValue(manualCount);

  // Animated bar width as a percentage string
  const barWidth = useTransform(pct, [0, 100], ["0%", "100%"]);

  // Formatted display values
  const displayPct = useTransform(pct, (v) =>
    v.toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
  );
  const displayEur = useTransform(eur, (v) => formatEUR(Math.round(v)));
  const displayCount = useTransform(count, (v) => String(Math.round(v)));

  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const delay = 0.5;
    const duration = 1.2;

    animate(pct, fullPct, { duration, delay, ease: EASE_OUT });
    animate(eur, totalEur, { duration, delay, ease: EASE_OUT });
    animate(count, totalCount, { duration, delay, ease: EASE_OUT });
  }, [pct, eur, count, fullPct, totalEur, totalCount]);

  return (
    <div className="rounded-xl bg-white border border-line shadow-[0_2px_20px_-6px_rgba(20,32,26,0.10)] overflow-hidden">
      {/* Top stripe — context label */}
      <div className="px-8 pt-7 pb-0 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Cobertura del control
          </p>
          <h2 className="text-xl font-semibold text-ink text-balance">
            El agente revisa el 100 % de las declaraciones
          </h2>
        </div>
        {/* Live badge */}
        <span className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ok bg-ok/8 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-ok inline-block" />
          En vivo
        </span>
      </div>

      {/* Main content */}
      <div className="px-8 pt-6 pb-8">
        {/* Hero number */}
        <div className="flex items-end gap-2 mb-8">
          <motion.span
            className="text-[5rem] font-medium leading-none tracking-tight text-brand tabular-nums"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {displayPct}
          </motion.span>
          <span className="text-4xl font-medium text-brand mb-1">%</span>
          <span className="text-sm text-muted mb-2 ml-1">de cobertura verificada</span>
        </div>

        {/* Bars */}
        <div className="space-y-5">
          {/* Manual row */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Muestreo manual
              </span>
              <span className="text-xs text-muted tabular-nums">
                {manualCount} / {totalCount} &middot; {formatEUR(manualEur)} ({formatPct(manualPct)})
              </span>
            </div>
            <div className="h-2.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-warning/50 rounded-full"
                style={{ width: `${manualPct}%` }}
              />
            </div>
          </div>

          {/* Agent row — animated */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark">
                Agente Sapira
              </span>
              <span className="text-xs font-semibold text-ink tabular-nums">
                <motion.span>{displayCount}</motion.span>
                {" / "}{totalCount}
                {" · "}
                <motion.span>{displayEur}</motion.span>
                {" ("}
                <motion.span>{displayPct}</motion.span>
                {" %)"}
              </span>
            </div>
            <div className="h-2.5 bg-brand-soft rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand rounded-full"
                style={{ width: barWidth }}
              />
            </div>
          </div>
        </div>

        {/* Divider + caption */}
        <div className="mt-6 pt-5 border-t border-line flex items-center gap-8">
          <div>
            <p className="text-xs text-muted">frente al control manual</p>
            <p className="text-sm font-semibold text-warning mt-0.5">
              {formatPct(manualPct)} cubierto antes
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">mejora de cobertura</p>
            <p className="text-sm font-semibold text-brand mt-0.5">
              ×{(fullPct / manualPct).toFixed(0)} veces más
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">importe no revisado antes</p>
            <p className="text-sm font-semibold text-ink mt-0.5">
              {formatEUR(totalEur - manualEur)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
