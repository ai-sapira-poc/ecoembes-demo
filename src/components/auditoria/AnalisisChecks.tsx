"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { AnalisisCheck } from "@/data/types";
import { formatEUR, formatPct, cn } from "@/lib/utils";

export interface AnalisisChecksProps {
  checks: AnalisisCheck[];
  /** How many checks have resolved so far (the rest show as "pending"). */
  resolvedCount: number;
}

/** The single check that carries money — pulled out as the hero block. */
function isHero(check: AnalisisCheck) {
  return check.estado === "alerta" && check.deltaEur > 0;
}

/** Quiet one-line row: a small status dot, the label, and a terse verdict. */
function QuietRow({ check, resolved, index }: { check: AnalisisCheck; resolved: boolean; index: number }) {
  const isAlerta = check.estado === "alerta";

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      className="flex items-center justify-between gap-3 px-6 py-2.5"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {!resolved ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted" />
        ) : (
          <span
            className={cn(
              "h-[7px] w-[7px] shrink-0 rounded-full",
              isAlerta ? "bg-warning" : "bg-ok"
            )}
            aria-hidden
          />
        )}
        <span className={cn("truncate text-sm", resolved ? "text-ink-soft" : "text-muted")}>
          {check.titulo}
        </span>
      </span>
      {resolved && (
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {isAlerta ? "Alerta" : "OK"} · {formatPct(check.confianza * 100, 0)}
        </span>
      )}
    </motion.li>
  );
}

/** The hero: the one finding that carries money. The € is the largest thing here. */
function HeroFinding({ check, resolved }: { check: AnalisisCheck; resolved: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: resolved ? 1 : 0.35, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-6 my-3 flex items-center gap-4 rounded-lg bg-danger-soft px-4 py-3.5"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{check.titulo}</p>
        <p className="mt-1 text-xs leading-snug text-ink-soft tabular-nums">
          0,049 €/kg <span className="text-muted">(Madera)</span> · 0,389 €/kg{" "}
          <span className="text-muted">(PEAD)</span> · 0,340 × 25.200 kg
        </p>
      </div>
      <p className="shrink-0 text-3xl font-extrabold leading-none tabular-nums text-danger">
        {resolved ? formatEUR(check.deltaEur) : "—"}
      </p>
    </motion.div>
  );
}

export function AnalisisChecks({ checks, resolvedCount }: AnalisisChecksProps) {
  const quiet = checks.filter((c) => !isHero(c));
  const hero = checks.find(isHero);

  return (
    <div className="py-1">
      <ul className="divide-y divide-line/70">
        {quiet.map((c) => {
          const originalIndex = checks.indexOf(c);
          return (
            <QuietRow
              key={c.id}
              check={c}
              resolved={resolvedCount > originalIndex}
              index={originalIndex}
            />
          );
        })}
      </ul>
      {hero && <HeroFinding check={hero} resolved={resolvedCount > checks.indexOf(hero)} />}
    </div>
  );
}
