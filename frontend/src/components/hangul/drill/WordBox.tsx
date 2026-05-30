'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { DrillWord } from '@/data/drillWords';
import { DrillPhase } from '@/hooks/usePronunciationDrill';

interface WordBoxProps {
  word: DrillWord;
  phase: DrillPhase;
  attempts: number;
}

export default function WordBox({ word, phase, attempts }: WordBoxProps) {
  const [showHint, setShowHint] = useState(true);
  const controls = useAnimation();
  const wordControls = useAnimation();
  const overlayControls = useAnimation();

  useEffect(() => {
    if (phase === 'correct') {
      // Step 1: Border flash
      controls.start({
        borderColor: '#00C853',
        boxShadow: '6px 6px 0px #00C853',
        transition: { duration: 0.15, ease: 'easeOut' }
      });
      // Step 2: Fill sweep
      overlayControls.start({
        scaleX: [0, 1],
        backgroundColor: 'rgba(0, 200, 83, 0.2)',
        transition: { duration: 0.3, ease: 'easeOut' }
      });
      // Word pop
      wordControls.start({
        scale: [1, 1.08, 1],
        transition: { type: 'spring', stiffness: 400, damping: 15 }
      });
    } else if (phase === 'wrong') {
      controls.start({
        borderColor: '#FF4B4B',
        boxShadow: '6px 6px 0px #FF4B4B',
        x: [0, -12, 12, -10, 10, -6, 6, -3, 3, 0],
        transition: { duration: 0.5, ease: 'linear' }
      });
      overlayControls.start({
        scaleX: 1,
        backgroundColor: ['rgba(255, 75, 75, 0)', 'rgba(255, 75, 75, 0.15)', 'rgba(255, 75, 75, 0)'],
        transition: { duration: 0.4 }
      });
      // Reset after 0.6s
      setTimeout(() => {
        if (phase === 'wrong') {
          controls.start({
            borderColor: '#0f0f0f',
            boxShadow: '6px 6px 0px #0f0f0f',
            x: 0,
            transition: { duration: 0.2 }
          });
        }
      }, 600);
    } else if (phase === 'skipped') {
      controls.start({
        borderColor: '#B71C1C',
        boxShadow: '6px 6px 0px #B71C1C',
        backgroundColor: '#fee2e2',
        transition: { duration: 0.2 }
      });
    } else if (phase === 'ready') {
      // Reset
      controls.start({
        borderColor: '#0f0f0f',
        boxShadow: '6px 6px 0px #0f0f0f',
        backgroundColor: '#ffffff',
        transition: { duration: 0.2 }
      });
      overlayControls.start({ scaleX: 0, backgroundColor: 'rgba(0,0,0,0)' });
    }
  }, [phase, controls, overlayControls, wordControls]);

  // Confetti particles
  const confetti = Array.from({ length: 12 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 12;
    const distance = 60 + Math.random() * 60;
    const colors = ['#FFD600', '#00C853', '#00E5FF'];
    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
        animate={phase === 'correct' ? {
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          backgroundColor: colors[i % 3],
          zIndex: 10
        }}
      />
    );
  });

  return (
    <motion.div
      animate={controls}
      initial={{ borderColor: '#0f0f0f', boxShadow: '6px 6px 0px #0f0f0f', backgroundColor: '#ffffff', x: 0 }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        minHeight: '280px',
        border: '3px solid #0f0f0f',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}
    >
      <motion.div
        animate={overlayControls}
        initial={{ scaleX: 0, originX: 0 }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      
      {phase === 'correct' && confetti}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AnimatePresence>
          {phase === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{ position: 'absolute', top: -30, right: -40, color: '#00C853', fontSize: '48px', fontWeight: 900 }}
            >
              ✓
            </motion.div>
          )}
          {phase === 'skipped' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{ position: 'absolute', top: -30, right: -40, color: '#B71C1C', fontSize: '48px', fontWeight: 900 }}
            >
              ✗
            </motion.div>
          )}
        </AnimatePresence>

        <motion.span
          animate={wordControls}
          style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, fontFamily: '"Noto Sans KR", sans-serif', color: '#0f0f0f', lineHeight: 1.2 }}
        >
          {word.korean}
        </motion.span>

        <div style={{ marginTop: '8px', cursor: 'pointer' }} onClick={() => setShowHint(!showHint)}>
          {showHint ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#6b7280', letterSpacing: '1px' }}>
                {word.romanization}
              </span>
              <span style={{ fontSize: '18px', fontStyle: 'italic', color: '#374151', marginTop: '4px' }}>
                {word.meaning}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', textDecoration: 'underline' }}>Show hint</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                scale: attempts === i + 1 && phase === 'wrong' ? [1, 1.4, 1] : 1,
                backgroundColor: attempts > i || phase === 'skipped' ? '#FF4B4B' : '#e5e7eb'
              }}
              transition={{ duration: 0.3 }}
              style={{ width: '12px', height: '12px', borderRadius: '50%' }}
            />
          ))}
        </div>
        
        <AnimatePresence>
          {phase === 'skipped' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '16px', fontWeight: 900, color: '#B71C1C', fontSize: '18px' }}
            >
              Skipped — we'll revisit this!
            </motion.div>
          )}
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ marginTop: '16px', fontWeight: 700, color: '#9ca3af', fontSize: '14px' }}
            >
              Tap mic to speak
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
