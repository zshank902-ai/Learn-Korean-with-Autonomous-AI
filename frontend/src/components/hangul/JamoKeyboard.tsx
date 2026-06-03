'use client';

import React from 'react';
import { motion } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CHO_SEONG, JUNG_SEONG } from '@/lib/hangulUtils';

interface JamoKeyboardProps {
  onJamoClick: (jamo: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function JamoKeyboard({ onJamoClick }: JamoKeyboardProps) {
  // Simple subsets for the keyboard to avoid clutter
  const basicConsonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const basicVowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
  const doubleConsonants = ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];
  const complexVowels = ['ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];

  const renderKey = (jamo: string, type: 'consonant' | 'vowel') => {
    const bgClass = type === 'consonant' ? 'bg-[var(--color-secondary-container)]' : 'bg-[var(--color-primary-container)]';
    
    return (
      <motion.button
        key={jamo}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(e) => onJamoClick(jamo, e as any)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, y: 2 }}
        className={`w-14 h-16 rounded-xl border border-[var(--color-outline-variant)] ${bgClass} text-[28px] font-bold text-[var(--color-on-surface)] flex items-center justify-center cursor-pointer shadow-sm font-sans`}
      >
        {jamo}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h3 className="text-[11px] font-bold mb-3 uppercase tracking-wider text-[var(--color-on-surface)]">Consonants (자음)</h3>
        <div className="flex flex-wrap gap-3">
          {basicConsonants.map(c => renderKey(c, 'consonant'))}
          <div className="w-full h-1" />
          {doubleConsonants.map(c => renderKey(c, 'consonant'))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold mb-3 uppercase tracking-wider text-[var(--color-on-surface)]">Vowels (모음)</h3>
        <div className="flex flex-wrap gap-3">
          {basicVowels.map(v => renderKey(v, 'vowel'))}
          <div className="w-full h-1" />
          {complexVowels.map(v => renderKey(v, 'vowel'))}
        </div>
      </div>
    </div>
  );
}
