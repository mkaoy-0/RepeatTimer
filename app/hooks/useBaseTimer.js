"use client";

import { useState, useRef } from "react";
import { parseDigitsToSeconds } from "../utils/timeUtils";
import { initAudio } from "../audio";

export function useBaseTimer(initialSeconds = 60) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [inputDigits, setInputDigits] = useState("");

  const targetTimeRef = useRef(null);
  const shouldResetOnInputRef = useRef(false);

  // 回数（リピート数）の状態管理
  const [repeatCounts, setRepeatCounts] = useState(0);

  // 回数入力用のフォーカスリセット判定フラグ
  const shouldResetCountOnInputRef = useRef(false);

  // ----------------------------------------------------
  // 内部共通：電卓風の入力判定を行う共通ロジック
  // ----------------------------------------------------
  const processCalculatorInput = (rawText, currentLength, resetRef, maxDigits) => {
    // 数字以外の文字をすべて除外
    let cleanDigits = rawText.replace(/\D/g, "");

    // フォーカス直後かつ文字数が増えた（数字キーが押された）場合
    if (resetRef.current) {
      resetRef.current = false;
      if (cleanDigits.length > currentLength) {
        // 直前に押された最後の1文字だけを切り出す（リセット入力）
        cleanDigits = cleanDigits.slice(-1);
      }
    }

    // 桁数制限（時間: 6桁、回数: 3桁など）
    if (maxDigits) {
      cleanDigits = cleanDigits.slice(-maxDigits);
    }

    return cleanDigits;
  };

  // ----------------------------------------------------
  // 時間（hh:mm:ss）用の処理
  // ----------------------------------------------------
  // 時間フォーカス時に呼ばれる関数
  const prepareInputOnFocus = () => {
    shouldResetOnInputRef.current = true;
  };

  // 時間の入力ハンドラー
  const handleInputChange = (rawText) => {
    const cleanDigits = processCalculatorInput(
      rawText,
      inputDigits.length,
      shouldResetOnInputRef,
      6
    );

    setInputDigits(cleanDigits);

    // 数字列を秒数に変換（入力された値に応じて適切に処理）
    const totalSeconds = parseDigitsToSeconds(cleanDigits);
    setSeconds(totalSeconds);
    setTimeLeft(totalSeconds);
  };


  // ----------------------------------------------------
  // 回数（単一数値）用の入力・フォーカス処理
  // ----------------------------------------------------
  const prepareCountInputOnFocus = () => {
    shouldResetCountOnInputRef.current = true;
  };

  const handleCountInputChange = (rawText) => {
    const currentStr = String(repeatCounts === 0 ? "" : repeatCounts);
    
    // 電卓風判定処理を呼び出し（最大3桁）
    const cleanDigits = processCalculatorInput(
      rawText,
      currentStr.length,
      shouldResetCountOnInputRef,
      3
    );

    const newCount = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);
    setRepeatCounts(newCount);
  };

  // ----------------------------------------------------
  // その他ボタン処理
  // ----------------------------------------------------
  const toggleTimer = () => {
    initAudio();
    if (timeLeft <= 0 && !isRunning) return;
    if (!isRunning) {
      setInputDigits("");
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(seconds);
    setInputDigits("");
  };

  const changeSeconds = (newSeconds) => {
    setIsRunning(false);
    setSeconds(newSeconds);
    setTimeLeft(newSeconds);
    setInputDigits("");
  };

  return {
    seconds,
    setSeconds,
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    inputDigits,
    setInputDigits,
    repeatCounts,
    setRepeatCounts,
    targetTimeRef,
    handleInputChange,
    prepareInputOnFocus,
    handleCountInputChange,
    prepareCountInputOnFocus,   
    toggleTimer,
    resetTimer,
    changeSeconds,
  };
}