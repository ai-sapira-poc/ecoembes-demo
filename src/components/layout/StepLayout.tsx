"use client";

import React, { useState, type JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StepBar } from "./StepBar";

export interface Step {
  n: number;
  nombre: string;
  titulo: string;
  explicacion: React.ReactNode;
  visual: React.ReactNode;
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

export function StepLayout({ steps }: { steps: Step[] }): JSX.Element {
  const [activeN, setActiveN] = useState<number>(steps[0].n);

  const activeStep = steps.find((s) => s.n === activeN) ?? steps[0];

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Back link */}
      <div className="px-6 pt-5 pb-2 flex-shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Two-column content area */}
      <div className="flex min-h-0 flex-1 overflow-hidden px-6 gap-6 pb-20">
        {/* Left column — narrow, explanation */}
        <div className="w-80 flex-shrink-0 flex flex-col justify-start py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${activeN}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {activeStep.n}
                </span>
                <h2 className="text-xl font-bold text-ink leading-tight">
                  {activeStep.titulo}
                </h2>
              </div>
              <div className="space-y-4">{activeStep.explicacion}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right column — wide, visual (no page scroll; visuals manage their own overflow) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`right-${activeN}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {activeStep.visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Step bar fixed at bottom */}
      <StepBar steps={steps} active={activeN} onChange={setActiveN} />
    </div>
  );
}
