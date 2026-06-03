"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAudio } from '@/hooks/useAudio';

export default function LevelUpModal() {
  const { level } = useKMasteryStore();
  const [show, setShow] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);
  const [achievedLevel, setAchievedLevel] = useState(level);
  const { playSound } = useAudio();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (level > prevLevel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAchievedLevel(level);
      setShow(true);
      setPrevLevel(level);
      playSound('levelup');
    }
  }, [level, prevLevel, playSound]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans" role="dialog" aria-modal="true" aria-labelledby="levelup-title">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={['#c2652a', '#e38d58', '#faf5ee', '#3a302a']}
          />
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShow(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            className="relative z-10 max-w-sm w-full sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-10 text-center shadow-sm"
          >
            {/* Close */}
            <button
              onClick={() => setShow(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Trophy */}
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-6 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] shadow-sm"
            >
              <Trophy className="text-[var(--color-primary)]" size={48} />
            </motion.div>

            {/* Text */}
            <div className="inline-flex items-center gap-2 bg-[var(--color-surface-container-low)] px-4 py-1 rounded-full border border-[var(--color-primary-container)] mb-4">
              <Sparkles size={14} className="text-[var(--color-primary)]" />
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">Level Up!</span>
            </div>

            <h2 id="levelup-title" className="text-5xl font-bold text-[var(--color-on-surface)] mb-2 font-serif">
              Level {achievedLevel}!
            </h2>
            <p className="text-[var(--color-on-surface-variant)] font-semibold mb-6">
              You've unlocked <span className="text-[var(--color-primary)] font-bold">TOPIK Level {achievedLevel}</span> mastery!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, type: 'spring' }}
                >
                  <Star className="text-[var(--color-primary)] fill-[var(--color-primary)]" size={28} />
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShow(false)}
              className="w-full py-4 rounded-2xl font-bold sahara-btn text-white transition-transform hover:-translate-y-1 text-lg"
            >
              Keep Learning!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
