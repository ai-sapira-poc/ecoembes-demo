"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { ArrowRight } from "lucide-react";
import { StatLedger } from "@/components/ui/StatLedger";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentDeclaracionesTable } from "@/components/dashboard/RecentDeclaracionesTable";
import { PendingRevisionTable } from "@/components/dashboard/PendingRevisionTable";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { trendData, declaraciones, revisionItems } from "@/data/index";
import { computeDashboardKpis, importeEnRiesgoForRange } from "@/data/mock/dashboard";
import { defaultDashboardRange, isDateInRange } from "@/lib/date-range";
import { formatEUR, formatNum } from "@/lib/utils";

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
        <StatLedger
          items={[
            {
              label: "Importe auditado",
              value: formatEUR(kpis.importeAuditadoEur),
            },
            {
              label: "Declaraciones aptas",
              value: `${formatNum(kpis.declaracionesAptas ?? 0)} / ${formatNum(kpis.declaracionesAuditadas)}`,
            },
            {
              label: "Importe en riesgo",
              value: formatEUR(kpis.importeEnRiesgoEur),
              tone: kpis.importeEnRiesgoEur > 0 ? "danger" : "neutral",
            },
            {
              label: "En revisión humana",
              value: formatNum(revisionItems.length),
            },
          ]}
        />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Declaraciones en auditoría</CardTitle>
              <Link
                href="/plataforma/auditoria"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors whitespace-nowrap cursor-pointer"
              >
                Ver más <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <div className="border-t border-line">
              <RecentDeclaracionesTable rows={filteredDeclaraciones.slice(0, 6)} />
            </div>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Pendiente revisión</CardTitle>
              <Link
                href="/plataforma/revision"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors whitespace-nowrap cursor-pointer"
              >
                Ver más <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <div className="border-t border-line">
              <PendingRevisionTable rows={revisionItems.slice(0, 6)} />
            </div>
          </Card>
        </div>
      </RevealItem>
    </Reveal>
  );
}
