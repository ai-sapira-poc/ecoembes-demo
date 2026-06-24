import type { Declaracion } from "@/data/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { formatEUR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FileCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface DictamenCardProps {
  declaracion: Declaracion;
}

export function DictamenCard({ declaracion }: DictamenCardProps) {
  const {
    cuotaDeclaradaEur,
    cuotaCalculadaEur,
    confianza,
    dictamen,
    estado,
  } = declaracion;

  const diff = cuotaDeclaradaEur - cuotaCalculadaEur;
  const hasDiff = Math.abs(diff) > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand" />
            <CardTitle>Dictamen del agente</CardTitle>
          </div>
          <ConfidenceBadge value={confianza} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Cuota comparison */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-canvas p-4 mb-4">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
              Cuota declarada
            </p>
            <p className="text-xl font-bold text-ink tabular-nums">
              {formatEUR(cuotaDeclaradaEur)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
              Cuota calculada
            </p>
            <p
              className={cn(
                "text-xl font-bold tabular-nums",
                hasDiff ? "text-danger" : "text-ok"
              )}
            >
              {formatEUR(cuotaCalculadaEur)}
            </p>
          </div>
          {hasDiff && (
            <div className="col-span-2 border-t border-black/5 pt-3 mt-1">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                Diferencia
              </p>
              <p
                className={cn(
                  "text-base font-semibold tabular-nums",
                  diff < 0 ? "text-danger" : "text-warning"
                )}
              >
                {diff > 0 ? "+" : ""}
                {formatEUR(diff)}
              </p>
            </div>
          )}
        </div>

        {/* Dictamen text */}
        <p className="text-sm text-ink leading-relaxed">{dictamen}</p>

        {/* CTA for en_revision */}
        {estado === "en_revision" && (
          <div className="mt-4 pt-4 border-t border-black/5">
            <Link
              href="/plataforma/revision"
              className="inline-flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2.5 text-sm font-medium text-warning hover:bg-warning/20 transition-colors"
            >
              <span>Enviar a revisión humana</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
