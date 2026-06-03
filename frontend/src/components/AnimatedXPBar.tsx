"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  level: number;
}

export default function AnimatedXPBar({ currentXP, level }: XPBarProps) {
  const xpInLevel = currentXP % 5000;
  const progress = Math.min(100, Math.max(0, (xpInLevel / 5000) * 100));

  return (
    <div className="w-full space-y-1 font-sans" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-[var(--color-primary)] drop-shadow-sm font-sans">
          Lv.{level}
        </span>
        <span className="text-xs font-bold text-[var(--color-on-surface-variant)]">
          {xpInLevel.toLocaleString()} / 5,000 XP
        </span>
      </div>
      {/* Bar track */}
      <div className="h-4 w-full rounded-full overflow-hidden bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-tertiary,#e38d58)]"
        />
      </div>
    </div>
  );
}
