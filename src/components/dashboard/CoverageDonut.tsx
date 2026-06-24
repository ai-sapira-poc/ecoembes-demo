"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Manual coverage: 1.6% by amount (€37.367 of €2.338.519)
const MANUAL_PCT = (37367 / 2338519) * 100; // ~1.598…

const agentData = [
  { name: "Agente IA", value: 100, color: "#00A13A" },
  { name: "Sin cobertura", value: 0, color: "#E6ECE8" },
];

const manualData = [
  { name: "Control manual", value: MANUAL_PCT, color: "#1F7A8C" },
  { name: "Sin cobertura", value: 100 - MANUAL_PCT, color: "#E6ECE8" },
];

function DonutRing({
  data,
  innerLabel,
  innerSub,
  caption,
  subcaption,
}: {
  data: { name: string; value: number; color: string }[];
  innerLabel: string;
  innerSub: string;
  caption: string;
  subcaption: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[148px] h-[148px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={66}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const n = typeof value === "number" ? value : 0;
                return `${n.toLocaleString("es-ES", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })} %`;
              }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #E6ECE8",
                boxShadow: "0 2px 8px rgba(20,32,26,0.06)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-semibold text-ink leading-none tabular-nums">{innerLabel}</span>
          <span className="text-[10px] text-muted mt-1 text-center leading-tight">{innerSub}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">{caption}</p>
        <p className="text-xs text-muted mt-0.5">{subcaption}</p>
      </div>
    </div>
  );
}

export function CoverageDonut({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-around gap-4 py-4">
        <DonutRing
          data={agentData}
          innerLabel="100 %"
          innerSub="por importe"
          caption="Agente IA"
          subcaption="437 / 437 declaraciones"
        />

        <div className="flex flex-col items-center gap-1 self-stretch justify-center">
          <div className="w-px flex-1 bg-line" />
          <span className="text-[10px] font-semibold text-muted uppercase tracking-[0.14em] py-1">vs</span>
          <div className="w-px flex-1 bg-line" />
        </div>

        <DonutRing
          data={manualData}
          innerLabel="1,6 %"
          innerSub="por importe"
          caption="Control manual"
          subcaption="5 / 437 declaraciones"
        />
      </div>

      <div className="mx-2 mt-1 mb-1 pt-4 border-t border-line">
        <p className="text-center text-xs text-muted leading-relaxed">
          El agente revisa el{" "}
          <span className="font-semibold text-brand">100 % del importe</span>
          {" "}· el muestreo manual alcanza solo el{" "}
          <span className="font-semibold text-ink">1,6 %</span>
        </p>
      </div>
    </div>
  );
}
