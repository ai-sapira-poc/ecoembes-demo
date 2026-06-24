import Link from "next/link";
import {
  FileSearch,
  ListChecks,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CoverageDonut } from "@/components/dashboard/CoverageDonut";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { dashboardKpis, trendData, declaraciones, revisionItems } from "@/data/index";
import { formatEUR, formatNum, formatPct } from "@/lib/utils";

// Hallazgos por severidad — computed from mock data
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
const MANUAL_AMOUNT_PCT = (MANUAL_IMPORTE / TOTAL_IMPORTE) * 100; // ~1.598…
const MANUAL_CASOS = 5;
const TOTAL_CASOS = 437;
const MANUAL_CASOS_PCT = (MANUAL_CASOS / TOTAL_CASOS) * 100; // ~1.144…

export default function PlataformaPage() {
  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Visión unificada</h1>
        <p className="text-muted text-sm mt-1">
          Ejercicio 2025 · Septiembre
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Declaraciones auditadas"
          value={formatNum(dashboardKpis.declaracionesAuditadas)}
          sub="Ejercicio 2025 · todas las empresas"
          icon={ClipboardList}
          trend="up"
        />
        <StatCard
          label="Importe auditado"
          value={formatEUR(dashboardKpis.importeAuditadoEur)}
          sub="Cuotas declaradas totales"
          icon={ShieldCheck}
          trend="up"
        />
        <StatCard
          label="Hallazgos detectados"
          value={formatNum(dashboardKpis.hallazgosTotales)}
          sub={`Impacto total: ${formatEUR(dashboardKpis.impactoDetectadoEur)}`}
          icon={AlertTriangle}
        />
        <StatCard
          label="Importe en riesgo"
          value={formatEUR(dashboardKpis.importeEnRiesgoEur)}
          sub="Control BPO · discrepancias detectadas"
          icon={TrendingUp}
          trend="down"
        />
      </div>

      {/* ── Coverage + Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coverage Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Cobertura del control</CardTitle>
            <p className="text-xs text-muted mt-1">
              Cobertura manual:{" "}
              <span className="font-semibold">
                {formatPct(MANUAL_AMOUNT_PCT)} por importe
              </span>{" "}
              ({formatEUR(MANUAL_IMPORTE)} de {formatEUR(TOTAL_IMPORTE)}) ·{" "}
              <span className="font-semibold">
                {MANUAL_CASOS} de {formatNum(TOTAL_CASOS)} casos ({formatPct(MANUAL_CASOS_PCT)})
              </span>
            </p>
          </CardHeader>
          <CardContent>
            <CoverageDonut />
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución mensual (últimos 6 meses)</CardTitle>
            <p className="text-xs text-muted mt-1">
              Importe auditado y declaraciones procesadas
            </p>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
      </div>

      {/* ── Lower two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              {/* Alta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge color="danger">Alta</Badge>
                  <span className="text-sm text-ink">
                    {hallazgosPorSeveridad["alta"] ?? 0} hallazgos
                  </span>
                </div>
                <div className="flex-1 mx-4 h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger rounded-full"
                    style={{
                      width:
                        totalHallazgos > 0
                          ? `${(((hallazgosPorSeveridad["alta"] ?? 0) / totalHallazgos) * 100).toFixed(1)}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-muted w-10 text-right">
                  {totalHallazgos > 0
                    ? formatPct(((hallazgosPorSeveridad["alta"] ?? 0) / totalHallazgos) * 100, 0)
                    : "0 %"}
                </span>
              </div>

              {/* Media */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge color="warning">Media</Badge>
                  <span className="text-sm text-ink">
                    {hallazgosPorSeveridad["media"] ?? 0} hallazgos
                  </span>
                </div>
                <div className="flex-1 mx-4 h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full"
                    style={{
                      width:
                        totalHallazgos > 0
                          ? `${(((hallazgosPorSeveridad["media"] ?? 0) / totalHallazgos) * 100).toFixed(1)}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-muted w-10 text-right">
                  {totalHallazgos > 0
                    ? formatPct(((hallazgosPorSeveridad["media"] ?? 0) / totalHallazgos) * 100, 0)
                    : "0 %"}
                </span>
              </div>

              {/* Baja */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge color="muted">Baja</Badge>
                  <span className="text-sm text-ink">
                    {hallazgosPorSeveridad["baja"] ?? 0} hallazgos
                  </span>
                </div>
                <div className="flex-1 mx-4 h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-muted rounded-full"
                    style={{
                      width:
                        totalHallazgos > 0
                          ? `${(((hallazgosPorSeveridad["baja"] ?? 0) / totalHallazgos) * 100).toFixed(1)}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-muted w-10 text-right">
                  {totalHallazgos > 0
                    ? formatPct(((hallazgosPorSeveridad["baja"] ?? 0) / totalHallazgos) * 100, 0)
                    : "0 %"}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-black/5">
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
            <div className="space-y-2 mb-4">
              {revisionItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-2 border-b border-black/5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{item.titulo}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge color={item.origen === "auditoria" ? "brand" : "ok"}>
                        {item.origen === "auditoria" ? "Auditoría" : "Control"}
                      </Badge>
                      <span className="text-xs text-muted">
                        {formatEUR(item.impactoEur)} en riesgo
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0 mt-1">
                    Conf. {formatPct(item.confianza * 100, 0)}
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

      {/* ── Quick-link cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/plataforma/auditoria" className="group block">
          <Card className="hover:border-brand/30 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0 group-hover:bg-brand/15 transition-colors">
                  <FileSearch className="text-brand" size={22} />
                </div>
                <div>
                  <p className="font-semibold text-ink">Módulo Auditoría</p>
                  <p className="text-sm text-muted">
                    {declaraciones.length} declaraciones · {formatNum(dashboardKpis.hallazgosTotales)} hallazgos detectados
                  </p>
                </div>
                <span className="ml-auto text-muted group-hover:text-brand transition-colors">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/plataforma/control" className="group block">
          <Card className="hover:border-brand/30 hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0 group-hover:bg-brand/15 transition-colors">
                  <ListChecks className="text-brand" size={22} />
                </div>
                <div>
                  <p className="font-semibold text-ink">Control BPO</p>
                  <p className="text-sm text-muted">
                    437 declaraciones · {formatEUR(dashboardKpis.importeEnRiesgoEur)} en riesgo
                  </p>
                </div>
                <span className="ml-auto text-muted group-hover:text-brand transition-colors">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
