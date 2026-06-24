import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ComponentType<{ className?: string; size?: number }>;
  trend?: "up" | "down";
  className?: string;
}

export function StatCard({ label, value, sub, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-black/5 shadow-sm p-6 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-muted font-medium">{label}</span>
        {Icon && (
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center">
            <Icon className="text-brand" size={18} />
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-ink leading-none">{value}</span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium mb-0.5",
              trend === "up" ? "text-ok" : "text-danger"
            )}
          >
            {trend === "up" ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
          </span>
        )}
      </div>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}
