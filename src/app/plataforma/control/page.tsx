import { ShieldCheck, AlertTriangle, CheckCircle, FileSearch } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ReconciliationTable } from "@/components/control/ReconciliationTable";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { bpoMes, BPO_IMPORTE_EN_RIESGO_EUR } from "@/data/mock/bpo";
import { formatEUR, formatNum } from "@/lib/utils";

const DISCREPANCIAS = bpoMes.records.filter((r) => r.estado !== "ok").length;
const OK_COUNT = bpoMes.totalDeclaraciones - DISCREPANCIAS;

export default function ControlPage() {
  return (
    <Reveal className="space-y-5">
      <RevealItem>
        <div>
          <h1 className="text-xl font-bold text-ink">Control BPO</h1>
          <p className="mt-0.5 text-sm text-muted">
            {bpoMes.totalDeclaraciones} declaraciones · {bpoMes.periodo}
          </p>
        </div>
      </RevealItem>

      <RevealItem>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Declaraciones"
            value={formatNum(bpoMes.totalDeclaraciones)}
            icon={FileSearch}
          />
          <StatCard
            label="Registros OK"
            value={formatNum(OK_COUNT)}
            icon={CheckCircle}
            valueTone="ok"
          />
          <StatCard
            label="Discrepancias"
            value={formatNum(DISCREPANCIAS)}
            icon={AlertTriangle}
            valueTone={DISCREPANCIAS > 0 ? "danger" : "ok"}
          />
          <StatCard
            label="Importe en riesgo"
            value={formatEUR(BPO_IMPORTE_EN_RIESGO_EUR)}
            icon={ShieldCheck}
            valueTone={BPO_IMPORTE_EN_RIESGO_EUR > 0 ? "danger" : "ok"}
          />
        </div>
      </RevealItem>

      <RevealItem>
        <ReconciliationTable records={bpoMes.records} />
      </RevealItem>
    </Reveal>
  );
}
