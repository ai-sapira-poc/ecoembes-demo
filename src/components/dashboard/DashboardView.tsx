"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
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
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { trendData, declaraciones, revisionItems } from "@/data/index";
import { computeDashboardKpis, importeEnRiesgoForRange } from "@/data/mock/dashboard";
import { defaultDashboardRange, isDateInRange } from "@/lib/date-range";
import { formatEUR, formatNum, formatPct } from "@/lib/utils";

export function DashboardView() {
  const [appliedRange, setAppliedRange] = useState<DateRange>(defaultDashboardRange);

  const filteredDeclaraciones = useMemo(
    () =>
      declaraciones.filter((d) => isDateInRange(d.fechaRecepcion, appliedRange)),
    [appliedRange]
  );

  const kpis = useMemo(
    () =>
      computeDashboardKpis(filteredDeclaraciones, importeEnRiesgoForRange(appliedRange)),
    [filteredDeclaraciones, appliedRange]
  );

  return (
    <Reveal className="space-y-5">
      <RevealItem>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-xl font-bold text-ink">Dashboard</h1>
          <DateRangeFilter
            value={appliedRange}
            onChange={setAppliedRange}
            disabled={{ before: new Date(2025, 2, 1), after: new Date(2025, 8, 30) }}
            defaultMonth={new Date(2025, 2)}
          />
        </div>
      </RevealItem>

      <RevealItem>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Importe auditado"
            value={formatEUR(kpis.importeAuditadoEur)}
            icon={ShieldCheck}
          />
          <StatCard
            label="Declaraciones aptas"
            value={`${formatNum(kpis.declaracionesAptas ?? 0)} / ${formatNum(kpis.declaracionesAuditadas)}`}
            icon={CheckCircle}
            valueTone={
              (kpis.declaracionesAptas ?? 0) === kpis.declaracionesAuditadas
                ? "ok"
                : (kpis.declaracionesNoAptas ?? 0) > 0
                  ? "warning"
                  : "ok"
            }
          />
          <StatCard
            label="Importe en riesgo"
            value={formatEUR(kpis.importeEnRiesgoEur)}
            icon={AlertTriangle}
            valueTone={kpis.importeEnRiesgoEur > 0 ? "danger" : "ok"}
          />
          <StatCard
            label="En revisión humana"
            value={formatNum(revisionItems.length)}
            icon={UserCheck}
            valueTone={revisionItems.length > 0 ? "warning" : "ok"}
          />
        </div>
      </RevealItem>

      <RevealItem>
        <Card>
          <CardHeader>
            <CardTitle>Evolución mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
      </RevealItem>

      <RevealItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3 flex flex-col overflow-hidden">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Carga del agente auditor</CardTitle>
              <Link
                href="/plataforma/auditoria"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors whitespace-nowrap cursor-pointer"
              >
                Ver módulo <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <div className="border-t border-line">
              <RecentDeclaracionesTable rows={filteredDeclaraciones.slice(0, 6)} />
            </div>
          </Card>

          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Casos en revisión humana</CardTitle>
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
                className="mt-3 pt-3 border-t border-line inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark transition-colors cursor-pointer"
              >
                <UserCheck size={15} />
                Ir a la cola de revisión ({revisionItems.length}) <ArrowRight size={13} />
              </Link>
            </CardContent>
          </Card>
        </div>
      </RevealItem>
    </Reveal>
  );
}
