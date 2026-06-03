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
          className="fixed pointer-events-none z-[300] flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--color-outline-variant)] font-sans"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--color-surface)',
            boxShadow: '0px 8px 24px rgba(58, 48, 42, 0.12)',
          }}
        >
          <div className="w-8 h-8 bg-[var(--color-primary-container)] rounded-lg flex items-center justify-center border border-[var(--color-outline-variant)] shadow-sm">
            <Zap className="text-[var(--color-primary)]" size={18} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold text-[var(--color-primary)] font-serif">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
