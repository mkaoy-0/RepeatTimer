// hooks/useNormalTimer.js
"use client";

import { useEffect } from "react";
import { useBaseTimer } from "./useBaseTimer";
import { playBeep, playDingDong } from "../audio";

export function useNormalTimer(initialSeconds = 60) {
  const base = useBaseTimer(initialSeconds);
  const { isRunning, setIsRunning, timeLeft, setTimeLeft, setInputDigits, targetTimeRef } = base;

  useEffect(() => {
    if (!isRunning) return;

    targetTimeRef.current = Date.now() + timeLeft * 1000;

    const timerId = setInterval(() => {
      const now = Date.now();
      const realTimeLeft = Math.ceil((targetTimeRef.current - now) / 1000);

      if (realTimeLeft > 0) {
        setTimeLeft(realTimeLeft);
      } else {
        // playBeep();
        playDingDong();
        setIsRunning(false);
        setTimeLeft(0);
        setInputDigits("");
        clearInterval(timerId);
      }
    }, 100);

    return () => clearInterval(timerId);
  }, [isRunning, timeLeft, setIsRunning, setTimeLeft, setInputDigits, targetTimeRef]);

  return base;
}