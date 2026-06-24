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
const AGENT_PCT = 100;

interface CoverageDonutProps {
  className?: string;
}

const agentData = [
  { name: "Agente IA", value: AGENT_PCT, color: "#6CB33F" },
  { name: "Sin cobertura", value: 0, color: "#E5E7EB" },
];

const manualData = [
  { name: "Control manual", value: MANUAL_PCT, color: "#1f7a8c" },
  { name: "Sin cobertura", value: 100 - MANUAL_PCT, color: "#E5E7EB" },
];

function DonutRing({
  data,
  label,
  sublabel,
  innerLabel,
  innerSub,
}: {
  data: { name: string; value: number; color: string }[];
  label: string;
  sublabel: string;
  innerLabel: string;
  innerSub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[160px] h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
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
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-ink leading-none">{innerLabel}</span>
          <span className="text-[10px] text-muted mt-0.5 text-center leading-tight">{innerSub}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-muted">{sublabel}</p>
      </div>
    </div>
  );
}

export function CoverageDonut({ className }: CoverageDonutProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-around gap-4 py-4">
        {/* Agent donut */}
        <DonutRing
          data={agentData}
          label="Agente IA"
          sublabel="437 / 437 declaraciones"
          innerLabel="100 %"
          innerSub="por importe"
        />

        {/* VS separator */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-16 bg-black/10" />
          <span className="text-xs font-bold text-muted uppercase tracking-wider">vs</span>
          <div className="w-px h-16 bg-black/10" />
        </div>

        {/* Manual donut */}
        <DonutRing
          data={manualData}
          label="Control manual"
          sublabel="5 / 437 declaraciones"
          innerLabel="1,6 %"
          innerSub="por importe"
        />
      </div>

      <p className="text-center text-xs text-muted pb-2 px-4">
        El agente revisa el <span className="font-semibold text-brand">100 %</span> de las declaraciones ·
        el muestreo manual alcanza solo el <span className="font-semibold">1,6 % del importe</span>
      </p>
    </div>
  );
}
