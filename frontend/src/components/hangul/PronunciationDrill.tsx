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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 py-8">
        <h2 className="text-3xl font-extrabold font-serif mb-12 text-center text-[var(--color-on-surface)]">Choose Difficulty</h2>
        
        <div className="flex flex-col gap-6 w-full max-w-md">
          {[
            { level: 1, label: '초급 — Beginner', desc: 'Single & double syllables' },
            { level: 2, label: '중급 — Intermediate', desc: 'Common 2-3 syllable words' },
            { level: 'all', label: '전체 — All Words', desc: 'Mix of all difficulties including phrases' }
          ].map((opt) => (
            <motion.button
              key={opt.level}
              type="button"
              whileHover={{ y: -4 }}
              whileTap={{ y: 2, scale: 0.98 }}
              onClick={(e) => { e.preventDefault(); startSession(opt.level as 1 | 2 | 3 | 'all'); }}
              disabled={state.isLoadingWords}
              className={`sahara-card p-6 w-full flex flex-col items-center justify-center transition-all ${state.isLoadingWords ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-[var(--color-primary)]'}`}
            >
              <span className="text-2xl font-extrabold font-serif mb-2 text-[var(--color-on-surface)]">{opt.label}</span>
              <span className="text-sm font-bold text-[var(--color-on-surface-variant)] font-sans">{opt.desc}</span>
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
    <div className="w-full flex flex-col min-h-screen relative font-sans">
      <DrillProgress state={state} />

      <div className="flex-1 flex flex-col items-center p-6 py-12 overflow-hidden relative">
        
        <AnimatePresence mode="wait">
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 right-6 p-4 px-6 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] border border-[var(--color-error)] rounded-xl shadow-sm font-bold z-50"
            >
              {state.error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-full max-w-lg flex justify-center">
          <AnimatePresence mode="popLayout" custom={state.currentIndex}>
            <motion.div
              key={currentWord?.id}
              initial={{ x: '120%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-120%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full absolute"
            >
              {currentWord && (
                <WordBox word={currentWord} phase={state.phase} attempts={state.attempts} />
              )}
            </motion.div>
          </AnimatePresence>
          {/* Spacer to maintain layout height while WordBox is absolutely positioned */}
          <div className="h-[280px] w-full" />
        </div>

        <MicButton
          phase={state.phase}
          onTap={handleMicTap}
          onRelease={stopRecording}
        />

        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ y: 2 }}
          onClick={() => currentWord && speak(currentWord.korean)}
          className="mt-8 px-6 py-3 sahara-btn-secondary bg-[var(--color-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container)]"
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
