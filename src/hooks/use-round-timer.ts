"use client";

import { useState, useEffect, useCallback } from "react";

interface UseRoundTimerOptions {
  startTime: Date | undefined;
  duration: number | undefined;
  onTimeUp: () => void;
}

export function useRoundTimer({
  startTime,
  duration,
  onTimeUp,
}: UseRoundTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const calcRemaining = useCallback(() => {
    if (!startTime || !duration) return null;
    const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
    return Math.max(0, Math.ceil(duration - elapsed));
  }, [startTime, duration]);

  useEffect(() => {
    if (!startTime || !duration) return;

    setSecondsLeft(calcRemaining());

    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setSecondsLeft(remaining);

      if (remaining !== null && remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, calcRemaining, onTimeUp]);

  return { secondsLeft };
}
