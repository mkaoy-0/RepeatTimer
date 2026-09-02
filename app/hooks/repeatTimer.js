// hooks/repeatTimer.js
"use client";

import { useState, useEffect } from "react";
import { useBaseTimer } from "./useBaseTimer";
import { playBeep, playDingDong } from "../audio";

export function useRepeatTimer(initialSeconds = 60) {
  const base = useBaseTimer(initialSeconds);
  const {
    seconds,
    isRunning,
    setIsRunning,
    timeLeft,
    setTimeLeft,
    setInputDigits,
    repeatCounts,
    targetTimeRef,
  } = base;

  const [counts, setCounts] = useState(0);


  useEffect(() => {
    if (!isRunning) return;

    targetTimeRef.current = Date.now() + timeLeft * 1000;

    const timerId = setInterval(() => {
      const now = Date.now();
      const realTimeLeft = Math.ceil((targetTimeRef.current - now) / 1000);

      if (realTimeLeft > 0) {
        setTimeLeft(realTimeLeft);
      } else {
        setCounts((prevCounts) => {
          const nextCounts = prevCounts + 1;

          // repeatCounts === 0 のときは無限ループ（or 規定回数未満なら継続）
          if (repeatCounts == 0 || nextCounts < repeatCounts) {
            // 継続時は「ピピッ」
            playBeep();
            targetTimeRef.current = Date.now() + seconds * 1000;
            setTimeLeft(seconds);
          } else {
            // 全周回完了時は「ピンポーン」
            playDingDong();
            setIsRunning(false);
            setTimeLeft(seconds);
            setInputDigits("");
          }
          return nextCounts;
        });
      }
    }, 200);

    return () => clearInterval(timerId);
  }, [isRunning, seconds, repeatCounts, setIsRunning, setTimeLeft, setInputDigits, targetTimeRef]);

  // toggleTimer をリピートタイマー用に上書き拡張
  const toggleTimer = () => {
    // 停止中からスタートしようとしている時
    if (!isRunning) {
      // 指定回数が設定されていて（> 0）、すでに上限まで達している場合はカウントを0に戻す
      if (repeatCounts > 0 && counts >= repeatCounts) {
        setCounts(0);
      }
    }
    // 元々の useBaseTimer 側の toggleTimer（音声初期化や isRunning の切替）を実行
    base.toggleTimer();
  };

  const resetTimer = () => {
    base.resetTimer();
    setCounts(0);
  };

  const changeRepeatCounts = (newCounts) => {
    setRepeatCounts(newCounts);
  };

  return {
    ...base,
    counts,
    repeatCounts,
    toggleTimer,
    resetTimer,
    changeRepeatCounts,
  };
}