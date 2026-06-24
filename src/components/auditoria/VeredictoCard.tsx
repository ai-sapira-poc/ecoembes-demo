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
  /** Skip entry animation when nested in accordions/lists. */
  embedded?: boolean;
}

/** Compact key-value row for the cuotas. */
function CuotaRow({ label, value, accent }: { label: string; value: string; accent?: "ok" | "danger" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cn("text-sm font-semibold tabular-nums", accent === "ok" ? "text-ok" : accent === "danger" ? "text-danger" : "text-ink")}>
        {value}
      </dd>
    </div>
  );
}

export function VeredictoCard({
  veredicto,
  estadoAgente,
  consultasAbiertas,
  cuotaDeclaradaEur,
  cuotaCalculadaEur,
  confianza,
  razonamiento,
  embedded = false,
}: VeredictoCardProps) {
  const diff = cuotaDeclaradaEur - cuotaCalculadaEur;

  const resuelto = veredicto === "apto" || veredicto === "no_apto";
  const tone = veredicto === "apto" ? "ok" : "danger";

  const body = (
    <>
      {resuelto && (
        <div className={cn("rounded-xl border bg-surface overflow-hidden", tone === "ok" ? "border-ok/30" : "border-danger/30")}>
          {/* Header accent */}
          <div className={cn("flex items-center justify-between gap-3 px-4 py-2.5 border-b", tone === "ok" ? "bg-ok-soft border-ok/15" : "bg-danger-soft border-danger/15")}>
            <div className="flex items-center gap-2">
              {tone === "ok" ? (
                <CheckCircle2 className="w-4 h-4 text-ok" />
              ) : (
                <XCircle className="w-4 h-4 text-danger" />
              )}
              <span className={cn("text-sm font-bold uppercase tracking-wide", tone === "ok" ? "text-ok" : "text-danger")}>
                {veredicto === "apto" ? "Apto" : "No apto"}
              </span>
            </div>
            <ConfidenceBadge value={confianza} />
          </div>
          {/* Body */}
          <div className="p-4 space-y-3">
            <dl className="space-y-2">
              <CuotaRow label="Cuota declarada" value={formatEUR(cuotaDeclaradaEur)} />
              <CuotaRow label="Cuota calculada" value={formatEUR(cuotaCalculadaEur)} accent={tone} />
              {veredicto === "no_apto" && Math.abs(diff) > 0 && (
                <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
                  <dt className="text-xs text-muted">Diferencia</dt>
                  <dd className={cn("text-sm font-semibold tabular-nums", diff < 0 ? "text-danger" : "text-warning")}>
                    {diff > 0 ? "+" : ""}
                    {formatEUR(diff)}
                  </dd>
                </div>
              )}
            </dl>
            {razonamiento && (
              <p className="text-xs text-ink-soft leading-relaxed border-t border-line pt-3">{razonamiento}</p>
            )}
          </div>
        </div>
      )}

      {veredicto === null && (estadoAgente === "consulta_enviada" || estadoAgente === "respuesta_recibida") && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <MailOpen className="w-4 h-4 text-warning flex-shrink-0" />
            <span className="text-sm font-semibold text-ink">En diálogo con el cliente</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {consultasAbiertas > 0
              ? `${consultasAbiertas} consulta${consultasAbiertas !== 1 ? "s" : ""} abierta${consultasAbiertas !== 1 ? "s" : ""} — pendiente de respuesta del cliente.`
              : "Respuesta recibida — pendiente de resolución por el agente."}
          </p>
        </div>
      )}

      {veredicto === null && estadoAgente === "en_revision" && (
        <div className="rounded-xl border border-warning/30 bg-surface overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-soft border-b border-warning/15">
            <span className="text-sm font-bold uppercase tracking-wide text-warning">En revisión</span>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted leading-relaxed mb-3">
              La confianza del agente es insuficiente para emitir dictamen definitivo.
            </p>
            <Link
              href="/plataforma/revision"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-warning hover:underline"
            >
              Ver cola de revisión <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {veredicto === null && (estadoAgente === "recibida" || estadoAgente === "en_analisis") && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-muted animate-spin" />
            <span className="text-sm font-medium text-muted">Análisis en curso…</span>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) return body;

  return <FadeUp delay={0.2}>{body}</FadeUp>;
}
