'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DrillState } from '@/hooks/usePronunciationDrill';

interface DrillProgressProps {
  state: DrillState;
}

export default function DrillProgress({ state }: DrillProgressProps) {
  const total = state.words.length;
  const current = state.currentIndex + 1;

  return (
    <div className="w-full h-14 bg-[var(--color-on-surface)] flex items-center justify-between px-6 text-[var(--color-surface)] border-b-2 border-black font-sans">
      
      <div className={`flex items-center gap-2 flex-1 pr-6 ${total > 10 ? 'overflow-x-auto' : 'overflow-x-visible'}`}>
        {state.words.map((w, index) => {
          const isPast = index < state.currentIndex;
          const isCurrent = index === state.currentIndex;
          const result = state.results.find(r => r.word.id === w.id);
          const isCorrect = result?.correct;

          let bgClass = 'bg-gray-700'; // pending grey
          let content: React.ReactNode = index + 1;
          let borderClass = 'border-[var(--color-on-surface)]';

          if (isPast && result) {
            bgClass = isCorrect ? 'bg-[#10B981]' : 'bg-[#ef4444]';
            content = isCorrect ? '✓' : '✗';
            borderClass = 'border-white';
          } else if (isCurrent) {
            bgClass = 'bg-[#FFD600]';
            content = index + 1;
            borderClass = 'border-[#FFD600]';
          }

          return (
            <motion.div
              key={w.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
              className={`min-w-[32px] h-8 rounded-2xl flex items-center justify-center font-black text-sm border-2 flex-shrink-0 ${bgClass} ${borderClass} ${isCurrent || (isPast && result) ? 'text-[var(--color-on-surface)]' : 'text-white'}`}
            >
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -inset-1 border-2 border-[#FFD600] rounded-full"
                />
              )}
              <span className="relative z-[1]">{content}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="font-black text-base flex items-center gap-2">
          <span className="text-[#10B981]">+{state.sessionXP} XP</span>
        </div>
        <div className="font-bold text-sm text-gray-400">
          Word {Math.min(current, total)} of {total}
        </div>
      </div>
    </div>
  );
}
