"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StepLayout, type Step } from "@/components/layout/StepLayout";
import { FormatosBreakdown } from "@/components/auditoria/FormatosBreakdown";
import { EstadoPipeline } from "@/components/auditoria/EstadoPipeline";
import { CorrespondenciaThread } from "@/components/auditoria/CorrespondenciaThread";
import { VeredictoCard } from "@/components/auditoria/VeredictoCard";
import { FindingsPanel } from "@/components/auditoria/FindingsPanel";
import { WhiteWipe } from "@/components/motion/WhiteWipe";
import { Skeleton } from "@/components/ui/Skeleton";
import { FadeUp, Reveal, RevealItem } from "@/components/motion/Reveal";
import { declaraciones, formatEUR } from "@/data/index";
import { cn } from "@/lib/utils";
import type { EstadoAgente } from "@/data/types";
import {
  Mail,
  Paperclip,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
  Send,
} from "lucide-react";

// DEC-005 — Higiene Natura Iberia S.A.
// veredicto: "no_apto" · estadoAgente: "no_apto"
// 3-message correspondencia thread · tarifa error hallazgo
const dec = declaraciones.find((d) => d.id === "DEC-005")!;

const senderDomain = "higienenatura.es";
const fechaLarga = new Date(dec.fechaRecepcion).toLocaleDateString("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const initials = dec.empresa
  .split(" ")
  .filter((w) => /[A-Za-zÁÉÍÓÚÑ]/.test(w))
  .slice(0, 2)
  .map((w) => w[0])
  .join("")
  .toUpperCase();

// Agent-state stepper — reused across Acto 1 steps (inline, comfortable density)
function EstadoBar({ estado }: { estado: EstadoAgente }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-3">
      <div className="flex items-center gap-4">
        <span className="shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Estado del agente
        </span>
        <div className="min-w-0 flex-1">
          <EstadoPipeline estadoAgente={estado} compact />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 Visual — Intake card + pipeline at "recibida"
// ─────────────────────────────────────────────────────────────────────────────
function IntakeVisual() {
  return (
    <FadeUp>
      <div className="mx-auto max-w-xl space-y-3">
        {/* The incoming email */}
        <article className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
            <span className="flex items-center gap-2 text-xs text-muted">
              <Mail className="h-3.5 w-3.5" />
              Bandeja de auditoría · declaraciones@ecoembes
            </span>
            <span className="text-[11px] text-muted">{fechaLarga}</span>
          </div>

          {/* Sender */}
          <div className="flex items-start gap-3 px-5 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas text-[11px] font-semibold text-ink-soft ring-1 ring-line">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                Dpto. de Cumplimiento · {dec.empresa}
              </p>
              <p className="truncate text-xs text-muted">
                cumplimiento@{senderDomain}
              </p>
            </div>
          </div>

          {/* Subject + body */}
          <div className="px-5 pt-3.5">
            <p className="text-sm font-semibold text-ink">
              Declaración Anual de Envases — Período {dec.periodo} ({dec.ejercicio})
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Buenos días. Adjuntamos la declaración SIG correspondiente al período{" "}
              {dec.periodo}. Quedamos a su disposición para cualquier aclaración.
            </p>
          </div>

          {/* Attachment */}
          <div className="px-5 pb-5 pt-4">
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
              <Paperclip className="h-4 w-4 shrink-0 text-muted" />
            </div>
          </div>
        </article>

        {/* Agent pickup — the only green accent on this step */}
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft">
            <span
              className="h-2 w-2 rounded-full bg-brand"
              style={{ animation: "soft-pulse 1.6s ease-in-out infinite" }}
            />
          </span>
          <p className="flex-1 text-sm text-ink-soft">
            El agente recibe el correo, extrae el adjunto e{" "}
            <strong className="font-semibold text-ink">inicia el análisis</strong>.
          </p>
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
            En curso
          </span>
        </div>
      </div>
    </FadeUp>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 Visual — Skeleton → FormatosBreakdown + validation checklist
// ─────────────────────────────────────────────────────────────────────────────
type ValidationStatus = "ok" | "flag" | "pending";

interface ValidationRow {
  label: string;
  detalle: string;
  status: ValidationStatus;
}

const validaciones005: ValidationRow[] = [
  {
    label: "Integridad del envase",
    detalle:
      "Componentes de envase presentes en todos los formatos declarados — estructura completa",
    status: "ok",
  },
  {
    label: "Coherencia de pesos",
    detalle:
      "kgTotales = unidades × pesoUnitarioG / 1.000 — todas las líneas cuadran",
    status: "ok",
  },
  {
    label: "Materiales y atributos",
    detalle:
      "Materiales reconocidos en el catálogo Ecoembes 2025 — sin referencias desconocidas",
    status: "ok",
  },
  {
    label: "Cruce de tarifas por material",
    detalle:
      "Línea 005-L4 (Gel Ducha PEAD 400ml): tarifa aplicada 0,049 €/kg (Madera) ≠ tarifa PEAD vigente 0,389 €/kg — diferencia 0,340 €/kg sobre 25.200 kg",
    status: "flag",
  },
  {
    label: "Análisis de infradeclaración",
    detalle:
      "Cuota resultante infra-calculada en €8.568 por el error de tarifa detectado — requiere corrección",
    status: "flag",
  },
];

/** Skeleton that mirrors the SIG table layout while the agent extracts. */
function ExtractionTableSkeleton() {
  const colWidths = [28, 88, 72, 56, 40, 48, 36, 52, 44, 40];
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex gap-2 border-b border-line bg-canvas px-3 py-2.5">
        {colWidths.map((w, i) => (
          <Skeleton key={i} className="h-2.5 shrink-0 rounded-sm" style={{ width: w }} />
        ))}
      </div>
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="flex gap-2 border-b border-line px-3 py-2 last:border-0"
        >
          {colWidths.map((w, i) => (
            <Skeleton
              key={i}
              className="h-3 shrink-0 rounded-sm"
              style={{ width: i === 1 ? w + 24 : w }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ValidationRow({
  v,
  resolved,
}: {
  v: ValidationRow;
  resolved: boolean;
}) {
  const status = resolved ? v.status : "pending";

  return (
    <li className="flex items-start gap-3 px-4 py-2">
      <div className="mt-0.5 flex-shrink-0">
        {status === "ok" && <CheckCircle2 className="w-3.5 h-3.5 text-ok" />}
        {status === "flag" && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
        {status === "pending" && (
          <Loader2 className="w-3.5 h-3.5 text-muted animate-spin" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs font-medium leading-snug ${
            status === "flag" ? "text-warning" : status === "pending" ? "text-muted" : "text-ink"
          }`}
        >
          {v.label}
        </p>
        {resolved && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted line-clamp-2 text-pretty">
            {v.detalle}
          </p>
        )}
      </div>
      <div className="ml-auto flex-shrink-0 self-center">
        {status === "ok" && (
          <span className="text-[11px] bg-ok-soft text-ok font-semibold px-2 py-0.5 rounded-full">
            OK
          </span>
        )}
        {status === "flag" && (
          <span className="text-[11px] bg-warning-soft text-warning font-semibold px-2 py-0.5 rounded-full">
            Alerta
          </span>
        )}
      </div>
    </li>
  );
}

function AnalisisVisual() {
  const [phase, setPhase] = useState<"extracting" | "table" | "validations">("extracting");
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    const toTable = setTimeout(() => setPhase("table"), 1500);
    const toValidations = setTimeout(() => setPhase("validations"), 2200);
    return () => {
      clearTimeout(toTable);
      clearTimeout(toValidations);
    };
  }, []);

  useEffect(() => {
    if (phase !== "validations") return;
    if (resolvedCount >= validaciones005.length) return;
    const t = setTimeout(() => setResolvedCount((n) => n + 1), 380);
    return () => clearTimeout(t);
  }, [phase, resolvedCount]);

  const nFormatos = dec.formatos?.length ?? 0;
  const nComponentes =
    dec.formatos?.reduce((a, f) => a + f.componentes.length, 0) ?? 0;
  const allResolved = resolvedCount >= validaciones005.length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <FadeUp className="shrink-0">
        <EstadoBar estado="en_analisis" />
      </FadeUp>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Extracted data — scrolls internally when validations share the viewport */}
        <FadeUp
          delay={0.06}
          className={cn(
            "flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            phase === "validations" ? "max-h-[10.5rem] shrink-0" : "flex-1"
          )}
        >
          <div className="shrink-0 border-b border-line px-4 py-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Declaración extraída</p>
              <p className="text-xs text-muted mt-0.5">
                Hoja SIG · {dec.empresa}
              </p>
            </div>
            <AnimatePresence mode="wait">
              {phase === "extracting" ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-xs text-muted"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Extrayendo del adjunto…
                </motion.span>
              ) : (
                <motion.span
                  key="ready"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-xs text-muted tabular-nums"
                >
                  {nFormatos} formatos · {nComponentes} componentes
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-2">
            <AnimatePresence mode="wait">
              {phase === "extracting" ? (
                <motion.div
                  key="skeleton"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ExtractionTableSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FormatosBreakdown
                    formatos={dec.formatos ?? []}
                    flaggedComponenteIds={["005-F2-C1"]}
                    compact={phase === "validations"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeUp>

        {/* Validation checklist — natural height; no internal scroll in normal viewports */}
        <AnimatePresence>
          {phase === "validations" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="shrink-0 border-b border-line px-4 py-2">
                <p className="text-sm font-semibold text-ink">
                  Validaciones automáticas — monográfico
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {dec.empresa} · Ejercicio {dec.ejercicio}
                </p>
              </div>
              <ul className="shrink-0 divide-y divide-line">
                {validaciones005.map((v, i) => (
                  <ValidationRow key={v.label} v={v} resolved={resolvedCount > i} />
                ))}
              </ul>
              <AnimatePresence>
                {allResolved && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 border-t border-warning/20 bg-warning-soft px-4 py-2">
                      <XCircle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                      <p className="text-[11px] font-medium text-warning leading-snug">
                        2 alertas detectadas — el agente abre consulta formal con el cliente
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 Visual — WhiteWipe beat + CorrespondenciaThread (first message only)
// ─────────────────────────────────────────────────────────────────────────────
function ConsultaVisual() {
  const [showWipe, setShowWipe] = useState(true);
  const primerMensaje = (dec.correspondencia ?? []).slice(0, 1);

  useEffect(() => {
    const t = setTimeout(() => setShowWipe(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showWipe && (
        <WhiteWipe label="Redactando consulta al cliente…" duration={1500} />
      )}

      <div className="space-y-5">
        <EstadoBar estado="consulta_enviada" />

        {/* Context callout */}
        <FadeUp delay={0.1}>
          <div className="rounded-xl border border-brand/20 bg-brand-tint px-5 py-3.5 flex items-start gap-3">
            <Send className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-dark">
                El agente actúa como auditor: no asume el error, pregunta.
              </p>
              <p className="text-sm text-ink-soft mt-1 text-pretty">
                Ante la discrepancia de tarifa, el agente redacta y envía un correo formal
                solicitando justificación — exactamente como haría un auditor humano.
              </p>
            </div>
          </div>
        </FadeUp>

        {/* First message only */}
        <FadeUp delay={0.25}>
          <CorrespondenciaThread
            mensajes={primerMensaje}
            empresaNombre={dec.empresa}
          />
        </FadeUp>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 Visual — Full thread + FindingsPanel
// ─────────────────────────────────────────────────────────────────────────────
function DialogoVisual() {
  const thread = dec.correspondencia ?? [];

  return (
    <div className="space-y-5">
      <EstadoBar estado="respuesta_recibida" />

      {/* Full thread */}
      <CorrespondenciaThread mensajes={thread} empresaNombre={dec.empresa} />

      {/* Findings */}
      <FadeUp delay={0.3}>
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-line">
            <p className="text-sm font-semibold text-ink">Hallazgos confirmados</p>
            <p className="text-xs text-muted mt-0.5">
              La respuesta del cliente confirma el error — el hallazgo queda validado
            </p>
          </div>
          <div className="p-5">
            <FindingsPanel hallazgos={dec.hallazgos} />
          </div>
        </div>
      </FadeUp>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 Visual — VeredictoCard + closing statement
// ─────────────────────────────────────────────────────────────────────────────
function VeredictoVisual() {
  return (
    <div className="space-y-5">
      <EstadoBar estado="no_apto" />

      {/* Verdict */}
      <VeredictoCard
        veredicto={dec.veredicto ?? null}
        estadoAgente={dec.estadoAgente ?? "no_apto"}
        consultasAbiertas={dec.consultasAbiertas ?? 0}
        cuotaDeclaradaEur={dec.cuotaDeclaradaEur}
        cuotaCalculadaEur={dec.cuotaCalculadaEur}
        confianza={dec.confianza}
        razonamiento={dec.dictamen}
      />

      {/* Consequence callout */}
      <Reveal>
        <RevealItem>
          <div className="rounded-xl border border-danger/20 bg-danger-soft px-5 py-4 space-y-2">
            <p className="text-sm font-semibold text-danger">
              Consecuencias del veredicto NO APTO
            </p>
            <ul className="space-y-1.5">
              {[
                `Cuota recalculada: ${formatEUR(dec.cuotaCalculadaEur)} (vs. declarada ${formatEUR(dec.cuotaDeclaradaEur)})`,
                `Diferencia: ${formatEUR(dec.cuotaCalculadaEur - dec.cuotaDeclaradaEur)} — requiere declaración complementaria`,
                "Plazo de subsanación: 30 de junio de 2025",
                "Evidencia archivada: hilo de correo + documento de confirmación adjunto",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                  <XCircle className="w-3.5 h-3.5 text-danger mt-0.5 flex-shrink-0" />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealItem>
        <RevealItem>
          <div className="rounded-lg border border-line bg-canvas px-4 py-2.5 flex items-center gap-2 text-xs text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-ok flex-shrink-0" />
            Documento marcado como{" "}
            <strong className="text-ink mx-0.5">NO APTO</strong> · evidencia
            archivada · trazabilidad completa
          </div>
        </RevealItem>
      </Reveal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps definition
// ─────────────────────────────────────────────────────────────────────────────
const steps: Step[] = [
  {
    n: 1,
    nombre: "Recepción",
    titulo: "La declaración llega",
    explicacion: (
      <>
        <p>
          <strong className="text-ink">{dec.empresa}</strong> envía su
          declaración SIG del período {dec.periodo} por correo, con la hoja DAE
          adjunta.
        </p>
        <p>
          En el proceso tradicional, ese correo entraría en una bandeja
          compartida y esperaría turno para una revisión manual — días, a veces
          semanas.
        </p>
        <p>
          Con el agente, la recepción desencadena inmediatamente el análisis
          automático. El proceso empieza en el momento en que llega.
        </p>
        <p className="text-xs text-muted italic">
          Importe declarado:{" "}
          <span className="tabular-nums font-medium">
            {formatEUR(dec.importeDaeEur ?? dec.cuotaDeclaradaEur)}
          </span>
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
        <p>
          El agente extrae los formatos y componentes de envase declarados, los
          normaliza contra el catálogo Ecoembes 2025 y ejecuta el{" "}
          <strong className="text-ink">monográfico de validación</strong>:
          integridad del envase, coherencia de pesos, materiales y atributos,
          infradeclaración.
        </p>
        <p>
          En segundos, detecta que la línea del envase gel ducha PEAD aplica una
          tarifa de Madera (
          <span className="font-mono text-xs">0,049 €/kg</span>) en lugar de la
          tarifa PEAD vigente (
          <span className="font-mono text-xs">0,389 €/kg</span>).
        </p>
        <p>
          El agente no solo valida números — cruza materiales, tarifas y
          benchmarks sectoriales, como un auditor que conoce el reglamento de
          memoria.
        </p>
      </>
    ),
    visual: <AnalisisVisual />,
  },
  {
    n: 3,
    nombre: "Consulta",
    titulo: "El agente escribe al cliente",
    explicacion: (
      <>
        <p>
          Ante la discrepancia de tarifa, el agente no la descarta ni la marca
          automáticamente como error.{" "}
          <strong className="text-ink">Actúa como un auditor:</strong> abre un
          expediente de consulta y redacta un correo formal al responsable de
          cumplimiento de la empresa.
        </p>
        <p>
          El mensaje es preciso: identifica la línea afectada, la tarifa
          detectada, la tarifa correcta y la magnitud del impacto. Solicita
          confirmación o justificación documental.
        </p>
        <p>
          Todo esto ocurre sin intervención humana, pero con la forma y el tono
          de una comunicación auditora profesional.
        </p>
      </>
    ),
    visual: <ConsultaVisual />,
  },
  {
    n: 4,
    nombre: "Diálogo",
    titulo: "Diálogo con el cliente",
    explicacion: (
      <>
        <p>
          El cliente responde: confirma que fue un error de selección en la
          plataforma. El agente registra la respuesta, actualiza el expediente y
          re-evalúa la declaración con la nueva información.
        </p>
        <p>
          El agente cierra el intercambio con un tercer mensaje que comunica la
          resolución — la declaración original se marcará como NO APTA y se
          establece el plazo de subsanación.
        </p>
        <p>
          Este diálogo estructurado reemplaza las llamadas telefónicas, los
          correos perdidos y la memoria de cada auditor.{" "}
          <strong className="text-ink">
            Todo queda registrado con trazabilidad completa.
          </strong>
        </p>
      </>
    ),
    visual: <DialogoVisual />,
  },
  {
    n: 5,
    nombre: "Veredicto",
    titulo: "Veredicto: NO APTO",
    explicacion: (
      <>
        <p>
          Con el hallazgo confirmado y el diálogo cerrado, el agente emite el{" "}
          <strong className="text-ink">veredicto definitivo: NO APTO.</strong>
        </p>
        <p>
          La cuota se recalcula con la tarifa correcta. La diferencia, el plazo
          de subsanación y toda la evidencia quedan archivados en el expediente.
        </p>
        <p>
          El auditor humano solo necesita revisar los casos en los que el agente
          escala por incertidumbre. En este caso, el agente lo resolvió solo —
          con rigor documental, sin ambigüedad.
        </p>
        <p className="text-xs text-muted italic">
          Confianza del agente:{" "}
          <strong className="text-ink">
            {Math.round(dec.confianza * 100)}%
          </strong>
        </p>
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
    <div className="min-h-screen">
      {/* Header kicker */}
      <div className="px-6 pt-4 pb-2 border-b border-line bg-surface flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark bg-brand-soft px-2.5 py-1 rounded-full">
          Acto 1
        </span>
        <h1 className="text-base font-semibold text-ink">
          Auditoría de Declaraciones SIG
        </h1>
        <span className="text-muted text-sm hidden md:inline">
          — {dec.empresa} · Período {dec.periodo}
        </span>
      </div>

      <StepLayout steps={steps} />
    </div>
  );
}
