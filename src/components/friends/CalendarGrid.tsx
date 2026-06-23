"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getDaysInMonth, getFirstDayOfWeek } from "@/lib/utils";
import { format, addMonths, subMonths, isToday, isFuture } from "date-fns";

interface CalendarGridProps {
  completedDates: Set<string>; // "yyyy-MM-dd"
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarGrid({ completedDates }: CalendarGridProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = getDaysInMonth(year, month);
  const startDay = getFirstDayOfWeek(year, month);
  const blanks = Array(startDay).fill(null);

  const canGoNext = !isFuture(addMonths(new Date(year, month, 1), 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
        <button
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 active:bg-slate-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {format(viewDate, "MMMM yyyy")}
        </span>
        <button
          onClick={() => !isFuture(addMonths(viewDate, 1)) && setViewDate((d) => addMonths(d, 1))}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
            canGoNext
              ? "text-slate-400 active:bg-slate-100"
              : "text-slate-200 pointer-events-none"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3 pt-2 pb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            <span className="text-[10px] font-semibold text-slate-300 uppercase">{d}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((date) => {
          const key = format(date, "yyyy-MM-dd");
          const completed = completedDates.has(key);
          const today = isToday(date);
          const future = isFuture(date) && !today;

          return (
            <div key={key} className="flex items-center justify-center py-0.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center relative",
                  completed && "bg-sky-500",
                  today && !completed && "ring-2 ring-sky-300",
                  future && "opacity-30"
                )}
              >
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    completed ? "text-white" : today ? "text-sky-500" : "text-slate-600"
                  )}
                >
                  {format(date, "d")}
                </span>
                {completed && (
                  <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
