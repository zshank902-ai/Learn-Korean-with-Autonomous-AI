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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="levelup-title">
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={['#4F46E5', '#F97316', '#16A34A', '#FBBF24', '#EF4444']}
          />
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(30, 27, 75, 0.5)' }}
            onClick={() => setShow(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            className="relative z-10 max-w-sm w-full bg-white border-4 border-[#1E1B4B] rounded-3xl p-10 text-center"
            style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
          >
            {/* Close */}
            <button
              onClick={() => setShow(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#EEF2FF] transition-colors cursor-pointer"
            >
              <X size={20} className="text-[#1E1B4B]/50" />
            </button>

            {/* Trophy */}
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-6 border-4 border-[#1E1B4B]"
              style={{ background: '#F97316', boxShadow: '6px 6px 0px #1E1B4B' }}
            >
              <Trophy className="text-white" size={48} />
            </motion.div>

            {/* Text */}
            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] px-4 py-1 rounded-full border-2 border-[#4F46E5] mb-4">
              <Sparkles size={14} className="text-[#4F46E5]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#4F46E5]">Level Up!</span>
            </div>

            <h2 id="levelup-title" className="text-5xl font-black text-[#1E1B4B] mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
              Level {achievedLevel}!
            </h2>
            <p className="text-[#1E1B4B]/60 font-semibold mb-6">
              You've unlocked <span className="text-[#4F46E5] font-black">TOPIK Level {achievedLevel}</span> mastery!
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
                  <Star className="text-[#F97316] fill-[#F97316]" size={28} />
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShow(false)}
              className="w-full py-4 rounded-2xl font-black text-xl text-white border-4 border-[#1E1B4B] cursor-pointer transition-transform hover:-translate-y-1"
              style={{ background: '#4F46E5', boxShadow: '4px 4px 0px #1E1B4B', fontFamily: 'Fredoka, cursive' }}
            >
              Keep Learning!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
