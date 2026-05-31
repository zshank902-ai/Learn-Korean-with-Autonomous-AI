"use client";

import React from 'react';
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
    <div className="flex w-full overflow-x-auto gap-2 pb-2 mb-6 scrollbar-hide">
      {levels.map((level) => {
        const isLocked = level > highestUnlockedLevel;
        const isActive = level === currentLevel;
        const isCompleted = level < highestUnlockedLevel; // basic heuristic: if higher is unlocked, this is completed

        return (
          <button
            key={level}
            onClick={() => handleTabClick(level)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl border-3 font-black whitespace-nowrap transition-all uppercase tracking-widest text-sm
              ${isActive 
                ? 'bg-[#1E1B4B] border-[#1E1B4B] text-white shadow-[4px_4px_0px_#4F46E5] scale-105' 
                : isLocked 
                  ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-80' 
                  : 'bg-white border-[#1E1B4B] text-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B] hover:bg-[#EEF2FF]'
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
