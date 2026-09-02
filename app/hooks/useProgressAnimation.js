"use client";

import { useState, useEffect, useRef } from "react";

export function useProgressAnimation(isRunning, seconds, timeLeft, isRepeatMode = false) {
  const [animatedProgress, setAnimatedProgress] = useState(1);
  const [isIncreasing, setIsIncreasing] = useState(false);

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const prevTimeLeftRef = useRef(timeLeft);
  const directionRef = useRef("decrease");
  const startProgressRef = useRef(1);
  const durationMsRef = useRef((seconds || 1) * 1000);

  useEffect(() => {
    if (!isRunning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      if (timeLeft === seconds) {
        setAnimatedProgress(1);
        setIsIncreasing(false);
        directionRef.current = "decrease";
        startTimeRef.current = null;
        startProgressRef.current = 1;
        durationMsRef.current = (seconds || 1) * 1000;
      } else {
        setAnimatedProgress((current) => {
          startProgressRef.current = current;
          return current;
        });
        startTimeRef.current = null;
      }

      prevTimeLeftRef.current = timeLeft;
      return;
    }

    if (isRepeatMode && timeLeft > prevTimeLeftRef.current) {
      startTimeRef.current = Date.now();
      const nextDir = directionRef.current === "decrease" ? "increase" : "decrease";
      directionRef.current = nextDir;
      setIsIncreasing(nextDir === "increase");
      startProgressRef.current = nextDir === "decrease" ? 1 : 0;
      durationMsRef.current = (seconds || 1) * 1000;
    } else if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      const remainingSec = Math.max(timeLeft, 0.1);
      durationMsRef.current = remainingSec * 1000;
    }

    prevTimeLeftRef.current = timeLeft;

    const animate = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const rate = Math.min(1, elapsed / durationMsRef.current);

      let currentProgress;
      if (!isRepeatMode || directionRef.current === "decrease") {
        currentProgress = startProgressRef.current * (1 - rate);
      } else {
        currentProgress = startProgressRef.current + (1 - startProgressRef.current) * rate;
      }

      setAnimatedProgress(currentProgress);

      if (rate < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, seconds, timeLeft, isRepeatMode]);

  return { animatedProgress, isIncreasing };
}