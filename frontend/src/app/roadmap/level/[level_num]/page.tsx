'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, GraduationCap, Play, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import ModuleGrid from '@/components/roadmap/ModuleGrid';
import type { TopikModule, TopikLevel, TopikLevelNum } from '@/lib/roadmapTypes';
import type { ComponentType } from 'react';

// Dynamic imports to prevent SSR issues
import type { ModuleViewerProps } from '@/components/roadmap/ModuleViewer';
const ModuleViewer = dynamic<ModuleViewerProps>(
  () => import('@/components/roadmap/ModuleViewer') as Promise<{ default: ComponentType<ModuleViewerProps> }>,
  { ssr: false }
);

interface MockExamRunnerProps {
  levelId: number;
  levelColor: string;
  xpEarned: number;
  onClose: () => void;
}
const MockExamRunner = dynamic<MockExamRunnerProps>(
  () => import('@/components/roadmap/MockExamRunner') as Promise<{ default: ComponentType<MockExamRunnerProps> }>,
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
          background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '2px solid #d1d5db',
        }}
      />
      <div
        style={{
          height: '180px',
          borderRadius: '24px',
          background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '4px solid #d1d5db',
        }}
      />
      <div
        style={{
          height: '300px',
          borderRadius: '24px',
          background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '4px solid #d1d5db',
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
    moduleStatuses,
    activeTopikModule,
    roadmapLoading,
    fetchRoadmap,
    fetchRoadmapProgress,
    setActiveTopikModule,
    level: userCurrentLevel, // User's active level in Zustand store
  } = useKMasteryStore();

  const [mockExam, setMockExam] = useState<{
    levelId: number;
    levelColor: string;
    xpEarned: number;
  } | null>(null);

  useEffect(() => {
    void fetchRoadmap();
    void fetchRoadmapProgress();
  }, [fetchRoadmap, fetchRoadmapProgress]);

  // Find the current level structure
  const currentLevel: TopikLevel | undefined = roadmapLevels.find(
    (l) => l.level_num === targetLevelNum
  );

  // If loading or invalid level range
  if (roadmapLoading || !currentLevel) {
    return (
      <ProtectedRoute>
        <div style={{ minHeight: '100vh', background: '#EEF2FF', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <LoadingSkeleton />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Derive level status
  const isLevelUnlocked = (() => {
    if (targetLevelNum === 1) return true;
    // Check if the previous levels are fully completed or if any module in this level is unlocked
    const anyUnlocked = currentLevel.modules.some((m) => {
      const status = moduleStatuses[m.id];
      return status === 'available' || status === 'in_progress' || status === 'completed';
    });
    return anyUnlocked;
  })();

  if (!isLevelUnlocked) {
    // Render access denied or redirect
    return (
      <ProtectedRoute>
        <div style={{ minHeight: '100vh', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '4px solid #0f0f0f',
              borderRadius: '24px',
              padding: '40px 24px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '8px 8px 0px #0f0f0f',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#F3F4F6', border: '3px solid #0f0f0f', borderRadius: '16px', padding: '16px', boxShadow: '3px 3px 0px #0f0f0f' }}>
                <Lock size={44} color="#6B7280" />
              </div>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f0f0f', margin: '0 0 10px' }}>Level Locked</h2>
            <p style={{ fontSize: '15px', color: '#4b5563', margin: '0 0 24px', lineHeight: 1.5 }}>
              Please complete all prerequisite modules in the previous levels before accessing TOPIK Level {targetLevelNum}.
            </p>
            <Link href="/roadmap" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#818CF8',
                  color: '#0f0f0f',
                  border: '3px solid #0f0f0f',
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontWeight: 900,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  boxShadow: '3px 3px 0px #0f0f0f',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back to Roadmap
              </div>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Derive level completion status
  const isCompleted = currentLevel.modules.every((m) => moduleStatuses[m.id] === 'completed');
  const isLvlActive = targetLevelNum === userCurrentLevel;

  const completedCount = currentLevel.modules.filter((m) => moduleStatuses[m.id] === 'completed').length;
  const progressPercent = (completedCount / currentLevel.modules.length) * 100;

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

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#EEF2FF', padding: '32px 20px 80px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top Bar Navigation */}
          <div>
            <Link href="/roadmap" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: -4 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '3px solid #0f0f0f',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontWeight: 900,
                  fontSize: '13px',
                  color: '#0f0f0f',
                  textTransform: 'uppercase',
                  boxShadow: '3px 3px 0px #0f0f0f',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back to Roadmap
              </motion.div>
            </Link>
          </div>

          {/* Level Header Card */}
          <div
            style={{
              background: '#ffffff',
              border: '4px solid #0f0f0f',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '8px 8px 0px #0f0f0f',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted ? '#D1FAE5' : '#FEF3C7',
                  border: '4px solid #0f0f0f',
                  boxShadow: '4px 4px 0px #0f0f0f',
                  flexShrink: 0,
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={32} className="text-[#059669]" />
                ) : (
                  <GraduationCap size={32} className="text-[#B45309]" />
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em' }}>
                  {currentLevel.title}
                </h1>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#4b5563', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentLevel.subtitle}
                </p>
              </div>

              {/* Progress Summary */}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f0f0f', background: currentLevel.color + '30', border: `2.5px solid #0f0f0f`, borderRadius: '10px', padding: '6px 12px', boxShadow: '2px 2px 0px #0f0f0f' }}>
                  {completedCount} / {currentLevel.modules.length} Mastered
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
                <span>Level Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div style={{ background: '#e5e7eb', border: '2.5px solid #0f0f0f', borderRadius: '999px', height: '18px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: currentLevel.color,
                    width: `${progressPercent}%`,
                    transition: 'width 0.5s ease-out',
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                background: '#F9FAFB',
                border: '2.5px solid #0f0f0f',
                borderRadius: '16px',
                padding: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Vocab</span>
                <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 900, color: '#0f0f0f' }}>{currentLevel.target_vocab} Words</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam Format</span>
                <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 900, color: '#0f0f0f' }}>{currentLevel.exam_type}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pass Score</span>
                <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 900, color: '#0f0f0f' }}>{currentLevel.pass_score} / {currentLevel.max_score} pts</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP Completion Reward</span>
                <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 900, color: '#0f0f0f' }}>{currentLevel.xp_reward} XP</p>
              </div>
            </div>

            {/* TOPIK Exam Buttons */}
            {isLvlActive && targetLevelNum <= 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
                  TOPIK-I Practice
                </p>
                <button
                  onClick={() => router.push('/exam/topik-i?practice=listening')}
                  style={{ background: '#EEF2FF', color: '#1E1B4B', border: '3px solid #0f0f0f', borderRadius: '14px', padding: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '3px 3px 0px #0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }}
                >
                  🎧 Practice Listening (30 Q)
                </button>
                <button
                  onClick={() => router.push('/exam/topik-i?practice=reading')}
                  style={{ background: '#FEF3C7', color: '#1E1B4B', border: '3px solid #0f0f0f', borderRadius: '14px', padding: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '3px 3px 0px #0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }}
                >
                  📖 Practice Reading (40 Q)
                </button>
                <button
                  onClick={() => router.push('/exam/topik-i?mode=full')}
                  style={{ background: '#4F46E5', color: '#ffffff', border: '3px solid #0f0f0f', borderRadius: '14px', padding: '14px', fontWeight: 900, fontSize: '14px', cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }}
                >
                  📋 Full Mock Exam (70 Q · 100 min)
                </button>
              </div>
            )}
            {isLvlActive && targetLevelNum >= 3 && (
              <button
                onClick={() => router.push(`/exam/topik-ii?targetLevel=${targetLevelNum}`)}
                style={{ background: '#1E1B4B', color: '#ffffff', border: '4px solid #0f0f0f', borderRadius: '16px', padding: '16px', fontWeight: 900, fontSize: '14px', cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', width: '100%' }}
              >
                📝 Full Mock Exam (104 Q · 180 min)
              </button>
            )}
          </div>

          {/* Curriculum Modules Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f0f0f', margin: 0 }}>
              Curriculum Modules
            </h2>
            <ModuleGrid
              modules={currentLevel.modules}
              moduleStatuses={moduleStatuses}
              levelColor={currentLevel.color}
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
                background: 'rgba(0,0,0,0.45)',
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
              />
            </motion.div>
          )}
        </AnimatePresence>

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
