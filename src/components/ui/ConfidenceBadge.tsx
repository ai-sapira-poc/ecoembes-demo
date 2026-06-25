import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/utils";

interface ConfidenceBadgeProps {
  value: number; // 0–1
  className?: string;
}

/**
 * Confidence is not an error state — high confidence shouldn't shout green and
 * mid confidence shouldn't glow amber. It reads as quiet tabular text; only a
 * genuinely low score (< 0.70, "send to a human") is colored.
 */
export function ConfidenceBadge({ value, className }: ConfidenceBadgeProps) {
  const low = value < 0.7;
  return (
    <span
      className={cn(
        "inline-flex items-center tabular-nums text-xs font-semibold leading-none",
        low ? "text-danger" : "text-muted",
        className
      )}
    >
      {formatPct(value * 100, 0)}
    </span>
  );
}
