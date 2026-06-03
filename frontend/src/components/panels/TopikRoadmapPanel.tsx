'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Lock, CheckCircle2, GraduationCap, BookOpen, Headphones, FileText, ClipboardList } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import ProgressRail from '@/components/roadmap/ProgressRail';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      className="h-[240px] rounded-3xl border border-[var(--color-outline-variant)]"
      style={{
        background: 'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container) 50%, var(--color-surface-container-low) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Rail skeleton */}
      <div
        className="h-[110px] rounded-2xl border border-[var(--color-outline-variant)]"
        style={{
          background: 'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container) 50%, var(--color-surface-container-low) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }}
      />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-8">
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
    <div className="flex flex-col gap-0.5">
      <h2 className="m-0 font-serif font-extrabold text-[20px] text-[var(--color-on-surface)] tracking-tight drop-shadow-sm">
        {title}
      </h2>
      {subtitle && (
        <p className="m-0 font-sans font-medium text-[13px] text-[var(--color-on-surface-variant)]">
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  useEffect(() => {
    void fetchRoadmap();
    void fetchRoadmapProgress();
  }, [fetchRoadmap, fetchRoadmapProgress]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const color = lvl?.color ?? '#c2652a';
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
          bg: 'var(--color-surface-container)',
          border: '#10B981',
          icon: <CheckCircle2 size={28} className="text-[#10B981] drop-shadow-sm" />,
        };
      case 'active':
        return {
          bg: 'var(--color-surface)',
          border: 'var(--color-primary)',
          icon: <GraduationCap size={28} className="text-[var(--color-primary)] drop-shadow-sm" />,
        };
      case 'locked':
      default:
        return {
          bg: 'var(--color-surface-container-lowest)',
          border: 'var(--color-outline-variant)',
          icon: <Lock size={28} className="text-[var(--color-on-surface-variant)]" />,
        };
    }
  }

  const sortedLevels = [...roadmapLevels].sort((a, b) => a.level_num - b.level_num);

  return (
    <div className="px-4 py-6 pb-20 md:px-5 md:py-6 font-sans bg-transparent">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 md:gap-9">
        {/* Title / Header */}
        <div>
          <h1 className="m-0 font-extrabold text-2xl md:text-[32px] text-[var(--color-on-background)] font-serif tracking-tighter drop-shadow-sm">
            📍 TOPIK Curriculum Roadmap
          </h1>
          <p className="mt-1 md:mt-[6px] font-medium text-sm md:text-[15px] text-[var(--color-on-surface-variant)]">
            Master all 6 levels from beginner to advanced Korean with connected interactive modules
          </p>
        </div>

        {roadmapLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* 1. Progress Rail (High-level Summary) */}
            <section className="sahara-card rounded-[18px] p-4 md:p-6 border border-[var(--color-outline-variant)]">
              <SectionHeader title="Curriculum Overview" subtitle="Click any level orb to scroll smoothly to its modules" />
              <ProgressRail
                levels={roadmapLevels}
                moduleStatuses={moduleStatuses}
                activeLevel={activeTopikLevel}
                onSelectLevel={handleLevelSelect}
              />
            </section>

            {/* 2. Connected Vertical Tree Timeline */}
            <div className="relative w-full mt-8 md:mt-10 mx-auto">
              {/* Central Vertical Line Path */}
              <div
                className="hidden md:block absolute left-1/2 top-0 bottom-0 w-4 bg-[var(--color-surface-container-high)] -translate-x-1/2 rounded-full z-[1]"
              />
              {/* Inner highlight line to create a double-layered look */}
              <div
                className="hidden md:block absolute left-1/2 top-0 bottom-0 w-2 bg-[var(--color-primary)] opacity-50 -translate-x-1/2 rounded-full z-[2]"
              />

              <div className="flex flex-col gap-8 md:gap-14 relative z-10">
                {sortedLevels.map((lvl, idx) => {
                  const status = getLevelStatus(lvl);
                  const isEven = idx % 2 === 0;
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const isLvlActive = lvl.level_num === level; // matches store level

                  const style = getCardStyle(status, lvl.color);

                  return (
                    <div
                      key={lvl.id}
                      id={`level-section-${lvl.level_num}`}
                      className={`flex flex-col md:flex-row items-center justify-between w-full relative ${
                        isEven ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Level Card */}
                      <div className="w-full md:w-[46%] z-[12]">
                        <motion.div
                          whileHover={status !== 'locked' ? { y: -4 } : {}}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          className={`sahara-card rounded-3xl p-4 md:p-6 relative transition-all duration-300 border border-[var(--color-outline-variant)]`}
                          style={{
                            background: style.bg,
                            opacity: status === 'locked' ? 0.75 : 1,
                          }}
                        >
                          {/* Card Header */}
                          <div className="flex items-center gap-4 mb-5">
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] shrink-0"
                            >
                              {style.icon}
                            </div>
                            <div>
                              <h3 className="m-0 font-serif font-extrabold text-[22px] text-[var(--color-on-surface)] tracking-tight drop-shadow-sm">
                                {lvl.title}
                              </h3>
                              <p className="m-[4px_0_0] font-sans font-bold text-[12px] text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                                {lvl.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Level Details Bar inside card */}
                          {status !== 'locked' && (
                            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-3 md:p-[14px] mb-5 grid grid-cols-2 gap-2 md:gap-4">
                              <div>
                                <span className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Target Vocab</span>
                                <p className="m-0 text-[16px] font-extrabold text-[var(--color-on-surface)] drop-shadow-sm">{lvl.target_vocab} Words</p>
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Exam Type</span>
                                <p className="m-0 text-[16px] font-extrabold text-[var(--color-on-surface)] drop-shadow-sm">{lvl.exam_type}</p>
                              </div>
                            </div>
                          )}

                          {/* Module Completion Summary & CTA */}
                          {status !== 'locked' && (
                            <div className="flex flex-col gap-3.5 mt-4">
                              <div className="flex justify-between items-center">
                                <span className="font-sans text-[13px] font-extrabold text-[var(--color-on-surface)]">
                                  Modules Progress
                                </span>
                                <span className="font-sans text-[13px] font-bold text-[var(--color-primary)]">
                                  {lvl.modules.filter((m) => moduleStatuses[m.id] === 'completed').length} / {lvl.modules.length} Completed
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="h-[14px] rounded-full overflow-hidden bg-[var(--color-surface-container-high)]">
                                <div
                                  className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out rounded-full"
                                  style={{
                                    width: `${(lvl.modules.filter((m) => moduleStatuses[m.id] === 'completed').length / lvl.modules.length) * 100}%`,
                                  }}
                                />
                              </div>

                              {/* Link to Sub-page */}
                              <Link
                                href={`/roadmap/level/${lvl.level_num}`}
                                className="no-underline block mt-1.5"
                              >
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center justify-center gap-2 sahara-btn-secondary text-[var(--color-on-surface)] rounded-2xl p-3 font-extrabold text-[12px] md:text-[14px] uppercase cursor-pointer"
                                >
                                  Enter Level {lvl.level_num} Curriculum
                                </motion.div>
                              </Link>
                            </div>
                          )}

                          {status === 'locked' && (
                            <div className="mt-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-xl p-[14px] text-center text-[var(--color-on-surface-variant)] font-bold text-[13px] flex items-center justify-center gap-2">
                              <Lock size={16} /> Locked - Complete Level {lvl.level_num - 1} First
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Timeline Central Node Marker */}
                      <div
                        className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface)] z-20 items-center justify-center shadow-sm"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
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
            className="fixed inset-0 bg-black/10 backdrop-blur-[4px] flex items-center justify-center z-[100] p-5"
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
