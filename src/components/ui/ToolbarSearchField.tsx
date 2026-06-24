"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** No brand ring/outline — toolbar search sits inside an already-bordered shell. */
export const chromelessSearchInputClass =
  "w-full border-0 bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-muted focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0";

interface ToolbarSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ToolbarSearchField({
  value,
  onChange,
  placeholder = "Buscar por empresa o CIF…",
  className,
}: ToolbarSearchFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-center px-4", className)}>
      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={chromelessSearchInputClass}
      />
    </div>
  );
}
