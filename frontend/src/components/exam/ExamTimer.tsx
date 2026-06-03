'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ExamTimerProps {
  startSeconds: number;
  onExpire: () => void;
  paused?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExamTimer({ startSeconds, onExpire, paused = false }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(startSeconds);
  // eslint-disable-next-line react-hooks/purity
  const startRef = useRef<number>(Date.now());
  const initialRef = useRef<number>(startSeconds);
  const expiredRef = useRef(false);

  // Reset when startSeconds changes (section transition)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(startSeconds);
    startRef.current = Date.now();
    initialRef.current = startSeconds;
    expiredRef.current = false;
  }, [startSeconds]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const left = Math.max(0, initialRef.current - elapsed);
      setRemaining(left);

      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [paused, onExpire]);

  const isWarning = remaining <= 300; // < 5 minutes
  const isCritical = remaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-sm border ${
        isWarning
          ? 'bg-[#fef2f2] border-[#ef4444]'
          : 'bg-[var(--color-surface-container)] border-[var(--color-outline-variant)]'
      } ${isCritical ? 'animate-pulse' : ''}`}
    >
      <span
        className={`text-sm font-bold uppercase tracking-widest ${
          isWarning ? 'text-[#ef4444]' : 'text-[var(--color-on-surface-variant)]'
        }`}
      >
        ⏱
      </span>
      <span
        className={`text-xl font-bold font-sans tabular-nums tracking-wider ${
          isWarning ? 'text-[#ef4444]' : 'text-[var(--color-on-surface)]'
        }`}
      >
        {formatTime(remaining)}
      </span>
    </div>
  );
}
