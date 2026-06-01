"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Award, Star, ArrowRight, Zap } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  type: 'module' | 'level';
  xpAwarded: number;
  nextModuleName?: string;
  levelNum?: number;
  onClose: () => void;
}

export default function CompletionModal({ isOpen, type, xpAwarded, nextModuleName, levelNum, onClose }: CompletionModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Burst animation variants
  const particleCount = 8;
  const particles = Array.from({ length: particleCount });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
        
        {/* Celebration Particles */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {particles.map((_, i) => {
            const angle = (i * 360) / particleCount;
            const distance = 150;
            const x = Math.cos((angle * Math.PI) / 180) * distance;
            const y = Math.sin((angle * Math.PI) / 180) * distance;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={shouldReduceMotion ? {} : { 
                  x: [0, x], 
                  y: [0, y], 
                  scale: [0, 1.5, 0], 
                  opacity: [1, 1, 0] 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: ['#F97316', '#4F46E5', '#10B981', '#FBBF24'][i % 4]
                }}
              />
            );
          })}
        </div>

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white max-w-sm w-full rounded-3xl border-4 border-[#1E1B4B] p-6 sm:p-8 text-center relative z-10"
          style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
        >
          {type === 'level' ? (
            <div className="mx-auto w-24 h-24 bg-[#F59E0B] rounded-full border-4 border-[#1E1B4B] flex items-center justify-center mb-6 shadow-[4px_4px_0px_#1E1B4B]">
              <Award size={48} className="text-white" />
            </div>
          ) : (
            <div className="mx-auto w-20 h-20 bg-[#10B981] rounded-2xl border-4 border-[#1E1B4B] flex items-center justify-center mb-6 shadow-[4px_4px_0px_#1E1B4B] rotate-3">
              <Star size={40} className="text-white" />
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
            {type === 'level' ? 'Level Complete!' : 'Module Complete!'}
          </h2>
          
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border-2 border-[#CA8A04] text-[#CA8A04] px-4 py-2 rounded-xl font-black text-lg mb-6">
            <Zap size={20} /> +{xpAwarded} XP
          </div>

          {type === 'level' ? (
            <p className="text-[#1E1B4B]/70 font-bold mb-8">
              Incredible work! You have mastered TOPIK {levelNum} and unlocked the next phase of your journey.
            </p>
          ) : (
            <p className="text-[#1E1B4B]/70 font-bold mb-8">
              {nextModuleName ? `Next up: ${nextModuleName}` : "You've finished this section!"}
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-[#1E1B4B] text-white font-black uppercase tracking-widest rounded-xl hover:-translate-y-1 transition-transform border-4 border-transparent shadow-[4px_4px_0px_#4F46E5] flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
