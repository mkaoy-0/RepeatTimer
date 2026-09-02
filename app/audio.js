// app/audio.js
"use client";

let audioCtx = null;

// ブラウザの自動再生ブロックを解除するための初期化関数
export function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// 0秒になったときに鳴らす効果音（「ピピッ」という電子音）
export function playBeep() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // 1回目の音（ピッ）
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = "sine"; // 正弦波（電子音っぽい丸い音）
  osc1.frequency.setValueAtTime(880, now); // 880Hz (ラ/A5)
  gain1.gain.setValueAtTime(0.1, now); // 音量
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.1);

  // 2回目の音（ピッ）
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(880, now + 0.15); // 880Hz
  gain2.gain.setValueAtTime(0.1, now + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.25);
}

// 完了時などに鳴らす効果音（「ピンポーン」というチャイム音）
// 明るく高めの「ぴぽーん」という効果音
export function playDingDong() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // ----------------------------------------------------
  // 1音目：「ぴ」（高いド / C6: 1046.50Hz）
  // ----------------------------------------------------
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1046.5, now);

  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.2, now + 0.015); // アタックを少し短く軽やかに
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // 少し早めに切る

  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);

  osc1.start(now);
  osc1.stop(now + 0.4);

  // ----------------------------------------------------
  // 2音目：「ぽーん」（ソ / G5: 783.99Hz）
  // ----------------------------------------------------
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();

  osc2.type = "sine";
  // 1音目からテンポよくつなげる（0.15秒後）
  osc2.frequency.setValueAtTime(783.99, now + 0.15);

  gain2.gain.setValueAtTime(0.001, now + 0.15);
  gain2.gain.linearRampToValueAtTime(0.25, now + 0.17);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0); // 程よい余韻

  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);

  osc2.start(now + 0.15);
  osc2.stop(now + 1.0);
}