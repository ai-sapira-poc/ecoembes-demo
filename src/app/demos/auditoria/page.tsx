"use client";

import React, { useEffect, useState } from "react";
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
import {
  Inbox,
  CalendarDays,
  Building2,
  Hash,
  CreditCard,
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

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 Visual — Intake card + pipeline at "recibida"
// ─────────────────────────────────────────────────────────────────────────────
function IntakeVisual() {
  return (
    <FadeUp>
      <div className="space-y-4">
        {/* Pipeline tracker */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-4">
            Estado del agente
          </p>
          <EstadoPipeline estadoAgente="recibida" />
        </div>

        {/* Declaration intake card */}
        <div className="rounded-xl border border-line bg-surface shadow-[0_2px_20px_-6px_rgba(20,32,26,0.1)] overflow-hidden">
          {/* Email-like header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-line bg-canvas">
            <Inbox className="w-4 h-4 text-brand flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">
                Nueva declaración SIG recibida — {dec.empresa}
              </p>
              <p className="text-[11px] text-muted">
                {dec.canal} ·{" "}
                {new Date(dec.fechaRecepcion).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand-dark flex-shrink-0">
              Nueva
            </span>
          </div>

          {/* Metadata grid */}
          <div className="p-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">
                  Empresa
                </p>
                <p className="text-sm text-ink font-medium mt-0.5">{dec.empresa}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Hash className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">
                  CIF
                </p>
                <p className="text-sm font-mono text-ink mt-0.5">{dec.cif}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CalendarDays className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">
                  Período
                </p>
                <p className="text-sm text-ink mt-0.5">
                  Período {dec.periodo} · {dec.ejercicio}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">
                  Importe DAE
                </p>
                <p className="text-sm font-semibold text-ink tabular-nums mt-0.5">
                  {formatEUR(dec.importeDaeEur ?? dec.cuotaDeclaradaEur)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">
                  Sector
                </p>
                <p className="text-sm text-ink mt-0.5">{dec.sector}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Inbox className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">
                  Canal
                </p>
                <p className="text-sm text-ink mt-0.5">{dec.canal}</p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-4">
            <div className="rounded-lg bg-brand-soft px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-brand animate-spin flex-shrink-0" />
              <p className="text-sm text-brand-dark font-medium">
                El agente ha recibido la declaración e inicia el análisis automático…
              </p>
            </div>
          </div>
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

function AnalisisVisual() {
  const [phase, setPhase] = useState<"skeleton" | "ready">("skeleton");

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-5">
      {/* Pipeline */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-4">
          Estado del agente
        </p>
        <EstadoPipeline estadoAgente="en_analisis" />
      </div>

      {/* Formatos breakdown with skeleton */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">
            Formatos y componentes declarados
          </p>
          {phase === "skeleton" ? (
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Extrayendo formatos…
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-ok font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {dec.formatos?.length ?? 0} formatos,{" "}
              {dec.formatos?.reduce((a, f) => a + f.componentes.length, 0) ?? 0}{" "}
              componentes
            </span>
          )}
        </div>
        <div className="p-5">
          {phase === "skeleton" ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <FormatosBreakdown
              formatos={dec.formatos ?? []}
              flaggedComponenteIds={["005-F2-C1"]}
            />
          )}
        </div>
      </div>

      {/* Validation checklist — only once formatos are revealed */}
      {phase === "ready" && (
        <FadeUp delay={0.15}>
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <div className="px-5 py-3.5 border-b border-line">
              <p className="text-sm font-semibold text-ink">
                Validaciones automáticas — monográfico
              </p>
              <p className="text-xs text-muted mt-0.5">
                {dec.empresa} · Ejercicio {dec.ejercicio}
              </p>
            </div>
            <ul className="divide-y divide-line">
              {validaciones005.map((v, i) => (
                <li key={i} className="flex items-start gap-4 px-5 py-3.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {v.status === "ok" && (
                      <CheckCircle2 className="w-4 h-4 text-ok" />
                    )}
                    {v.status === "flag" && (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    {v.status === "pending" && (
                      <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        v.status === "flag" ? "text-warning" : "text-ink"
                      }`}
                    >
                      {v.label}
                    </p>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed text-pretty">
                      {v.detalle}
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    {v.status === "ok" && (
                      <span className="text-[11px] bg-ok-soft text-ok font-semibold px-2 py-0.5 rounded-full">
                        OK
                      </span>
                    )}
                    {v.status === "flag" && (
                      <span className="text-[11px] bg-warning-soft text-warning font-semibold px-2 py-0.5 rounded-full">
                        Alerta
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t border-warning/20 bg-warning-soft flex items-center gap-2">
              <XCircle className="w-4 h-4 text-warning flex-shrink-0" />
              <p className="text-xs text-warning font-medium">
                2 alertas detectadas — el agente abre consulta formal con el cliente
              </p>
            </div>
          </div>
        </FadeUp>
      )}
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
        {/* Pipeline at "consulta enviada" */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-4">
            Estado del agente
          </p>
          <EstadoPipeline estadoAgente="consulta_enviada" />
        </div>

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
      {/* Pipeline at "respuesta recibida" */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-4">
          Estado del agente
        </p>
        <EstadoPipeline estadoAgente="respuesta_recibida" />
      </div>

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
      {/* Pipeline at terminal "no_apto" */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-4">
          Estado del agente
        </p>
        <EstadoPipeline estadoAgente="no_apto" />
      </div>

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
          <strong className="text-ink">{dec.empresa}</strong> presenta su
          declaración SIG del período {dec.periodo} a través de la{" "}
          <em>{dec.canal}</em>.
        </p>
        <p>
          En el proceso tradicional, esta declaración entraría en una bandeja de
          entrada compartida y esperaría turno para una revisión manual — días,
          a veces semanas.
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
