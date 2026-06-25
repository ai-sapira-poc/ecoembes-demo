"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StepLayout, type Step } from "@/components/layout/StepLayout";
import { FormatosBreakdown } from "@/components/auditoria/FormatosBreakdown";
import { ConversationLog } from "@/components/auditoria/ConversationLog";
import { EstadoBadge } from "@/components/auditoria/EstadoBadge";
import { ExpedienteExpandido } from "@/components/auditoria/ExpedienteExpandido";
import { FindingsPanel, type FindingDecision } from "@/components/auditoria/FindingsPanel";
import { AnalisisChecks } from "@/components/auditoria/AnalisisChecks";
import { ClientPortalFull } from "@/components/auditoria/ClientPortalFull";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/Reveal";
import {
  declaraciones,
  formatEUR,
  analisisChecks005,
  impactoAnalisis005,
  chatPortal005,
  agenteCaso005,
} from "@/data/index";
import { cn } from "@/lib/utils";
import type { Declaracion, EstadoAgente } from "@/data/types";
import {
  Mail,
  FileSpreadsheet,
  LayoutDashboard,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  Link2,
  Send,
  Hash,
  Building2,
  Layers,
  Calendar,
  Radio,
} from "lucide-react";

// DEC-005 — Higiene Natura Iberia S.A.
// veredicto: "no_apto" · estadoAgente: "no_apto"
// 3-message correspondencia thread · tarifa error hallazgo
const dec = declaraciones.find((d) => d.id === "DEC-005")!;

const fechaLarga = new Date(dec.fechaRecepcion).toLocaleDateString("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Fecha de emisión del requerimiento de subsanación (portal del declarante).
const fechaRequerimiento = new Date("2025-04-15").toLocaleDateString("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 Visual — Platform submission + agent fetch animation
// ─────────────────────────────────────────────────────────────────────────────
function PlatformSubmissionCard() {
  return (
    <>
      <div className="px-5 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Presentación registrada
        </p>
        <p className="mt-1 text-sm font-semibold text-ink">
          Declaración SIG · Período {dec.periodo} ({dec.ejercicio})
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="mx-5 mt-3 rounded-lg border border-line bg-canvas px-4 py-3"
      >
        <p className="text-sm font-semibold text-ink">{dec.empresa}</p>
        <p className="mt-0.5 text-xs text-muted">
          <span className="font-mono">{dec.cif}</span> · {dec.sector}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        className="px-5 py-4"
      >
        <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3.5 py-2.5">
          <FileSpreadsheet className="h-5 w-5 shrink-0 text-ink-soft" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              DAE_{dec.empresa.split(" ")[0]}_P{dec.periodo}.xlsx
            </p>
            <p className="text-[11px] text-muted">
              Hoja SIG · importe declarado{" "}
              {formatEUR(dec.importeDaeEur ?? dec.cuotaDeclaradaEur)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-3.5 text-xs text-muted"
      >
        <span className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" />
          <span className="font-mono">{dec.cif}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {dec.sector}
        </span>
        {dec.periodo && (
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Período {dec.periodo}
          </span>
        )}
        {dec.canal && (
          <span className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            {dec.canal}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Recibida el {fechaLarga}
        </span>
      </motion.div>
    </>
  );
}

function IntakeVisual() {
  return (
    <FadeUp>
      <div className="mx-auto w-full max-w-4xl">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
            <span className="flex items-center gap-2 text-xs text-muted">
              <LayoutDashboard className="h-3.5 w-3.5" />
              {dec.canal ?? "PLATAFORMA 2.0"} · Declaraciones de envases
            </span>
            <span className="text-[11px] text-muted">{fechaLarga}</span>
          </div>

          <PlatformSubmissionCard />

          <div className="flex items-center gap-3 border-t border-line px-5 py-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft">
              <span
                className="h-2 w-2 rounded-full bg-brand"
                style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
              />
            </span>
            <p className="flex-1 text-sm text-ink-soft">
              El agente detecta la presentación, recupera la ficha y el SIG, e{" "}
              <strong className="font-semibold text-ink">inicia el análisis</strong>.
            </p>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
              En curso
            </span>
          </div>
        </Card>
      </div>
    </FadeUp>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 Visual — one sectioned surface: declaración + comprobaciones (the one
// "agent is working" beat of the Acto is the checks resolving line-by-line).
// ─────────────────────────────────────────────────────────────────────────────
function SectionOverline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>
  );
}

function AnalisisVisual() {
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    if (resolvedCount >= analisisChecks005.length) return;
    const t = setTimeout(() => setResolvedCount((n) => n + 1), 560);
    return () => clearTimeout(t);
  }, [resolvedCount]);

  const nFormatos = dec.formatos?.length ?? 0;
  const nComponentes = dec.formatos?.reduce((a, f) => a + f.componentes.length, 0) ?? 0;
  const allResolved = resolvedCount >= analisisChecks005.length;

  return (
    <FadeUp className="mx-auto w-full max-w-4xl">
      <Card className="overflow-hidden">
        {/* meta row */}
        <div className="flex items-start justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <p className="text-base font-bold text-ink">{dec.empresa}</p>
            <p className="mt-0.5 text-xs text-muted">
              <span className="font-mono">{dec.cif}</span> · {dec.sector} · Período {dec.periodo}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {dec.estadoAgente && <EstadoBadge estado={dec.estadoAgente} />}
            <p className="mt-1 text-xs tabular-nums text-muted">
              Confianza {Math.round(dec.confianza * 100)}%
            </p>
          </div>
        </div>

        {/* declaración */}
        <div className="border-t border-line px-6 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SectionOverline>Declaración · {nFormatos} formatos</SectionOverline>
            <span className="text-[11px] tabular-nums text-muted">{nComponentes} componentes</span>
          </div>
          <FormatosBreakdown formatos={dec.formatos ?? []} flaggedComponenteIds={["005-F2-C1"]} />
        </div>

        {/* comprobaciones */}
        <div className="border-t border-line pt-4">
          <div className="mb-1 flex items-center justify-between gap-3 px-6">
            <SectionOverline>Comprobaciones · {analisisChecks005.length}</SectionOverline>
            {!allResolved && (
              <span className="flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums text-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                {resolvedCount}/{analisisChecks005.length}
              </span>
            )}
          </div>
          <AnalisisChecks checks={analisisChecks005} resolvedCount={resolvedCount} />
        </div>
      </Card>
    </FadeUp>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 Visual — Revisión y acción del agente (human-in-the-loop)
// Operator sees the analysis + suggested actions → "Enviar link" →
// white-wipe → cut to the CLIENT PORTAL (declaration + findings + chat).
// ─────────────────────────────────────────────────────────────────────────────
function OperatorAccionPanel({ onSend }: { onSend: () => void }) {
  return (
    <FadeUp className="mx-auto w-full max-w-xl shrink-0 space-y-5">
      {/* Context recap */}
      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-3 pb-3">
          <CardTitle>Expediente {dec.id}</CardTitle>
          {dec.estadoAgente && <EstadoBadge estado={dec.estadoAgente} />}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-muted">Empresa</dt>
              <dd className="mt-0.5 font-semibold text-ink">{dec.empresa}</dd>
            </div>
            <div>
              <dt className="text-muted">Hallazgo del análisis</dt>
              <dd className="mt-0.5 font-semibold text-warning">Tarifa Madera → PEAD</dd>
            </div>
            <div>
              <dt className="text-muted">Impacto estimado</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-ink">
                {formatEUR(impactoAnalisis005)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Confianza del agente</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-ink">
                {Math.round(dec.confianza * 100)}%
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Suggested actions */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Acciones sugeridas por el agente</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {/* Secondary: email */}
          <div className="flex items-start gap-3 rounded-lg border border-line bg-canvas px-3.5 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface ring-1 ring-line">
              <Mail className="h-4 w-4 text-ink-soft" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Enviar un email formal</p>
              <p className="mt-0.5 text-xs text-muted text-pretty">
                Consulta por correo con la discrepancia y la solicitud de subsanación.
              </p>
            </div>
            <span className="shrink-0 self-center rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-muted">
              Opción B
            </span>
          </div>

          {/* Primary: send portal link */}
          <div className="rounded-lg border border-brand/30 bg-brand-soft/40 px-3.5 py-3">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                <Link2 className="h-4 w-4 text-brand-dark" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Enviar un enlace al cliente</p>
                <p className="mt-0.5 text-xs text-ink-soft text-pretty">
                  El cliente entra a su portal, ve su declaración y los hallazgos, y{" "}
                  <strong className="font-semibold text-ink">chatea con su agente de caso</strong>{" "}
                  para resolverlo al momento.
                </p>
              </div>
            </div>
            <Button type="button" onClick={onSend} className="mt-3 w-full">
              <Send className="h-4 w-4" />
              Enviar enlace y abrir el caso
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeUp>
  );
}

// Declarante (cliente) que aparece en el hilo del portal.
const declarantePortal005 = "Carlos Ruiz · Higiene Natura Iberia";

function RevisionAccionVisual() {
  const [stage, setStage] = useState<"operator" | "wiping" | "portal">("operator");

  const handleSend = () => {
    setStage("wiping");
    setTimeout(() => setStage("portal"), 1400);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "portal" ? (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ClientPortalFull
              empresa={dec.empresa}
              declaracionId={dec.id}
              periodo={dec.periodo}
              ejercicio={dec.ejercicio}
              emitidoEl={fechaRequerimiento}
              cuotaDeclaradaEur={dec.cuotaDeclaradaEur}
              cuotaCalculadaEur={dec.cuotaCalculadaEur}
              hallazgos={dec.hallazgos}
              formatos={dec.formatos ?? []}
              flaggedComponenteIds={["005-F2-C1"]}
              mensajes={chatPortal005}
              agente={agenteCaso005}
              declarante={declarantePortal005}
              onClose={() => setStage("operator")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="operator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            <OperatorAccionPanel onSend={handleSend} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "wiping" && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, times: [0, 0.25, 0.7, 1], ease: "easeInOut" }}
            exit={{ opacity: 0 }}
          >
            <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-muted">
              <Link2 className="h-4 w-4" />
              Enviando enlace al cliente…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 Visual — Full thread + FindingsPanel
// ─────────────────────────────────────────────────────────────────────────────
function DialogoVisual() {
  const totalImpacto = dec.hallazgos.reduce((a, h) => a + h.impactoEur, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {/* Confirmed findings with € impact, surfaced ABOVE the conversation */}
      <FadeUp className="w-full shrink-0">
        <Card className="overflow-hidden">
          <CardHeader className="flex items-center justify-between gap-3 pb-3">
            <CardTitle>Hallazgos confirmados</CardTitle>
            <div className="shrink-0 text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted">Impacto total</p>
              <p className="text-base font-bold tabular-nums text-danger">
                {formatEUR(totalImpacto)}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <FindingsPanel hallazgos={dec.hallazgos} confirmed />
          </CardContent>
        </Card>
      </FadeUp>

      {/* Transcript of the portal exchange that resolved the case — same channel
          as Paso 3, rendered as a reviewable log for the auditor. */}
      <FadeUp delay={0.12} className="w-full shrink-0">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Registro de la conversación · portal
            </p>
            <span className="text-xs text-muted">{chatPortal005.length} mensajes · resuelto</span>
          </div>
          <ConversationLog mensajes={chatPortal005} />
        </Card>
      </FadeUp>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 Visual — Platform-style validation queue + hero verdict
// ─────────────────────────────────────────────────────────────────────────────
const QUEUE_SUMMARY_CHIPS: { estado: EstadoAgente; label: string }[] = [
  { estado: "apto", label: "Aptas" },
  { estado: "no_apto", label: "No aptas" },
  { estado: "en_revision", label: "En revisión" },
  { estado: "consulta_enviada", label: "Consulta enviada" },
  { estado: "respuesta_recibida", label: "Respuesta recibida" },
  { estado: "en_analisis", label: "En análisis" },
  { estado: "recibida", label: "Recibidas" },
];

/** A long slice of the workload — conveys real volume in the queue. */
const QUEUE_SHOWCASE_IDS = [
  "DEC-005",
  "DEC-016",
  "DEC-012",
  "DEC-013",
  "DEC-019",
  "DEC-006",
  "DEC-014",
  "DEC-020",
  "DEC-009",
  "DEC-007",
  "DEC-017",
  "DEC-001",
  "DEC-011",
  "DEC-015",
  "DEC-018",
] as const;

function countByEstado(items: Declaracion[]) {
  const counts: Partial<Record<EstadoAgente, number>> = {};
  for (const item of items) {
    if (item.estadoAgente) {
      counts[item.estadoAgente] = (counts[item.estadoAgente] ?? 0) + 1;
    }
  }
  return counts;
}

function QueueAccordionItem({
  item,
  expanded,
  onToggle,
}: {
  item: Declaracion;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className={cn("overflow-hidden transition-shadow", expanded && "shadow-sm")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-brand-tint/60"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start gap-2">
            <p className={cn("truncate text-sm font-semibold", expanded ? "text-ink" : "text-ink-soft")}>
              {item.empresa}
            </p>
            {item.consultasAbiertas != null && item.consultasAbiertas > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning">
                <MessageSquare className="h-3 w-3" />
                {item.consultasAbiertas}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted">
            <span className="font-mono">{item.cif}</span>
            <span>{item.sector}</span>
            {item.periodo != null && <span>Período {item.periodo}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="flex flex-col items-end gap-1.5">
            {item.estadoAgente && <EstadoBadge estado={item.estadoAgente} />}
            {item.importeDaeEur != null && (
              <span className="text-sm font-semibold tabular-nums text-ink">
                {formatEUR(item.importeDaeEur)}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-4 pb-4 pt-3">
              <ExpedienteExpandido item={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/** Human-in-the-loop verdict: approve/reject each finding → derived veredicto. */
function VeredictoHITL() {
  const [decisions, setDecisions] = useState<Record<string, FindingDecision>>(() =>
    Object.fromEntries(dec.hallazgos.map((h) => [h.id, "aprobado" as FindingDecision]))
  );

  const onDecide = (id: string, decision: FindingDecision) =>
    setDecisions((prev) => ({ ...prev, [id]: decision }));

  const aprobados = dec.hallazgos.filter((h) => decisions[h.id] === "aprobado");
  const impactoAprobado = aprobados.reduce((a, h) => a + h.impactoEur, 0);
  const veredicto = aprobados.length > 0 ? "no_apto" : "apto";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-3 pb-3">
        <CardTitle>Veredicto · revisión humana</CardTitle>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
            veredicto === "no_apto" ? "bg-danger-soft text-danger" : "bg-ok-soft text-ok"
          )}
        >
          {veredicto === "no_apto" ? "No apto" : "Apto"}
        </span>
      </CardHeader>

      <CardContent>
        <FindingsPanel hallazgos={dec.hallazgos} decisions={decisions} onDecide={onDecide} />
      </CardContent>

      <div className="flex items-center gap-2.5 border-t border-line bg-canvas/60 px-6 py-3">
        {veredicto === "no_apto" ? (
          <XCircle className="h-4 w-4 shrink-0 text-danger" />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" />
        )}
        <p className="text-xs leading-snug text-ink-soft">
          {veredicto === "no_apto" ? (
            <>
              {aprobados.length} hallazgo{aprobados.length !== 1 ? "s" : ""} aprobado
              {aprobados.length !== 1 ? "s" : ""} → declaración{" "}
              <strong className="font-semibold text-danger">NO APTA</strong> · impacto{" "}
              <strong className="font-semibold tabular-nums">{formatEUR(impactoAprobado)}</strong>
            </>
          ) : (
            <>
              Todos los hallazgos descartados → declaración{" "}
              <strong className="font-semibold text-ok">APTA</strong>
            </>
          )}
        </p>
      </div>
    </Card>
  );
}

function VeredictoVisual() {
  const counts = useMemo(() => countByEstado(declaraciones), []);
  const showcase = QUEUE_SHOWCASE_IDS.map((id) => declaraciones.find((d) => d.id === id)!);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {/* Human-in-the-loop verdict for the featured expediente */}
      <FadeUp className="shrink-0">
        <VeredictoHITL />
      </FadeUp>

      <FadeUp delay={0.1} className="shrink-0">
        <Card className="overflow-hidden">
          <CardHeader className="flex items-baseline justify-between gap-3 pb-3">
            <CardTitle>Cola de validación del período</CardTitle>
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {declaraciones.length} declaraciones · P56 · 2025
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUEUE_SUMMARY_CHIPS.map(({ estado, label }) => {
                const count = counts[estado] ?? 0;
                if (count === 0) return null;
                return (
                  <span
                    key={estado}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                  >
                    {label}
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-muted">
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </FadeUp>

      <FadeUp delay={0.12} className="shrink-0 space-y-2">
        {showcase.map((item) => (
          <QueueAccordionItem
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => toggleExpanded(item.id)}
          />
        ))}
      </FadeUp>

      <FadeUp delay={0.18} className="shrink-0">
        <Link
          href="/plataforma/auditoria"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand/30 hover:text-brand"
        >
          Abrir módulo Auditoría en la plataforma
          <ArrowRight className="h-4 w-4" />
        </Link>
      </FadeUp>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps definition
// ─────────────────────────────────────────────────────────────────────────────
const steps: Step[] = [
  {
    n: 1,
    nombre: "Presentación",
    titulo: "Subida en plataforma",
    explicacion: (
      <>
        <p className="text-sm text-ink-soft leading-relaxed">
          <span className="font-semibold text-ink">{dec.empresa}</span> presenta su declaración SIG
          del período {dec.periodo} en {dec.canal ?? "PLATAFORMA 2.0"}. En el proceso tradicional, la
          presentación queda en cola hasta que un auditor recoge el expediente manualmente.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          El agente detecta la nueva presentación al instante, recupera la ficha de la empresa, el
          adjunto y el histórico desde plataforma, y{" "}
          <span className="font-semibold text-ink">abre el expediente sin intervención humana</span>.
          El análisis empieza en el mismo minuto en que llega la declaración.
        </p>
      </>
    ),
    visual: <IntakeVisual />,
  },
  {
    n: 2,
    nombre: "Análisis",
    titulo: "El agente analiza",
    explicacion: (
      <>
        <p className="text-sm text-ink-soft leading-relaxed">
          El agente extrae todos los formatos y componentes del adjunto SIG, normaliza cada material
          contra el catálogo Ecoembes 2025 y ejecuta el{" "}
          <span className="font-semibold text-ink">monográfico de validación automática</span>: pesos,
          integridad del envase y cruce de tarifas por material.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          En este expediente detecta que la línea del gel ducha PEAD aplica tarifa de{" "}
          <span className="font-semibold text-ink">Madera</span> (0,049 €/kg) en lugar de la tarifa{" "}
          <span className="font-semibold text-ink">PEAD</span> vigente (0,389 €/kg). El agente actúa
          con el criterio de un auditor que conoce el reglamento — señala la discrepancia antes de
          escalar al cliente.
        </p>
      </>
    ),
    visual: <AnalisisVisual />,
  },
  {
    n: 3,
    nombre: "Revisión y acción",
    titulo: "Revisión y acción del agente",
    explicacion: (
      <>
        <p className="text-sm text-ink-soft leading-relaxed">
          El agente no actúa solo. Presenta el expediente al operador con las{" "}
          <span className="font-semibold text-ink">acciones sugeridas</span>: enviar un email formal
          o abrir el portal del cliente con un enlace directo.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          La vía recomendada es el portal: el cliente entra, ve su declaración y los hallazgos, y{" "}
          <span className="font-semibold text-ink">chatea con su agente de caso</span> para resolverlo
          en el momento. La duda se cierra con cercanía, no con un expediente frío.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Interactúa</p>
          <p className="mt-1 text-xs text-ink-soft">Pulsa «Enviar enlace y abrir el caso» para ver la transición al portal del cliente.</p>
        </div>
      </>
    ),
    visual: <RevisionAccionVisual />,
  },
  {
    n: 4,
    nombre: "Diálogo",
    titulo: "Diálogo y resolución",
    explicacion: (
      <>
        <p className="text-sm text-ink-soft leading-relaxed">
          En el portal, la empresa confirma un error de selección y lo resuelve en el chat con su{" "}
          <span className="font-semibold text-ink">agente de caso</span>. El agente registra la
          respuesta, re-evalúa la declaración y fija la resolución y el plazo de subsanación.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Toda la conversación queda en el expediente — sustituye llamadas sueltas y correos sin
          trazar. Los hallazgos quedan <span className="font-semibold text-ink">confirmados</span>{" "}
          antes de que el operador emita el veredicto.
        </p>
      </>
    ),
    visual: <DialogoVisual />,
  },
  {
    n: 5,
    nombre: "Validación",
    titulo: "Validación y veredicto",
    explicacion: (
      <>
        <p className="text-sm text-ink-soft leading-relaxed">
          El operador <span className="font-semibold text-ink">aprueba o descarta cada hallazgo</span>.
          El veredicto APTO / NO APTO se deriva de su decisión — no es automático. Aprobar un hallazgo
          lo incluye; descartarlo recalcula el impacto al momento.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          El agente ha procesado toda la carga del período: la mayoría de los expedientes cierran
          solos; el humano solo decide los casos dudosos. Una cola unificada — aptas, no aptas,
          consultas abiertas, todo en un mismo módulo.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Interactúa</p>
          <p className="mt-1 text-xs text-ink-soft">Aprueba o descarta cada hallazgo y observa cómo cambia el veredicto en tiempo real.</p>
        </div>
      </>
    ),
    visual: <VeredictoVisual />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AuditoriaActoPage() {
  return (
    <StepLayout
      steps={steps}
      actLabel="Acto 1 · Auditoría de Declaraciones SIG"
      actMeta={`${dec.empresa} · Período ${dec.periodo}`}
    />
  );
}
