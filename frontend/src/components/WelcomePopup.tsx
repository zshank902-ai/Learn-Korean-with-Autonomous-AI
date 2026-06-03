"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Flame, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('just_logged_in');
    if (justLoggedIn === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      sessionStorage.removeItem('just_logged_in');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[var(--color-surface)] w-full max-w-lg rounded-3xl border border-[var(--color-outline-variant)] p-8 overflow-hidden z-10 shadow-sm"
        >
          {/* Decorative shapes */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-primary-container)] rounded-full blur-2xl opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--color-tertiary-container,var(--color-primary-container))] rounded-full blur-2xl opacity-50" />

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-6 -rotate-6 shadow-sm">
              <Sparkles size={40} className="text-white" />
            </div>

            <h2 className="text-4xl font-bold text-[var(--color-on-surface)] mb-2 font-serif">
              Welcome to K-Mastery!
            </h2>
            
            <p className="text-[var(--color-on-surface-variant)] font-semibold text-lg mb-8">
              Hi {user?.nickname || user?.full_name || 'there'}! You're now inside the world's most advanced autonomous Korean learning OS.
            </p>

            <div className="grid grid-cols-1 gap-4 w-full mb-8">
              <div className="flex items-center gap-4 bg-[var(--color-surface-container)] p-4 rounded-xl border border-[var(--color-outline-variant)]">
                <Target className="text-[var(--color-primary)] shrink-0" size={24} />
                <div className="text-left">
                  <p className="font-bold text-[var(--color-on-surface)]">Master TOPIK Levels 1-6</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)] font-semibold">Adaptive curriculum tailored to you.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[var(--color-surface-container)] p-4 rounded-xl border border-[var(--color-outline-variant)]">
                <Flame className="text-[var(--color-primary)] shrink-0" size={24} />
                <div className="text-left">
                  <p className="font-bold text-[var(--color-on-surface)]">Build Your Streak</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)] font-semibold">Earn XP and climb the Global Leaderboard.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[var(--color-surface-container)] p-4 rounded-xl border border-[var(--color-outline-variant)]">
                <Zap className="text-[var(--color-primary)] shrink-0" size={24} />
                <div className="text-left">
                  <p className="font-bold text-[var(--color-on-surface)]">Zero-Latency Edge AI</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)] font-semibold">Practice speaking and chatting in real-time.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-4 sahara-btn text-white rounded-xl font-bold text-xl hover:-translate-y-1 transition-transform flex items-center justify-center gap-2"
            >
              LET'S GO! <ArrowRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
