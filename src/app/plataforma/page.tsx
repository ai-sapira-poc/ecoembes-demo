import Link from "next/link";
import {
  FileSearch,
  ListChecks,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  BrainCircuit,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CoverageDonut } from "@/components/dashboard/CoverageDonut";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import {
  dashboardKpis,
  trendData,
  declaraciones,
  revisionItems,
  auditoriaPipeline,
} from "@/data/index";
import { formatEUR, formatNum, formatPct } from "@/lib/utils";

// Hallazgos por severidad
const hallazgosPorSeveridad = declaraciones.reduce(
  (acc, d) => {
    for (const h of d.hallazgos) {
      acc[h.severidad] = (acc[h.severidad] ?? 0) + 1;
    }
    return acc;
  },
  {} as Record<string, number>,
);

const totalHallazgos =
  (hallazgosPorSeveridad["alta"] ?? 0) +
  (hallazgosPorSeveridad["media"] ?? 0) +
  (hallazgosPorSeveridad["baja"] ?? 0);

// Coverage framing
const MANUAL_IMPORTE = 37_367;
const TOTAL_IMPORTE = 2_338_519;
const MANUAL_AMOUNT_PCT = (MANUAL_IMPORTE / TOTAL_IMPORTE) * 100;
const MANUAL_CASOS = 5;
const TOTAL_CASOS = 437;

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
    <Reveal className="space-y-8">
      {/* ── Header ── */}
      <RevealItem>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Visión unificada · Sep 2025
          </p>
          <h1 className="text-2xl font-semibold text-ink">
            Ejercicio 2025 — todas las declaraciones
          </h1>
        </div>
      </RevealItem>

      {/* ── Asymmetric KPI section ── */}
      <RevealItem>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-stretch">
          {/* Hero metric — importe auditado */}
          <div className="bg-surface rounded-xl border border-line p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted leading-none">
                Importe total auditado
              </span>
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center">
                <ShieldCheck className="text-brand-dark" size={16} />
              </span>
            </div>
            {/* Number centered in the available space → balanced, no dead gap */}
            <div className="flex-1 flex flex-col justify-center py-5">
              <p className="text-[2.75rem] font-semibold text-ink tabular-nums leading-none">
                {formatEUR(dashboardKpis.importeAuditadoEur)}
              </p>
              <p className="text-sm text-ink-soft mt-2.5">
                {formatNum(dashboardKpis.declaracionesAuditadas)} declaraciones · Ejercicio 2025 · todos los envasadores
              </p>
            </div>
            <div className="pt-4 border-t border-line space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Cobertura del agente</span>
                <span className="text-sm font-semibold text-brand">100 % del importe</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* Three stacked smaller stats */}
          <div className="flex flex-col gap-3">
            <StatCard
              label="Declaraciones aptas"
              value={formatNum(dashboardKpis.declaracionesAptas ?? 0)}
              sub="Veredicto automático del agente"
              icon={CheckCircle}
              trend="up"
            />
            <StatCard
              label="No aptas · consultas"
              value={`${formatNum(dashboardKpis.declaracionesNoAptas ?? 0)} / ${formatNum(dashboardKpis.enDialogo ?? 0)}`}
              sub="No aptas · en diálogo con cliente"
              icon={MessageSquare}
            />
            <StatCard
              label="Importe en riesgo"
              value={formatEUR(dashboardKpis.importeEnRiesgoEur)}
              sub="Control BPO · discrepancias detectadas"
              icon={AlertTriangle}
              trend="down"
            />
          </div>
        </div>
      </RevealItem>

      {/* ── Coverage + Trend ── */}
      <RevealItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cobertura del control</CardTitle>
              <p className="text-xs text-muted mt-1">
                Manual:{" "}
                <span className="font-semibold">
                  {formatPct(MANUAL_AMOUNT_PCT)} por importe
                </span>{" "}
                ({formatEUR(MANUAL_IMPORTE)} de {formatEUR(TOTAL_IMPORTE)}) ·{" "}
                <span className="font-semibold">
                  {MANUAL_CASOS} de {formatNum(TOTAL_CASOS)} casos
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <CoverageDonut />
            </CardContent>
          </Card>

          <Card>
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

      {/* ── Agentic pipeline ── */}
      <RevealItem>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-brand" />
              <CardTitle>Pipeline del agente auditor</CardTitle>
            </div>
            <p className="text-xs text-muted mt-1">
              Estado actual de las {formatNum(declaraciones.length)} declaraciones en el flujo de auditoría automática
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {pipelineStages.map((stage, idx) => {
                const count = pipeline[stage.key]?.length ?? 0;
                return (
                  <div key={stage.key} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <Badge color={stage.color}>
                        {count}
                      </Badge>
                      <span className="text-[10px] text-muted whitespace-nowrap">
                        {stage.label}
                      </span>
                    </div>
                    {idx < pipelineStages.length - 1 && (
                      <span className="text-muted text-sm mb-3 select-none">→</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted">
              Las declaraciones con veredicto <span className="font-medium text-ok">Apto</span> y <span className="font-medium text-danger">No apto</span> se resuelven automáticamente.
              Solo los casos en <span className="font-medium text-ink">revisión humana</span> pasan a la cola HITL.
            </p>
          </CardContent>
        </Card>
      </RevealItem>

      {/* ── Lower two-column section ── */}
      <RevealItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hallazgos por severidad */}
          <Card>
            <CardHeader>
              <CardTitle>Hallazgos por severidad</CardTitle>
              <p className="text-xs text-muted mt-1">
                Módulo Auditoría · {formatNum(totalHallazgos)} hallazgos totales
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: "alta", label: "Alta", colorClass: "bg-danger" },
                  { key: "media", label: "Media", colorClass: "bg-warning" },
                  { key: "baja", label: "Baja", colorClass: "bg-muted" },
                ].map(({ key, label, colorClass }) => {
                  const count = hallazgosPorSeveridad[key] ?? 0;
                  const pct = totalHallazgos > 0 ? (count / totalHallazgos) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-medium text-ink-soft shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-full`}
                          style={{ width: `${pct.toFixed(1)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted w-8 text-right tabular-nums shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-line">
                <Link
                  href="/plataforma/auditoria"
                  className="flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
                >
                  <FileSearch size={15} />
                  Ver módulo Auditoría →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Casos en revisión humana */}
          <Card>
            <CardHeader>
              <CardTitle>Casos en revisión humana</CardTitle>
              <p className="text-xs text-muted mt-1">
                El agente escala solo lo que necesita criterio humano
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-5">
                {revisionItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 py-2.5 border-b border-line last:border-0"
                  >
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
                {revisionItems.length > 3 && (
                  <p className="text-xs text-muted pt-1">
                    +{revisionItems.length - 3} casos más pendientes
                  </p>
                )}
              </div>
              <Link
                href="/plataforma/revision"
                className="flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
              >
                <UserCheck size={15} />
                Ir a la cola de revisión ({revisionItems.length} casos) →
              </Link>
            </CardContent>
          </Card>
        </div>
      </RevealItem>

      {/* ── Quick-link cards ── */}
      <RevealItem>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/plataforma/auditoria" className="group block">
            <Card className="hover:border-brand/30 hover:shadow-[0_2px_20px_-6px_rgba(20,32,26,0.18)] transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0 group-hover:bg-brand/10 transition-colors">
                    <FileSearch className="text-brand" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">Módulo Auditoría</p>
                    <p className="text-sm text-muted mt-0.5">
                      {declaraciones.length} declaraciones · {formatNum(dashboardKpis.hallazgosTotales)} hallazgos detectados
                    </p>
                  </div>
                  <span className="ml-auto text-muted group-hover:text-brand transition-colors text-lg leading-none">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/plataforma/control" className="group block">
            <Card className="hover:border-brand/30 hover:shadow-[0_2px_20px_-6px_rgba(20,32,26,0.18)] transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0 group-hover:bg-brand/10 transition-colors">
                    <ListChecks className="text-brand" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">Control BPO</p>
                    <p className="text-sm text-muted mt-0.5">
                      437 declaraciones · {formatEUR(dashboardKpis.importeEnRiesgoEur)} en riesgo
                    </p>
                  </div>
                  <span className="ml-auto text-muted group-hover:text-brand transition-colors text-lg leading-none">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </RevealItem>
    </Reveal>
  );
}
