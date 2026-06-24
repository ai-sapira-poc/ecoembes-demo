"use client";

import { Download, ShieldCheck, FileText, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevealItem } from "@/components/motion/Reveal";
import { formatEUR, formatNum } from "@/lib/utils";
import type { BpoMes } from "@/data/types";

interface EvidenceCardProps {
  mes: BpoMes;
  discrepancias: number;
  importeEnRiesgoEur: number;
}

const AUDIT_TRAIL = [
  {
    ts: "2025-09-30 23:58:01",
    msg: "Inicio del proceso de conciliación automática. Período: Septiembre 2025.",
  },
  {
    ts: "2025-09-30 23:58:04",
    msg: "Carga completada: 437 declaraciones desde sistema origen.",
  },
  {
    ts: "2025-09-30 23:58:09",
    msg: "Cruce con SGA iniciado.",
  },
  {
    ts: "2025-09-30 23:58:47",
    msg: "Conciliación completada. 431 registros OK · 6 incidencias detectadas.",
  },
  {
    ts: "2025-09-30 23:58:48",
    msg: "Generación de informe de auditoría iniciada.",
  },
  {
    ts: "2025-09-30 23:58:49",
    msg: "Informe firmado digitalmente y archivado en trazabilidad.",
  },
];

export function EvidenceCard({
  mes,
  discrepancias,
  importeEnRiesgoEur,
}: EvidenceCardProps) {
  const okCount = mes.totalDeclaraciones - discrepancias;

  return (
    <div className="rounded-xl bg-white border border-line shadow-[0_2px_20px_-6px_rgba(20,32,26,0.10)] overflow-hidden">
      {/* Card header */}
      <div className="px-8 pt-6 pb-5 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-brand" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-0.5">
              Evidencia
            </p>
            <h3 className="text-base font-semibold text-ink">
              Control automático — informe auditado
            </h3>
          </div>
        </div>
        <Badge color="brand">{mes.periodo}</Badge>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Summary stats row */}
        <RevealItem>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Total revisado */}
            <div className="rounded-lg bg-canvas border border-line p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted mb-2 flex items-center gap-1.5">
                <FileText size={11} />
                Total revisado
              </p>
              <p className="text-xl font-semibold text-ink tabular-nums">
                {formatNum(mes.totalDeclaraciones)}
              </p>
              <p className="text-xs text-muted mt-1">
                {formatEUR(mes.importeTotalEur)}
              </p>
            </div>

            {/* Registros OK */}
            <div className="rounded-lg bg-canvas border border-line p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
                Registros OK
              </p>
              <p className="text-xl font-semibold text-ok tabular-nums">
                {formatNum(okCount)}
              </p>
              <p className="text-xs text-muted mt-1">sin incidencias</p>
            </div>

            {/* Discrepancias */}
            <div className="rounded-lg bg-danger/5 border border-danger/15 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-danger/70 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={11} />
                Discrepancias
              </p>
              <p className="text-xl font-semibold text-danger tabular-nums">
                {discrepancias}
              </p>
              <p className="text-xs text-danger/60 mt-1">fuera de la muestra</p>
            </div>

            {/* Importe en riesgo */}
            <div className="rounded-lg bg-danger/5 border border-danger/15 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-danger/70 mb-2">
                Importe en riesgo
              </p>
              <p className="text-xl font-semibold text-danger tabular-nums">
                {formatEUR(importeEnRiesgoEur)}
              </p>
              <p className="text-xs text-danger/60 mt-1">no detectado antes</p>
            </div>
          </div>
        </RevealItem>

        {/* Audit trail */}
        <RevealItem>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted mb-3 flex items-center gap-1.5">
              <Clock size={11} />
              Traza de auditoría
            </p>
            <div className="border border-line rounded-lg overflow-hidden">
              {AUDIT_TRAIL.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-4 px-4 py-2.5 text-xs border-b border-line last:border-0 ${
                    idx % 2 === 0 ? "bg-white" : "bg-canvas"
                  }`}
                >
                  <span className="font-mono text-muted whitespace-nowrap shrink-0 pt-px">
                    {entry.ts}
                  </span>
                  <span className="text-ink-soft leading-relaxed">{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealItem>

        {/* CTA footer */}
        <RevealItem>
          <div className="flex items-center justify-between pt-1 border-t border-line">
            <p className="text-xs text-muted leading-relaxed">
              Informe generado automáticamente · Firmado digitalmente · Archivado en trazabilidad
            </p>
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Download size={13} />
              Descargar informe
            </Button>
          </div>
        </RevealItem>
      </div>
    </div>
  );
}
