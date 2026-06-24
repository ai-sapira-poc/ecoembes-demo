"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: Matcher | Matcher[];
  defaultMonth?: Date;
}

export function DateRangeFilter({
  value,
  onChange,
  disabled,
  defaultMonth,
}: DateRangeFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange>(value);
  const [rangeComplete, setRangeComplete] = useState(true);

  return (
    <Popover
      open={calendarOpen}
      onOpenChange={(open) => {
        setCalendarOpen(open);
        if (open) {
          setPendingRange(value);
          setRangeComplete(true);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-soft shadow-sm transition-colors hover:bg-brand-soft"
        >
          <CalendarIcon className="h-4 w-4 text-brand" />
          {value.from && value.to
            ? `${fmtDate(value.from)} – ${fmtDate(value.to)}`
            : "Select date range"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-3">
        <Calendar
          mode="range"
          selected={pendingRange}
          onSelect={(_range, day) => {
            if (rangeComplete || !pendingRange.from) {
              setPendingRange({ from: day, to: undefined });
              setRangeComplete(false);
            } else {
              const from = pendingRange.from;
              if (day < from) {
                setPendingRange({ from: day, to: from });
              } else {
                setPendingRange({ from, to: day });
              }
              setRangeComplete(true);
            }
          }}
          disabled={disabled}
          numberOfMonths={2}
          defaultMonth={defaultMonth}
        />
        <div className="flex justify-end border-t border-line pt-3 mt-1">
          <button
            type="button"
            disabled={!pendingRange.from || !pendingRange.to}
            onClick={() => {
              onChange(pendingRange);
              setCalendarOpen(false);
            }}
            className="cursor-pointer rounded-md bg-brand px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-default disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
