import { cn } from "@/lib/utils";

type Tone = "neutral" | "danger" | "ok";

export interface StatLedgerItem {
  label: string;
  value: string | number;
  sub?: string;
  /** Reserve color: only the figure that carries the story gets it. */
  tone?: Tone;
}

const toneClass: Record<Tone, string> = {
  neutral: "text-ink",
  danger: "text-danger",
  ok: "text-brand-dark",
};

/**
 * Editorial KPI band: one surface, hairline-divided cells, large tabular
 * numbers. No per-cell borders, no decorative icons — the figures carry the
 * row. Color is reserved (see DESIGN.md): pass `tone` only on the one number
 * that matters per view.
 */
export function StatLedger({
  items,
  className,
}: {
  items: StatLedgerItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-line overflow-hidden",
        "grid grid-cols-1 divide-y divide-line",
        "lg:grid-cols-none lg:grid-flow-col lg:auto-cols-fr lg:divide-y-0 lg:divide-x",
        className
      )}
    >
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-2 px-5 py-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted leading-none">
            {it.label}
          </span>
          <span
            className={cn(
              "text-[28px] font-bold tabular-nums leading-none",
              toneClass[it.tone ?? "neutral"]
            )}
          >
            {it.value}
          </span>
          {it.sub && (
            <span className="text-xs text-muted leading-snug">{it.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}
