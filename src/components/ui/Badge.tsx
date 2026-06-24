import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeColor = "brand" | "ok" | "warning" | "danger" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorClasses: Record<BadgeColor, string> = {
  brand:   "bg-brand-soft text-brand-dark",
  ok:      "bg-ok/10 text-ok",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
  muted:   "bg-black/5 text-muted",
};

export function Badge({ color = "muted", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
