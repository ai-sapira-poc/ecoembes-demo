import type { DateRange } from "react-day-picker";

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateInRange(isoDate: string, range: DateRange): boolean {
  if (!range.from || !range.to) return true;
  const from = toISODate(range.from);
  const to = toISODate(range.to);
  return isoDate >= from && isoDate <= to;
}

/** Default dashboard range: April 2025 — covers the demo declaration cluster. */
export const defaultDashboardRange: DateRange = {
  from: new Date(2025, 3, 1),
  to: new Date(2025, 3, 30),
};
