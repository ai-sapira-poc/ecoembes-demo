"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import type { AnalisisCheck } from "@/data/types";
import { formatEUR, formatPct, cn } from "@/lib/utils";

export interface AnalisisChecksProps {
  checks: AnalisisCheck[];
  /** How many checks have resolved so far (the rest show as "pending"). */
  resolvedCount: number;
}

function CheckRow({ check, resolved, index }: { check: AnalisisCheck; resolved: boolean; index: number }) {
  const isAlerta = check.estado === "alerta";

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      className="px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {!resolved ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : isAlerta ? (
            <AlertTriangle className="h-4 w-4 text-warning" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-ok" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p
              className={cn(
                "text-sm font-semibold leading-snug",
                !resolved ? "text-muted" : isAlerta ? "text-warning" : "text-ink"
              )}
            >
              {check.titulo}
            </p>
            {resolved && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isAlerta ? "bg-warning-soft text-warning" : "bg-ok-soft text-ok"
                )}
              >
                {isAlerta ? "Alerta" : "OK"}
              </span>
            )}
          </div>

          <AnimatePresence>
            {resolved && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="mt-1 text-[12px] leading-snug text-ink-soft text-pretty">
                  {check.comprobacion}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                  <span>
                    <span className="text-muted/70">Evidencia:</span> {check.evidencia}
                  </span>
                  <span className="tabular-nums">
                    <span className="text-muted/70">Confianza:</span>{" "}
                    {formatPct(check.confianza * 100, 0)}
                  </span>
                  <span className="tabular-nums">
                    <span className="text-muted/70">Δ cuota:</span>{" "}
                    {check.deltaEur > 0 ? (
                      <span className="font-semibold text-danger">{formatEUR(check.deltaEur)}</span>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
}

export function AnalisisChecks({ checks, resolvedCount }: AnalisisChecksProps) {
  return (
    <ul className="divide-y divide-line">
      {checks.map((c, i) => (
        <CheckRow key={c.id} check={c} resolved={resolvedCount > i} index={i} />
      ))}
    </ul>
  );
}
