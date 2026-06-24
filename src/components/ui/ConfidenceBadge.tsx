import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/utils";

interface ConfidenceBadgeProps {
  value: number; // 0–1
  className?: string;
}

export function ConfidenceBadge({ value, className }: ConfidenceBadgeProps) {
  const color =
    value >= 0.85
      ? "bg-ok/10 text-ok"
      : value >= 0.7
      ? "bg-warning/10 text-warning"
      : "bg-danger/10 text-danger";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        color,
        className
      )}
    >
      {formatPct(value * 100, 0)}
    </span>
  );
}
