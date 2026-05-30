'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrillWord } from '@/data/drillWords';
import { DrillPhase } from '@/hooks/usePronunciationDrill';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface AttemptFeedbackProps {
  phase: DrillPhase;
  attempts: number;
  word: DrillWord;
  heardText: string;
}

export default function AttemptFeedback({ phase, attempts, word, heardText }: AttemptFeedbackProps) {
  const { speak } = useSpeechSynthesis();
  const isVisible = phase === 'correct' || phase === 'wrong' || phase === 'skipped';

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '0', right: '0', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 100, padding: '0 16px' }}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{
              pointerEvents: 'auto',
              width: '100%',
              maxWidth: '500px',
              border: '3px solid #0f0f0f',
              borderRadius: '16px',
              boxShadow: '6px 6px 0px #0f0f0f',
              padding: '20px',
              backgroundColor: phase === 'correct' ? '#00C853' : phase === 'skipped' ? '#B71C1C' : '#FF4B4B',
              color: phase === 'correct' ? '#0f0f0f' : '#ffffff',
            }}
          >
            {phase === 'correct' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>✓ 완벽해요!</p>
                <p style={{ fontWeight: 700, fontSize: '16px', marginTop: '8px', opacity: 0.9 }}>You said: "{heardText}"</p>
              </div>
            )}

            {phase === 'wrong' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>✗ 다시!</p>
                <p style={{ fontWeight: 700, fontSize: '16px', marginTop: '8px', opacity: 0.9 }}>
                  You said: <strong style={{ textDecoration: 'underline' }}>{heardText || '(Nothing)'}</strong>
                </p>
                {attempts === 2 && word.pronunciationTip && (
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: 900 }}>
                    💡 {word.pronunciationTip}
                  </div>
                )}
              </div>
            )}

            {phase === 'skipped' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>✗ 건너뜁니다</p>
                  <p style={{ fontWeight: 700, fontSize: '16px', marginTop: '4px', opacity: 0.9 }}>Correct: {word.korean}</p>
                </div>
                <button
                  onClick={() => speak(word.korean)}
                  style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#B71C1C', border: '2px solid #0f0f0f', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', boxShadow: '2px 2px 0px #0f0f0f' }}
                >
                  🔊 Hear it
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
