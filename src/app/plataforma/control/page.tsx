import { AlertTriangle } from "lucide-react";
import { CoverageMeter } from "@/components/control/CoverageMeter";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { EvidenceCard } from "@/components/control/EvidenceCard";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/mock/bpo";
import { formatEUR } from "@/lib/utils";

const DISCREPANCIAS = bpoMes.records.filter((r) => r.estado !== "ok").length;

const manualPct =
  (bpoMes.importeMuestreadoEur / bpoMes.importeTotalEur) * 100;

export default function ControlPage() {
  return (
    <Reveal className="space-y-8">
      {/* Page header */}
      <RevealItem>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Módulo
          </p>
          <h1 className="text-2xl font-semibold text-ink text-balance">
            Control de Integridad BPO
          </h1>
          <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
            Conciliación automática de declaraciones · {bpoMes.periodo}
          </p>
        </div>
      </RevealItem>

      {/* Coverage Meter — the hero visual */}
      <RevealItem>
        <CoverageMeter
          manualPct={manualPct}
          fullPct={100}
          manualEur={bpoMes.importeMuestreadoEur}
          totalEur={bpoMes.importeTotalEur}
          manualCount={bpoMes.muestreadas}
          totalCount={bpoMes.totalDeclaraciones}
        />
      </RevealItem>

      {/* Discrepancy callout */}
      <RevealItem>
        <div className="flex items-start gap-4 rounded-xl border border-danger/20 bg-danger/5 px-6 py-5">
          <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
            <AlertTriangle size={16} className="text-danger" />
          </span>
          <div>
            <p className="font-semibold text-danger text-sm leading-snug">
              {DISCREPANCIAS} discrepancias detectadas fuera de la muestra manual
              {" — "}{formatEUR(BPO_IMPORTE_EN_RIESGO_EUR)} en riesgo que el
              control actual no habría visto
            </p>
            <p className="text-xs text-danger/70 mt-1.5 leading-relaxed">
              Las {bpoMes.muestreadas} declaraciones inspeccionadas manualmente
              representan solo el{" "}
              {manualPct.toLocaleString("es-ES", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{" "}
              % del importe total. Las 6 anomalías se encontraban fuera de esa
              muestra y habrían pasado desapercibidas.
            </p>
          </div>
        </div>
      </RevealItem>

      {/* Reconciliation table */}
      <RevealItem>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-3">
            Registros conciliados
          </p>
          <ReconciliationTable records={bpoMes.records} />
        </div>
      </RevealItem>

      {/* Evidence card */}
      <RevealItem>
        <EvidenceCard
          mes={bpoMes}
          discrepancias={DISCREPANCIAS}
          importeEnRiesgoEur={BPO_IMPORTE_EN_RIESGO_EUR}
        />
      </RevealItem>
    </Reveal>
  );
}
