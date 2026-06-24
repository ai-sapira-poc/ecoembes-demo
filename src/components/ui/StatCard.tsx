import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ComponentType<{ className?: string; size?: number }>;
  trend?: "up" | "down";
  /** Optional trend label shown next to the arrow (e.g. "+12%") */
  trendLabel?: string;
  valueTone?: "neutral" | "ok" | "danger" | "warning";
  className?: string;
}

const valueToneClass = {
  neutral: "text-ink",
  ok: "text-ok",
  danger: "text-danger",
  warning: "text-warning",
} as const;

const iconToneClass = {
  neutral: "bg-brand-soft text-brand-dark",
  ok: "bg-ok-soft text-ok",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
} as const;

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendLabel,
  valueTone = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-line p-5 flex flex-col gap-2.5",
        className
      )}
    >
      {/* Header row: label + optional icon */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted leading-none pt-0.5">
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
              iconToneClass[valueTone]
            )}
          >
            <Icon className="currentColor" size={16} />
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "text-2xl font-semibold tabular-nums leading-none",
            valueToneClass[valueTone]
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              trend === "up" ? "text-ok" : "text-danger"
            )}
          >
            {trend === "up" ? (
              <TrendingUp size={13} strokeWidth={2.2} />
            ) : (
              <TrendingDown size={13} strokeWidth={2.2} />
            )}
            {trendLabel && <span>{trendLabel}</span>}
          </span>
        )}
      </div>

      {/* Sub-label */}
      {sub && (
        <span className="text-xs text-muted leading-snug">{sub}</span>
      )}
    </div>
  );
}
