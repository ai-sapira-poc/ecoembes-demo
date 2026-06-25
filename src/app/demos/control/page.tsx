"use client";

import Link from "next/link";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ClipboardCheck, Layers } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import {
  StepLayout,
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
        <p className="text-sm text-ink-soft leading-relaxed">
          A final de mes, el agente sincroniza con{" "}
          <span className="font-semibold text-ink">{bpoErpMeta.sistema}</span> vía{" "}
          {bpoErpMeta.conector} e importa{" "}
          <span className="font-semibold text-ink">{formatNum(bpoMes.totalDeclaraciones)} declaraciones</span>{" "}
          por un total de{" "}
          <span className="font-semibold text-ink">{formatEUR(bpoMes.importeTotalEur)}</span>.
          Sin exportaciones manuales, sin intervención del equipo.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          El cierre completo queda desglosado por material, sector y estado en el momento de la
          importación, listo para iniciar la conciliación caso a caso.
        </p>
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
        <p className="text-sm text-ink-soft leading-relaxed">
          El agente concilia cada registro{" "}
          <span className="font-semibold text-ink">campo a campo</span>: importe declarado frente
          al ERP frente al calculado, con peso, tarifa y material. Cada caso recibe una puntuación
          de confianza.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Sin incidencia y confianza ≥ {CONFIDENCE_THRESHOLD * 100} %: cierre autónomo —{" "}
          <span className="font-semibold text-ink">{formatNum(AUTO_DICTAMEN_COUNT)} registros</span>{" "}
          resueltos sin tocar. Cualquier discrepancia va directa a la cola de revisión humana.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Interactúa</p>
          <p className="mt-1 text-xs text-ink-soft">Observa cómo el agente recorre los registros uno a uno hasta completar el cierre.</p>
        </div>
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
        <p className="text-sm text-ink-soft leading-relaxed">
          El agente resuelve {formatNum(AUTO_DICTAMEN_COUNT)} registros por sí solo. Solo los{" "}
          <span className="font-semibold text-ink">{HITL_COUNT} casos con incidencia</span> llegan
          al revisor — cada uno con la evidencia que el agente reunió y la acción que sugiere.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Los estados posibles son: declaración no cargada en SGA, importe distinto al origen, o
          carga duplicada con riesgo de doble cobro. El revisor resuelve o escala cada caso con
          un clic — sin tener que reconstruir el contexto desde cero.
        </p>
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
        <p className="text-sm text-ink-soft leading-relaxed">
          El agente concilia el{" "}
          <span className="font-semibold text-ink">100 % del volumen</span>:{" "}
          {formatNum(AUTO_DICTAMEN_COUNT)} registros cerrados de forma autónoma,{" "}
          {DISCREPANCY_COUNT} incidencias detectadas por{" "}
          <span className="font-semibold text-ink">{formatEUR(IMPORTE_EN_RIESGO)}</span>. Antes
          solo se verificaba el {formatPct(MANUAL_PCT)} manualmente — y las{" "}
          {DISCREPANCY_COUNT} incidencias estaban todas fuera de esa muestra.
        </p>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          El informe de control queda disponible en plataforma con evidencia por registro y
          trazabilidad completa. El humano solo decide lo que el agente escaló.
        </p>
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
