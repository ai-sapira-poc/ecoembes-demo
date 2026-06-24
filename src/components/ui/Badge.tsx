import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeColor = "brand" | "ok" | "warning" | "danger" | "info" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorClasses: Record<BadgeColor, string> = {
  brand:   "bg-brand-soft text-brand-dark",
  ok:      "bg-ok-soft text-ok",
  warning: "bg-warning-soft text-warning",
  danger:  "bg-danger-soft text-danger",
  info:    "bg-info-soft text-info",
  muted:   "bg-line text-muted",
};

export function Badge({ color = "muted", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none",
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
