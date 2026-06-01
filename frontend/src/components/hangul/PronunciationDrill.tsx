'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePronunciationDrill } from '@/hooks/usePronunciationDrill';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

import WordBox from './drill/WordBox';
import MicButton from './drill/MicButton';
import AttemptFeedback from './drill/AttemptFeedback';
import DrillProgress from './drill/DrillProgress';
import SessionReport from './drill/SessionReport';

interface PronunciationDrillProps {
  onBack: () => void;
}

export default function PronunciationDrill({ onBack }: PronunciationDrillProps) {
  const { 
    state, 
    startSession, 
    handleMicTap, 
    stopRecording, 
    restartSession, 
    drillWeakWords, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clearError 
  } = usePronunciationDrill();
  const { speak } = useSpeechSynthesis();

  if (state.phase === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '48px', textAlign: 'center' }}>Choose Difficulty</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '400px' }}>
          {[
            { level: 1, label: '초급 — Beginner', desc: 'Single & double syllables' },
            { level: 2, label: '중급 — Intermediate', desc: 'Common 2-3 syllable words' },
            { level: 'all', label: '전체 — All Words', desc: 'Mix of all difficulties including phrases' }
          ].map((opt) => (
            <motion.button
              key={opt.level}
              type="button"
              whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px #0f0f0f' }}
              whileTap={{ x: 4, y: 4, boxShadow: '0px 0px 0px #0f0f0f' }}
              onClick={(e) => { e.preventDefault(); startSession(opt.level as 1 | 2 | 3 | 'all'); }}
              disabled={state.isLoadingWords}
              style={{
                width: '100%', padding: '24px', backgroundColor: '#FAFAFA', border: '3px solid #0f0f0f',
                borderRadius: '16px', boxShadow: '4px 4px 0px #0f0f0f', cursor: state.isLoadingWords ? 'wait' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{opt.label}</span>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 700 }}>{opt.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (state.phase === 'complete') {
    return (
      <SessionReport
        state={state}
        onDrillAgain={restartSession}
        onReDrillWeak={drillWeakWords}
        onBackToPlayground={onBack}
      />
    );
  }

  const currentWord = state.words[state.currentIndex];

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', position: 'relative' }}>
      <DrillProgress state={state} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', overflow: 'hidden', position: 'relative' }}>
        
        <AnimatePresence mode="wait">
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ position: 'absolute', top: 24, right: 24, padding: '16px 24px', backgroundColor: '#FF4B4B', color: 'white', border: '3px solid #0f0f0f', borderRadius: '12px', boxShadow: '4px 4px 0px #0f0f0f', fontWeight: 900, zIndex: 50 }}
            >
              {state.error}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
          <AnimatePresence mode="popLayout" custom={state.currentIndex}>
            <motion.div
              key={currentWord?.id}
              initial={{ x: '120%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-120%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ width: '100%', position: 'absolute' }}
            >
              {currentWord && (
                <WordBox word={currentWord} phase={state.phase} attempts={state.attempts} />
              )}
            </motion.div>
          </AnimatePresence>
          {/* Spacer to maintain layout height while WordBox is absolutely positioned */}
          <div style={{ height: '280px', width: '100%' }} />
        </div>

        <MicButton
          phase={state.phase}
          onTap={handleMicTap}
          onRelease={stopRecording}
        />

        <motion.button
          type="button"
          whileHover={{ y: -2, boxShadow: '4px 4px 0px #0f0f0f' }}
          whileTap={{ y: 2, boxShadow: '0px 0px 0px #0f0f0f' }}
          onClick={() => currentWord && speak(currentWord.korean)}
          style={{ marginTop: '32px', padding: '12px 24px', backgroundColor: '#ffffff', border: '2px solid #0f0f0f', borderRadius: '12px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '2px 2px 0px #0f0f0f' }}
        >
          🔊 들어보기 (Listen)
        </motion.button>

        {currentWord && (
          <AttemptFeedback
            phase={state.phase}
            attempts={state.attempts}
            word={currentWord}
            heardText={state.heardText}
          />
        )}
      </div>
    </div>
  );
}
