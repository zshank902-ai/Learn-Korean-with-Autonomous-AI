'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DrillState } from '@/hooks/usePronunciationDrill';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface SessionReportProps {
  state: DrillState;
  onDrillAgain: () => void;
  onReDrillWeak: () => void;
  onBackToPlayground: () => void;
}

export default function SessionReport({ state, onDrillAgain, onReDrillWeak, onBackToPlayground }: SessionReportProps) {
  const { speak } = useSpeechSynthesis();
  const [isSaved, setIsSaved] = useState(false);

  const total = state.results.length;
  const correctCount = state.results.filter(r => r.correct).length;
  const accuracy = Math.round((correctCount / total) * 100);
  
  const weakWords = state.results.filter(r => !r.correct);

  let badgeText = "다시 해봐요 🔄";
  let badgeColorClass = "bg-[#ffebee] text-[#c62828] border-[#ef5350]";
  if (accuracy >= 90) {
    badgeText = "완벽! 🏆";
    badgeColorClass = "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]";
  } else if (accuracy >= 70) {
    badgeText = "잘했어요! ⭐";
    badgeColorClass = "bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]";
  } else if (accuracy >= 50) {
    badgeText = "괜찮아요 💪";
    badgeColorClass = "bg-[var(--color-surface)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]";
  }

  useEffect(() => {
    // Mock save progress
    setTimeout(() => {
      setIsSaved(true);
    }, 1500);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full max-w-4xl mx-auto p-8 font-sans"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-2xl font-black mb-4">Session Complete</h2>
        
        <div className={`px-8 py-4 border rounded-2xl shadow-sm mb-8 ${badgeColorClass}`}>
          <span className="text-3xl font-black">{badgeText}</span>
        </div>

        <div className="text-[6rem] font-black font-sans text-[var(--color-on-surface)] leading-none">
          {correctCount}<span className="text-gray-400 text-[4rem]">/{total}</span>
        </div>
        
        <div className="flex gap-8 mt-4">
          <div className="text-center">
            <p className="m-0 font-black text-2xl text-[#10B981]">{accuracy}%</p>
            <p className="m-0 font-bold text-gray-500">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="m-0 font-black text-2xl text-[#FFD600]">+{state.sessionXP}</p>
            <p className="m-0 font-bold text-gray-500">XP Earned</p>
          </div>
        </div>

        {isSaved && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#10B981] font-black mt-4">
            ✓ Progress saved
          </motion.p>
        )}
      </div>

      {/* WEAK WORDS */}
      {weakWords.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-black mb-6 text-[#ef4444]">연습이 필요해요 — Needs Practice</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {weakWords.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm"
              >
                <span className="text-3xl font-black">{r.word.korean}</span>
                <span className="text-sm italic text-[var(--color-on-surface-variant)] my-2">{r.word.meaning}</span>
                <button
                  onClick={() => speak(r.word.korean)}
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] border border-[var(--color-outline-variant)] rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  🔊 Hear
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FULL BREAKDOWN */}
      <div className="mb-12">
        <h3 className="text-2xl font-black mb-6">Full Breakdown</h3>
        <div className="border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-sm">
          {state.results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[2fr_2fr_1fr_1fr] p-4 px-6 items-center ${i < state.results.length - 1 ? 'border-b border-[var(--color-outline-variant)]' : 'border-none'} ${i % 2 === 0 ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-container-low)]'}`}
            >
              <span className="font-black text-lg">{r.word.korean}</span>
              <span className="text-gray-500">"{r.heard || "-"}"</span>
              <span className={`font-black ${r.correct ? 'text-[#10B981]' : 'text-[#ef4444]'}`}>{r.correct ? '✓ Correct' : '✗ Skipped'}</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(dot => (
                  <div key={dot} className={`w-2.5 h-2.5 rounded-full ${dot < r.attemptsUsed ? (r.correct && dot === r.attemptsUsed - 1 ? 'bg-[#10B981]' : 'bg-[#ef4444]') : 'bg-gray-200'}`} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 justify-center flex-wrap">
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ y: 0, scale: 0.98 }}
          onClick={onDrillAgain}
          className="sahara-btn px-8 py-4 rounded-2xl font-bold text-[15px] uppercase tracking-wider cursor-pointer shadow-sm"
        >
          다시 하기 — Drill Again
        </motion.button>
        
        {weakWords.length > 0 && (
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ y: 0, scale: 0.98 }}
            onClick={onReDrillWeak}
            className="px-8 py-4 bg-[#ffebee] text-[#c62828] border border-[#ef5350] rounded-2xl font-bold text-[15px] uppercase tracking-wider cursor-pointer shadow-sm"
          >
            약한 단어 연습 — Re-drill Weak Words
          </motion.button>
        )}

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ y: 0, scale: 0.98 }}
          onClick={onBackToPlayground}
          className="px-8 py-4 bg-[var(--color-surface)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] rounded-2xl font-bold text-[15px] uppercase tracking-wider cursor-pointer shadow-sm"
        >
          홈으로 — Back to Playground
        </motion.button>
      </div>
    </motion.div>
  );
}
