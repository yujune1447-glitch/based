"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const KEY = "based_active_timer";

interface StoredTimer {
  startedAt: number;
  selectedMinutes: number;
  sessionId: string | null;
}

export function saveTimer(data: StoredTimer) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearTimer() {
  localStorage.removeItem(KEY);
}

export function getStoredTimer(): StoredTimer | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredTimer;
  } catch {
    return null;
  }
}

export function usePersistedTimer(onComplete: (sessionId: string | null) => void) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = getStoredTimer();
    if (!stored) return;

    const elapsed = Math.floor((Date.now() - stored.startedAt) / 1000);
    const total = stored.selectedMinutes * 60;
    const remaining = total - elapsed;

    setSelectedMinutes(stored.selectedMinutes);
    setSessionId(stored.sessionId);

    if (remaining <= 0) {
      // Completed while away
      clearTimer();
      completedRef.current = true;
      onComplete(stored.sessionId);
    } else {
      setTimeRemaining(remaining);
      setIsRunning(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeRemaining(0);
    clearTimer();
    onComplete(sessionId);
  }, [onComplete, sessionId]);

  // Tick
  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleComplete]);

  const start = useCallback(
    (minutes: number, newSessionId: string | null) => {
      completedRef.current = false;
      setSessionId(newSessionId);
      setTimeRemaining(minutes * 60);
      setIsRunning(true);
      saveTimer({ startedAt: Date.now(), selectedMinutes: minutes, sessionId: newSessionId });
    },
    []
  );

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    completedRef.current = false;
    setIsRunning(false);
    setTimeRemaining(selectedMinutes * 60);
    clearTimer();
  }, [selectedMinutes]);

  return {
    selectedMinutes,
    setSelectedMinutes,
    timeRemaining,
    setTimeRemaining,
    isRunning,
    sessionId,
    start,
    reset,
  };
}
