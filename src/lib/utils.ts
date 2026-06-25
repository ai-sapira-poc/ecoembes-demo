import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// useGrouping: "always" forces the thousands separator on 4-digit numbers too
// (8.568 €, not 8568 €). es-ES otherwise omits it on 4-digit values per RAE,
// but the demo wants every figure grouped consistently.
const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });
const eur2 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" });
const num = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

export const formatEUR = (n: number) => eur.format(n);
export const formatEUR2 = (n: number) => eur2.format(n);
export const formatNum = (n: number) => num.format(n);
export const formatPct = (n: number, decimals = 1) =>
  `${n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} %`;
