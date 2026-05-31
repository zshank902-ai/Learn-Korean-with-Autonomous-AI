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
      setIsOpen(true);
      sessionStorage.removeItem('just_logged_in');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-[#1E1B4B]/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-3xl border-4 border-[#1E1B4B] p-8 overflow-hidden z-10"
          style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#818CF8]/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#F97316]/20 rounded-full blur-2xl" />

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 bg-[#F97316] rounded-2xl border-4 border-[#1E1B4B] flex items-center justify-center mb-6 -rotate-6"
                 style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
              <Sparkles size={40} className="text-white" />
            </div>

            <h2 className="text-4xl font-black text-[#1E1B4B] mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
              Welcome to K-Mastery!
            </h2>
            
            <p className="text-[#1E1B4B]/70 font-bold text-lg mb-8">
              Hi {user?.username || 'there'}! You're now inside the world's most advanced autonomous Korean learning OS.
            </p>

            <div className="grid grid-cols-1 gap-4 w-full mb-8">
              <div className="flex items-center gap-4 bg-[#EEF2FF] p-4 rounded-xl border-2 border-[#1E1B4B]">
                <Target className="text-[#4F46E5] shrink-0" size={24} />
                <div className="text-left">
                  <p className="font-bold text-[#1E1B4B]">Master TOPIK Levels 1-6</p>
                  <p className="text-sm text-[#1E1B4B]/60 font-semibold">Adaptive curriculum tailored to you.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#FFF7ED] p-4 rounded-xl border-2 border-[#1E1B4B]">
                <Flame className="text-[#F97316] shrink-0" size={24} />
                <div className="text-left">
                  <p className="font-bold text-[#1E1B4B]">Build Your Streak</p>
                  <p className="text-sm text-[#1E1B4B]/60 font-semibold">Earn XP and climb the Global Leaderboard.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F0FDF4] p-4 rounded-xl border-2 border-[#1E1B4B]">
                <Zap className="text-[#16A34A] shrink-0" size={24} />
                <div className="text-left">
                  <p className="font-bold text-[#1E1B4B]">Zero-Latency Edge AI</p>
                  <p className="text-sm text-[#1E1B4B]/60 font-semibold">Practice speaking and chatting in real-time.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-[#F97316] text-white rounded-xl border-4 border-[#1E1B4B] font-black text-xl hover:-translate-y-1 hover:shadow-[4px_6px_0px_#1E1B4B] active:translate-y-1 active:shadow-[0px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-2"
              style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
            >
              LET'S GO! <ArrowRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
