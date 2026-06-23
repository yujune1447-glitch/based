"use client";

import { cn } from "@/lib/utils";

const DURATIONS = [5, 10, 15, 20, 25, 30];

interface TimeSelectorProps {
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  onClose: () => void;
}

export default function TimeSelector({
  selectedMinutes,
  onSelect,
  onClose,
}: TimeSelectorProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl fade-in" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          <div className="px-6 pb-2">
            <h2 className="text-lg font-semibold text-slate-800">Set timer</h2>
            <p className="text-sm text-slate-400 mt-0.5">How long would you like to pray?</p>
          </div>

          {/* Duration grid */}
          <div className="grid grid-cols-3 gap-3 px-6 py-4">
            {DURATIONS.map((minutes) => (
              <button
                key={minutes}
                onClick={() => {
                  onSelect(minutes);
                  onClose();
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center h-20 rounded-2xl border transition-all duration-150 active:scale-95",
                  selectedMinutes === minutes
                    ? "border-sky-400 bg-sky-50"
                    : "border-slate-100 bg-slate-50 active:bg-slate-100"
                )}
              >
                <span
                  className={cn(
                    "text-3xl font-light tabular-nums",
                    selectedMinutes === minutes ? "text-sky-600" : "text-slate-700"
                  )}
                >
                  {minutes}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium mt-0.5",
                    selectedMinutes === minutes ? "text-sky-500" : "text-slate-400"
                  )}
                >
                  min
                </span>

                {selectedMinutes === minutes && (
                  <span className="absolute top-2 right-2 text-sky-400 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="px-6 pb-8">
            <button
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-slate-50 text-slate-400 text-sm font-medium transition-colors active:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
