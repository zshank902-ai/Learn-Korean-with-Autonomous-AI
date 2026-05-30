'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, CheckCircle2, GraduationCap, BookOpen, Headphones, FileText, ClipboardList } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import ProgressRail from '@/components/roadmap/ProgressRail';
import ModuleGrid from '@/components/roadmap/ModuleGrid';
import type { TopikModule, TopikLevel, TopikLevelNum } from '@/lib/roadmapTypes';

// Phase 4 — dynamically imported to avoid SSR issues
import type { ModuleViewerProps } from '@/components/roadmap/ModuleViewer';
import type { ComponentType } from 'react';
const ModuleViewer = dynamic<ModuleViewerProps>(
  () => import('@/components/roadmap/ModuleViewer') as Promise<{ default: ComponentType<ModuleViewerProps> }>,
  { ssr: false }
);

// ── Loading Skeleton ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        height: '240px',
        borderRadius: '24px',
        background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        border: '4px solid #e5e7eb',
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Rail skeleton */}
      <div
        style={{
          height: '110px',
          borderRadius: '18px',
          background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          border: '2.5px solid #d1d5db',
        }}
      />

      {/* Grid skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
        }}
      >
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <h2
        style={{
          margin: 0,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: '20px',
          color: '#0f0f0f',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

interface TopikRoadmapPanelProps {
  onStartMockExam?: (module: TopikModule, levelColor: string) => void;
}

export function TopikRoadmapPanel({ onStartMockExam }: TopikRoadmapPanelProps) {
  const {
    roadmapLevels,
    moduleStatuses,
    activeTopikLevel,
    activeTopikModule,
    roadmapLoading,
    fetchRoadmap,
    fetchRoadmapProgress,
    setActiveTopikLevel,
    setActiveTopikModule,
    level, // User's active level in Zustand store
  } = useKMasteryStore();

  const router = useRouter();

  useEffect(() => {
    void fetchRoadmap();
    void fetchRoadmapProgress();
  }, [fetchRoadmap, fetchRoadmapProgress]);

  function handleModuleSelect(module: TopikModule) {
    setActiveTopikModule(module);
  }

  function handleModuleViewerClose() {
    setActiveTopikModule(null);
  }

  function handleLevelSelect(n: TopikLevelNum) {
    setActiveTopikLevel(n);
    const element = document.getElementById(`level-section-${n}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleStartMockExam(module: TopikModule) {
    const lvl = roadmapLevels.find((l) => l.id === module.level_id);
    const color = lvl?.color ?? '#1E1B4B';
    setActiveTopikModule(null);
    onStartMockExam?.(module, color);
  }

  function getLevelStatus(lvl: TopikLevel): 'completed' | 'active' | 'locked' {
    if (!lvl.modules || lvl.modules.length === 0) return 'locked';

    const allCompleted = lvl.modules.every((m) => moduleStatuses[m.id] === 'completed');
    if (allCompleted) return 'completed';

    // Level 1 is always active (unless completed)
    if (lvl.level_num === 1) return 'active';

    // A level is locked if the PREVIOUS level is not completely finished
    const previousLevel = roadmapLevels.find(l => l.level_num === lvl.level_num - 1);
    if (previousLevel) {
      const prevAllCompleted = previousLevel.modules.every(
        (m) => moduleStatuses[m.id] === 'completed'
      );
      if (!prevAllCompleted) return 'locked';
    }

    return 'active';
  }

  function getCardStyle(status: 'completed' | 'active' | 'locked', levelColor: string) {
    switch (status) {
      case 'completed':
        return {
          bg: '#D1FAE5',
          border: '#10B981',
          icon: <CheckCircle2 size={28} className="text-[#059669]" />,
        };
      case 'active':
        return {
          bg: '#FEF3C7',
          border: levelColor,
          icon: <GraduationCap size={28} className="text-[#B45309]" />,
        };
      case 'locked':
      default:
        return {
          bg: '#F3F4F6',
          border: '#9CA3AF',
          icon: <Lock size={28} className="text-[#6B7280]" />,
        };
    }
  }

  const sortedLevels = [...roadmapLevels].sort((a, b) => a.level_num - b.level_num);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#EEF2FF',
        padding: '24px 20px 80px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        {/* Title / Header */}
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 900,
              fontSize: '32px',
              color: '#0f0f0f',
              letterSpacing: '-0.03em',
            }}
          >
            📍 TOPIK Curriculum Roadmap
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              color: '#4b5563',
            }}
          >
            Master all 6 levels from beginner to advanced Korean with connected interactive modules
          </p>
        </div>

        {roadmapLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* 1. Progress Rail (High-level Summary) */}
            <section
              style={{
                background: '#ffffff',
                border: '2.5px solid #0f0f0f',
                borderRadius: '18px',
                padding: '16px 24px 24px',
                boxShadow: '4px 4px 0px #0f0f0f',
              }}
            >
              <SectionHeader title="Curriculum Overview" subtitle="Click any level orb to scroll smoothly to its modules" />
              <ProgressRail
                levels={roadmapLevels}
                moduleStatuses={moduleStatuses}
                activeLevel={activeTopikLevel}
                onSelectLevel={handleLevelSelect}
              />
            </section>

            {/* 2. Connected Vertical Tree Timeline */}
            <div style={{ position: 'relative', width: '100%', margin: '40px auto 0' }}>
              {/* Central Vertical Line Path */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '16px',
                  background: '#1E1B4B',
                  transform: 'translateX(-50%)',
                  borderRadius: '999px',
                  zIndex: 1,
                }}
                className="hidden md:block"
              />
              {/* Inner highlight line to create a double-layered look */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '8px',
                  background: '#818CF8',
                  opacity: 0.5,
                  transform: 'translateX(-50%)',
                  borderRadius: '999px',
                  zIndex: 2,
                }}
                className="hidden md:block"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', position: 'relative', zIndex: 10 }}>
                {sortedLevels.map((lvl, idx) => {
                  const status = getLevelStatus(lvl);
                  const isEven = idx % 2 === 0;
                  const isLvlActive = lvl.level_num === level; // matches store level

                  const style = getCardStyle(status, lvl.color);

                  return (
                    <div
                      key={lvl.id}
                      id={`level-section-${lvl.level_num}`}
                      className={`flex flex-col md:flex-row items-center justify-between w-full ${
                        isEven ? 'md:flex-row-reverse' : ''
                      }`}
                      style={{ position: 'relative' }}
                    >
                      {/* Level Card */}
                      <div className="w-full md:w-[46%]" style={{ zIndex: 12 }}>
                        <motion.div
                          whileHover={status !== 'locked' ? { y: -4, boxShadow: '8px 8px 0px #0f0f0f' } : {}}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          style={{
                            background: style.bg,
                            border: `4px solid #0f0f0f`,
                            borderRadius: '24px',
                            padding: '24px',
                            boxShadow: status === 'active' ? '12px 12px 0px #0f0f0f' : '6px 6px 0px #0f0f0f',
                            opacity: status === 'locked' ? 0.75 : 1,
                            position: 'relative',
                          }}
                        >
                          {/* Card Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#ffffff',
                                border: '4px solid #0f0f0f',
                                boxShadow: '4px 4px 0px #0f0f0f',
                                flexShrink: 0,
                              }}
                            >
                              {style.icon}
                            </div>
                            <div>
                              <h3
                                style={{
                                  margin: 0,
                                  fontFamily: 'Inter, sans-serif',
                                  fontWeight: 900,
                                  fontSize: '22px',
                                  color: '#0f0f0f',
                                  letterSpacing: '-0.02em',
                                }}
                              >
                                {lvl.title}
                              </h3>
                              <p
                                style={{
                                  margin: '4px 0 0',
                                  fontFamily: 'Inter, sans-serif',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  color: '#4b5563',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                {lvl.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Level Details Bar inside card */}
                          {status !== 'locked' && (
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.6)',
                                border: '2.5px solid #0f0f0f',
                                borderRadius: '14px',
                                padding: '14px',
                                marginBottom: '20px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '16px',
                              }}
                            >
                              <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Vocab</span>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f0f0f' }}>{lvl.target_vocab} Words</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam Type</span>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f0f0f' }}>{lvl.exam_type}</p>
                              </div>
                            </div>
                          )}

                          {/* Module Completion Summary & CTA */}
                          {status !== 'locked' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 800, color: '#0f0f0f' }}>
                                  Modules Progress
                                </span>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 900, color: '#4b5563' }}>
                                  {lvl.modules.filter((m) => moduleStatuses[m.id] === 'completed').length} / {lvl.modules.length} Completed
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div
                                style={{
                                  background: '#e5e7eb',
                                  border: '2px solid #0f0f0f',
                                  borderRadius: '999px',
                                  height: '14px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    background: lvl.color,
                                    width: `${(lvl.modules.filter((m) => moduleStatuses[m.id] === 'completed').length / lvl.modules.length) * 100}%`,
                                    transition: 'width 0.5s ease-out',
                                  }}
                                />
                              </div>

                              {/* Link to Sub-page */}
                              <Link
                                href={`/roadmap/level/${lvl.level_num}`}
                                style={{ textDecoration: 'none', display: 'block', marginTop: '6px' }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: '#ffffff',
                                    border: '3px solid #0f0f0f',
                                    borderRadius: '16px',
                                    padding: '12px',
                                    fontWeight: 900,
                                    fontSize: '14px',
                                    color: '#0f0f0f',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    boxShadow: '3px 3px 0px #0f0f0f',
                                  }}
                                >
                                  Enter Level {lvl.level_num} Curriculum
                                </motion.div>
                              </Link>
                            </div>
                          )}

                          {status === 'locked' && (
                            <div
                              style={{
                                marginTop: '16px',
                                background: '#e5e7eb',
                                border: '2px solid #9ca3af',
                                borderRadius: '12px',
                                padding: '14px',
                                textAlign: 'center',
                                color: '#6b7280',
                                fontWeight: 700,
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                              }}
                            >
                              <Lock size={16} /> Locked - Complete Level {lvl.level_num - 1} First
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Timeline Central Node Marker */}
                      <div
                        className="hidden md:flex"
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          border: '4px solid #0f0f0f',
                          background: '#ffffff',
                          zIndex: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '2px 2px 0px #0f0f0f',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: style.border,
                          }}
                        />
                      </div>

                      {/* Empty Space for Staggered Rows */}
                      <div className="hidden md:block w-[46%]" />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
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
              onStartMockExam={() => handleStartMockExam(activeTopikModule)}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
