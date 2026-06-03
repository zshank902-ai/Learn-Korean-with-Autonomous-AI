'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { DrillWord } from '@/data/drillWords';
import { DrillPhase } from '@/hooks/usePronunciationDrill';

interface WordBoxProps {
  word: DrillWord;
  phase: DrillPhase;
  attempts: number;
}

export default function WordBox({ word, phase, attempts }: WordBoxProps) {
  const [showHint, setShowHint] = useState(true);
  const controls = useAnimation();
  const wordControls = useAnimation();
  const overlayControls = useAnimation();

  useEffect(() => {
    if (phase === 'correct') {
      // Step 1: Border flash
      controls.start({
        borderColor: '#10B981', // green
        boxShadow: 'none',
        transition: { duration: 0.15, ease: 'easeOut' }
      });
      // Step 2: Fill sweep
      overlayControls.start({
        scaleX: [0, 1],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        transition: { duration: 0.3, ease: 'easeOut' }
      });
      // Word pop
      wordControls.start({
        scale: [1, 1.08, 1],
        transition: { type: 'spring', stiffness: 400, damping: 15 }
      });
    } else if (phase === 'wrong') {
      controls.start({
        borderColor: '#ef4444', // red
        boxShadow: 'none',
        x: [0, -12, 12, -10, 10, -6, 6, -3, 3, 0],
        transition: { duration: 0.5, ease: 'linear' }
      });
      overlayControls.start({
        scaleX: 1,
        backgroundColor: ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0)'],
        transition: { duration: 0.4 }
      });
      // Reset after 0.6s
      setTimeout(() => {
        if (phase === 'wrong') {
          controls.start({
            borderColor: 'var(--color-on-surface)',
            boxShadow: 'none',
            x: 0,
            transition: { duration: 0.2 }
          });
        }
      }, 600);
    } else if (phase === 'skipped') {
      controls.start({
        borderColor: '#b91c1c',
        boxShadow: 'none',
        backgroundColor: '#fee2e2',
        transition: { duration: 0.2 }
      });
    } else if (phase === 'ready') {
      // Reset
      controls.start({
        borderColor: 'var(--color-on-surface)',
        boxShadow: 'none',
        backgroundColor: 'var(--color-surface)',
        transition: { duration: 0.2 }
      });
      overlayControls.start({ scaleX: 0, backgroundColor: 'rgba(0,0,0,0)' });
    }
  }, [phase, controls, overlayControls, wordControls]);

  // Confetti particles
  const confetti = Array.from({ length: 12 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 12;
    // eslint-disable-next-line react-hooks/purity
    const distance = 60 + Math.random() * 60;
    const colors = ['var(--color-secondary)', '#10B981', 'var(--color-primary)'];
    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
        animate={phase === 'correct' ? {
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute w-2 h-2 z-10"
        style={{ backgroundColor: colors[i % 3] }}
      />
    );
  });

  return (
    <motion.div
      animate={controls}
      initial={{ borderColor: 'var(--color-outline-variant)', boxShadow: 'none', backgroundColor: 'var(--color-surface)', x: 0 }}
      className="relative w-full max-w-[500px] min-h-[280px] border border-[var(--color-outline-variant)] rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8 shadow-sm font-sans"
    >
      <motion.div
        animate={overlayControls}
        initial={{ scaleX: 0, originX: 0 }}
        className="absolute inset-0 z-0"
      />
      
      {phase === 'correct' && confetti}

      <div className="relative z-[1] flex flex-col items-center">
        <AnimatePresence>
          {phase === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -top-8 -right-10 text-[#10B981] text-5xl font-extrabold"
            >
              ✓
            </motion.div>
          )}
          {phase === 'skipped' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -top-8 -right-10 text-[#b91c1c] text-5xl font-extrabold"
            >
              ✗
            </motion.div>
          )}
        </AnimatePresence>

        <motion.span
          animate={wordControls}
          className="text-[clamp(3rem,8vw,5rem)] font-extrabold text-[var(--color-on-surface)] leading-[1.2]"
        >
          {word.korean}
        </motion.span>

        <div className="mt-2 cursor-pointer" onClick={() => setShowHint(!showHint)}>
          {showHint ? (
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-[var(--color-on-surface-variant)] tracking-widest">
                {word.romanization}
              </span>
              <span className="text-lg italic text-[var(--color-on-surface-variant)] mt-1">
                {word.meaning}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-[var(--color-on-surface-variant)] underline">Show hint</span>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                scale: attempts === i + 1 && phase === 'wrong' ? [1, 1.4, 1] : 1,
                backgroundColor: attempts > i || phase === 'skipped' ? '#ef4444' : '#e5e7eb'
              }}
              transition={{ duration: 0.3 }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </div>
        
        <AnimatePresence>
          {phase === 'skipped' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-bold text-[#b91c1c] text-lg"
            >
              Skipped — we'll revisit this!
            </motion.div>
          )}
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-4 font-bold text-[var(--color-on-surface-variant)] text-sm"
            >
              Tap mic to speak
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
