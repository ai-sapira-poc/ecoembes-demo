"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Pencil,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { formatEUR, formatPct, cn } from "@/lib/utils";
import type { RevisionItem } from "@/data/types";

type Resolucion = "aprobado" | "rechazado" | "solicitar_datos" | null;
type Decision = Exclude<Resolucion, null>;

interface RevisionTicketDetailProps {
  item: RevisionItem;
  resolucion: Resolucion;
  onResolucion: (value: Resolucion) => void;
  onBack?: () => void;
}

const DECISION_OPTIONS: { value: Decision; label: string; description: string }[] = [
  {
    value: "aprobado",
    label: "Confirmar",
    description: "Cerrar con la acción sugerida.",
  },
  {
    value: "rechazado",
    label: "Descartar",
    description: "El hallazgo está justificado.",
  },
  {
    value: "solicitar_datos",
    label: "Solicitar datos",
    description: "Pedir información adicional.",
  },
];

function origenLabel(origen: RevisionItem["origen"]) {
  return origen === "auditoria" ? "Auditoría" : "Control BPO";
}

function resolucionLabel(resolucion: Decision) {
  if (resolucion === "aprobado") return "Aprobado";
  if (resolucion === "rechazado") return "Rechazado";
  return "Datos solicitados";
}

export function RevisionTicketDetail({
  item,
  resolucion,
  onResolucion,
  onBack,
}: RevisionTicketDetailProps) {
  const resuelto = resolucion !== null;
  const [selectedDecision, setSelectedDecision] = useState<Decision>("aprobado");

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-xs text-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/20 lg:hidden"
          >
            ← Volver
          </button>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="font-mono text-[11px]" translate="no">
            {item.id}
          </span>
          <span aria-hidden>·</span>
          <span>{origenLabel(item.origen)}</span>
          <span aria-hidden>·</span>
          <span>{item.prioridad === "alta" ? "Prioridad alta" : "Prioridad media"}</span>
          <span aria-hidden>·</span>
          <span>Creado hace {item.creadoHace}</span>
          {resolucion === "aprobado" && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-semibold text-ok">
              <CheckCircle2 size={11} aria-hidden />
              Aprobado
            </span>
          )}
          {resolucion === "rechazado" && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-[11px] font-semibold text-danger">
              <XCircle size={11} aria-hidden />
              Rechazado
            </span>
          )}
          {resolucion === "solicitar_datos" && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-line px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
              <FileText size={11} aria-hidden />
              Datos solicitados
            </span>
          )}
        </div>

        <h2 className="mt-2 text-pretty text-base font-semibold leading-snug text-ink md:text-lg">
          {item.titulo}
        </h2>

        <section className="mt-4 overflow-hidden rounded-xl border border-brand/20 bg-brand-tint/45">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="p-3 md:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-dark">
                Decisión requerida
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-ink">
                {item.decisionRequerida}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.accionSugerida}</p>
            </div>
            <div className="grid grid-cols-3 border-t border-brand/15 bg-surface/65 lg:grid-cols-1 lg:border-l lg:border-t-0">
              <Metric label="Impacto" value={formatEUR(item.impactoEur)} />
              <Metric label="Confianza" value={formatPct(item.confianza * 100, 0)} />
              <Metric label="Estado" value={resuelto ? "Resuelto" : "Abierto"} />
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-4">
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                Qué detectó el agente
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.resumen}</p>
            </section>

            <section className="rounded-xl border border-line bg-surface p-3.5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                Ruta de decisión del agente
              </h3>
              <ol className="mt-3 space-y-0">
                {item.pasos.map((paso, index) => (
                  <li key={`${item.id}-${index}`} className="grid grid-cols-[1.25rem_1fr] gap-2.5">
                    <div className="relative flex justify-center">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-ink-soft" aria-hidden />
                      {index < item.pasos.length - 1 && (
                        <span className="absolute top-4 bottom-0 w-px bg-line" aria-hidden />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {paso.etapa}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{paso.detalle}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-3.5 w-3.5 text-muted" aria-hidden />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  Evidencia
                </h3>
              </div>
              <div className="mt-2.5 divide-y divide-line">
                {item.evidencia.map((evidencia) => (
                  <div key={`${item.id}-${evidencia.fuente}`} className="py-2.5">
                    <p className="text-xs font-medium text-ink">{evidencia.fuente}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{evidencia.detalle}</p>
                  </div>
                ))}
              </div>
            </section>

            <details className="group rounded-xl border border-line bg-canvas/50 p-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted focus-visible:ring-2 focus-visible:ring-brand/25">
                Razonamiento completo
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.razonamiento}</p>
            </details>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-surface px-4 py-2 md:px-5 md:py-3">
        <div className="flex flex-col gap-2">
          {resuelto && resolucion ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink-soft">
                Ticket marcado como <strong className="font-semibold text-ink">{resolucionLabel(resolucion)}</strong>.
              </p>
              <button
                type="button"
                onClick={() => onResolucion(null)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-ink/20"
              >
                <RotateCcw size={14} aria-hidden />
                Reabrir
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {DECISION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedDecision(option.value)}
                    className={cn(
                      "rounded-lg border p-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand/25 md:p-2.5",
                      selectedDecision === option.value
                        ? "border-brand/40 bg-brand-tint"
                        : "border-line hover:bg-canvas/70"
                    )}
                  >
                    <span className="block text-xs font-semibold leading-snug text-ink md:text-sm">
                      {option.label}
                    </span>
                    <span className="mt-1 hidden text-xs leading-relaxed text-muted md:block">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-canvas hover:text-ink-soft focus-visible:ring-2 focus-visible:ring-ink/20"
                >
                  <Pencil size={14} aria-hidden />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onResolucion(selectedDecision)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                  <CheckCircle2 size={14} aria-hidden />
                  Resolver ticket
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-line px-3 py-2.5 last:border-r-0 md:px-4 lg:border-b lg:border-r-0 lg:last:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}
