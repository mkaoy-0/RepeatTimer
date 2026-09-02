"use client";

import { useState, useEffect, useRef } from "react";

/**
 * 通常タイマーの円形SVG進捗アニメーション（requestAnimationFrameによる滑らかな減衰）
 * @param {boolean} isRunning タイマー動作中か
 * @param {number} seconds 設定合計秒数
 * @param {number} timeLeft 現在の残り秒数
 */
export function useNormalProgressAnimation(isRunning, seconds, timeLeft) {
  const [animatedProgress, setAnimatedProgress] = useState(1); // 1.0 (100%) -> 0.0 (0%)
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const startProgressRef = useRef(1);
  const durationMsRef = useRef((seconds || 1) * 1000);

  useEffect(() => {
    // タイマー停止中のアニメーション同期処理
    if (!isRunning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      if (timeLeft === seconds) {
        // リセット状態
        setAnimatedProgress(1);
        startTimeRef.current = null;
        startProgressRef.current = 1;
        durationMsRef.current = (seconds || 1) * 1000;
      } else {
        // 一時停止状態：現在のアニメーション位置を保持
        setAnimatedProgress((current) => {
          startProgressRef.current = current;
          return current;
        });
        startTimeRef.current = null;
      }
      return;
    }

    // 動作開始時：基準時間と残りアニメーション時間を設定
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      const remainingSec = Math.max(timeLeft, 0.1);
      durationMsRef.current = remainingSec * 1000;
    }

    // 毎フレームの描画更新処理
    const animate = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const rate = Math.min(1, elapsed / durationMsRef.current);

      // 進捗率を減少（1.0 -> 0.0）
      const currentProgress = startProgressRef.current * (1 - rate);
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

  return animatedProgress;
}