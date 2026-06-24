"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EstadoBadge } from "@/components/auditoria/EstadoBadge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { formatEUR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Declaracion, EmailMensaje } from "@/data/types";

interface LogEntry {
  id: string;
  fecha: string;
  label: string;
  detail?: string;
}

function formatLogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function offsetDate(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildExpedienteLog(item: Declaracion): LogEntry[] {
  const entries: LogEntry[] = [];
  const corr = item.correspondencia ?? [];

  entries.push({
    id: `${item.id}-recv`,
    fecha: item.fechaRecepcion,
    label: "Declaración recibida",
    detail: [
      item.canal,
      item.importeDaeEur != null ? formatEUR(item.importeDaeEur) : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  if (item.estadoAgente && item.estadoAgente !== "recibida") {
    entries.push({
      id: `${item.id}-analysis`,
      fecha: offsetDate(item.fechaRecepcion, 1),
      label: "Análisis monográfico completado",
      detail:
        item.hallazgos.length > 0
          ? `${item.hallazgos.length} hallazgo${item.hallazgos.length !== 1 ? "s" : ""} detectado${item.hallazgos.length !== 1 ? "s" : ""}`
          : "Sin incidencias",
    });
  }

  for (const hallazgo of item.hallazgos) {
    entries.push({
      id: hallazgo.id,
      fecha: offsetDate(item.fechaRecepcion, 1),
      label: hallazgo.tipo,
      detail: hallazgo.lineaId
        ? `${hallazgo.lineaId} · ${formatEUR(hallazgo.impactoEur)}`
        : formatEUR(hallazgo.impactoEur),
    });
  }

  for (const msg of corr) {
    entries.push(correspondenciaToLog(msg));
  }

  if (item.veredicto === "apto" || item.veredicto === "no_apto") {
    const verdictDate =
      corr.length > 0
        ? corr[corr.length - 1].fecha
        : offsetDate(item.fechaRecepcion, 2);
    const diff = item.cuotaCalculadaEur - item.cuotaDeclaradaEur;
    entries.push({
      id: `${item.id}-verdict`,
      fecha: verdictDate,
      label: `Dictamen · ${item.veredicto === "apto" ? "Apto" : "No apto"}`,
      detail:
        Math.abs(diff) > 0
          ? `Diferencia ${formatEUR(diff)} · confianza ${Math.round(item.confianza * 100)}%`
          : `Confianza ${Math.round(item.confianza * 100)}%`,
    });

    if (item.veredicto === "no_apto") {
      entries.push({
        id: `${item.id}-archive`,
        fecha: verdictDate,
        label: "Expediente archivado",
        detail: "Hilo de correo y documentación adjunta registrados",
      });
    }
  }

  if (item.estadoAgente === "en_revision") {
    entries.push({
      id: `${item.id}-escalation`,
      fecha: offsetDate(item.fechaRecepcion, 5),
      label: "Escalado a revisión humana",
      detail: `Confianza ${Math.round(item.confianza * 100)}% · por debajo del umbral autónomo`,
    });
  }

  if (item.estadoAgente === "en_analisis") {
    entries.push({
      id: `${item.id}-progress`,
      fecha: offsetDate(item.fechaRecepcion, 2),
      label: "Análisis en curso",
      detail: "Monográfico y cruce de ventas pendiente de cierre",
    });
  }

  if (
    item.veredicto === null &&
    (item.estadoAgente === "consulta_enviada" || item.estadoAgente === "respuesta_recibida")
  ) {
    entries.push({
      id: `${item.id}-pending`,
      fecha: corr.length > 0 ? corr[corr.length - 1].fecha : offsetDate(item.fechaRecepcion, 3),
      label: "Dictamen pendiente",
      detail:
        item.consultasAbiertas && item.consultasAbiertas > 0
          ? `${item.consultasAbiertas} consulta abierta`
          : "Respuesta recibida · pendiente de resolución",
    });
  }

  return entries.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
}

function correspondenciaToLog(msg: EmailMensaje): LogEntry {
  const isOutbound = msg.de === "agente";
  return {
    id: msg.id,
    fecha: msg.fecha,
    label: isOutbound ? "Salida · consulta al cliente" : "Entrada · respuesta del cliente",
    detail: msg.asunto,
  };
}

function ExpedienteResumen({ item }: { item: Declaracion }) {
  const diff = item.cuotaCalculadaEur - item.cuotaDeclaradaEur;
  const badgeEstado =
    item.veredicto === "apto"
      ? "apto"
      : item.veredicto === "no_apto"
        ? "no_apto"
        : item.estadoAgente ?? "recibida";

  return (
    <div className="space-y-3 rounded-lg border border-line bg-canvas/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Resumen
        </span>
        <div className="flex items-center gap-2">
          <EstadoBadge estado={badgeEstado} />
          <ConfidenceBadge value={item.confianza} />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 border-t border-line pt-3 text-xs">
        <div>
          <dt className="text-muted">Declarada</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-ink">
            {formatEUR(item.cuotaDeclaradaEur)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Calculada</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-ink">
            {formatEUR(item.cuotaCalculadaEur)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Diferencia</dt>
          <dd
            className={cn(
              "mt-0.5 font-semibold tabular-nums",
              Math.abs(diff) < 0.01
                ? "text-muted"
                : diff < 0
                  ? "text-ink"
                  : "text-ink-soft"
            )}
          >
            {diff > 0 ? "+" : ""}
            {formatEUR(diff)}
          </dd>
        </div>
      </dl>

      {item.dictamen && (
        <p className="border-t border-line pt-3 text-sm leading-relaxed text-ink-soft text-pretty">
          {item.dictamen}
        </p>
      )}

      {item.estadoAgente === "en_revision" && (
        <Link
          href="/plataforma/revision"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-brand"
        >
          Ver cola de revisión
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function RegistroActividad({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Registro de actividad
      </p>
      <ol className="mt-3 space-y-0">
        {entries.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
            <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted/50" aria-hidden />
              {index < entries.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-line" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1 -mt-0.5">
              <time className="text-[11px] tabular-nums text-muted">
                {formatLogDate(entry.fecha)}
              </time>
              <p className="text-sm text-ink">{entry.label}</p>
              {entry.detail && (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft text-pretty">
                  {entry.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export interface ExpedienteExpandidoProps {
  item: Declaracion;
}

export function ExpedienteExpandido({ item }: ExpedienteExpandidoProps) {
  const log = buildExpedienteLog(item);

  return (
    <div className="space-y-3">
      <ExpedienteResumen item={item} />
      <RegistroActividad entries={log} />
    </div>
  );
}
