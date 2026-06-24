import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/utils";

interface ConfidenceBadgeProps {
  value: number; // 0–1
  className?: string;
}

export function ConfidenceBadge({ value, className }: ConfidenceBadgeProps) {
  const colorClass =
    value >= 0.85
      ? "bg-ok-soft text-ok"
      : value >= 0.7
      ? "bg-warning-soft text-warning"
      : "bg-danger-soft text-danger";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none",
        colorClass,
        className
      )}
    >
      {formatPct(value * 100, 0)}
    </span>
  );
}
