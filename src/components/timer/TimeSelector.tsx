"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 52;

// Generate minutes list: 1-9, then 10, 15, 20... up to 120
const MINUTES = [
  ...Array.from({ length: 9 }, (_, i) => i + 1),
  10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55,
  60, 75, 90, 105, 120,
];

interface TimeSelectorProps {
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  onClose: () => void;
}

export default function TimeSelector({ selectedMinutes, onSelect, onClose }: TimeSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialIndex = Math.max(0, MINUTES.indexOf(
    MINUTES.reduce((prev, curr) =>
      Math.abs(curr - selectedMinutes) < Math.abs(prev - selectedMinutes) ? curr : prev
    )
  ));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Scroll to selected on open
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = initialIndex * ITEM_H;
  }, []); // eslint-disable-line

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    setSelectedIndex(Math.max(0, Math.min(idx, MINUTES.length - 1)));
  };

  const handleConfirm = () => {
    onSelect(MINUTES[selectedIndex]);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20 backdrop" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl fade-in"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <h2 className="text-lg font-semibold text-slate-800">Set timer</h2>
          <button onClick={onClose} className="text-sm text-slate-400 active:text-slate-600">Cancel</button>
        </div>

        {/* Wheel */}
        <div className="relative mx-6 my-4" style={{ height: ITEM_H * 5 }}>
          {/* Selection highlight */}
          <div
            className="absolute left-0 right-0 rounded-2xl bg-sky-50 border border-sky-100 pointer-events-none z-10"
            style={{ top: ITEM_H * 2, height: ITEM_H }}
          />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-scroll no-scrollbar"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {/* Top padding */}
            <div style={{ height: ITEM_H * 2 }} />

            {MINUTES.map((m, i) => (
              <div
                key={m}
                style={{ scrollSnapAlign: "center", height: ITEM_H }}
                className="flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setSelectedIndex(i);
                  scrollRef.current!.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                }}
              >
                <span className={cn(
                  "text-3xl font-light tabular-nums transition-all",
                  i === selectedIndex ? "text-sky-600 font-medium" : "text-slate-400"
                )}>
                  {m}
                </span>
                <span className={cn(
                  "text-base transition-all",
                  i === selectedIndex ? "text-sky-400" : "text-slate-300"
                )}>
                  min
                </span>
              </div>
            ))}

            {/* Bottom padding */}
            <div style={{ height: ITEM_H * 2 }} />
          </div>

          {/* Fade top/bottom */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleConfirm}
            className="w-full h-14 rounded-2xl bg-sky-500 text-white text-[15px] font-semibold active:bg-sky-600 transition-colors"
          >
            Set {MINUTES[selectedIndex]} minutes
          </button>
        </div>
      </div>
    </>
  );
}
