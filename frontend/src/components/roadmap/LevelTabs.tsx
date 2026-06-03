"use client";

import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface LevelTabsProps {
  currentLevel: number;
  highestUnlockedLevel: number;
  onSelectLevel: (level: number) => void;
}

export default function LevelTabs({ currentLevel, highestUnlockedLevel, onSelectLevel }: LevelTabsProps) {
  const toast = useToast();

  const levels = [1, 2, 3, 4, 5, 6];

  const handleTabClick = (level: number) => {
    if (level > highestUnlockedLevel) {
      toast.error(`Complete TOPIK ${level - 1} first to unlock this level`);
      return;
    }
    onSelectLevel(level);
  };

  return (
    <div className="flex w-full overflow-x-auto gap-3 pb-2 mb-6 scrollbar-hide">
      {levels.map((level) => {
        const isLocked = level > highestUnlockedLevel;
        const isActive = level === currentLevel;
        const isCompleted = level < highestUnlockedLevel;

        return (
          <button
            key={level}
            onClick={() => handleTabClick(level)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl border font-bold whitespace-nowrap transition-all text-sm
              ${isActive 
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[0_2px_12px_rgba(194,101,42,0.4)] scale-105' 
                : isLocked 
                  ? 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] cursor-not-allowed opacity-70' 
                  : 'bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface)] shadow-[0_2px_4px_rgba(58,48,42,0.04)] hover:bg-[var(--color-surface-container-high)]'
              }
            `}
          >
            {isLocked && <Lock size={16} />}
            {isCompleted && !isActive && <CheckCircle2 size={16} className="text-[#10B981]" />}
            TOPIK {level}
          </button>
        );
      })}
    </div>
  );
}
