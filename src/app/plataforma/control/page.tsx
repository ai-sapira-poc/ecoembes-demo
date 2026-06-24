import { AlertTriangle } from "lucide-react";
import { CoverageMeter } from "@/components/control/CoverageMeter";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { EvidenceCard } from "@/components/control/EvidenceCard";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/mock/bpo";
import { formatEUR } from "@/lib/utils";

const DISCREPANCIAS = bpoMes.records.filter((r) => r.estado !== "ok").length;

const manualPct =
  (bpoMes.importeMuestreadoEur / bpoMes.importeTotalEur) * 100;

export default function ControlPage() {
  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-ink">
          Control de Integridad BPO
        </h1>
        <p className="text-sm text-muted mt-1">
          Conciliación automática de declaraciones · {bpoMes.periodo}
        </p>
      </div>

      {/* Hero: Coverage Meter */}
      <CoverageMeter
        manualPct={manualPct}
        fullPct={100}
        manualEur={bpoMes.importeMuestreadoEur}
        totalEur={bpoMes.importeTotalEur}
        manualCount={bpoMes.muestreadas}
        totalCount={bpoMes.totalDeclaraciones}
      />

      {/* Callout banner */}
      <div className="flex items-start gap-4 rounded-xl border border-danger/20 bg-danger/5 px-6 py-5">
        <span className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle size={18} className="text-danger" />
        </span>
        <div>
          <p className="font-semibold text-danger text-sm">
            {DISCREPANCIAS} discrepancias detectadas fuera de la muestra manual
            {" — "}{formatEUR(BPO_IMPORTE_EN_RIESGO_EUR)} en riesgo que el
            control actual no habría visto
          </p>
          <p className="text-xs text-danger/70 mt-1">
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

      {/* Reconciliation table */}
      <div>
        <h2 className="text-base font-semibold text-ink mb-3">
          Registros conciliados
        </h2>
        <ReconciliationTable records={bpoMes.records} />
      </div>

      {/* Evidence card */}
      <EvidenceCard
        mes={bpoMes}
        discrepancias={DISCREPANCIAS}
        importeEnRiesgoEur={BPO_IMPORTE_EN_RIESGO_EUR}
      />
    </div>
  );
}
