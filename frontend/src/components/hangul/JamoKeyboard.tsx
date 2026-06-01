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
    const bg = type === 'consonant' ? '#FFD600' : '#00E5FF';
    
    return (
      <motion.button
        key={jamo}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(e) => onJamoClick(jamo, e as any)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, y: 2, boxShadow: '2px 2px 0px #0f0f0f' }}
        style={{
          background: bg,
          border: '3px solid #0f0f0f',
          borderRadius: '12px',
          width: '56px',
          height: '64px',
          fontSize: '28px',
          fontWeight: 900,
          color: '#0f0f0f',
          boxShadow: '4px 4px 0px #0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        {jamo}
      </motion.button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', color: '#0f0f0f' }}>Consonants (자음)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {basicConsonants.map(c => renderKey(c, 'consonant'))}
          <div style={{ width: '100%', height: '4px' }} />
          {doubleConsonants.map(c => renderKey(c, 'consonant'))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', color: '#0f0f0f' }}>Vowels (모음)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {basicVowels.map(v => renderKey(v, 'vowel'))}
          <div style={{ width: '100%', height: '4px' }} />
          {complexVowels.map(v => renderKey(v, 'vowel'))}
        </div>
      </div>
    </div>
  );
}
