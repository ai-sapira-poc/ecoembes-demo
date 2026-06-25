"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileQuestion,
  GitBranch,
  RotateCcw,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { Badge } from "@/components/ui/Badge";
import { cn, formatEUR } from "@/lib/utils";
import type { RevisionItem } from "@/data/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Estado = "no_cargada" | "importe_distinto" | "duplicada" | "cif_erroneo";
type Resolucion = "resuelto" | "escalado" | null;

interface StateMeta {
  estado: Estado;
  label: string;
  icon: typeof FileQuestion;
  recordIds: string[];
}

// The narrative states, each mapped to its control revision ticket(s).
// The first three are the headline states; the CIF case is the 6th discrepancy
// so the queue total stays at 6 — matching the cierre grid and the BPO punchline.
const STATES: StateMeta[] = [
  { estado: "no_cargada", label: "No cargada", icon: FileQuestion, recordIds: ["045", "158"] },
  { estado: "importe_distinto", label: "Importe distinto", icon: Scale, recordIds: ["103", "430"] },
  { estado: "duplicada", label: "Duplicada", icon: Copy, recordIds: ["299"] },
  { estado: "cif_erroneo", label: "CIF erróneo", icon: AlertTriangle, recordIds: ["402"] },
];

interface HitlCaseFlowProps {
  /** All control-origin revision tickets (with registroId). */
  items: RevisionItem[];
}

export function HitlCaseFlow({ items }: HitlCaseFlowProps) {
  const byRecord = useMemo(() => {
    const map: Record<string, RevisionItem> = {};
    for (const it of items) if (it.registroId) map[it.registroId] = it;
    return map;
  }, [items]);

  // Flatten the queue in narrative order, one entry per state's records.
  const queue = useMemo(
    () =>
      STATES.flatMap((s) =>
        s.recordIds
          .map((rid) => byRecord[rid])
          .filter((x): x is RevisionItem => Boolean(x))
          .map((item) => ({ item, state: s }))
      ),
    [byRecord]
  );

  const [activeId, setActiveId] = useState(queue[0]?.item.id);
  const [resolutions, setResolutions] = useState<Record<string, Resolucion>>({});

  const active = queue.find((q) => q.item.id === activeId) ?? queue[0];
  const resolvedCount = Object.values(resolutions).filter((r) => r !== null).length;

  if (!active) return null;

  const { item, state } = active;
  const resolucion = resolutions[item.id] ?? null;
  const setResolucion = (r: Resolucion) =>
    setResolutions((prev) => ({ ...prev, [item.id]: r }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      {/* Queue header — the 3 states */}
      <article className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
          <span className="flex items-center gap-2 text-xs text-muted">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Cola de revisión humana · Control BPO
          </span>
          <span className="text-[11px] text-muted tabular-nums">
            {resolvedCount} / {queue.length} resueltos
          </span>
        </div>
        <div className="divide-y divide-line">
          {queue.map(({ item: it, state: st }) => {
            const Icon = st.icon;
            const res = resolutions[it.id] ?? null;
            const isActive = it.id === active.item.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setActiveId(it.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                  isActive ? "bg-brand-soft/50" : "hover:bg-canvas"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                    isActive ? "bg-brand text-white" : "bg-canvas text-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{st.label}</span>
                  <span className="block truncate font-mono text-[11px] text-muted">
                    {it.id} · ID {it.registroId}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-ink-soft">
                  {formatEUR(it.impactoEur)}
                </span>
                {res ? (
                  <Badge color={res === "resuelto" ? "ok" : "warning"}>
                    {res === "resuelto" ? "Resuelto" : "Escalado"}
                  </Badge>
                ) : (
                  <Badge color="warning">Pendiente</Badge>
                )}
              </button>
            );
          })}
        </div>
      </article>

      {/* Active case detail */}
      <AnimatePresence mode="wait">
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-dark">
                <state.icon className="h-3.5 w-3.5" />
                {state.label}
              </p>
              <h3 className="mt-1 text-pretty text-sm font-semibold leading-snug text-ink">
                {item.titulo}
              </h3>
            </div>
            <ConfidenceBadge value={item.confianza} className="mt-0.5 shrink-0" />
          </div>

          <div className="grid gap-px bg-line sm:grid-cols-2">
            {/* Evidence */}
            <div className="bg-surface p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                <ClipboardCheck className="h-3 w-3" /> Evidencia
              </p>
              <div className="divide-y divide-line">
                {item.evidencia.map((e, i) => (
                  <div key={i} className="py-2 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold text-ink">{e.fuente}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{e.detalle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent suggestion + decision path */}
            <div className="bg-surface p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                <GitBranch className="h-3 w-3" /> Acción sugerida por el agente
              </p>
              <p className="rounded-lg border border-brand/20 bg-brand-soft/40 px-3 py-2 text-xs leading-relaxed text-ink">
                {item.accionSugerida}
              </p>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-soft">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                {item.decisionRequerida}
              </p>
            </div>
          </div>

          {/* Human resolution */}
          <div className="border-t border-line bg-canvas px-5 py-3">
            {resolucion ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm text-ink-soft">
                  {resolucion === "resuelto" ? (
                    <CheckCircle2 className="h-4 w-4 text-ok" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-warning" />
                  )}
                  Caso{" "}
                  <strong className="font-semibold text-ink">
                    {resolucion === "resuelto" ? "resuelto por el revisor" : "escalado a IT / cliente"}
                  </strong>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setResolucion(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reabrir
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  El humano decide únicamente sobre los casos dudosos. Confianza {Math.round(item.confianza * 100)} %.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResolucion("escalado")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> Escalar
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolucion("resuelto")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolver
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.article>
      </AnimatePresence>

      <Link
        href="/plataforma/revision"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand/30 hover:text-brand"
      >
        <ClipboardCheck className="h-4 w-4 shrink-0" />
        Ver la cola completa en la plataforma
        <ArrowUpRight className="ml-auto h-4 w-4" />
      </Link>
    </div>
  );
}
