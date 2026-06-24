import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    "bg-brand text-white",
    "hover:bg-brand-dark",
    "active:bg-brand-darker active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    "shadow-sm",
  ].join(" "),
  ghost: [
    "bg-transparent text-brand",
    "hover:bg-brand-soft",
    "active:bg-brand-soft/70 active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
  ].join(" "),
  outline: [
    "bg-transparent border border-brand text-brand",
    "hover:bg-brand-soft",
    "active:bg-brand-soft/70 active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm gap-1.5",
  md: "px-4.5 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg",
        "transition-all duration-150",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
