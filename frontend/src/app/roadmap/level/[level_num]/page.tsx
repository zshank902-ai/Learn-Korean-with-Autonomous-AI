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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <div style={{ minHeight: '100vh', background: 'transparent', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', zIndex: 10 }}>
          <div className="sahara-card" style={{ borderRadius: '24px', padding: '40px 24px', maxWidth: '480px', width: '100%', textAlign: 'center', border: '1px solid var(--color-outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', borderRadius: '16px', padding: '16px' }}>
                <Lock size={44} className="text-[var(--color-on-surface-variant)]" />
              </div>
            </div>
            <h2 className="font-serif font-extrabold text-[var(--color-on-surface)] drop-shadow-sm" style={{ fontSize: '24px', margin: '0 0 10px' }}>Level Locked</h2>
            <p className="font-sans font-medium text-[var(--color-on-surface-variant)]" style={{ fontSize: '15px', margin: '0 0 24px', lineHeight: 1.5 }}>
              Please complete all prerequisite modules in the previous levels before accessing TOPIK Level {targetLevelNum}.
            </p>
            <Link href="/roadmap" style={{ textDecoration: 'none' }}>
              <div className="sahara-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '16px', padding: '12px 24px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer' }}>
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
      <div className="relative z-10" style={{ minHeight: '100vh', padding: '32px 20px 80px', fontFamily: 'var(--font-sans)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Level Tabs Navigation */}
          <LevelTabs 
            currentLevel={targetLevelNum}
            highestUnlockedLevel={userCurrentLevel}
            onSelectLevel={(level) => router.push(`/roadmap/level/${level}`)}
          />

          {/* Top Bar Navigation */}
          <div>
            <Link href="/roadmap" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: -4 }}
                className="sahara-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back to Roadmap
              </motion.div>
            </Link>
          </div>

          {/* Level Header Card */}
          <div className="sahara-card" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLevelCompleted ? 'var(--color-surface-container)' : '#ffffff', border: '1px solid var(--color-outline-variant)', flexShrink: 0 }}>
                {isLevelCompleted ? <CheckCircle2 size={32} className="text-[#10B981] drop-shadow-sm" /> : <GraduationCap size={32} className="text-[var(--color-primary)] drop-shadow-sm" />}
              </div>
              <div>
                <h1 className="font-serif font-extrabold text-[var(--color-on-surface)] drop-shadow-sm" style={{ fontSize: '28px', margin: 0, letterSpacing: '-0.02em' }}>{currentLevel!.title}</h1>
                <p className="font-sans font-bold text-[var(--color-on-surface-variant)]" style={{ fontSize: '14px', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentLevel!.subtitle}</p>
              </div>

              {/* Progress Summary */}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span className="font-sans font-extrabold text-[var(--color-primary)]" style={{ fontSize: '13px', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', borderRadius: '10px', padding: '6px 12px' }}>
                  {completedCount} / {currentLevel!.modules.length} Mastered
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="font-sans text-[var(--color-on-surface)] font-extrabold drop-shadow-sm" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Level Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div style={{ background: 'var(--color-surface-container-high)', borderRadius: '999px', height: '14px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progressPercent}%`, transition: 'width 0.5s ease-out' }} />
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', borderRadius: '16px', padding: '16px' }}>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)]" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Vocab</span>
                <p className="font-sans font-extrabold text-[var(--color-on-surface)] drop-shadow-sm" style={{ margin: '4px 0 0', fontSize: '16px' }}>{currentLevel!.target_vocab} Words</p>
              </div>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)]" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam Format</span>
                <p className="font-sans font-extrabold text-[var(--color-on-surface)] drop-shadow-sm" style={{ margin: '4px 0 0', fontSize: '16px' }}>{currentLevel!.exam_type}</p>
              </div>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)]" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pass Score</span>
                <p className="font-sans font-extrabold text-[var(--color-on-surface)] drop-shadow-sm" style={{ margin: '4px 0 0', fontSize: '16px' }}>{currentLevel!.pass_score} / {currentLevel!.max_score} pts</p>
              </div>
              <div>
                <span className="font-sans font-bold text-[var(--color-on-surface-variant)]" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP Completion Reward</span>
                <p className="font-sans font-extrabold text-[var(--color-primary)] drop-shadow-sm" style={{ margin: '4px 0 0', fontSize: '16px' }}>{currentLevel!.xp_reward} XP</p>
              </div>
            </div>

            {/* TOPIK Exam Buttons */}
            {targetLevelNum <= 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p className="font-sans font-bold text-[var(--color-on-surface-variant)]" style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOPIK-I Practice</p>
                <button onClick={() => router.push('/exam/topik-i?practice=listening')} className="sahara-btn transition-all hover:-translate-y-1" style={{ borderRadius: '14px', padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  🎧 Practice Listening (30 Q)
                </button>
                <button onClick={() => router.push('/exam/topik-i?practice=reading')} className="sahara-btn transition-all hover:-translate-y-1" style={{ borderRadius: '14px', padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  📖 Practice Reading (40 Q)
                </button>
                <button onClick={() => router.push('/exam/topik-i?mode=full')} className="sahara-btn-secondary text-[var(--color-on-surface)] transition-all hover:-translate-y-1" style={{ borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  📋 Full Mock Exam (70 Q · 100 min)
                </button>
              </div>
            )}
            {targetLevelNum >= 3 && (
              <button onClick={() => router.push(`/exam/topik-ii?targetLevel=${targetLevelNum}`)} className="sahara-btn-secondary text-[var(--color-on-surface)] transition-all hover:-translate-y-1" style={{ borderRadius: '16px', padding: '16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                📝 Full Mock Exam (104 Q · 180 min)
              </button>
            )}
          </div>

          {/* Curriculum Modules Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="font-serif font-extrabold text-[var(--color-on-surface)] drop-shadow-sm" style={{ fontSize: '22px', margin: 0 }}>Curriculum Modules</h2>
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
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px',
              }}
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
