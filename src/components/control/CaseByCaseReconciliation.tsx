"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, Check, Loader2, Minus, X } from "lucide-react";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { cn, formatEUR, formatNum } from "@/lib/utils";
import { bpoCaso } from "@/data/index";
import type { CasoConciliacion, ConciliacionRecord } from "@/data/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CaseByCaseReconciliationProps {
  /** Records to step through one-by-one (a curated demo sample). */
  records: ConciliacionRecord[];
  totalDeclaraciones: number;
  onComplete?: () => void;
}

const estadoCopy: Record<string, { label: string; tone: "ok" | "danger" | "warning" }> = {
  ok: { label: "Sin incidencia", tone: "ok" },
  no_cargada: { label: "No cargada en SGA", tone: "danger" },
  importe_distinto: { label: "Importe distinto", tone: "danger" },
  duplicada: { label: "Duplicada", tone: "warning" },
  campos_distintos: { label: "Campos distintos", tone: "warning" },
};

function FieldRow({
  label,
  declarado,
  erp,
  calculado,
  mismatch,
}: {
  label: string;
  declarado: string;
  erp: string;
  calculado: string;
  mismatch?: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr_1fr_1fr] items-center gap-2 px-4 py-2 text-xs">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums text-ink">{declarado}</span>
      <span className={cn("tabular-nums", mismatch ? "font-semibold text-danger" : "text-ink-soft")}>{erp}</span>
      <span className="tabular-nums text-ink-soft">{calculado}</span>
    </div>
  );
}

function CaseDetail({ caso }: { caso: CasoConciliacion }) {
  const { record } = caso;
  const tone = estadoCopy[record.estado] ?? estadoCopy.ok;
  const importeMismatch = record.importeSgaEur !== record.importeOrigenEur;
  const erpImporte = caso.importeErpEur === null ? "— sin registro" : formatEUR(caso.importeErpEur);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-canvas">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink" title={record.empresa}>
            {record.empresa}
          </p>
          <p className="font-mono text-[11px] text-muted">
            ID {record.id} · {record.cif} · {caso.material}
          </p>
        </div>
        <ConfidenceBadge value={caso.confianza} />
      </div>

      <div className="grid grid-cols-[110px_1fr_1fr_1fr] gap-2 border-b border-line px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        <span>Campo</span>
        <span>Declarado</span>
        <span>ERP / SGA</span>
        <span>Calculado</span>
      </div>
      <div className="divide-y divide-line">
        <FieldRow
          label="Importe"
          declarado={formatEUR(caso.importeDeclaradoEur)}
          erp={erpImporte}
          calculado={formatEUR(caso.importeCalculadoEur)}
          mismatch={importeMismatch}
        />
        <FieldRow
          label="Peso"
          declarado={`${formatNum(caso.pesoKg)} kg`}
          erp={`${formatNum(caso.pesoKg)} kg`}
          calculado={`${formatNum(caso.pesoKg)} kg`}
        />
        <FieldRow
          label="Tarifa"
          declarado={`${caso.tarifaEurKg.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 4 })} €/kg`}
          erp={`${caso.tarifaEurKg.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 4 })} €/kg`}
          calculado={`${caso.tarifaEurKg.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 4 })} €/kg`}
        />
        <FieldRow
          label="Material"
          declarado={caso.material}
          erp={record.estado === "campos_distintos" ? "CIF erróneo" : caso.material}
          calculado={caso.material}
          mismatch={record.estado === "campos_distintos"}
        />
      </div>

      <div
        className={cn(
          "flex items-center gap-2 border-t border-line px-4 py-2.5 text-xs",
          tone.tone === "ok" && "text-ok",
          tone.tone === "danger" && "text-danger",
          tone.tone === "warning" && "text-warning"
        )}
      >
        {tone.tone === "ok" ? (
          <Check className="h-3.5 w-3.5 shrink-0" />
        ) : tone.tone === "warning" ? (
          <Minus className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <X className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="font-medium">{tone.label}</span>
        <span className="ml-auto truncate text-muted" title={record.detalle}>
          {record.detalle}
        </span>
      </div>
    </div>
  );
}

export function CaseByCaseReconciliation({
  records,
  totalDeclaraciones,
  onComplete,
}: CaseByCaseReconciliationProps) {
  const [index, setIndex] = useState(0);
  const done = index >= records.length;
  const calledDone = useRef(false);

  // Auto-advance through the cases. Discrepancies linger slightly longer.
  useEffect(() => {
    if (done) {
      if (!calledDone.current) {
        calledDone.current = true;
        onComplete?.();
      }
      return;
    }
    const current = records[index];
    const dwell = current.estado === "ok" ? 900 : 1500;
    const t = setTimeout(() => setIndex((i) => i + 1), dwell);
    return () => clearTimeout(t);
  }, [index, done, records, onComplete]);

  const shown = done ? records.length : index + 1;
  const okSoFar = records.slice(0, shown).filter((r) => r.estado === "ok").length;
  const incidSoFar = shown - okSoFar;
  const current = done ? records[records.length - 1] : records[index];
  const caso = bpoCaso(current);

  return (
    <article className="shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
        <span className="flex items-center gap-2 text-xs text-muted">
          <Bot className="h-3.5 w-3.5" />
          Conciliación automática · caso a caso
        </span>
        {done ? (
          <span className="text-[11px] font-semibold text-ok">
            {formatNum(totalDeclaraciones)} conciliados
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <Loader2 className="h-3 w-3 animate-spin text-brand" />
            Conciliando {shown} / {records.length} de la muestra
          </span>
        )}
      </div>

      {/* live progress strip */}
      <div className="flex items-center gap-4 border-b border-line bg-canvas px-5 py-2 text-[11px]">
        <span className="text-muted">
          Revisados <strong className="tabular-nums text-ink">{formatNum(shown)}</strong>
        </span>
        <span className="flex items-center gap-1 text-ok">
          <Check className="h-3 w-3" /> {okSoFar} OK
        </span>
        <span className="flex items-center gap-1 text-danger">
          <X className="h-3 w-3" /> {incidSoFar} incidencias
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {records.map((r, i) => (
            <span
              key={r.id}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i < shown ? (r.estado === "ok" ? "bg-ok" : "bg-danger") : "bg-line",
                !done && i === index && "ring-2 ring-brand/40"
              )}
            />
          ))}
        </span>
      </div>

      <div className="p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + (done ? "-done" : "")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <CaseDetail caso={caso} />
          </motion.div>
        </AnimatePresence>
      </div>

      {done && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 border-t border-line px-5 py-2.5 text-xs text-ink-soft"
        >
          El agente repite el mismo cruce campo a campo en los {formatNum(totalDeclaraciones)} registros del cierre.
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted" />
        </motion.p>
      )}
    </article>
  );
}
