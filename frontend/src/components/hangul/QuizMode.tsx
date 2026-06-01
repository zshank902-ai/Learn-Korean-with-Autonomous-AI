'use client';

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CHO_SEONG, JUNG_SEONG } from '@/lib/hangulUtils';

interface QuizModeProps {
  onMasteryUpdate: (jamo: string) => void;
  masteryData: Record<string, number>;
  onCheckCompletion: () => void;
  lastClickedJamo: string | null;
}

const CATEGORIES = {
  'Basic Consonants': ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
  'Basic Vowels': ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'],
  'Double Consonants': ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'],
  'Complex Vowels': ['ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'],
};

const ROMANIZATION_MAP: Record<string, string> = {
  'ㄱ': 'g/k', 'ㄴ': 'n', 'ㄷ': 'd/t', 'ㄹ': 'r/l', 'ㅁ': 'm', 'ㅂ': 'b/p', 'ㅅ': 's', 'ㅇ': 'ng (silent start)', 'ㅈ': 'j/ch', 'ㅊ': 'ch\'', 'ㅋ': 'k\'', 'ㅌ': 't\'', 'ㅍ': 'p\'', 'ㅎ': 'h',
  'ㄲ': 'kk', 'ㄸ': 'tt', 'ㅃ': 'pp', 'ㅆ': 'ss', 'ㅉ': 'jj',
  'ㅏ': 'a', 'ㅑ': 'ya', 'ㅓ': 'eo', 'ㅕ': 'yeo', 'ㅗ': 'o', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅣ': 'i',
  'ㅐ': 'ae', 'ㅒ': 'yae', 'ㅔ': 'e', 'ㅖ': 'ye', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅢ': 'ui',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function QuizMode({ onMasteryUpdate, masteryData, onCheckCompletion, lastClickedJamo }: QuizModeProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof CATEGORIES>('Basic Consonants');
  const [targetJamo, setTargetJamo] = useState<string>('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // Pick a new target
  const pickNextTarget = () => {
    const pool = CATEGORIES[activeTab];
    const next = pool[Math.floor(Math.random() * pool.length)];
    setTargetJamo(next);
    
    // Auto-play audio
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(next);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pickNextTarget();
    setScore(0);
    setTotalAttempts(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Check the incoming clicked Jamo
  useEffect(() => {
    if (lastClickedJamo && feedback === 'idle') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTotalAttempts(prev => prev + 1);
      if (lastClickedJamo === targetJamo) {
        setFeedback('correct');
        setScore(prev => prev + 1);
        onMasteryUpdate(targetJamo);
        onCheckCompletion();
        setTimeout(() => {
          setFeedback('idle');
          pickNextTarget();
        }, 1000);
      } else {
        setFeedback('incorrect');
        setTimeout(() => setFeedback('idle'), 800);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastClickedJamo]);

  const speakCurrent = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(targetJamo);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

  return (
    <div style={{
      background: '#ffffff',
      border: '4px solid #0f0f0f',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '8px 8px 0px #0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      alignItems: 'center'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.keys(CATEGORIES).map(tab => (
          <button
            key={tab}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab ? '#00E5FF' : '#f3f4f6',
              border: '3px solid #0f0f0f',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: activeTab === tab ? '4px 4px 0px #0f0f0f' : '0px 0px 0px transparent',
              transform: activeTab === tab ? 'translateY(-4px)' : 'none',
              transition: 'all 0.2s',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height: '4px', background: '#0f0f0f', borderRadius: '2px' }} />

      {/* Quiz Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', color: '#0f0f0f' }}>Find the matching Jamo</h2>
        
        <motion.div
          animate={{
            scale: feedback === 'correct' ? [1, 1.2, 1] : feedback === 'incorrect' ? [1, 0.9, 1.1, 1] : 1,
            rotate: feedback === 'incorrect' ? [0, -5, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: '180px',
            height: '180px',
            background: feedback === 'correct' ? '#10B981' : feedback === 'incorrect' ? '#FF4B4B' : '#f3f4f6',
            border: '4px solid #0f0f0f',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 4px 0px #0f0f0f',
            cursor: 'pointer'
          }}
          onClick={speakCurrent}
        >
          {feedback === 'correct' ? (
            <span style={{ fontSize: '64px', fontWeight: 900, color: '#ffffff' }}>{targetJamo}</span>
          ) : (
            <>
              <span style={{ fontSize: '48px' }}>🔊</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#0f0f0f', marginTop: '12px' }}>
                "{ROMANIZATION_MAP[targetJamo]}"
              </span>
            </>
          )}
        </motion.div>
        <p style={{ fontWeight: 800, color: '#6b7280', fontSize: '14px' }}>Use the keyboard on the left to answer.</p>
      </div>

      {/* Stats Area */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', border: '3px solid #0f0f0f', borderRadius: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280' }}>Category Score</span>
          <span style={{ fontSize: '24px', fontWeight: 900, color: '#0f0f0f' }}>{score}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280' }}>Accuracy</span>
          <span style={{ fontSize: '24px', fontWeight: 900, color: accuracy >= 80 ? '#10B981' : '#f59e0b' }}>{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
