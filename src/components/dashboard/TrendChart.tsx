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
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradImporte" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6CB33F" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6CB33F" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradDeclaraciones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f7a8c" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#1f7a8c" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "#6b7770" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="importe"
            orientation="left"
            tickFormatter={formatImporte}
            tick={{ fontSize: 10, fill: "#6b7770" }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <YAxis
            yAxisId="declaraciones"
            orientation="right"
            tick={{ fontSize: 10, fill: "#6b7770" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : 0;
              if (name === "importeEur") return [formatImporte(n), "Importe auditado"];
              if (name === "declaraciones") return [n.toLocaleString("es-ES"), "Declaraciones"];
              return [String(value), String(name)];
            }}
            labelFormatter={(label) => `Mes: ${label}`}
          />
          <Area
            yAxisId="importe"
            type="monotone"
            dataKey="importeEur"
            stroke="#6CB33F"
            strokeWidth={2}
            fill="url(#gradImporte)"
            dot={{ r: 3, fill: "#6CB33F", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Area
            yAxisId="declaraciones"
            type="monotone"
            dataKey="declaraciones"
            stroke="#1f7a8c"
            strokeWidth={2}
            fill="url(#gradDeclaraciones)"
            dot={{ r: 3, fill: "#1f7a8c", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 justify-center mt-2">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="inline-block w-3 h-0.5 bg-[#6CB33F] rounded" />
          Importe auditado
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="inline-block w-3 h-0.5 bg-[#1f7a8c] rounded" />
          Declaraciones
        </span>
      </div>
    </div>
  );
}
