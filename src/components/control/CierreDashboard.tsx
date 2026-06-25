"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { ArrowRight, ClipboardCheck, ShieldCheck } from "lucide-react";
import { FadeUp, Reveal, RevealItem } from "@/components/motion/Reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatLedger } from "@/components/ui/StatLedger";
import { formatNum, formatPct } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CierreDashboardProps {
  periodo: string;
  totalDeclaraciones: number;
  discrepancias: number;
  importeEnRiesgoEur: number;
  cierreAutonomo: number;
  hitlCount: number;
}

function CountUp({
  to,
  prefix = "",
  duration = 1.1,
  delay = 0.2,
  className,
}: {
  to: number;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
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

const TRAZA = [
  { ts: "23:58:04", msg: "Cierre importado desde el ERP · 437 declaraciones · 2.338.519 €" },
  { ts: "23:58:09", msg: "Conciliación campo a campo con SGA iniciada" },
  { ts: "23:58:47", msg: "Conciliación completada · 431 OK · 6 incidencias" },
  { ts: "23:58:48", msg: "6 casos escalados a revisión humana (HITL)" },
  { ts: "23:58:49", msg: "Informe de control firmado y archivado" },
];

export function CierreDashboard({
  periodo,
  totalDeclaraciones,
  discrepancias,
  importeEnRiesgoEur,
  cierreAutonomo,
  hitlCount,
}: CierreDashboardProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      <FadeUp>
        {/* Hero */}
        <Card className="shrink-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-3">
            <span className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" />
              Control de Integridad BPO · Cierre {periodo}
            </span>
            <span className="text-[11px] font-semibold text-ok">Completado · 100 % conciliado</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-line">
            <div className="bg-surface px-5 py-7 text-center">
              <CountUp
                to={discrepancias}
                duration={0.7}
                className="block text-5xl font-medium leading-none tracking-tight text-danger tabular-nums md:text-6xl"
              />
              <p className="mt-2 text-sm text-muted">incidencias detectadas</p>
              <p className="mt-0.5 text-[11px] text-muted">en el 100 % del cierre</p>
            </div>
            <div className="bg-surface px-5 py-7 text-center">
              <CountUp
                to={importeEnRiesgoEur}
                prefix="€"
                duration={1.1}
                className="block text-4xl font-medium leading-none tracking-tight text-danger tabular-nums md:text-5xl"
              />
              <p className="mt-2 text-sm text-muted">importe en riesgo</p>
              <p className="mt-0.5 text-[11px] text-muted">no detectado antes</p>
            </div>
          </div>
        </Card>
      </FadeUp>

      {/* KPI band — one ledger, color reserved for the close */}
      <FadeUp className="shrink-0">
        <StatLedger
          items={[
            { label: "Conciliados", value: formatNum(totalDeclaraciones) },
            { label: "Cierre autónomo", value: formatNum(cierreAutonomo) },
            { label: "Revisión humana", value: formatNum(hitlCount) },
            { label: "Cobertura", value: "100 %", tone: "ok" },
          ]}
        />
      </FadeUp>

      {/* Resolved vs pending + traza */}
      <Reveal className="grid shrink-0 gap-3 sm:grid-cols-2">
        <RevealItem>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Resolución del cierre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Bar label="Cierre autónomo" value={cierreAutonomo} total={totalDeclaraciones} tone="brand" />
              <Bar label="Revisión humana" value={hitlCount} total={totalDeclaraciones} tone="warning" />
              <p className="pt-1 text-xs text-ink-soft">
                <strong className="font-semibold text-ink">{formatNum(cierreAutonomo)}</strong> registros cerrados
                sin intervención · el humano sólo revisa los <strong className="font-semibold text-ink">{hitlCount}</strong> dudosos.
              </p>
            </CardContent>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="h-full overflow-hidden">
            <CardHeader>
              <CardTitle>Traza del cierre</CardTitle>
            </CardHeader>
            <div className="divide-y divide-line border-t border-line">
              {TRAZA.map((t) => (
                <div key={t.ts} className="flex items-start gap-3 px-6 py-2 text-xs">
                  <span className="shrink-0 font-mono text-muted">{t.ts}</span>
                  <span className="leading-relaxed text-ink-soft">{t.msg}</span>
                </div>
              ))}
            </div>
          </Card>
        </RevealItem>
      </Reveal>

      {/* Platform links */}
      <div className="grid shrink-0 gap-2 sm:grid-cols-2">
        <Link
          href="/plataforma/control"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-tint/60 hover:text-brand"
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Informe de control
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
        <Link
          href="/plataforma/revision"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-tint/60 hover:text-brand"
        >
          <ClipboardCheck className="h-4 w-4 shrink-0" />
          {hitlCount} casos en revisión humana
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "brand" | "warning";
}) {
  const pct = (value / total) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="text-ink-soft">{label}</span>
        <span className="tabular-nums text-muted">
          {formatNum(value)} · {formatPct(pct, 1)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <motion.div
          className={tone === "brand" ? "h-full rounded-full bg-brand" : "h-full rounded-full bg-warning"}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 0.8)}%` }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
        />
      </div>
    </div>
  );
}
