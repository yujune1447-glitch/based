"use client";

import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface SidebarDay {
  date: string;
  preview: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  days: SidebarDay[];
  selectedDate: string | null;
  onSelectDay: (date: string) => void;
}

function groupByMonth(days: SidebarDay[]): Map<string, SidebarDay[]> {
  const map = new Map<string, SidebarDay[]>();
  for (const day of days) {
    const key = format(new Date(day.date), "MMMM yyyy");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(day);
  }
  return map;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d");
}

export default function ChatSidebar({
  isOpen,
  onClose,
  days,
  selectedDate,
  onSelectDay,
}: ChatSidebarProps) {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onClose,
    trackMouse: false,
    delta: 40,
  });

  const grouped = groupByMonth(days);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        {...swipeHandlers}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-[78vw] max-w-xs bg-white flex flex-col",
          "shadow-2xl",
          isOpen ? "sidebar-enter" : "sidebar-exit pointer-events-none"
        )}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Journal</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M14 4L4 14M4 4l10 10"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* New conversation */}
        <button
          onClick={() => {
            onSelectDay("today");
            onClose();
          }}
          className="mx-4 mt-3 mb-1 flex items-center gap-2.5 px-4 h-11 rounded-xl bg-sky-50 text-sky-600 text-sm font-medium active:bg-sky-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2v12M2 8h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New entry
        </button>

        {/* History */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {days.length === 0 ? (
            <p className="text-center text-slate-400 text-sm mt-8 px-6">
              Your journal entries will appear here
            </p>
          ) : (
            Array.from(grouped.entries()).map(([month, monthDays]) => (
              <div key={month}>
                <div className="px-5 py-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {month}
                  </span>
                </div>
                {monthDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => {
                      onSelectDay(day.date);
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left px-5 py-3 transition-colors active:bg-slate-50",
                      selectedDate === day.date ? "bg-sky-50" : "hover:bg-slate-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium",
                        selectedDate === day.date ? "text-sky-600" : "text-slate-700"
                      )}
                    >
                      {formatDayLabel(day.date)}
                    </p>
                    {day.preview && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{day.preview}</p>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
