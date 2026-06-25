import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

export type StatusColor = "brand" | "ok" | "warning" | "danger" | "info" | "muted";

const dotClass: Record<StatusColor, string> = {
  brand:   "bg-brand",
  ok:      "bg-ok",
  warning: "bg-warning",
  danger:  "bg-danger",
  info:    "bg-info",
  muted:   "bg-muted",
};

interface StatusDotProps {
  color: StatusColor;
  label: string;
  /**
   * Reserve the filled pill for the one state that carries weight (a finding,
   * a discrepancy). Routine states stay quiet: a colored dot + plain label,
   * no background fill — so a table of statuses reads as one signal, not
   * confetti.
   */
  loud?: boolean;
  className?: string;
}

export function StatusDot({ color, label, loud, className }: StatusDotProps) {
  const dot = (
    <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", dotClass[color])} />
  );

  if (loud) {
    return (
      <Badge color={color} className={cn("inline-flex items-center gap-1.5", className)}>
        {dot}
        {label}
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink-soft",
        className
      )}
    >
      {dot}
      {label}
    </span>
  );
}
