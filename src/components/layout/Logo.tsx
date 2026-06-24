import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark";
  /** "color" = official green-on-white JPG (use on light surfaces). "white" = transparent logo recolored white (use on dark/green surfaces). */
  tone?: "color" | "white";
  className?: string;
}

const SIZES = {
  full: { width: 132, height: 154 },
  mark: { width: 60, height: 70 },
} as const;

export function Logo({ variant = "full", tone = "color", className }: LogoProps) {
  const { width, height } = SIZES[variant];
  const src = tone === "white" ? "/brand/ecoembes-logo-transparent.png" : "/brand/ecoembes-logo.jpg";

  return (
    <Image
      src={src}
      alt="Ecoembes"
      width={width}
      height={height}
      priority
      className={cn(tone === "white" && "[filter:brightness(0)_invert(1)]", className)}
    />
  );
}
