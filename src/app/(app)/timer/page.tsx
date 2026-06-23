"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLongPress } from "use-long-press";
import { useSession } from "next-auth/react";
import TimerCircle from "@/components/timer/TimerCircle";
import TimeSelector from "@/components/timer/TimeSelector";
import { playCompletionBell } from "@/lib/sounds";
import { supabase } from "@/lib/supabase-client";
import { format } from "date-fns";

const DEFAULT_MINUTES = 25;
const HOLD_DURATION = 1000; // ms

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TimerPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [selectedMinutes, setSelectedMinutes] = useState(DEFAULT_MINUTES);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPressingDown, setIsPressingDown] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [streak, setStreak] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pressStartRef = useRef<number>(0);

  // Fetch streak on mount
  useEffect(() => {
    if (!session?.user?.id) return;
    const uid = session.user.id;

    async function fetchStreak() {
      const { data } = await supabase
        .from("timer_sessions")
        .select("created_at")
        .eq("user_id", uid)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(90);

      if (!data) return;
      const dates = new Set(data.map((s) => new Date(s.created_at).toDateString()));
      let count = 0;
      const today = new Date();
      for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (dates.has(d.toDateString())) {
          count++;
        } else {
          break;
        }
      }
      setStreak(count);
    }
    fetchStreak();
  }, [session]);

  // Sync timeRemaining when duration changes (and timer idle)
  useEffect(() => {
    if (!isRunning && !isComplete) {
      setTimeRemaining(selectedMinutes * 60);
    }
  }, [selectedMinutes, isRunning, isComplete]);

  const startTimer = useCallback(async () => {
    if (isRunning || isComplete) return;

    if (session?.user?.id) {
      const { data } = await supabase
        .from("timer_sessions")
        .insert({
          user_id: session.user.id,
          planned_minutes: selectedMinutes,
          actual_minutes: 0,
          completed: false,
        })
        .select("id")
        .single();
      if (data) sessionIdRef.current = data.id;
    }

    startedAtRef.current = Date.now();
    setIsRunning(true);
    setIsPressingDown(false);
    setHoldProgress(0);
  }, [isRunning, isComplete, session, selectedMinutes]);

  const handleTimerComplete = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsComplete(true);
    playCompletionBell();

    const actualMinutes = Math.round(
      (Date.now() - (startedAtRef.current ?? Date.now())) / 60000
    );

    if (sessionIdRef.current && session?.user?.id) {
      await supabase
        .from("timer_sessions")
        .update({ completed: true, actual_minutes: actualMinutes })
        .eq("id", sessionIdRef.current);
    }

    setTimeout(() => {
      const id = sessionIdRef.current;
      router.push(id ? `/reflection?session=${id}` : "/reflection");
    }, 2200);
  }, [router, session]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  // Hold progress animation
  const startHoldProgress = useCallback(() => {
    pressStartRef.current = Date.now();
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - pressStartRef.current;
      const p = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(p);
    }, 16);
  }, []);

  const stopHoldProgress = useCallback(() => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
  }, []);

  const longPressHandlers = useLongPress(
    () => {
      stopHoldProgress();
      startTimer();
    },
    {
      threshold: HOLD_DURATION,
      onStart: () => {
        if (isRunning || isComplete) return;
        setIsPressingDown(true);
        startHoldProgress();
      },
      onCancel: () => {
        setIsPressingDown(false);
        stopHoldProgress();
      },
      onFinish: () => {
        setIsPressingDown(false);
        stopHoldProgress();
      },
    }
  );

  const handleTap = () => {
    if (isRunning || isComplete || isPressingDown) return;
    setShowSelector(true);
  };

  const progress = timeRemaining / (selectedMinutes * 60);
  const todayLabel = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-2 px-6">
        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
          {todayLabel}
        </p>
        <h1 className="text-[22px] font-semibold text-slate-700 mt-1">
          {getGreeting()}
          {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
      </div>

      {/* Timer — centered in remaining space */}
      <div className="flex-1 flex items-center justify-center px-6">
        <TimerCircle
          progress={progress}
          timeRemaining={timeRemaining}
          totalSeconds={selectedMinutes * 60}
          isRunning={isRunning}
          isComplete={isComplete}
          isPressingDown={isPressingDown}
          holdProgress={holdProgress}
          onTap={handleTap}
          longPressHandlers={longPressHandlers()}
          streak={streak}
          userName={session?.user?.name}
        />
      </div>

      {/* Time selector sheet */}
      {showSelector && !isRunning && !isComplete && (
        <TimeSelector
          selectedMinutes={selectedMinutes}
          onSelect={(m) => {
            setSelectedMinutes(m);
            setTimeRemaining(m * 60);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
