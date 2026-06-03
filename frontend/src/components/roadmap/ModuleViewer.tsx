'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import type { TopikModule } from '@/lib/roadmapTypes';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const FlashcardDeck = dynamic(() => import('./FlashcardDeck'), { ssr: false });
const GrammarDrillView = dynamic(() => import('./GrammarDrillView'), { ssr: false });
const MCQView = dynamic(() => import('./MCQView'), { ssr: false });
const AudioTaskView = dynamic(() => import('./AudioTaskView'), { ssr: false });
const EssayView = dynamic(() => import('./EssayView'), { ssr: false });

export interface ModuleViewerProps {
  module: TopikModule;
  levelColor?: string;
  onClose: () => void;
  onStartMockExam?: () => void;
  onComplete?: (moduleId: string, xpAwarded: number) => Promise<void>;
}

type BannerState = 'idle' | 'loading' | 'success' | 'error';

export default function ModuleViewer({ module, levelColor, onClose, onStartMockExam, onComplete }: ModuleViewerProps) {
  const resolvedColor = levelColor ?? '#c2652a';
  const [bannerState, setBannerState] = useState<BannerState>('idle');
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleActivityComplete = useCallback(async (score: number) => {
    setBannerState('loading');
    try {
      if (onComplete) {
        // Parent will handle API call, progress refetching, and modal celebration
        await onComplete(module.id, module.xp);
      }
      setBannerState('success');
      // Auto close after brief moment to reveal the celebration modal
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setBannerState('error');
    }
  }, [module, onComplete, onClose]);

  const levelNum = module.level_id ?? 1;

  const renderActivity = () => {
    switch (module.type) {
      case 'flashcard':
        return <FlashcardDeck moduleId={module.id} level={levelNum} onComplete={handleActivityComplete} />;
      case 'grammar_drill':
        return <GrammarDrillView moduleId={module.id} level={levelNum} onComplete={handleActivityComplete} />;
      case 'mcq':
        return <MCQView moduleId={module.id} level={levelNum} onComplete={handleActivityComplete} />;
      case 'audio_task':
        return <AudioTaskView moduleId={module.id} level={levelNum} onComplete={handleActivityComplete} />;
      case 'essay':
        return <EssayView moduleId={module.id} level={levelNum} onComplete={handleActivityComplete} />;
      case 'mock_exam':
        return (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="text-6xl">📝</div>
            <div className="text-center">
              <p className="text-2xl font-serif font-extrabold text-[var(--color-on-surface)] mb-2">Full Mock Exam</p>
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)] max-w-xs">
                This is a timed full-length TOPIK exam. Make sure you have enough time before starting.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartMockExam}
              className="flex items-center gap-3 px-8 py-4 sahara-btn text-white rounded-2xl font-bold text-lg uppercase tracking-wide"
            >
              <Play size={24} className="fill-white" />
              Start Full Exam
            </motion.button>
          </div>
        );
      case 'playground':
        return (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="text-6xl">🎮</div>
            <div className="text-center">
              <p className="text-2xl font-serif font-extrabold text-[var(--color-on-surface)] mb-2">Interactive Playground</p>
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)] max-w-xs">
                Master the Korean alphabet with interactive tools, pronunciation drills, and quizzes!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                await handleActivityComplete(100);
                router.push('/hangul');
              }}
              className="flex items-center gap-3 px-8 py-4 sahara-btn-secondary text-[var(--color-primary)] rounded-2xl font-bold text-lg uppercase tracking-wide"
            >
              <Play size={24} className="fill-[var(--color-primary)] text-[var(--color-primary)]" />
              Launch Playground
            </motion.button>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-40">
            <p className="font-bold text-[var(--color-on-surface-variant)]">Unknown module type.</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/10 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[var(--color-surface)] z-50 flex flex-col overflow-hidden"
        style={{ boxShadow: '-4px 0px 24px rgba(58, 48, 42, 0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]">
          <div className="w-12 h-12 bg-[#ffffff] border border-[var(--color-outline-variant)] rounded-xl flex items-center justify-center text-2xl shrink-0">
            {module.icon || <BookOpen size={22} className="text-[var(--color-primary)]" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] truncate">{module.type.replace('_', ' ')}</p>
            <p className="text-lg font-serif font-extrabold text-[var(--color-on-surface)] truncate">{module.title}</p>
          </div>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-1 text-[var(--color-primary)] font-bold text-sm shrink-0">
            +{module.xp} XP
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-transparent border border-transparent hover:bg-[var(--color-surface-container-low)] hover:border-[var(--color-outline-variant)] rounded-xl flex items-center justify-center transition-colors shrink-0">
            <X size={20} className="text-[var(--color-on-surface-variant)]" />
          </button>
        </div>
        
        {module.description && (
          <div className="px-6 py-3 bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-outline-variant)]">
            <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">{module.description}</p>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderActivity()}
        </div>

        <AnimatePresence>
          {bannerState === 'loading' && (
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="px-6 py-4 bg-[var(--color-surface-container)] border-t border-[var(--color-outline-variant)] flex items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full shrink-0" />
              <span className="text-[var(--color-on-surface)] font-bold text-sm">Saving progress…</span>
            </motion.div>
          )}
          {bannerState === 'success' && (
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="px-6 py-4 bg-[#e8f5e9] border-t border-[#81c784] flex items-center gap-3">
              <CheckCircle2 size={22} className="text-[#2e7d32] shrink-0" />
              <span className="text-[#1b5e20] font-bold text-sm">Validating completion...</span>
            </motion.div>
          )}
          {bannerState === 'error' && (
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="px-6 py-4 bg-[#fff3e0] border-t border-[#ffb74d] flex items-center gap-3">
              <AlertTriangle size={20} className="text-[#e65100] shrink-0" />
              <span className="text-[#e65100] font-bold text-sm">Failed to save progress to server.</span>
              <button onClick={onClose} className="ml-auto sahara-btn-secondary px-4 py-1.5 rounded-xl font-bold text-xs">Close</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
