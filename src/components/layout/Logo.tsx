import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official Ecoembes logo variants — see brand manual §2.2–2.14 */
export type LogoVariant =
  | "horizontal-claim" // Primary: symbol + logotype + claim (preferred)
  | "horizontal" // Compact header lockup without claim
  | "mark"; // Symbol only (favicon / tight spaces)

/** @deprecated Use `horizontal-claim` */
type LegacyVariant = "full";

interface LogoProps {
  variant?: LogoVariant | LegacyVariant | "mark";
  /** color = positive on white/light surfaces. white = official negative asset on dark/color backgrounds — never CSS-filtered. */
  tone?: "color" | "white";
  className?: string;
}

const ASSETS = {
  "horizontal-claim": {
    color: { src: "/brand/ecoembes-logo-color.png", width: 7676, height: 3024 },
    white: { src: "/brand/ecoembes-logo-white.png", width: 7676, height: 3024 },
    defaultWidth: 240,
  },
  horizontal: {
    color: { src: "/brand/ecoembes-logo-header.png", width: 211, height: 52 },
    white: { src: "/brand/ecoembes-logo-header.png", width: 211, height: 52 },
    defaultWidth: 132,
  },
  mark: {
    color: { src: "/brand/ecoembes-symbol.png", width: 40, height: 41 },
    white: { src: "/brand/ecoembes-symbol.png", width: 40, height: 41 },
    defaultWidth: 40,
  },
} as const;

function resolveVariant(variant: LogoProps["variant"]): LogoVariant {
  if (variant === "full") return "horizontal-claim";
  return variant ?? "horizontal-claim";
}

export function Logo({ variant = "horizontal-claim", tone = "color", className }: LogoProps) {
  const key = resolveVariant(variant);
  const asset = ASSETS[key][tone];
  const { defaultWidth } = ASSETS[key];
  const displayHeight = Math.round(defaultWidth * (asset.height / asset.width));

  return (
    <Image
      src={asset.src}
      alt="Ecoembes"
      width={defaultWidth}
      height={displayHeight}
      priority
      className={cn("h-auto w-auto", className)}
    />
  );
}
