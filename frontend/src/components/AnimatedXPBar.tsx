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
    <div className="w-full space-y-1" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-[#4F46E5]" style={{ fontFamily: 'Fredoka, cursive' }}>
          Lv.{level}
        </span>
        <span className="text-xs font-bold text-[#1E1B4B]/50">
          {xpInLevel.toLocaleString()} / 5,000 XP
        </span>
      </div>
      {/* Bar track */}
      <div
        className="h-4 w-full rounded-full border-3 border-[#1E1B4B] overflow-hidden"
        style={{ background: '#C7D2FE', border: '3px solid #1E1B4B', boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #F97316, #FBBF24)',
            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15), inset 2px 2px 4px rgba(255,255,255,0.4)',
          }}
        />
      </div>
    </div>
  );
}
