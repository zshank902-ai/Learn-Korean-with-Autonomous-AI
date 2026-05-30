'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useKMasteryStore } from '@/store/useKMasteryStore';
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
}

interface CompleteModulePayload {
  score: number;
  user_id: number;
}

type BannerState = 'idle' | 'loading' | 'success' | 'error';

export default function ModuleViewer({ module, levelColor, onClose, onStartMockExam }: ModuleViewerProps) {
  const resolvedColor = levelColor ?? '#1E1B4B';
  const { updateModuleStatus } = useKMasteryStore();
  const [bannerState, setBannerState] = useState<BannerState>('idle');
  const [xpGained, setXpGained] = useState<number | null>(null);
  const router = useRouter();

  const handleActivityComplete = useCallback(async (score: number) => {
    setBannerState('loading');
    const payload: CompleteModulePayload = { score, user_id: 1 };
    try {
      const res = await fetch(`${API_ENDPOINTS.ROADMAP}/module/${module.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('complete failed');
      const data = await res.json() as { xpGained?: number };
      setXpGained(data.xpGained ?? 0);
      updateModuleStatus(module.id, 'completed');
      setBannerState('success');
    } catch {
      // Still mark as completed locally
      updateModuleStatus(module.id, 'completed');
      setBannerState('error');
    }
  }, [module.id, updateModuleStatus]);

  const levelNum = module.level_id ?? 1;

  const renderActivity = () => {
    switch (module.type) {
      case 'flashcard':
        return (
          <FlashcardDeck
            moduleId={module.id}
            level={levelNum}
            onComplete={handleActivityComplete}
          />
        );
      case 'grammar_drill':
        return (
          <GrammarDrillView
            moduleId={module.id}
            level={levelNum}
            onComplete={handleActivityComplete}
          />
        );
      case 'mcq':
        return (
          <MCQView
            moduleId={module.id}
            level={levelNum}
            onComplete={handleActivityComplete}
          />
        );
      case 'audio_task':
        return (
          <AudioTaskView
            moduleId={module.id}
            level={levelNum}
            onComplete={handleActivityComplete}
          />
        );
      case 'essay':
        return (
          <EssayView
            moduleId={module.id}
            level={levelNum}
            onComplete={handleActivityComplete}
          />
        );
      case 'mock_exam':
        return (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="text-6xl">📝</div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#1E1B4B] mb-2">Full Mock Exam</p>
              <p className="text-sm font-bold text-gray-500 max-w-xs">
                This is a timed full-length TOPIK exam. Make sure you have enough time before starting.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onStartMockExam}
              className="flex items-center gap-3 px-8 py-4 bg-[#6366F1] text-white rounded-2xl border-4 border-[#1E1B4B] font-black text-lg"
              style={{ boxShadow: '6px 6px 0px #1E1B4B' }}
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
              <p className="text-2xl font-black text-[#1E1B4B] mb-2">Interactive Playground</p>
              <p className="text-sm font-bold text-gray-500 max-w-xs">
                Master the Korean alphabet with interactive tools, pronunciation drills, and quizzes!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={async () => {
                // Automatically mark as complete so they can unlock the rest of the curriculum
                await handleActivityComplete(100);
                router.push('/hangul');
              }}
              className="flex items-center gap-3 px-8 py-4 bg-[#00E5FF] text-[#0f0f0f] rounded-2xl border-4 border-[#1E1B4B] font-black text-lg"
              style={{ boxShadow: '6px 6px 0px #1E1B4B' }}
            >
              <Play size={24} className="fill-[#0f0f0f]" />
              Launch Playground
            </motion.button>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-40">
            <p className="font-bold text-gray-400">Unknown module type.</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#FAFAFA] z-50 flex flex-col overflow-hidden"
        style={{ boxShadow: '-8px 0px 40px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 py-4 border-b-4 border-[#1E1B4B]"
          style={{ background: resolvedColor }}
        >
          {/* Module icon */}
          <div className="w-12 h-12 bg-white border-4 border-[#1E1B4B] rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.3)' }}
          >
            {module.icon || <BookOpen size={22} className="text-[#1E1B4B]" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-white/70 truncate">
              {module.type.replace('_', ' ')}
            </p>
            <p className="text-lg font-black text-white truncate">{module.title}</p>
          </div>

          {/* XP badge */}
          <div className="bg-white/20 border-2 border-white/40 rounded-xl px-3 py-1 text-white font-black text-sm shrink-0">
            +{module.xp} XP
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 border-2 border-white/40 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
            aria-label="Close module"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Description strip */}
        {module.description && (
          <div className="px-6 py-3 bg-white border-b-2 border-gray-200">
            <p className="text-sm font-bold text-gray-600">{module.description}</p>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderActivity()}
        </div>

        {/* Footer banners */}
        <AnimatePresence>
          {bannerState === 'loading' && (
            <motion.div
              key="loading-banner"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="px-6 py-4 bg-[#1E1B4B] border-t-4 border-[#1E1B4B] flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full shrink-0"
              />
              <span className="text-white font-bold text-sm">Saving progress…</span>
            </motion.div>
          )}

          {bannerState === 'success' && (
            <motion.div
              key="success-banner"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="px-6 py-4 bg-green-500 border-t-4 border-[#1E1B4B] flex items-center gap-3"
            >
              <CheckCircle2 size={22} className="text-white shrink-0" />
              <span className="text-white font-black text-sm">
                Module Complete!{xpGained !== null && xpGained > 0 ? ` +${xpGained} XP earned!` : ''}
              </span>
              <button
                onClick={onClose}
                className="ml-auto bg-white text-green-700 px-4 py-1.5 rounded-xl border-2 border-[#1E1B4B] font-black text-xs hover:bg-green-50 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}

          {bannerState === 'error' && (
            <motion.div
              key="error-banner"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="px-6 py-4 bg-yellow-100 border-t-4 border-yellow-400 flex items-center gap-3"
            >
              <AlertTriangle size={20} className="text-yellow-700 shrink-0" />
              <span className="text-yellow-800 font-bold text-sm">
                AI is temporarily unavailable. Progress saved locally.
              </span>
              <button
                onClick={onClose}
                className="ml-auto bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-xl border-2 border-yellow-600 font-black text-xs hover:bg-yellow-500 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
