'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrillWord } from '@/data/drillWords';
import { DrillPhase } from '@/hooks/usePronunciationDrill';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface AttemptFeedbackProps {
  phase: DrillPhase;
  attempts: number;
  word: DrillWord;
  heardText: string;
}

export default function AttemptFeedback({ phase, attempts, word, heardText }: AttemptFeedbackProps) {
  const { speak } = useSpeechSynthesis();
  const isVisible = phase === 'correct' || phase === 'wrong' || phase === 'skipped';

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-[100] px-4 font-sans">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`pointer-events-auto w-full max-w-[500px] border border-[var(--color-outline-variant)] rounded-2xl shadow-lg p-5 ${
              phase === 'correct' ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#4caf50]' : phase === 'skipped' ? 'bg-[#ffebee] text-[#c62828] border-[#ef5350]' : 'bg-[#ffebee] text-[#c62828] border-[#ef5350]'
            }`}
          >
            {phase === 'correct' && (
              <div className="text-center">
                <p className="font-black text-xl m-0">✓ 완벽해요!</p>
                <p className="font-bold text-base mt-2 opacity-90">You said: "{heardText}"</p>
              </div>
            )}

            {phase === 'wrong' && (
              <div className="text-center">
                <p className="font-black text-xl m-0">✗ 다시!</p>
                <p className="font-bold text-base mt-2 opacity-90">
                  You said: <strong className="underline decoration-2">{heardText || '(Nothing)'}</strong>
                </p>
                {attempts === 2 && word.pronunciationTip && (
                  <div className="mt-3 p-2 bg-[var(--color-surface-container)] rounded-lg text-sm font-black text-left text-[var(--color-on-surface)]">
                    💡 {word.pronunciationTip}
                  </div>
                )}
              </div>
            )}

            {phase === 'skipped' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-xl m-0">✗ 건너뜁니다</p>
                  <p className="font-bold text-base mt-1 opacity-90">Correct: {word.korean}</p>
                </div>
                <button
                  onClick={() => speak(word.korean)}
                  className="px-4 py-2 bg-[var(--color-surface)] text-[#c62828] border border-[var(--color-outline-variant)] rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  🔊 Hear it
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
