import Link from "next/link";
import {
  FileSearch,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentDeclaracionesTable } from "@/components/dashboard/RecentDeclaracionesTable";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import {
  dashboardKpis,
  trendData,
  declaraciones,
  revisionItems,
  auditoriaPipeline,
} from "@/data/index";
import { formatEUR, formatNum, formatPct } from "@/lib/utils";

// Coverage framing
const MANUAL_IMPORTE = 37_367;
const TOTAL_IMPORTE = 2_338_519;
const MANUAL_AMOUNT_PCT = (MANUAL_IMPORTE / TOTAL_IMPORTE) * 100;

// Pipeline counts
const pipeline = auditoriaPipeline();
const pipelineStages = [
  { key: "recibida" as const, label: "Recibida", color: "muted" as const },
  { key: "en_analisis" as const, label: "En análisis", color: "info" as const },
  { key: "consulta_enviada" as const, label: "Consulta enviada", color: "warning" as const },
  { key: "respuesta_recibida" as const, label: "Respuesta recibida", color: "warning" as const },
  { key: "apto" as const, label: "Apto", color: "ok" as const },
  { key: "no_apto" as const, label: "No apto", color: "danger" as const },
];

export default function PlataformaPage() {
  return (
    <Reveal className="space-y-5">
      {/* ── Header ── */}
      <RevealItem>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-1">
              Visión unificada
            </p>
            <h1 className="text-xl font-bold text-ink">
              Ejercicio 2025 — todas las declaraciones
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 [animation:soft-pulse_2s_ease-in-out_infinite]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
            </span>
            Período 56 · Sep 2025
          </span>
        </div>
      </RevealItem>

      {/* ── KPI row ── */}
      <RevealItem>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Importe auditado"
            value={formatEUR(dashboardKpis.importeAuditadoEur)}
            sub={`${formatNum(dashboardKpis.declaracionesAuditadas)} declaraciones · Ejercicio 2025`}
            icon={ShieldCheck}
          />
          <StatCard
            label="Declaraciones aptas"
            value={`${formatNum(dashboardKpis.declaracionesAptas ?? 0)} / ${formatNum(dashboardKpis.declaracionesAuditadas)}`}
            sub="Veredicto automático del agente"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            label="Importe en riesgo"
            value={formatEUR(dashboardKpis.importeEnRiesgoEur)}
            sub="Control BPO · discrepancias detectadas"
            icon={AlertTriangle}
            trend="down"
          />
          <StatCard
            label="En revisión humana"
            value={formatNum(revisionItems.length)}
            sub="Casos escalados a la cola HITL"
            icon={UserCheck}
          />
        </div>
      </RevealItem>

      {/* ── Coverage + Trend ── */}
      <RevealItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Coverage — the punchline, as a compact comparison */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>Cobertura del control</CardTitle>
              <p className="text-xs text-muted mt-1">
                Agente Sapira vs. muestreo manual · por importe
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-5">
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs font-semibold text-brand-dark uppercase tracking-wide">
                    Agente Sapira
                  </span>
                  <span className="text-xs text-ink-soft tabular-nums">
                    437 / 437 · <span className="font-semibold text-ink">100 %</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-canvas overflow-hidden">
                  <div className="h-full rounded-full bg-brand" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Control manual
                  </span>
                  <span className="text-xs text-ink-soft tabular-nums">
                    5 / 437 · <span className="font-semibold text-ink">{formatPct(MANUAL_AMOUNT_PCT)}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-canvas overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(MANUAL_AMOUNT_PCT, 0.6)}%` }} />
                </div>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed border-t border-line pt-4">
                El agente verifica <span className="font-semibold text-brand">×63 más cobertura</span> que
                el muestreo manual — {formatEUR(TOTAL_IMPORTE - MANUAL_IMPORTE)} que antes no se revisaban.
              </p>
            </CardContent>
          </Card>

          {/* Trend */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Evolución mensual</CardTitle>
              <p className="text-xs text-muted mt-1">
                Importe auditado y declaraciones · últimos 6 meses
              </p>
            </CardHeader>
            <CardContent>
              <TrendChart data={trendData} />
            </CardContent>
          </Card>
        </div>
      </RevealItem>

      {/* ── Workload table + Review queue ── */}
      <RevealItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent declaraciones — real table */}
          <Card className="lg:col-span-3 flex flex-col overflow-hidden">
            <CardHeader className="flex items-center justify-between pb-2">
              <div>
                <CardTitle>Carga del agente auditor</CardTitle>
                <p className="text-xs text-muted mt-1">
                  Últimas declaraciones en el flujo automático
                </p>
              </div>
              <Link
                href="/plataforma/auditoria"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors whitespace-nowrap"
              >
                Ver módulo <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <div className="border-t border-line">
              <RecentDeclaracionesTable rows={declaraciones.slice(0, 6)} />
            </div>
          </Card>

          {/* Review queue */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Casos en revisión humana</CardTitle>
              <p className="text-xs text-muted mt-1">
                El agente escala solo lo que necesita criterio humano
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-2">
              <div className="flex-1 divide-y divide-line">
                {revisionItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink leading-snug line-clamp-1">
                        {item.titulo}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color={item.origen === "auditoria" ? "brand" : "ok"}>
                          {item.origen === "auditoria" ? "Auditoría" : "Control"}
                        </Badge>
                        <span className="text-xs text-muted">
                          {formatEUR(item.impactoEur)} en riesgo
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted flex-shrink-0 mt-0.5 tabular-nums">
                      {formatPct(item.confianza * 100, 0)} conf.
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/plataforma/revision"
                className="mt-3 pt-3 border-t border-line inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
              >
                <UserCheck size={15} />
                Ir a la cola de revisión ({revisionItems.length}) <ArrowRight size={13} />
              </Link>
            </CardContent>
          </Card>
        </div>
      </RevealItem>

      {/* ── Agentic pipeline strip ── */}
      <RevealItem>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <FileSearch size={15} className="text-brand" />
                <span className="text-sm font-semibold text-ink">Pipeline del agente</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
                {pipelineStages.map((stage, idx) => {
                  const count = pipeline[stage.key]?.length ?? 0;
                  return (
                    <div key={stage.key} className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1">
                        <Badge color={stage.color}>{count}</Badge>
                        <span className="text-[11px] text-ink-soft whitespace-nowrap">{stage.label}</span>
                      </span>
                      {idx < pipelineStages.length - 1 && (
                        <span className="text-muted/50 text-xs select-none px-0.5">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </RevealItem>
    </Reveal>
  );
}
