"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Step } from "./StepLayout";

interface StepBarProps {
  steps: Step[];
  active: number;
  onChange: (n: number) => void;
}

export function StepBar({ steps, active, onChange }: StepBarProps) {
  const isFirst = active === steps[0].n;
  const isLast = active === steps[steps.length - 1].n;

  const prev = () => {
    const idx = steps.findIndex((s) => s.n === active);
    if (idx > 0) onChange(steps[idx - 1].n);
  };

  const next = () => {
    const idx = steps.findIndex((s) => s.n === active);
    if (idx < steps.length - 1) onChange(steps[idx + 1].n);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-t border-black/5 px-6 py-3 flex items-center gap-4">
      {/* Anterior */}
      <button
        onClick={prev}
        disabled={isFirst}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          isFirst
            ? "text-muted/40 cursor-not-allowed"
            : "text-ink hover:bg-canvas cursor-pointer"
        )}
        aria-label="Paso anterior"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>

      {/* Step chips */}
      <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
        {steps.map((step) => {
          const isActive = step.n === active;
          return (
            <button
              key={step.n}
              onClick={() => onChange(step.n)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "bg-canvas text-muted hover:bg-brand-soft hover:text-brand-dark"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  isActive ? "bg-white/20" : "bg-black/5"
                )}
              >
                {step.n}
              </span>
              <span className="hidden sm:inline">{step.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* Siguiente */}
      <button
        onClick={next}
        disabled={isLast}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          isLast
            ? "text-muted/40 cursor-not-allowed"
            : "text-ink hover:bg-canvas cursor-pointer"
        )}
        aria-label="Paso siguiente"
      >
        Siguiente
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
