// utils/timeUtils.js

/**
 * 数字文字列（最大6桁: hhmmss）を合計秒数に変換する
 */
export const parseDigitsToSeconds = (digits) => {
  if (!digits) return 0;
  const padded = digits.padStart(6, "0");
  const hrs = parseInt(padded.slice(0, 2), 10) || 0;
  const mins = parseInt(padded.slice(2, 4), 10) || 0;
  const secs = parseInt(padded.slice(4, 6), 10) || 0;
  return hrs * 3600 + mins * 60 + secs;
};

/**
 * 秒数を「HH:MM:SS」または「MM:SS」または「SS」形式の文字列に変換する
 */
export const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = (timeInSeconds % 3600) % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
  return String(seconds);
};