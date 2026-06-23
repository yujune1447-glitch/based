"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLongPress } from "use-long-press";
import { useSession } from "next-auth/react";
import TimerCircle from "@/components/timer/TimerCircle";
import TimeSelector from "@/components/timer/TimeSelector";
import { playCompletionBell } from "@/lib/sounds";
import { supabase } from "@/lib/supabase-client";
import { usePersistedTimer } from "@/lib/usePersistedTimer";
import { format } from "date-fns";

const HOLD_DURATION = 1000;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TimerPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isComplete, setIsComplete] = useState(false);
  const [isPressingDown, setIsPressingDown] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showSelector, setShowSelector] = useState(false);
  const [streak, setStreak] = useState(0);

  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartRef = useRef<number>(0);
  const completingRef = useRef(false);

  const handleComplete = useCallback(
    async (completedSessionId: string | null) => {
      if (completingRef.current) return;
      completingRef.current = true;

      setIsComplete(true);
      playCompletionBell();

      // Mark session complete in DB
      if (completedSessionId && session?.user?.id) {
        await supabase
          .from("timer_sessions")
          .update({ completed: true, actual_minutes: timer.selectedMinutes })
          .eq("id", completedSessionId);

        // Bump streak by 1 (only if not already counted today)
        setStreak((prev) => prev + 1);
      }

      setTimeout(() => {
        router.push(
          completedSessionId
            ? `/reflection?session=${completedSessionId}`
            : "/reflection"
        );
      }, 2200);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, session]
  );

  const timer = usePersistedTimer(handleComplete);

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
      // Deduplicate by day
      const days = new Set(
        data.map((s) => format(new Date(s.created_at), "yyyy-MM-dd"))
      );
      let count = 0;
      const today = new Date();
      for (let i = 0; i < 90; i++) {
        const d = format(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - i),
          "yyyy-MM-dd"
        );
        if (days.has(d)) count++;
        else break;
      }
      setStreak(count);
    }
    fetchStreak();
  }, [session]);


  const startTimer = useCallback(async () => {
    if (timer.isRunning || isComplete) return;

    let newSessionId: string | null = null;
    if (session?.user?.id) {
      const { data } = await supabase
        .from("timer_sessions")
        .insert({
          user_id: session.user.id,
          planned_minutes: timer.selectedMinutes,
          actual_minutes: 0,
          completed: false,
        })
        .select("id")
        .single();
      if (data) newSessionId = data.id;
    }

    setIsPressingDown(false);
    setHoldProgress(0);
    timer.start(timer.selectedMinutes, newSessionId);
  }, [timer, isComplete, session]);

  // Hold progress animation
  const startHoldProgress = useCallback(() => {
    pressStartRef.current = Date.now();
    holdIntervalRef.current = setInterval(() => {
      const p = Math.min((Date.now() - pressStartRef.current) / HOLD_DURATION, 1);
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
        if (timer.isRunning || isComplete) return;
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
    if (timer.isRunning || isComplete || isPressingDown) return;
    setShowSelector(true);
  };

  const progress = timer.isRunning || isComplete
    ? timer.timeRemaining / (timer.selectedMinutes * 60)
    : 1;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex flex-col items-center pt-10 pb-2 px-6">
        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-[22px] font-semibold text-slate-700 mt-1">
          {getGreeting()}
          {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <TimerCircle
          progress={progress}
          timeRemaining={timer.timeRemaining}
          totalSeconds={timer.selectedMinutes * 60}
          isRunning={timer.isRunning}
          isComplete={isComplete}
          isPressingDown={isPressingDown}
          holdProgress={holdProgress}
          onTap={handleTap}
          longPressHandlers={longPressHandlers()}
          streak={streak}
          userName={session?.user?.name}
        />
      </div>

      {showSelector && !timer.isRunning && !isComplete && (
        <TimeSelector
          selectedMinutes={timer.selectedMinutes}
          onSelect={(m) => {
            timer.setSelectedMinutes(m);
            timer.setTimeRemaining(m * 60);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
