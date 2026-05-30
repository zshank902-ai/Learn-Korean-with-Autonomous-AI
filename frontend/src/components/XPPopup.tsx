"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPPopupProps {
  amount: number;
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * Principal Architect: Lightweight Animated XP Popup.
 * Provides immediate visual gratification for learning actions.
 * Fixed: removed non-existent CSS variables (cyan-vibrant, bg-background).
 */
export default function XPPopup({ amount, isVisible, onComplete }: XPPopupProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [20, -40, -60, -80],
            scale: [0.5, 1.2, 1, 0.8]
          }}
          transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
          className="fixed pointer-events-none z-[300] flex items-center gap-2 px-6 py-3 rounded-2xl border-4 border-[#1E1B4B]"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#4F46E5',
            boxShadow: '6px 6px 0px #1E1B4B',
          }}
        >
          <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center border-2 border-[#1E1B4B]">
            <Zap className="text-white" size={18} fill="currentColor" />
          </div>
          <span className="text-2xl font-black text-white" style={{ fontFamily: 'Fredoka, cursive' }}>
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
