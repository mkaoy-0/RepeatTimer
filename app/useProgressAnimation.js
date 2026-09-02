// app/useProgressAnimation.js
"use client";

import { useState, useEffect, useRef } from "react";

export function useProgressAnimation(isRunning, seconds, timeLeft) {
  const [animatedProgress, setAnimatedProgress] = useState(1);
  const [isIncreasing, setIsIncreasing] = useState(false);

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const prevTimeLeftRef = useRef(timeLeft);
  const directionRef = useRef("decrease");

  // ★ 再開時の「現在位置」と「残りの所要ミリ秒」を保持する参照
  const startProgressRef = useRef(1); // アニメーション開始時点の進捗率 (0~1)
  const durationMsRef = useRef((seconds || 1) * 1000); // 0(または1)に到達するまでの残りミリ秒

  useEffect(() => {
    // ----------------------------------------------------
    // 1. 停止・一時停止（isRunning === false）の場合
    // ----------------------------------------------------
    if (!isRunning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      if (timeLeft === seconds) {
        // 完全リセット時
        setAnimatedProgress(1);
        setIsIncreasing(false);
        directionRef.current = "decrease";
        startTimeRef.current = null;
        startProgressRef.current = 1;
        durationMsRef.current = (seconds || 1) * 1000;
      } else {
        // ポーズした瞬間：現在のゲージ位置を記憶
        setAnimatedProgress((current) => {
          startProgressRef.current = current;
          return current;
        });
        startTimeRef.current = null;
      }

      prevTimeLeftRef.current = timeLeft;
      return;
    }

    // ----------------------------------------------------
    // 2. 実行中（isRunning === true）の処理
    // ----------------------------------------------------

    // 周回検知（タイマーが0になって次の周へ入った時）
    if (timeLeft > prevTimeLeftRef.current) {
      startTimeRef.current = Date.now();
      
      const nextDir = directionRef.current === "decrease" ? "increase" : "decrease";
      directionRef.current = nextDir;
      setIsIncreasing(nextDir === "increase");

      // 新しい周の初期値設定
      startProgressRef.current = nextDir === "decrease" ? 1 : 0;
      durationMsRef.current = (seconds || 1) * 1000;
    } 
    // ポーズからの再開時（startTimeRef がない状態からの復帰）
    else if (!startTimeRef.current) {
      startTimeRef.current = Date.now();

      // 残りのタイマー時間（timeLeft）に合わせて、ゲージが到達するまでの残り時間を再計算
      // ※ timeLeft が 0 の場合は最小 0.1秒 として計算
      const remainingSec = Math.max(timeLeft, 0.1);
      durationMsRef.current = remainingSec * 1000;
    }

    prevTimeLeftRef.current = timeLeft;

    // ----------------------------------------------------
    // 3. アニメーション描画ループ（残り時間をベースに計算）
    // ----------------------------------------------------
    const animate = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      // 今回の残り時間に対する進行割合 (0 ～ 1)
      const rate = Math.min(1, elapsed / durationMsRef.current);

      let currentProgress;
      if (directionRef.current === "decrease") {
        // 現在のゲージ位置（startProgressRef）から 0 に向かって減衰
        currentProgress = startProgressRef.current * (1 - rate);
      } else {
        // 現在のゲージ位置（startProgressRef）から 1 に向かって増加
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
  }, [isRunning, seconds, timeLeft]);

  return { animatedProgress, isIncreasing };
}