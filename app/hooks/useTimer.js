"use client";

import { useState, useEffect, useRef } from "react";
import { playBeep, initAudio } from "../audio";

export function useTimer(initialSeconds = 60, initialRepeatTarget = 1) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [inputDigits, setInputDigits] = useState("");

  // くり返し回数の設定と管理
  const [repeatTarget, setRepeatTarget] = useState(initialRepeatTarget); // 目標のくり返し回数
  const [currentCount, setCurrentCount] = useState(0);                   // 現在の完了回数

  const targetTimeRef = useRef(null);
  const shouldResetOnInputRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;

    targetTimeRef.current = Date.now() + timeLeft * 1000;

    const timerId = setInterval(() => {
      const now = Date.now();
      const realTimeLeft = Math.ceil((targetTimeRef.current - now) / 1000);

      if (realTimeLeft > 0) {
        setTimeLeft(realTimeLeft);
      } else {
        playBeep();

        setCurrentCount((prev) => {
          const nextCount = prev + 1;

          // 設定したリピート回数(repeatTarget)に達していない場合は繰り返す
          if (nextCount < repeatTarget) {
            targetTimeRef.current = Date.now() + seconds * 1000;
            setTimeLeft(seconds);
          } else {
            // 全回数終了
            setIsRunning(false);
            setTimeLeft(seconds);
            setInputDigits("");
            clearInterval(timerId);
          }
          return nextCount;
        });
      }
    }, 100);

    return () => clearInterval(timerId);
  }, [isRunning, seconds, repeatTarget, timeLeft]);

  const parseDigitsToSeconds = (digits) => {
    if (!digits) return 0;
    const padded = digits.padStart(6, "0");
    const hrs = parseInt(padded.slice(0, 2), 10) || 0;
    const mins = parseInt(padded.slice(2, 4), 10) || 0;
    const secs = parseInt(padded.slice(4, 6), 10) || 0;
    return hrs * 3600 + mins * 60 + secs;
  };

  const handleInputChange = (rawText) => {
    let cleanDigits = rawText.replace(/\D/g, "").slice(-6);
    if (shouldResetOnInputRef.current) {
      shouldResetOnInputRef.current = false;
      if (cleanDigits.length > inputDigits.length) {
        cleanDigits = cleanDigits.slice(-1);
      }
    }
    setInputDigits(cleanDigits);
    const totalSeconds = parseDigitsToSeconds(cleanDigits);
    setSeconds(totalSeconds);
    setTimeLeft(totalSeconds);
  };

  const prepareInputOnFocus = () => {
    shouldResetOnInputRef.current = true;
  };

  const toggleTimer = () => {
    initAudio();
    if (timeLeft <= 0) return;
    if (!isRunning) setInputDigits("");
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(seconds);
    setInputDigits("");
    setCurrentCount(0);
  };

  return {
    seconds,
    timeLeft,
    isRunning,
    setIsRunning,
    inputDigits,
    repeatTarget,
    setRepeatTarget,
    currentCount,
    handleInputChange,
    prepareInputOnFocus,
    toggleTimer,
    resetTimer,
  };
}