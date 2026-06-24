"use client";

import { Download, ShieldCheck, FileText, AlertTriangle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatEUR, formatNum } from "@/lib/utils";
import type { BpoMes } from "@/data/types";

interface EvidenceCardProps {
  mes: BpoMes;
  discrepancias: number;
  importeEnRiesgoEur: number;
}

const AUDIT_TRAIL = [
  { ts: "2025-09-30 23:58:01", msg: "Inicio del proceso de conciliación automática. Período: Septiembre 2025." },
  { ts: "2025-09-30 23:58:04", msg: "Carga completada: 437 declaraciones desde sistema origen." },
  { ts: "2025-09-30 23:58:09", msg: "Cruce con SGA iniciado." },
  { ts: "2025-09-30 23:58:47", msg: "Conciliación completada. 431 registros OK · 6 incidencias detectadas." },
  { ts: "2025-09-30 23:58:48", msg: "Generación de informe de auditoría iniciada." },
  { ts: "2025-09-30 23:58:49", msg: "Informe firmado digitalmente y archivado en trazabilidad." },
];

export function EvidenceCard({ mes, discrepancias, importeEnRiesgoEur }: EvidenceCardProps) {
  const okCount = mes.totalDeclaraciones - discrepancias;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand" />
            Evidencia del control automático
          </CardTitle>
          <Badge color="brand">{mes.periodo}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
          <div className="rounded-lg bg-canvas p-4">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <FileText size={12} />
              Total revisado
            </p>
            <p className="text-lg font-bold text-ink">
              {formatNum(mes.totalDeclaraciones)}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {formatEUR(mes.importeTotalEur)}
            </p>
          </div>

          <div className="rounded-lg bg-canvas p-4">
            <p className="text-xs text-muted mb-1">Registros OK</p>
            <p className="text-lg font-bold text-ok">{formatNum(okCount)}</p>
            <p className="text-xs text-muted mt-0.5">sin incidencias</p>
          </div>

          <div className="rounded-lg bg-danger/5 border border-danger/10 p-4">
            <p className="text-xs text-danger mb-1 flex items-center gap-1">
              <AlertTriangle size={12} />
              Discrepancias
            </p>
            <p className="text-lg font-bold text-danger">{discrepancias}</p>
            <p className="text-xs text-danger/70 mt-0.5">fuera de la muestra manual</p>
          </div>

          <div className="rounded-lg bg-danger/5 border border-danger/10 p-4">
            <p className="text-xs text-danger mb-1">Importe en riesgo</p>
            <p className="text-lg font-bold text-danger">
              {formatEUR(importeEnRiesgoEur)}
            </p>
            <p className="text-xs text-danger/70 mt-0.5">no detectado en control manual</p>
          </div>
        </div>

        {/* Audit trail */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock size={12} />
            Traza de auditoría generada
          </h4>
          <div className="space-y-1 border border-black/5 rounded-lg overflow-hidden">
            {AUDIT_TRAIL.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 px-4 py-2.5 text-xs border-b border-black/5 last:border-0 bg-white odd:bg-canvas"
              >
                <span className="font-mono text-muted whitespace-nowrap shrink-0">
                  {entry.ts}
                </span>
                <span className="text-ink">{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <p className="text-xs text-muted">
            Informe generado automáticamente · Firmado digitalmente · Archivado en trazabilidad
          </p>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Download size={14} />
            Descargar informe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
