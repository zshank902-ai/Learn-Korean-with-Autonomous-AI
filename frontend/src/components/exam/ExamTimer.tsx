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
  const startRef = useRef<number>(Date.now());
  const initialRef = useRef<number>(startSeconds);
  const expiredRef = useRef(false);

  // Reset when startSeconds changes (section transition)
  useEffect(() => {
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: isWarning ? '#FEF2F2' : '#F0FDF4',
        border: `3px solid ${isWarning ? '#EF4444' : '#0f0f0f'}`,
        borderRadius: '14px',
        padding: '8px 16px',
        boxShadow: `3px 3px 0px ${isWarning ? '#EF4444' : '#0f0f0f'}`,
        animation: isCritical ? 'pulse 1s infinite' : 'none',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: isWarning ? '#EF4444' : '#059669',
        }}
      >
        ⏱
      </span>
      <span
        style={{
          fontSize: '20px',
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          color: isWarning ? '#EF4444' : '#0f0f0f',
          letterSpacing: '0.04em',
        }}
      >
        {formatTime(remaining)}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
