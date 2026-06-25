"use client";

import React, { useState, type JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { StepBar } from "./StepBar";

export interface Step {
  n: number;
  nombre: string;
  titulo: string;
  explicacion: React.ReactNode;
  visual: React.ReactNode;
}

export interface StepLayoutProps {
  steps: Step[];
  /** Breadcrumb tail, e.g. "Acto 1 · Auditoría de Declaraciones SIG" */
  actLabel: string;
  /** Optional muted detail after act label */
  actMeta?: string;
  demoLabel?: string;
  homeHref?: string;
}

/** Left-rail section heading for Acto step explainers. */
export function StepAsideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </p>
      <div className="space-y-2 text-sm text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

/** Bulleted list for Acto sidebar copy. */
export function StepAsideList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Optional footnote line below sections (meta, figures). */
export function StepAsideMeta({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-line pt-3 text-xs italic text-muted">{children}</p>
  );
}

export function StepLayout({
  steps,
  actLabel,
  actMeta,
  demoLabel = "Demo paso a paso",
  homeHref = "/",
}: StepLayoutProps): JSX.Element {
  const [activeN, setActiveN] = useState<number>(steps[0].n);
  const [replayKey, setReplayKey] = useState(0);

  const activeStep = steps.find((s) => s.n === activeN) ?? steps[0];
  const activeIndex = steps.findIndex((s) => s.n === activeN);
  const progressPct = ((activeIndex + 1) / steps.length) * 100;

  const handleReplay = () => setReplayKey((k) => k + 1);

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:h-dvh md:max-h-dvh md:min-h-0 md:overflow-hidden">
      {/* Top bar — Home + breadcrumb */}
      <header className="flex shrink-0 items-center gap-2 border-b border-line bg-surface px-4 md:px-6 py-3">
        <span className="text-sm text-muted">{demoLabel}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/50" aria-hidden />
        <span className="truncate text-sm font-medium text-ink">{actLabel}</span>
        {actMeta && (
          <span className="hidden truncate text-sm text-muted md:inline">· {actMeta}</span>
        )}
      </header>

      {/* Content — stacked + page-scroll on mobile, fixed two-column on desktop.
          On md+ the row is height-pinned (min-h-0 + flex-1 + overflow-hidden) so
          neither column can grow it; the left rail stays put and only the right
          visual column scrolls internally. */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden px-4 md:px-6 pb-28 md:pb-20 pt-2 gap-4 md:gap-6">
        {/* Left — progress + explainer. Pinned on desktop: sticky to the top of
            the (non-scrolling) row and clipped so tall explainer copy never drags
            the column into a shared scroll. */}
        <aside className="flex w-full md:w-80 shrink-0 flex-col justify-start py-4 md:py-6 md:sticky md:top-0 md:self-start md:max-h-full md:overflow-hidden">
          {/* Progress */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Progreso
              </p>
              <p className="text-[11px] tabular-nums text-muted">
                {activeIndex + 1} / {steps.length}
              </p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${activeN}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step header + replay */}
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Paso {activeStep.n} · {activeStep.nombre}
                </p>
                <h2 className="mt-1 text-xl font-bold leading-tight text-ink text-balance">
                  {activeStep.titulo}
                </h2>
              </div>

              <div className="space-y-4">{activeStep.explicacion}</div>
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* Right — visual. On mobile it sizes to content (page scrolls);
            on desktop it fills the column and scrolls internally. */}
        <div className="flex min-h-[60vh] md:min-h-0 flex-1 flex-col md:overflow-hidden pb-6 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`right-${activeN}-${replayKey}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              {activeStep.visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <StepBar
        steps={steps}
        active={activeN}
        onChange={setActiveN}
        onReplay={handleReplay}
        homeHref={homeHref}
      />
    </div>
  );
}
