'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Lock, CheckCircle2, GraduationCap, Play, ArrowLeft } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useTopikProgress } from '@/hooks/useTopikProgress';

import ModuleGrid from '@/components/roadmap/ModuleGrid';
import LevelTabs from '@/components/roadmap/LevelTabs';
import CompletionModal from '@/components/roadmap/CompletionModal';

import type { TopikModule, TopikLevel, TopikLevelNum } from '@/lib/roadmapTypes';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ComponentType } from 'react';

const ModuleViewer = dynamic<import('@/components/roadmap/ModuleViewer').ModuleViewerProps>(
  () => import('@/components/roadmap/ModuleViewer').then(m => m.default),
  { ssr: false }
);

interface MockExamRunnerProps {
  levelId: number;
  levelColor: string;
  xpEarned: number;
  onClose: () => void;
}
const MockExamRunner = dynamic<MockExamRunnerProps>(
  () => import('@/components/roadmap/MockExamRunner').then(m => m.default),
  { ssr: false }
);

// ── Loading Skeleton ───────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div
        style={{
          width: '180px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container) 50%, var(--color-surface-container-low) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '1px solid var(--color-outline-variant)',
        }}
      />
      <div
        style={{
          height: '180px',
          borderRadius: '24px',
          background: 'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container) 50%, var(--color-surface-container-low) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '1px solid var(--color-outline-variant)',
        }}
      />
      <div
        style={{
          height: '300px',
          borderRadius: '24px',
          background: 'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container) 50%, var(--color-surface-container-low) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '1px solid var(--color-outline-variant)',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
interface LevelPageProps {
  params: Promise<{
    level_num: string;
  }>;
}

export default function LevelPage({ params }: LevelPageProps) {
  const router = useRouter();
  const { level_num } = React.use(params);
  const targetLevelNum = parseInt(level_num, 10) as TopikLevelNum;

  const {
    roadmapLevels,
    activeTopikModule,
    roadmapLoading,
    fetchRoadmap,
    setActiveTopikModule,
    level: userCurrentLevel, // User's highest unlocked level from Zustand
  } = useKMasteryStore();

  const { progressData, isLoading: progressLoading, completeModule, fetchProgress } = useTopikProgress(targetLevelNum);

  const [mockExam, setMockExam] = useState<{
    levelId: number;
    levelColor: string;
    xpEarned: number;
  } | null>(null);

  const [completionState, setCompletionState] = useState<{
    isOpen: boolean;
    type: 'module' | 'level';
    xp: number;
    nextModule?: string;
  }>({ isOpen: false, type: 'module', xp: 0 });

  useEffect(() => {
    void fetchRoadmap();
  }, [fetchRoadmap]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress, targetLevelNum]);

  const currentLevel: TopikLevel | undefined = roadmapLevels.find((l) => l.level_num === targetLevelNum);
  const isLoading = roadmapLoading || progressLoading || !currentLevel;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-transparent p-10 px-5">
          <div className="max-w-[1000px] mx-auto">
            <LoadingSkeleton />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Determine access (Level unlocked)
  const isLevelUnlocked = targetLevelNum <= userCurrentLevel;

  if (!isLevelUnlocked) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-5 relative z-10">
          <div className="sahara-card rounded-3xl p-10 max-w-md w-full text-center border border-[var(--color-outline-variant)] bg-[var(--color-surface)]">
            <div className="flex justify-center mb-5">
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-4">
                <Lock size={44} className="text-[var(--color-on-surface-variant)]" />
              </div>
            </div>
            <h2 className="font-serif font-extrabold text-[var(--color-on-surface)] drop-shadow-sm text-2xl mb-2.5">Level Locked</h2>
            <p className="font-sans font-medium text-[var(--color-on-surface-variant)] text-[15px] mb-6 leading-relaxed">
              Please complete all prerequisite modules in the previous levels before accessing TOPIK Level {targetLevelNum}.
            </p>
            <Link href="/roadmap" className="no-underline">
              <div className="sahara-btn inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-sm uppercase tracking-wider cursor-pointer">
                <ArrowLeft size={16} /> Back to Roadmap
              </div>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Derive level completion from new API
  const isLevelCompleted = progressData?.level_complete ?? false;
  const completedCount = progressData?.modules.filter((m) => m.status === 'completed').length ?? 0;
  const progressPercent = currentLevel!.modules.length > 0 
    ? (completedCount / currentLevel!.modules.length) * 100 
    : 0;

  function handleModuleSelect(module: TopikModule) {
    setActiveTopikModule(module);
  }

  function handleModuleViewerClose() {
    setActiveTopikModule(null);
  }

  function handleStartMockExam() {
    if (activeTopikModule) {
      setMockExam({
        levelId: currentLevel!.id,
        levelColor: currentLevel!.color,
        xpEarned: activeTopikModule.xp,
      });
      setActiveTopikModule(null);
    }
  }

  const handleModuleComplete = async (moduleId: string, xpAwarded: number) => {
    // Attempt completion
    const responseData = await completeModule(moduleId, xpAwarded);
    if (responseData) {
      // Look up next module for the celebration modal
      const idx = currentLevel!.modules.findIndex(m => m.id === moduleId);
      const nextModule = currentLevel!.modules[idx + 1]?.title;
      
      const isLvlComplete = responseData.level_complete || false;
      
      setCompletionState({
        isOpen: true,
        type: isLvlComplete ? 'level' : 'module',
        xp: xpAwarded,
        nextModule
      });
    }
  };

  const closeCompletionModal = () => {
    setCompletionState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ProtectedRoute>
      <div className="relative z-10 min-h-screen p-8 md:p-12 pb-24 font-sans bg-[var(--color-background)]">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          {/* Level Tabs Navigation */}
          <LevelTabs 
            currentLevel={targetLevelNum}
            highestUnlockedLevel={userCurrentLevel}
            onSelectLevel={(level) => router.push(`/roadmap/level/${level}`)}
          />

          {/* Top Bar Navigation */}
          <div>
            <Link href="/roadmap" className="no-underline">
              <motion.div
                whileHover={{ x: -4 }}
                className="sahara-btn inline-flex items-center gap-2 rounded-[14px] px-[18px] py-[10px] font-bold text-[13px] uppercase cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Roadmap
              </motion.div>
            </Link>
          </div>

          {/* Level Header Card */}
          <div className="sahara-card rounded-[24px] p-8 border border-[var(--color-outline-variant)] flex flex-col gap-6">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] shrink-0">
                {isLevelCompleted ? <CheckCircle2 size={32} className="text-[#10B981] drop-shadow-sm" /> : <GraduationCap size={32} className="text-[var(--color-primary)] drop-shadow-sm" />}
              </div>
              <div>
                <h1 className="font-serif font-extrabold text-[var(--color-on-surface)] text-[28px] m-0 tracking-tighter drop-shadow-sm">{currentLevel!.title}</h1>
                <p className="font-sans font-bold text-[var(--color-on-surface-variant)] text-[14px] mt-1 uppercase tracking-[0.05em]">{currentLevel!.subtitle}</p>
              </div>

              {/* Progress Summary */}
              <div className="ml-auto text-right">
                <span className="font-sans font-extrabold text-[var(--color-primary)] text-[13px] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-[10px] px-3 py-1.5">
                  {completedCount} / {currentLevel!.modules.length} Mastered
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="font-sans text-[var(--color-on-surface)] font-extrabold drop-shadow-sm flex justify-between text-xs tracking-wider mb-2">
                <span>PROGRESS</span>
                <span className="text-[var(--color-primary)]">{Math.round(progressPercent)}%</span>
              </div>
              <div className="bg-[var(--color-surface-container-high)] rounded-full h-3.5 overflow-hidden border border-[var(--color-outline-variant)]">
                <div className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-4 shadow-sm">
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)] text-[11px] uppercase tracking-[0.05em]">Target Vocab</span>
                <p className="font-sans font-extrabold text-[var(--color-on-surface)] drop-shadow-sm mt-1 text-base">{currentLevel!.target_vocab} Words</p>
              </div>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)] text-[11px] uppercase tracking-[0.05em]">Exam Format</span>
                <p className="font-sans font-extrabold text-[var(--color-on-surface)] drop-shadow-sm mt-1 text-base">{currentLevel!.exam_type}</p>
              </div>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)] text-[11px] uppercase tracking-[0.05em]">Pass Score</span>
                <p className="font-sans font-extrabold text-[var(--color-on-surface)] drop-shadow-sm mt-1 text-base">{currentLevel!.pass_score} / {currentLevel!.max_score} pts</p>
              </div>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)] text-[11px] uppercase tracking-[0.05em]">XP Reward</span>
                <p className="font-sans font-extrabold text-[var(--color-primary)] drop-shadow-sm mt-1 text-base">{currentLevel!.xp_reward} XP</p>
              </div>
            </div>

            {/* TOPIK Exam Buttons */}
            {targetLevelNum <= 2 && (
              <div className="flex flex-col gap-2.5">
                <p className="font-sans font-bold text-[var(--color-on-surface-variant)] m-0 text-[11px] uppercase tracking-[0.05em]">TOPIK-I Practice</p>
                <button onClick={() => router.push('/exam/topik-i?practice=listening')} className="sahara-btn transition-all hover:-translate-y-1 rounded-[14px] p-3 font-bold text-[13px] flex items-center justify-center gap-2">
                  🎧 Practice Listening (30 Q)
                </button>
                <button onClick={() => router.push('/exam/topik-i?practice=reading')} className="sahara-btn transition-all hover:-translate-y-1 rounded-[14px] p-3 font-bold text-[13px] flex items-center justify-center gap-2">
                  📖 Practice Reading (40 Q)
                </button>
                <button onClick={() => router.push('/exam/topik-i?mode=full')} className="sahara-btn-secondary bg-[var(--color-surface)] text-[var(--color-on-surface)] transition-all hover:-translate-y-1 rounded-[14px] p-3.5 font-bold text-[14px] flex items-center justify-center gap-2 border border-[var(--color-outline-variant)]">
                  📋 Full Mock Exam (70 Q · 100 min)
                </button>
              </div>
            )}
            {targetLevelNum >= 3 && (
              <button onClick={() => router.push(`/exam/topik-ii?targetLevel=${targetLevelNum}`)} className="sahara-btn-secondary bg-[var(--color-surface)] text-[var(--color-on-surface)] transition-all hover:-translate-y-1 rounded-2xl p-4 font-bold text-[14px] flex items-center justify-center gap-2 w-full border border-[var(--color-outline-variant)]">
                📝 Full Mock Exam (104 Q · 180 min)
              </button>
            )}
          </div>

          {/* Curriculum Modules Grid */}
          <div className="flex flex-col gap-4">
            <h2 className="font-serif font-extrabold text-[var(--color-on-surface)] drop-shadow-sm text-[22px] m-0">Curriculum Modules</h2>
            <ModuleGrid
              modules={currentLevel!.modules}
              progressData={progressData?.modules || []}
              levelColor={currentLevel!.color}
              onModuleSelect={handleModuleSelect}
            />
          </div>
        </div>

        {/* ModuleViewer Slide-out Overlay */}
        <AnimatePresence>
          {activeTopikModule && (
            <motion.div
              key="module-viewer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-[100] p-5"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleModuleViewerClose();
              }}
            >
              <ModuleViewer
                module={activeTopikModule}
                onClose={handleModuleViewerClose}
                onStartMockExam={handleStartMockExam}
                onComplete={handleModuleComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration Modal Overlay */}
        <CompletionModal 
          isOpen={completionState.isOpen}
          type={completionState.type}
          xpAwarded={completionState.xp}
          nextModuleName={completionState.nextModule}
          levelNum={targetLevelNum}
          onClose={closeCompletionModal}
        />

        {/* Mock Exam Overlay */}
        {mockExam && (
          <MockExamRunner
            levelId={mockExam.levelId}
            levelColor={mockExam.levelColor}
            xpEarned={mockExam.xpEarned}
            onClose={() => setMockExam(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
