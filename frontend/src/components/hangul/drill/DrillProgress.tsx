'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DrillState } from '@/hooks/usePronunciationDrill';

interface DrillProgressProps {
  state: DrillState;
}

export default function DrillProgress({ state }: DrillProgressProps) {
  const total = state.words.length;
  const current = state.currentIndex + 1;

  return (
    <div style={{ width: '100%', height: '56px', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: '#ffffff', borderBottom: '2px solid #000' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: total > 10 ? 'auto' : 'visible', flex: 1, paddingRight: '24px' }}>
        {state.words.map((w, index) => {
          const isPast = index < state.currentIndex;
          const isCurrent = index === state.currentIndex;
          const result = state.results.find(r => r.word.id === w.id);
          const isCorrect = result?.correct;

          let bg = '#374151'; // pending grey
          let content: React.ReactNode = index + 1;
          let borderColor = '#0A0A0A';

          if (isPast && result) {
            bg = isCorrect ? '#00C853' : '#FF4B4B';
            content = isCorrect ? '✓' : '✗';
            borderColor = '#ffffff';
          } else if (isCurrent) {
            bg = '#FFD600';
            content = index + 1;
            borderColor = '#FFD600';
          }

          return (
            <motion.div
              key={w.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                backgroundColor: bg,
                borderColor: borderColor,
                color: isCurrent || (isPast && result) ? '#0f0f0f' : '#ffffff'
              }}
              transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
              style={{
                minWidth: '32px',
                height: '32px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '14px',
                border: '2px solid',
                flexShrink: 0
              }}
            >
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ position: 'absolute', inset: -4, border: '2px solid #FFD600', borderRadius: '20px' }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{content}</span>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
        <div style={{ fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00C853' }}>+{state.sessionXP} XP</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#9ca3af' }}>
          Word {Math.min(current, total)} of {total}
        </div>
      </div>
    </div>
  );
}
