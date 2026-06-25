"use client";

import Link from "next/link";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ClipboardCheck, Layers } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import {
  StepLayout,
  StepAsideSection,
  StepAsideList,
  StepAsideMeta,
  type Step,
} from "@/components/layout/StepLayout";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { ErpSyncWorkspace } from "@/components/control/ErpSyncWorkspace";
import { CaseByCaseReconciliation } from "@/components/control/CaseByCaseReconciliation";
import { HitlCaseFlow } from "@/components/control/HitlCaseFlow";
import { CierreDashboard } from "@/components/control/CierreDashboard";
import {
  bpoMes,
  bpoErpMeta,
  BPO_IMPORTE_EN_RIESGO_EUR,
  BPO_CONFIANZA_BY_ID,
  revisionItems,
} from "@/data/index";
import type { ConciliacionRecord } from "@/data/types";
import { formatEUR, formatNum, formatPct } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Derived constants
// ─────────────────────────────────────────────────────────────────────────────
const DISCREPANCY_RECORDS = bpoMes.records.filter((r) => r.estado !== "ok");
const DISCREPANCY_COUNT = DISCREPANCY_RECORDS.length; // 6
const IMPORTE_EN_RIESGO = BPO_IMPORTE_EN_RIESGO_EUR; // 26_900
const CONFIDENCE_THRESHOLD = 0.8;
const AUTO_DICTAMEN_COUNT = bpoMes.totalDeclaraciones - DISCREPANCY_COUNT; // 431
const HITL_COUNT = DISCREPANCY_COUNT; // 6
const MANUAL_PCT = (bpoMes.importeMuestreadoEur / bpoMes.importeTotalEur) * 100; // 1,6 %

const CONTROL_HITL = revisionItems.filter(
  (item) => item.origen === "control" && item.registroId
);

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Per-record confidence: discrepancies use the seeded HITL band; OK rows are high.
const CONFIDENCIA_BY_ID: Record<string, number> = Object.fromEntries(
  bpoMes.records.map((r) => [
    r.id,
    BPO_CONFIANZA_BY_ID[r.id] ?? (r.estado === "ok" ? 0.97 : 0.7),
  ])
);

// Curated demo sample for the case-by-case walk + the table beneath it.
// Mix of OK and all six incidencias so the user sees each state reconcile.
const CASE_WALK_IDS = ["001", "045", "012", "103", "299", "402"];
const CASE_WALK_RECORDS = CASE_WALK_IDS.map(
  (id) => bpoMes.records.find((r) => r.id === id)!
);

const TABLE_IDS = ["001", "012", "088", "045", "103", "158", "299", "402", "430", "377"];
const TABLE_RECORDS: ConciliacionRecord[] = TABLE_IDS.map(
  (id) => bpoMes.records.find((r) => r.id === id)!
);

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — case-by-case reconciliation, then stats + table
// ─────────────────────────────────────────────────────────────────────────────
function ConciliacionVisual() {
  const [done, setDone] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      <CaseByCaseReconciliation
        records={CASE_WALK_RECORDS}
        totalDeclaraciones={bpoMes.totalDeclaraciones}
        onComplete={() => setDone(true)}
      />

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <StatCard label="Conciliados" value={formatNum(bpoMes.totalDeclaraciones)} icon={Layers} />
            <StatCard
              label="Sin incidencia"
              value={formatNum(AUTO_DICTAMEN_COUNT)}
              icon={CheckCircle}
              valueTone="ok"
            />
            <StatCard
              label="Incidencias"
              value={String(DISCREPANCY_COUNT)}
              icon={AlertTriangle}
              valueTone="danger"
            />
            <StatCard label="En cola HITL" value={String(HITL_COUNT)} icon={ClipboardCheck} valueTone="warning" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.1 }}
            className="shrink-0 space-y-3"
          >
            <ReconciliationTable
              variant="agent"
              records={TABLE_RECORDS}
              confianzaById={CONFIDENCIA_BY_ID}
              confidenceThreshold={CONFIDENCE_THRESHOLD}
              title="Registros conciliados"
            />
            <p className="text-center text-xs text-muted">
              Muestra de {TABLE_RECORDS.length} registros ·{" "}
              <Link href="/plataforma/control" className="font-medium text-brand hover:underline">
                {formatNum(bpoMes.totalDeclaraciones)} en plataforma
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps definition
// ─────────────────────────────────────────────────────────────────────────────
const steps: Step[] = [
  {
    n: 1,
    nombre: "Cierre mensual",
    titulo: "Sincronización con el ERP",
    explicacion: (
      <>
        <StepAsideSection title="Qué ocurre">
          <p>
            A final de mes, el agente sincroniza con el ERP (
            <strong className="text-ink">{bpoErpMeta.sistema}</strong>) e importa{" "}
            <strong className="text-ink">{formatNum(bpoMes.totalDeclaraciones)} declaraciones</strong>{" "}
            por un total de <strong className="text-ink">{formatEUR(bpoMes.importeTotalEur)}</strong>.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Con el agente">
          <StepAsideList
            items={[
              `Conector directo ${bpoErpMeta.conector} sobre ${bpoErpMeta.modulo}.`,
              "Importa el cierre completo, sin exportaciones manuales.",
              "Desglosa por material, sector y estado al instante.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Período: <span className="font-medium not-italic text-ink">{bpoErpMeta.periodo}</span> ·{" "}
          {bpoErpMeta.lotes} lotes importados
        </StepAsideMeta>
      </>
    ),
    visual: <ErpSyncWorkspace />,
  },
  {
    n: 2,
    nombre: "Conciliación",
    titulo: "Conciliación caso a caso",
    explicacion: (
      <>
        <StepAsideSection title="Qué hace el agente">
          <p>
            Concilia cada registro <strong className="text-ink">campo a campo</strong>: importe
            declarado vs ERP vs calculado, peso, tarifa y material — con una puntuación de confianza
            por caso.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Enrutamiento automático">
          <StepAsideList
            items={[
              `Sin incidencia y confianza ≥ ${CONFIDENCE_THRESHOLD * 100} % → cierre autónomo (${formatNum(AUTO_DICTAMEN_COUNT)} registros).`,
              `Cualquier discrepancia → cola de revisión humana (${HITL_COUNT} casos).`,
              "El mismo cruce se repite en los 437 registros del cierre.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          Umbral autónomo: {CONFIDENCE_THRESHOLD * 100} % · {HITL_COUNT} casos escalados
        </StepAsideMeta>
      </>
    ),
    visual: <ConciliacionVisual />,
  },
  {
    n: 3,
    nombre: "Revisión humana",
    titulo: "Revisión humana caso a caso",
    explicacion: (
      <>
        <StepAsideSection title="El humano sólo decide lo dudoso">
          <p>
            El agente resuelve {formatNum(AUTO_DICTAMEN_COUNT)} registros solo. Los{" "}
            <strong className="text-ink">{HITL_COUNT} casos dudosos</strong> llegan a un revisor con
            evidencia y acción sugerida.
          </p>
        </StepAsideSection>
        <StepAsideSection title="Tres estados, caso a caso">
          <StepAsideList
            items={[
              "No cargada — la declaración no tiene registro en SGA.",
              "Importe distinto — el importe en SGA no cuadra con el origen.",
              "Duplicada — doble carga con riesgo de doble cobro.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="Cada caso muestra">
          <StepAsideList
            items={[
              "La evidencia que el agente reunió.",
              "La acción que sugiere.",
              "Cómo lo resuelve o escala el humano.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          {HITL_COUNT} casos · confianza 55 – 78 % · {formatEUR(IMPORTE_EN_RIESGO)} en riesgo
        </StepAsideMeta>
      </>
    ),
    visual: <HitlCaseFlow items={CONTROL_HITL} />,
  },
  {
    n: 4,
    nombre: "Cierre",
    titulo: "Fase de cierre",
    explicacion: (
      <>
        <StepAsideSection title="Resultado del cierre">
          <p>
            El agente concilia el <strong className="text-ink">100 %</strong> del volumen, cierra{" "}
            <strong className="text-ink">{formatNum(AUTO_DICTAMEN_COUNT)} registros</strong> de forma
            autónoma y detecta <strong className="text-ink">{DISCREPANCY_COUNT} incidencias</strong> por{" "}
            <strong className="text-ink">{formatEUR(IMPORTE_EN_RIESGO)}</strong>.
          </p>
        </StepAsideSection>
        <StepAsideSection title="La historia de la cobertura">
          <StepAsideList
            items={[
              `Antes: ${formatPct(MANUAL_PCT)} verificado (${formatEUR(bpoMes.importeMuestreadoEur)}).`,
              "Ahora: 100 % conciliado, con evidencia por registro.",
              "Las 6 incidencias estaban todas fuera de la muestra manual.",
            ]}
          />
        </StepAsideSection>
        <StepAsideSection title="La plataforma real">
          <StepAsideList
            items={[
              "Informe de control en /plataforma/control.",
              "Cola HITL unificada en /plataforma/revision.",
              "Trazabilidad completa con firma digital.",
            ]}
          />
        </StepAsideSection>
        <StepAsideMeta>
          {bpoMes.periodo} · {DISCREPANCY_COUNT} incidencias · {formatEUR(IMPORTE_EN_RIESGO)} en riesgo
        </StepAsideMeta>
      </>
    ),
    visual: (
      <CierreDashboard
        periodo={bpoMes.periodo}
        totalDeclaraciones={bpoMes.totalDeclaraciones}
        importeTotalEur={bpoMes.importeTotalEur}
        discrepancias={DISCREPANCY_COUNT}
        importeEnRiesgoEur={IMPORTE_EN_RIESGO}
        cierreAutonomo={AUTO_DICTAMEN_COUNT}
        hitlCount={HITL_COUNT}
        manualPct={MANUAL_PCT}
        manualEur={bpoMes.importeMuestreadoEur}
      />
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ControlActoPage() {
  return (
    <StepLayout
      steps={steps}
      actLabel="Acto 2 · Control de Integridad BPO"
      actMeta={`${bpoMes.periodo} · ${formatNum(bpoMes.totalDeclaraciones)} declaraciones`}
    />
  );
}
