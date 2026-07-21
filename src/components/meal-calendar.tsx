"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

interface MealCalendarProps {
  selectedDate: string;
  loggedDates: Set<string>;
  onSelect: (date: string) => void;
}

export function MealCalendar({ selectedDate, loggedDates, onSelect }: MealCalendarProps) {
  const initial = new Date(`${selectedDate}T00:00:00`);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const now = new Date();
  const todayIso = toIso(now);
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  function goToMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToMonth(-1)}
          aria-label="Vorige maand"
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-medium capitalize">
          {firstOfMonth.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => goToMonth(1)}
          disabled={isCurrentMonth}
          aria-label="Volgende maand"
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const iso = toIso(new Date(viewYear, viewMonth, day));
          const isSelected = iso === selectedDate;
          const isToday = iso === todayIso;
          const hasLogs = loggedDates.has(iso);
          return (
            <button
              key={iso}
              onClick={() => onSelect(iso)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-full text-sm transition-colors",
                isSelected
                  ? "bg-primary font-semibold text-primary-foreground"
                  : isToday
                    ? "text-primary ring-1 ring-primary"
                    : "text-foreground hover:bg-muted",
              )}
            >
              {day}
              {hasLogs && !isSelected && (
                <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
