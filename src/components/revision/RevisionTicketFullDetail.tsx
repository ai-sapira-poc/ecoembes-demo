"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { cn, formatEUR, formatPct } from "@/lib/utils";
import { revisionItems } from "@/data/index";
import { Badge } from "@/components/ui/Badge";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";

interface RevisionTicketFullDetailProps {
  id: string;
}

type Resolucion = "aprobado" | "rechazado" | "solicitar_datos" | null;
type Decision = Exclude<Resolucion, null>;
type BadgeColor = "ok" | "warning" | "danger" | "muted";

const DECISION_OPTIONS: { value: Decision; label: string; description: string }[] = [
  {
    value: "aprobado",
    label: "Confirmar acción",
    description: "Cerrar con la acción sugerida.",
  },
  {
    value: "rechazado",
    label: "Descartar hallazgo",
    description: "El hallazgo está justificado.",
  },
  {
    value: "solicitar_datos",
    label: "Solicitar datos",
    description: "Pedir información adicional al cliente.",
  },
];

function resolucionBadgeProps(resolucion: Resolucion): {
  color: BadgeColor;
  label: string;
  icon: typeof CheckCircle2 | typeof XCircle | typeof FileText | null;
} {
  if (resolucion === "aprobado") return { color: "ok", label: "Aprobado", icon: CheckCircle2 };
  if (resolucion === "rechazado") return { color: "danger", label: "Rechazado", icon: XCircle };
  if (resolucion === "solicitar_datos") {
    return { color: "muted", label: "Datos solicitados", icon: FileText };
  }
  return { color: "warning", label: "Pendiente", icon: null };
}

function origenLabel(origen: "auditoria" | "control") {
  return origen === "auditoria" ? "Auditoría" : "Control BPO";
}

export function RevisionTicketFullDetail({ id }: RevisionTicketFullDetailProps) {
  const router = useRouter();
  const item = revisionItems.find((t) => t.id === id);
  const [selectedDecision, setSelectedDecision] = useState<Decision>("aprobado");
  const [resolucion, setResolucionState] = useState<Resolucion>(item?.resolucion ?? null);

  if (!item) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        Ticket no encontrado.
      </div>
    );
  }

  const isResolved = resolucion !== null;

  const handleResolve = (value: Resolucion) => {
    item.resolucion = value;
    setResolucionState(value);
  };

  const badgeInfo = resolucionBadgeProps(resolucion);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/plataforma/revision")}
          className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/25"
        >
          <ArrowLeft size={16} aria-hidden />
          Volver a Revisión
        </button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-mono" translate="no">
            {item.id}
          </span>
          <span aria-hidden>·</span>
          <span>{origenLabel(item.origen)}</span>
          <span aria-hidden>·</span>
          <span>{item.prioridad === "alta" ? "Prioridad alta" : "Prioridad media"}</span>
          <span aria-hidden>·</span>
          <span>Hace {item.creadoHace}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={badgeInfo.color}>
            {BadgeIcon && <BadgeIcon className="mr-1 h-3 w-3" aria-hidden />}
            {badgeInfo.label}
          </Badge>
        </div>
        <h1 className="max-w-5xl text-balance text-2xl font-semibold leading-snug text-ink">
          {item.titulo}
        </h1>
      </div>

      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border-b border-line p-6 xl:border-b-0 xl:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">
              Decisión requerida
            </p>
            <p className="mt-3 max-w-4xl text-pretty text-base font-semibold leading-relaxed text-ink">
              {item.decisionRequerida}
            </p>
            <p className="mt-2 max-w-4xl text-pretty text-sm leading-relaxed text-ink-soft">
              {item.accionSugerida}
            </p>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-1">
            <Metric label="Impacto estimado" value={formatEUR(item.impactoEur)} />
            <Metric
              label="Confianza"
              value={
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{formatPct(item.confianza * 100, 0)}</span>
                  <ConfidenceBadge value={item.confianza} />
                </div>
              }
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <div className="mb-5 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted" aria-hidden />
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Evidencia
              </h2>
            </div>
            <div className="divide-y divide-line">
              {item.evidencia.map((evidencia, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-ink">{evidencia.fuente}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{evidencia.detalle}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Resumen del agente
            </h2>
            <p className="mt-3 max-w-4xl text-pretty text-sm leading-relaxed text-ink-soft">
              {item.resumen}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <details className="group rounded-xl border border-line bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl p-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25">
              Ruta de decisión del agente
              <ChevronDown
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="border-t border-line p-5 pt-4">
              <ol className="space-y-0">
                {item.pasos.map((paso, index) => (
                  <li key={`${item.id}-${index}`} className="grid grid-cols-[1.5rem_1fr] gap-3">
                    <div className="relative flex justify-center">
                      <span className="z-10 mt-1.5 h-2 w-2 rounded-full bg-ink-soft" aria-hidden />
                      {index < item.pasos.length - 1 && (
                        <span className="absolute top-4 bottom-0 w-px bg-line" aria-hidden />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {paso.etapa}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{paso.detalle}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-2 rounded-lg bg-canvas p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Razonamiento completo
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.razonamiento}</p>
              </div>
            </div>
          </details>
        </div>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5 md:p-6">
        {isResolved && resolucion ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft">
              Ticket marcado como{" "}
              <strong className="font-semibold text-ink">{badgeInfo.label}</strong>.
            </p>
            <button
              type="button"
              onClick={() => handleResolve(null)}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-ink/20"
            >
              <RotateCcw size={16} aria-hidden />
              Reabrir ticket
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Resolución
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {DECISION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedDecision(option.value)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand/25",
                      selectedDecision === option.value
                        ? "border-brand/40 bg-brand-soft"
                        : "border-line hover:bg-canvas"
                    )}
                  >
                    <span className="block text-sm font-semibold text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleResolve(selectedDecision)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand/30 lg:mb-0.5"
            >
              <CheckCircle2 size={16} aria-hidden />
              Confirmar resolución
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-r border-line p-5 last:border-r-0 xl:border-b xl:border-r-0 xl:last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <div className="mt-2 text-xl font-semibold text-ink">{value}</div>
    </div>
  );
}
