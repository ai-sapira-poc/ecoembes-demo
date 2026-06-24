"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineFilterOption =
  | string
  | {
      value: string;
      label: string;
    };

interface InlineFilterProps {
  label: string;
  value: string;
  options: readonly InlineFilterOption[];
  onChange: (value: string) => void;
}

function normalizeOption(option: InlineFilterOption): { value: string; label: string } {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export function InlineFilter({ label, value, options, onChange }: InlineFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.map(normalizeOption).find((opt) => opt.value === value);
  const display = selected?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex cursor-pointer items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm transition-colors",
          value ? "font-medium text-ink" : "text-muted hover:text-ink-soft"
        )}
      >
        {display}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-lg border border-line bg-surface py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-canvas",
              !value ? "font-medium text-ink" : "text-ink-soft"
            )}
          >
            Todos
          </button>
          {options.map((option) => {
            const { value: optValue, label: optLabel } = normalizeOption(option);
            return (
              <button
                key={optValue}
                type="button"
                onClick={() => {
                  onChange(optValue);
                  setOpen(false);
                }}
                className={cn(
                  "w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-canvas",
                  value === optValue ? "font-medium text-ink" : "text-ink-soft"
                )}
              >
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
