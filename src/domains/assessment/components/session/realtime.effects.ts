"use client";

import { useCallback, useRef, useState } from "react";

type RealtimeTone = "reveal" | "tick" | "warning" | "success" | "fail" | "leaderboard";

type ToneStep = {
  delay: number;
  duration: number;
  frequency: number;
  gain: number;
  type: OscillatorType;
};

const toneMap: Record<RealtimeTone, ToneStep[]> = {
  reveal: [
    { delay: 0, duration: 0.11, frequency: 440, gain: 0.03, type: "triangle" },
    { delay: 0.1, duration: 0.14, frequency: 554, gain: 0.035, type: "triangle" },
    { delay: 0.22, duration: 0.18, frequency: 659, gain: 0.04, type: "triangle" },
  ],
  tick: [{ delay: 0, duration: 0.07, frequency: 740, gain: 0.018, type: "square" }],
  warning: [
    { delay: 0, duration: 0.09, frequency: 880, gain: 0.024, type: "square" },
    { delay: 0.11, duration: 0.09, frequency: 988, gain: 0.026, type: "square" },
  ],
  success: [
    { delay: 0, duration: 0.1, frequency: 523, gain: 0.03, type: "triangle" },
    { delay: 0.11, duration: 0.12, frequency: 659, gain: 0.035, type: "triangle" },
    { delay: 0.24, duration: 0.18, frequency: 784, gain: 0.04, type: "triangle" },
  ],
  fail: [
    { delay: 0, duration: 0.12, frequency: 320, gain: 0.03, type: "sawtooth" },
    { delay: 0.13, duration: 0.18, frequency: 240, gain: 0.028, type: "sawtooth" },
  ],
  leaderboard: [
    { delay: 0, duration: 0.12, frequency: 392, gain: 0.025, type: "triangle" },
    { delay: 0.14, duration: 0.12, frequency: 523, gain: 0.03, type: "triangle" },
    { delay: 0.28, duration: 0.12, frequency: 659, gain: 0.035, type: "triangle" },
  ],
};

export function useRealtimeAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!audioContextRef.current) {
      const audioContext = new window.AudioContext();
      const masterGain = audioContext.createGain();
      masterGain.gain.value = 0.55;
      masterGain.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      masterGainRef.current = masterGain;
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    async (tone: RealtimeTone) => {
      if (!soundEnabled) {
        return;
      }

      const audioContext = await ensureContext();
      const masterGain = masterGainRef.current;

      if (!audioContext || !masterGain) {
        return;
      }

      const now = audioContext.currentTime;
      const sequence = toneMap[tone];

      sequence.forEach((step) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startTime = now + step.delay;
        const endTime = startTime + step.duration;

        oscillator.type = step.type;
        oscillator.frequency.setValueAtTime(step.frequency, startTime);

        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(step.gain, startTime + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        oscillator.start(startTime);
        oscillator.stop(endTime);
      });
    },
    [ensureContext, soundEnabled],
  );

  const prime = useCallback(() => {
    void ensureContext();
  }, [ensureContext]);

  return {
    soundEnabled,
    setSoundEnabled,
    prime,
    playTone,
  };
}
