"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { formatEUR, formatPct } from "@/lib/utils";

interface CoverageMeterProps {
  manualPct: number;       // e.g. 1.6
  fullPct: number;         // e.g. 100
  manualEur: number;       // e.g. 37_367
  totalEur: number;        // e.g. 2_338_519
  manualCount: number;     // e.g. 5
  totalCount: number;      // e.g. 437
}

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

  // Animated bar width (clamped 0–100%)
  const barWidth = useTransform(pct, [0, 100], ["0%", "100%"]);

  // Animated display values formatted as strings
  const displayPct = useTransform(pct, (v) =>
    v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  );
  const displayEur = useTransform(eur, (v) =>
    formatEUR(Math.round(v))
  );
  const displayCount = useTransform(count, (v) => String(Math.round(v)));

  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const delay = 0.6;
    const duration = 2.2;

    animate(pct, fullPct, { duration, delay, ease: "easeInOut" });
    animate(eur, totalEur, { duration, delay, ease: "easeInOut" });
    animate(count, totalCount, { duration, delay, ease: "easeInOut" });
  }, [pct, eur, count, fullPct, totalEur, totalCount]);

  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink">Cobertura del control</h2>
        <p className="text-sm text-muted mt-1">
          El agente revisa el 100% de las declaraciones recibidas
        </p>
      </div>

      {/* Comparison rows */}
      <div className="space-y-5 mb-8">
        {/* Manual sample row */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-muted">Muestreo manual</span>
            <span className="text-sm text-muted">
              {manualCount} / {totalCount} · {formatEUR(manualEur)} ({formatPct(manualPct)})
            </span>
          </div>
          <div className="h-3 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-warning/60 rounded-full"
              style={{ width: `${manualPct}%` }}
            />
          </div>
        </div>

        {/* Agent row — animated */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-semibold text-brand-dark">Agente</span>
            <span className="text-sm font-semibold text-ink">
              <motion.span>{displayCount}</motion.span>
              {" / "}{totalCount} · <motion.span>{displayEur}</motion.span>
              {" ("}
              <motion.span>{displayPct}</motion.span>
              {" %)"}
            </span>
          </div>
          <div className="h-3 bg-brand-soft rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand rounded-full"
              style={{ width: barWidth }}
            />
          </div>
        </div>
      </div>

      {/* Hero number */}
      <div className="flex items-end gap-4 pt-4 border-t border-black/5">
        <div>
          <motion.span className="text-6xl font-extrabold text-brand leading-none tabular-nums">
            {displayPct}
          </motion.span>
          <span className="text-3xl font-bold text-brand ml-1">%</span>
        </div>
        <div className="pb-1">
          <p className="text-sm text-muted">de cobertura</p>
          <p className="text-xs text-muted">
            frente al <span className="text-warning font-medium">{formatPct(manualPct)}</span> del control manual
          </p>
        </div>
      </div>
    </div>
  );
}
