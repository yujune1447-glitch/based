"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface TimerCircleProps {
  progress: number; // 0–1, 1 = full time remaining
  timeRemaining: number; // seconds
  totalSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
  isPressingDown: boolean;
  holdProgress: number; // 0–1, how far through the 1s hold we are
  onTap: () => void;
  longPressHandlers: React.HTMLAttributes<HTMLDivElement>;
  streak: number;
  userName?: string | null;
}

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;

// Two rings: outer (hold progress), inner (timer progress)
const OUTER_R = 128;
const INNER_R = 110;
const STROKE = 12;
const OUTER_CIRC = 2 * Math.PI * OUTER_R;
const INNER_CIRC = 2 * Math.PI * INNER_R;

export default function TimerCircle({
  progress,
  timeRemaining,
  totalSeconds,
  isRunning,
  isComplete,
  isPressingDown,
  holdProgress,
  onTap,
  longPressHandlers,
  streak,
  userName,
}: TimerCircleProps) {
  const timerDashOffset = INNER_CIRC * (1 - Math.max(0, Math.min(1, progress)));
  const holdDashOffset = OUTER_CIRC * (1 - Math.max(0, Math.min(1, holdProgress)));

  return (
    <div className="flex flex-col items-center gap-7 select-none">
      {/* Circle */}
      <div
        className="relative cursor-pointer"
        style={{ width: SIZE, height: SIZE }}
        onClick={onTap}
        {...longPressHandlers}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="holdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer track (hold progress background) */}
          <circle
            cx={CX} cy={CY} r={OUTER_R}
            fill="none"
            stroke="#f0f9ff"
            strokeWidth={6}
          />

          {/* Outer ring: hold progress — appears during long press */}
          {isPressingDown && holdProgress < 1 && (
            <circle
              cx={CX} cy={CY} r={OUTER_R}
              fill="none"
              stroke="url(#holdGrad)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={OUTER_CIRC}
              strokeDashoffset={holdDashOffset}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: "stroke-dashoffset 0.05s linear" }}
            />
          )}

          {/* Inner track */}
          <circle
            cx={CX} cy={CY} r={INNER_R}
            fill="none"
            stroke="#e0f2fe"
            strokeWidth={STROKE}
          />

          {/* Inner ring: timer progress */}
          {(isRunning || progress < 1) && progress > 0 && (
            <circle
              cx={CX} cy={CY} r={INNER_R}
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={INNER_CIRC}
              strokeDashoffset={timerDashOffset}
              transform={`rotate(-90 ${CX} ${CY})`}
              className="timer-ring-progress"
              filter={isRunning ? "url(#softGlow)" : undefined}
            />
          )}

          {/* Completion ping */}
          {isComplete && (
            <circle
              cx={CX} cy={CY} r={INNER_R}
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth={STROKE}
              className="animate-ping opacity-25"
            />
          )}
        </svg>

        {/* Inner circle content */}
        <div
          className={cn(
            "absolute rounded-full bg-white flex flex-col items-center justify-center gap-0.5",
            "transition-all duration-150",
            isPressingDown && "scale-[0.96]"
          )}
          style={{
            top: CY - INNER_R + STROKE / 2 + 1,
            left: CX - INNER_R + STROKE / 2 + 1,
            right: CX - INNER_R + STROKE / 2 + 1,
            bottom: CY - INNER_R + STROKE / 2 + 1,
            boxShadow: isRunning
              ? "0 0 0 1px #bae6fd, 0 8px 40px rgba(14,165,233,0.1)"
              : "0 0 0 1px #e0f2fe, 0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          {isComplete ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sky-500 text-4xl">✓</span>
              <span className="text-xs font-medium text-slate-400">Complete</span>
            </div>
          ) : (
            <>
              <span
                className={cn(
                  "font-light tabular-nums tracking-tight text-slate-800 transition-all duration-300",
                  isRunning ? "text-5xl" : "text-4xl"
                )}
              >
                {formatTime(timeRemaining)}
              </span>
              {!isRunning && (
                <span className="text-[11px] text-slate-400 font-medium mt-1">
                  {isPressingDown ? "hold…" : "tap to set • hold to start"}
                </span>
              )}
              {isRunning && (
                <span className="text-[11px] text-slate-400 font-medium mt-1">praying</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Streak + greeting */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50",
            streak > 0 && "bg-orange-50"
          )}
        >
          <span
            className={cn(
              "text-xl leading-none",
              !isRunning && !isPressingDown && streak > 0 && "pulse-gentle",
              isPressingDown && "fire-rising"
            )}
          >
            🔥
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              streak > 0 ? "text-orange-600" : "text-slate-400"
            )}
          >
            {streak > 0 ? (
              <>
                <span className="font-semibold">{streak}</span>
                {" "}day{streak !== 1 ? "s" : ""}
              </>
            ) : (
              "start your streak"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
