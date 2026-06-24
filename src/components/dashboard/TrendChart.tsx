"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/data/types";

interface TrendChartProps {
  data: TrendPoint[];
  className?: string;
}

function formatImporte(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} M€`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} k€`;
  }
  return `${value.toLocaleString("es-ES")} €`;
}

export function TrendChart({ data, className }: TrendChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={196}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradImporte" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A13A" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#00A13A" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradDeclaraciones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F7A8C" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#1F7A8C" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="#E6ECE8" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "#5D6B64" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="importe"
            orientation="left"
            tickFormatter={formatImporte}
            tick={{ fontSize: 10, fill: "#5D6B64" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <YAxis
            yAxisId="declaraciones"
            orientation="right"
            tick={{ fontSize: 10, fill: "#5D6B64" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #E6ECE8",
              boxShadow: "0 2px 12px rgba(20,32,26,0.07)",
              padding: "8px 12px",
            }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : 0;
              if (name === "importeEur") return [formatImporte(n), "Importe auditado"];
              if (name === "declaraciones") return [n.toLocaleString("es-ES"), "Declaraciones"];
              return [String(value), String(name)];
            }}
            labelFormatter={(label) => `${label} 2025`}
          />
          <Area
            yAxisId="importe"
            type="monotone"
            dataKey="importeEur"
            stroke="#00A13A"
            strokeWidth={2}
            fill="url(#gradImporte)"
            dot={false}
            activeDot={{ r: 4, fill: "#00A13A", strokeWidth: 0 }}
          />
          <Area
            yAxisId="declaraciones"
            type="monotone"
            dataKey="declaraciones"
            stroke="#1F7A8C"
            strokeWidth={2}
            fill="url(#gradDeclaraciones)"
            dot={false}
            activeDot={{ r: 4, fill: "#1F7A8C", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 justify-center mt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="inline-block w-3 h-[2px] bg-brand rounded-full" />
          Importe auditado
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="inline-block w-3 h-[2px] bg-accent rounded-full" />
          Declaraciones
        </span>
      </div>
    </div>
  );
}
