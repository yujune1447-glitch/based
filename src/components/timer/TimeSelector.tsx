"use client";

import { useState } from "react";
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
  const [customValue, setCustomValue] = useState("");
  const [customError, setCustomError] = useState(false);

  const handleCustomSubmit = () => {
    const n = parseInt(customValue, 10);
    if (!n || n < 1 || n > 180) {
      setCustomError(true);
      return;
    }
    onSelect(n);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20 backdrop" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl fade-in"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 pb-2">
          <h2 className="text-lg font-semibold text-slate-800">Set timer</h2>
          <p className="text-sm text-slate-400 mt-0.5">How long would you like to pray?</p>
        </div>

        {/* Preset grid */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4">
          {DURATIONS.map((minutes) => (
            <button
              key={minutes}
              onClick={() => { onSelect(minutes); onClose(); }}
              className={cn(
                "flex flex-col items-center justify-center h-20 rounded-2xl border transition-all duration-150 active:scale-95",
                selectedMinutes === minutes
                  ? "border-sky-400 bg-sky-50"
                  : "border-slate-100 bg-slate-50 active:bg-slate-100"
              )}
            >
              <span className={cn(
                "text-3xl font-light tabular-nums",
                selectedMinutes === minutes ? "text-sky-600" : "text-slate-700"
              )}>
                {minutes}
              </span>
              <span className={cn(
                "text-xs font-medium mt-0.5",
                selectedMinutes === minutes ? "text-sky-500" : "text-slate-400"
              )}>
                min
              </span>
              {selectedMinutes === minutes && (
                <span className="absolute top-2 right-2 text-sky-400 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Custom duration */}
        <div className="px-6 pb-8 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Custom duration
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={180}
                value={customValue}
                onChange={(e) => { setCustomValue(e.target.value); setCustomError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                placeholder="e.g. 45"
                className={cn(
                  "flex-1 h-12 px-4 rounded-2xl bg-slate-50 border text-[15px] text-slate-800 outline-none",
                  "placeholder:text-slate-300 transition-colors",
                  customError ? "border-red-200" : "border-slate-100 focus:border-sky-200"
                )}
              />
              <span className="flex items-center text-sm text-slate-400 font-medium px-1">min</span>
              <button
                onClick={handleCustomSubmit}
                className="h-12 px-5 rounded-2xl bg-sky-500 text-white text-sm font-medium active:bg-sky-600 transition-colors"
              >
                Set
              </button>
            </div>
            {customError && (
              <p className="text-xs text-red-400 mt-1 px-1">Enter a number between 1 and 180</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full h-11 rounded-2xl bg-slate-50 text-slate-400 text-sm font-medium active:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
