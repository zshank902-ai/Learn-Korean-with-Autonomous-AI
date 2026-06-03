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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: isWarning ? '#fef2f2' : 'var(--color-surface-container)',
        border: `1px solid ${isWarning ? '#ef4444' : 'var(--color-outline-variant)'}`,
        borderRadius: '16px',
        padding: '10px 16px',
        boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
        animation: isCritical ? 'pulse 1s infinite' : 'none',
        fontFamily: '"Manrope", sans-serif',
      }}
    >
      <span
        style={{
          fontSize: '14px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: isWarning ? '#ef4444' : 'var(--color-on-surface-variant)',
        }}
      >
        ⏱
      </span>
      <span
        style={{
          fontSize: '20px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: isWarning ? '#ef4444' : 'var(--color-on-surface)',
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
