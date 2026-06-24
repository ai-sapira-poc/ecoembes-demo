"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, MailOpen, ArrowRight, Loader2 } from "lucide-react";
import { FadeUp } from "@/components/motion/Reveal";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { formatEUR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Veredicto, EstadoAgente } from "@/data/types";

export interface VeredictoCardProps {
  veredicto: Veredicto;
  estadoAgente: EstadoAgente;
  consultasAbiertas: number;
  cuotaDeclaradaEur: number;
  cuotaCalculadaEur: number;
  confianza: number;
  razonamiento?: string;
}

export function VeredictoCard({
  veredicto,
  estadoAgente,
  consultasAbiertas,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  confianza,
  razonamiento,
}: VeredictoCardProps) {
  const diff = cuotaDeclaradaEur - cuotaCalculadaEur;

  return (
    <FadeUp delay={0.2}>
      {veredicto === "apto" && (
        <div className="rounded-xl border border-ok/30 bg-ok-soft p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-ok flex-shrink-0" />
              <span className="text-3xl font-semibold text-ok tracking-tight">APTO</span>
            </div>
            <ConfidenceBadge value={confianza} />
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface/60 p-4 mb-4">
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Cuota declarada</p>
              <p className="text-lg font-semibold text-ink tabular-nums">{formatEUR(cuotaDeclaradaEur)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Cuota calculada</p>
              <p className="text-lg font-semibold text-ok tabular-nums">{formatEUR(cuotaCalculadaEur)}</p>
            </div>
          </div>
          {razonamiento && (
            <p className="text-sm text-ink-soft leading-relaxed text-pretty">{razonamiento}</p>
          )}
        </div>
      )}

      {veredicto === "no_apto" && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-danger flex-shrink-0" />
              <span className="text-3xl font-semibold text-danger tracking-tight">NO APTO</span>
            </div>
            <ConfidenceBadge value={confianza} />
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface/60 p-4 mb-4">
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Cuota declarada</p>
              <p className="text-lg font-semibold text-ink tabular-nums">{formatEUR(cuotaDeclaradaEur)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Cuota calculada</p>
              <p className="text-lg font-semibold text-danger tabular-nums">{formatEUR(cuotaCalculadaEur)}</p>
            </div>
            {Math.abs(diff) > 0 && (
              <div className="col-span-2 border-t border-danger/20 pt-3 mt-1">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Diferencia</p>
                <p className={cn("text-base font-semibold tabular-nums", diff < 0 ? "text-danger" : "text-warning")}>
                  {diff > 0 ? "+" : ""}
                  {formatEUR(diff)}
                </p>
              </div>
            )}
          </div>
          {razonamiento && (
            <p className="text-sm text-ink-soft leading-relaxed text-pretty">{razonamiento}</p>
          )}
        </div>
      )}

      {veredicto === null && (estadoAgente === "consulta_enviada" || estadoAgente === "respuesta_recibida") && (
        <div className="rounded-xl border border-line bg-surface p-6">
          <div className="flex items-center gap-3 mb-3">
            <MailOpen className="w-6 h-6 text-muted flex-shrink-0" />
            <span className="text-lg font-semibold text-ink">En diálogo con el cliente</span>
          </div>
          <p className="text-sm text-muted">
            {consultasAbiertas > 0
              ? `${consultasAbiertas} consulta${consultasAbiertas !== 1 ? "s" : ""} abierta${consultasAbiertas !== 1 ? "s" : ""} — pendiente de respuesta del cliente.`
              : "Respuesta recibida — pendiente de resolución por el agente."}
          </p>
        </div>
      )}

      {veredicto === null && estadoAgente === "en_revision" && (
        <div className="rounded-xl border border-warning/30 bg-warning-soft p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg font-semibold text-warning">Escalado a revisión humana</span>
          </div>
          <p className="text-sm text-muted mb-4">
            La confianza del agente es insuficiente para emitir dictamen definitivo.
          </p>
          <Link
            href="/plataforma/revision"
            className="inline-flex items-center gap-2 rounded-lg bg-warning text-white px-4 py-2 text-sm font-medium hover:bg-warning/90 transition-colors"
          >
            <span>Ver cola de revisión</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {veredicto === null && (estadoAgente === "recibida" || estadoAgente === "en_analisis") && (
        <div className="rounded-xl border border-line bg-canvas p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-muted animate-spin" />
            <span className="text-sm font-medium text-muted">Análisis en curso…</span>
          </div>
        </div>
      )}
    </FadeUp>
  );
}
