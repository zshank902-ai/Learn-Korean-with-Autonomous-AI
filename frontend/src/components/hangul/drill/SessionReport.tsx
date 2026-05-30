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
  let badgeColor = "#FF4B4B";
  if (accuracy >= 90) {
    badgeText = "완벽! 🏆";
    badgeColor = "#FFD600";
  } else if (accuracy >= 70) {
    badgeText = "잘했어요! ⭐";
    badgeColor = "#00E5FF";
  } else if (accuracy >= 50) {
    badgeText = "괜찮아요 💪";
    badgeColor = "#ffffff";
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
      style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '32px' }}
    >
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Session Complete</h2>
        
        <div style={{ padding: '16px 32px', backgroundColor: badgeColor, border: '4px solid #0f0f0f', borderRadius: '16px', boxShadow: '8px 8px 0px #0f0f0f', marginBottom: '32px' }}>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#0f0f0f' }}>{badgeText}</span>
        </div>

        <div style={{ fontSize: '6rem', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', color: '#0f0f0f', lineHeight: 1 }}>
          {correctCount}<span style={{ color: '#9ca3af', fontSize: '4rem' }}>/{total}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#00C853' }}>{accuracy}%</p>
            <p style={{ margin: 0, fontWeight: 700, color: '#6b7280' }}>Accuracy</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#FFD600' }}>+{state.sessionXP}</p>
            <p style={{ margin: 0, fontWeight: 700, color: '#6b7280' }}>XP Earned</p>
          </div>
        </div>

        {isSaved && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#00C853', fontWeight: 900, marginTop: '16px' }}>
            ✓ Progress saved
          </motion.p>
        )}
      </div>

      {/* WEAK WORDS */}
      {weakWords.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', color: '#FF4B4B' }}>연습이 필요해요 — Needs Practice</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {weakWords.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ backgroundColor: '#FAFAFA', border: '3px solid #0f0f0f', borderRadius: '16px', padding: '24px', boxShadow: '4px 4px 0px #0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <span style={{ fontSize: '32px', fontWeight: 900 }}>{r.word.korean}</span>
                <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#6b7280', margin: '8px 0 16px' }}>{r.word.meaning}</span>
                <button
                  onClick={() => speak(r.word.korean)}
                  style={{ padding: '8px 16px', backgroundColor: '#00E5FF', border: '2px solid #0f0f0f', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #0f0f0f' }}
                >
                  🔊 Hear
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FULL BREAKDOWN */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px' }}>Full Breakdown</h3>
        <div style={{ border: '3px solid #0f0f0f', borderRadius: '16px', overflow: 'hidden' }}>
          {state.results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '16px 24px', borderBottom: i < state.results.length - 1 ? '2px solid #e5e7eb' : 'none', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 900, fontSize: '18px' }}>{r.word.korean}</span>
              <span style={{ color: '#6b7280' }}>"{r.heard || '-'}"</span>
              <span style={{ fontWeight: 900, color: r.correct ? '#00C853' : '#FF4B4B' }}>{r.correct ? '✓ Correct' : '✗ Skipped'}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map(dot => (
                  <div key={dot} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dot < r.attemptsUsed ? (r.correct && dot === r.attemptsUsed - 1 ? '#00C853' : '#FF4B4B') : '#e5e7eb' }} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ y: -2, boxShadow: '6px 6px 0px #0f0f0f' }}
          whileTap={{ y: 2, boxShadow: '0px 0px 0px #0f0f0f' }}
          onClick={onDrillAgain}
          style={{ padding: '16px 32px', backgroundColor: '#FFD600', border: '3px solid #0f0f0f', borderRadius: '16px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f' }}
        >
          다시 하기 — Drill Again
        </motion.button>
        
        {weakWords.length > 0 && (
          <motion.button
            whileHover={{ y: -2, boxShadow: '6px 6px 0px #0f0f0f' }}
            whileTap={{ y: 2, boxShadow: '0px 0px 0px #0f0f0f' }}
            onClick={onReDrillWeak}
            style={{ padding: '16px 32px', backgroundColor: '#FF4B4B', color: '#ffffff', border: '3px solid #0f0f0f', borderRadius: '16px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f' }}
          >
            약한 단어 연습 — Re-drill Weak Words
          </motion.button>
        )}

        <motion.button
          whileHover={{ y: -2, boxShadow: '6px 6px 0px #0f0f0f' }}
          whileTap={{ y: 2, boxShadow: '0px 0px 0px #0f0f0f' }}
          onClick={onBackToPlayground}
          style={{ padding: '16px 32px', backgroundColor: '#ffffff', border: '3px solid #0f0f0f', borderRadius: '16px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f' }}
        >
          홈으로 — Back to Playground
        </motion.button>
      </div>
    </motion.div>
  );
}
