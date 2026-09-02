"use client";

import { useState } from "react";
import { useNormalTimer } from "./hooks/normalTimer";
import { useRepeatTimer } from "./hooks/repeatTimer";
import { useNormalProgressAnimation } from "./hooks/useNormalProgressAnimation";
import { useProgressAnimation } from "./hooks/useProgressAnimation"; 
import { formatTime } from "./utils/timeUtils";

// ----------------------------------------------------
// 1. アイコン・コンポーネント定義
// ----------------------------------------------------

// sizeClass を渡せるようにし、デフォルト値を設定
function PlayPauseIcon({ isRunning, sizeClass = "w-4 h-4 sm:w-5 sm:h-5" }) {
  return isRunning ? (
    <svg className={`${sizeClass} fill-current`} viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ) : (
    <svg className={`${sizeClass} fill-current ml-0.5`} viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ResetIcon({ sizeClass = "w-4 h-4 sm:w-5 sm:h-5" }) {
  return (
    <svg className={`${sizeClass} fill-current`} viewBox="0 0 24 24">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  ); 
}

function TimerCircleCard({
  title,
  titleColorClass = "text-blue-400",
  strokeColorClass = "stroke-blue-500",
  activeBgClass = "text-blue-400 hover:text-blue-300",
  dashoffset,
  isFocused,
  onFocusChange,
  inputValue,
  onInputChange,
  onPrepareInput,
  isDisabled = false,
  isRunning = false,
  onToggle = null,
  onReset,
  rotateClass = "-rotate-90",
  isFlipped = false,
  isYFlipped = false,
  hasTransition = false,
  sizeClass = "w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48",
  cardPaddingClass = "p-3 sm:p-4",
  textContainerClass = "text-xl sm:text-2xl lg:text-3xl",
  children,
  displayFormattedTime
}) {
  const SVG_SIZE = 240;
  const CENTER = SVG_SIZE / 2;
  const RADIUS = 105;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const flipClass = [
    isFlipped ? "scale-x-[-1]" : "",
    isYFlipped ? "scale-y-[-1]" : "",
  ].join(" ");

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 bg-slate-800 ${cardPaddingClass} rounded-2xl shadow-xl border border-slate-700/50`}>
      <h2 className={`text-xs sm:text-sm lg:text-base font-bold tracking-wider ${titleColorClass} text-center`}>
        {title}
      </h2>

      <div
        className={`relative ${sizeClass} flex items-center justify-center rounded-full transition-all duration-300 ${
          isFocused ? "scale-105" : "hover:scale-102"
        }`}
      >
        {/* 円形プログレスバー */}
        <svg
          className={`absolute inset-0 w-full h-full ${rotateClass} ${flipClass}`}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            className="stroke-slate-700"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            className={`${strokeColorClass} ${
              hasTransition ? "transition-all duration-500 ease-out" : ""
            }`}
            strokeWidth="6"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
          />
        </svg>

        {/* 中央コンテンツ */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 ${
            onToggle ? "pb-5 sm:pb-6" : ""
          }`}
        >
          {children ? (
            children
          ) : (
            <div className={`${textContainerClass} font-mono font-extrabold tracking-tight flex items-center ${titleColorClass}`}>
              <span>{displayFormattedTime}</span>
            </div>
          )}
        </div>

        {/* インプット要素 */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            onFocusChange(true);
            if (onPrepareInput) onPrepareInput();
          }}
          onBlur={() => onFocusChange(false)}
          disabled={isDisabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed rounded-full z-20"
        />

        {/* ボタン領域 */}
        <div className="absolute bottom-[14%] flex items-center gap-3 sm:gap-4 z-30">
          {onToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={`p-1 transition active:scale-90 ${
                isRunning
                  ? "text-amber-400 hover:text-amber-300"
                  : activeBgClass
              }`}
              title={isRunning ? "一時停止" : "スタート"}
            >
              <PlayPauseIcon isRunning={isRunning} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="p-1 text-slate-400 hover:text-slate-200 transition active:scale-90"
            title="リセット"
          >
            <ResetIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. メインの Home コンポーネント
// ----------------------------------------------------

export default function Home() {
  const normalTimer = useNormalTimer(60);
  const [isNormalFocused, setIsNormalFocused] = useState(false);
  const normalAnimatedProgress = useNormalProgressAnimation(
    normalTimer.isRunning,
    normalTimer.seconds,
    normalTimer.timeLeft
  );

  const repeatTimer = useRepeatTimer(60);
  const [isRepeatTimerFocused, setIsRepeatTimerFocused] = useState(false);
  const [isRepeatCountFocused, setIsRepeatCountFocused] = useState(false);
  const { animatedProgress: repeatAnimatedProgress, isIncreasing } = useProgressAnimation(
    repeatTimer.isRunning,
    repeatTimer.seconds,
    repeatTimer.timeLeft
  );

  const RADIUS = 105;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  
  const normalDashoffset = CIRCUMFERENCE * (1 - normalAnimatedProgress);
  const repeatDashoffset = CIRCUMFERENCE * (1 - repeatAnimatedProgress);

  const totalCounts = Number(repeatTimer.repeatCounts) || 0;
  const currentCounts = Number(repeatTimer.counts) || 0;
  const countProgress = totalCounts > 0 ? Math.min(currentCounts / totalCounts, 1) : 0;
  const countDashoffset = CIRCUMFERENCE * (1 - countProgress);

  const getDisplayTime = (isFocused, timer) => {
    if (isFocused) {
      const padded = (timer.inputDigits || "").padStart(6, "0");
      const hh = padded.slice(0, 2);
      const mm = padded.slice(2, 4);
      const ss = padded.slice(4, 6);
      return `${hh}:${mm}:${ss}`;
    }
    return formatTime(timer.timeLeft);
  };

  const isBothRunning = normalTimer.isRunning && repeatTimer.isRunning;

  const handleAllToggle = () => {
    const shouldStart = !normalTimer.isRunning || !repeatTimer.isRunning;
    if (shouldStart) {
      if (!normalTimer.isRunning) normalTimer.toggleTimer();
      if (!repeatTimer.isRunning) repeatTimer.toggleTimer();
    } else {
      if (normalTimer.isRunning) normalTimer.toggleTimer();
      if (repeatTimer.isRunning) repeatTimer.toggleTimer();
    }
  };

  const handleAllReset = () => {
    normalTimer.resetTimer();
    repeatTimer.resetTimer();
  };

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col items-center justify-between bg-slate-900 text-white p-3 sm:p-5">
      
      {/* 一括操作エリア（角丸の四角い背景つき） */}
      <div className="my-auto shrink-0 bg-slate-800/90 backdrop-blur p-1.5 sm:p-2 mb-1 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-5 sm:gap-8">
        <button
          onClick={handleAllToggle}
          className={`p-2 px-5 transition active:scale-90 ${
            isBothRunning
              ? "text-amber-400 hover:text-amber-300"
              : "text-indigo-400 hover:text-indigo-300"
          }`}
          title={isBothRunning ? "両方一時停止" : "両方スタート"}
        >
          <PlayPauseIcon isRunning={isBothRunning}sizeClass="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <button
          onClick={handleAllReset}
          className="p-2 px-5 text-slate-400 hover:text-slate-200 transition active:scale-90"
          title="両方リセット"
        >
          <ResetIcon sizeClass="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* タイマー配置エリア */}
      <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md lg:max-w-2xl my-auto">
        
        {/* 1. 繰り返しタイマー（左 / 上） */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <TimerCircleCard
            title="繰り返しタイマー"
            titleColorClass="text-blue-400"
            strokeColorClass="stroke-blue-500"
            activeBgClass="text-blue-400 hover:text-blue-300"
            sizeClass="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64"
            cardPaddingClass="p-4 sm:p-5"
            textContainerClass="text-2xl sm:text-3xl lg:text-4xl"
            dashoffset={repeatDashoffset}
            isFocused={isRepeatTimerFocused}
            onFocusChange={setIsRepeatTimerFocused}
            inputValue={repeatTimer.inputDigits}
            onInputChange={repeatTimer.handleInputChange}
            onPrepareInput={repeatTimer.prepareInputOnFocus}
            isDisabled={repeatTimer.isRunning}
            isRunning={repeatTimer.isRunning}
            onToggle={repeatTimer.toggleTimer}
            onReset={repeatTimer.resetTimer}
            isYFlipped={isIncreasing}
            displayFormattedTime={getDisplayTime(isRepeatTimerFocused, repeatTimer)}
          />
        </div>

        {/* 2. 右 / 下エリア（リピート回数 ＆ 通常タイマー） */}
        <div className="w-full lg:w-1/2 grid grid-cols-2 lg:flex lg:flex-col items-center justify-center gap-3 sm:gap-4">
          
          {/* リピート回数 */}
          <TimerCircleCard
            title="リピート回数"
            titleColorClass="text-blue-400"
            strokeColorClass="stroke-blue-400"
            sizeClass="w-32 h-32 sm:w-36 sm:h-36 lg:w-36 lg:h-36"
            cardPaddingClass="p-2.5 sm:p-3"
            dashoffset={countDashoffset}
            isFocused={isRepeatCountFocused}
            onFocusChange={setIsRepeatCountFocused}
            inputValue={repeatTimer.repeatCounts === 0 ? "" : repeatTimer.repeatCounts}
            onInputChange={repeatTimer.handleCountInputChange}
            onPrepareInput={repeatTimer.prepareCountInputOnFocus}
            isDisabled={repeatTimer.isRunning}
            onReset={repeatTimer.resetTimer}
            rotateClass="rotate-90"
            isFlipped={true}
            hasTransition={true}
          >
            <div className="flex items-center justify-center gap-0.5 font-mono leading-none">
              <span
                className={`font-extrabold transition-all duration-200 -translate-y-0.5 ${
                  isRepeatCountFocused ? "text-xs text-blue-400/60" : "text-base sm:text-xl text-blue-400"
                }`}
              >
                {repeatTimer.counts}
              </span>

              <span className="text-xs sm:text-base font-bold text-blue-400/40 opacity-70">/</span>

              <span
                className={`font-extrabold transition-all duration-200 ${
                  isRepeatCountFocused
                    ? "text-base sm:text-xl text-blue-400"
                    : "text-xs text-blue-400/60"
                }`}
              >
                {repeatTimer.repeatCounts === 0 || repeatTimer.repeatCounts === ""
                  ? "∞"
                  : repeatTimer.repeatCounts}
              </span>
            </div>
          </TimerCircleCard>

          {/* 通常タイマー */}
          <TimerCircleCard
            title="通常タイマー"
            titleColorClass="text-emerald-400"
            strokeColorClass="stroke-emerald-500"
            activeBgClass="text-emerald-400 hover:text-emerald-300"
            sizeClass="w-32 h-32 sm:w-36 sm:h-36 lg:w-36 lg:h-36"
            cardPaddingClass="p-2.5 sm:p-3"
            textContainerClass="text-sm sm:text-lg lg:text-xl"
            dashoffset={normalDashoffset}
            isFocused={isNormalFocused}
            onFocusChange={setIsNormalFocused}
            inputValue={normalTimer.inputDigits}
            onInputChange={normalTimer.handleInputChange}
            onPrepareInput={normalTimer.prepareInputOnFocus}
            isDisabled={normalTimer.isRunning}
            isRunning={normalTimer.isRunning}
            onToggle={normalTimer.toggleTimer}
            onReset={normalTimer.resetTimer}
            displayFormattedTime={getDisplayTime(isNormalFocused, normalTimer)}
          />

        </div>

      </div>

      <div className="shrink-0 h-1"></div>
    </main>
  );
}