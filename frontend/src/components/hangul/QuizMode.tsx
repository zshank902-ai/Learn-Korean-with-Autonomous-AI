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
    <div className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-8 flex flex-col gap-8 items-center font-sans shadow-sm">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap justify-center">
        {Object.keys(CATEGORIES).map(tab => (
          <button
            key={tab}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 border border-[var(--color-outline-variant)] rounded-xl font-bold text-[11px] uppercase tracking-widest cursor-pointer transition-all duration-200 ${
              activeTab === tab 
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm -translate-y-1' 
                : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] translate-y-0'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-[var(--color-outline-variant)]" />

      {/* Quiz Area */}
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-lg font-black uppercase text-[var(--color-on-surface)] m-0">Find the matching Jamo</h2>
        
        <motion.div
          animate={{
            scale: feedback === 'correct' ? [1, 1.2, 1] : feedback === 'incorrect' ? [1, 0.9, 1.1, 1] : 1,
            rotate: feedback === 'incorrect' ? [0, -5, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
          className={`w-[180px] h-[180px] border border-[var(--color-outline-variant)] rounded-3xl flex flex-col items-center justify-center cursor-pointer shadow-sm ${
            feedback === 'correct' ? 'bg-[#e8f5e9] border-[#4caf50]' : feedback === 'incorrect' ? 'bg-[#ffebee] border-[#ef5350]' : 'bg-[var(--color-surface-container)]'
          }`}
          onClick={speakCurrent}
        >
          {feedback === 'correct' ? (
            <span className="text-[64px] font-black text-white">{targetJamo}</span>
          ) : (
            <>
              <span className="text-[48px]">🔊</span>
              <span className="text-[24px] font-black text-[var(--color-on-surface)] mt-3">
                "{ROMANIZATION_MAP[targetJamo]}"
              </span>
            </>
          )}
        </motion.div>
        <p className="font-extrabold text-gray-500 text-sm m-0">Use the keyboard on the left to answer.</p>
      </div>

      {/* Stats Area */}
      <div className="flex w-full justify-between p-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl shadow-sm">
        <div className="flex flex-col">
          <span className="text-[11px] font-extrabold uppercase text-gray-500">Category Score</span>
          <span className="text-[24px] font-black text-[var(--color-on-surface)]">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-extrabold uppercase text-gray-500">Accuracy</span>
          <span className={`text-[24px] font-black ${accuracy >= 80 ? 'text-[#10B981]' : 'text-amber-500'}`}>{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
