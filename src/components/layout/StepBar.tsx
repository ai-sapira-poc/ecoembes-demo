"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Step } from "./StepLayout";

interface StepBarProps {
  steps: Step[];
  active: number;
  onChange: (n: number) => void;
  onReplay: () => void;
  homeHref?: string;
}

export function StepBar({
  steps,
  active,
  onChange,
  onReplay,
  homeHref = "/",
}: StepBarProps) {
  const router = useRouter();
  const activeIndex = steps.findIndex((s) => s.n === active);
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= steps.length - 1;

  const prev = () => {
    if (activeIndex > 0) onChange(steps[activeIndex - 1].n);
  };

  const next = () => {
    if (activeIndex < steps.length - 1) onChange(steps[activeIndex + 1].n);
  };

  const handlePrimary = () => {
    if (isLast) router.push(homeHref);
    else next();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-surface/95 px-4 md:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {/* Prev + Next — grouped left, Radisson-style */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={homeHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Inicio"
          >
            <Home className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Repetir animación del paso"
            title="Repetir paso"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={prev}
            disabled={isFirst}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              isFirst
                ? "cursor-not-allowed border-line text-muted/40"
                : "cursor-pointer border-line text-ink hover:bg-canvas"
            )}
            aria-label="Paso anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            type="button"
            onClick={handlePrimary}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "cursor-pointer bg-brand text-white hover:bg-brand-dark"
            )}
            aria-label={isLast ? "Finalizar demo" : "Paso siguiente"}
          >
            {isLast ? "Finalizar" : "Siguiente"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Step chips — scrollable trail (left on mobile, right-aligned on desktop) */}
        <div className="flex min-w-0 flex-1 items-center justify-start sm:justify-end gap-1.5 overflow-x-auto -mx-1 px-1">
          {steps.map((step) => {
            const isActive = step.n === active;
            return (
              <button
                key={step.n}
                type="button"
                onClick={() => onChange(step.n)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "bg-canvas text-muted hover:bg-brand-soft hover:text-brand-dark"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive ? "bg-white/20" : "bg-black/5"
                  )}
                >
                  {step.n}
                </span>
                <span>{step.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
