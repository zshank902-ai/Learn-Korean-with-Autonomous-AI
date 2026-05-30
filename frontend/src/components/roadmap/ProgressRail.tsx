'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { TopikLevel, TopikLevelNum, ModuleStatus } from '@/lib/roadmapTypes';

interface ProgressRailProps {
  levels: TopikLevel[];
  moduleStatuses: Record<string, ModuleStatus>;
  activeLevel: TopikLevelNum;
  onSelectLevel: (n: TopikLevelNum) => void;
}

function getLevelCompletion(level: TopikLevel, moduleStatuses: Record<string, ModuleStatus>): number {
  if (level.modules.length === 0) return 0;
  const done = level.modules.filter((m) => moduleStatuses[m.id] === 'completed').length;
  return done / level.modules.length;
}

function isLevelLocked(level: TopikLevel, moduleStatuses: Record<string, ModuleStatus>): boolean {
  // Level 1 is never locked. Others are locked if the previous level has 0 completed modules.
  if (level.level_num === 1) return false;
  return level.modules.every((m) => moduleStatuses[m.id] === 'locked' || moduleStatuses[m.id] === undefined);
}

export default function ProgressRail({
  levels,
  moduleStatuses,
  activeLevel,
  onSelectLevel,
}: ProgressRailProps) {
  const sortedLevels = [...levels].sort((a, b) => a.level_num - b.level_num);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowX: 'auto',
      }}
    >
      {/* Track container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          minWidth: '480px',
          width: '100%',
          maxWidth: '700px',
        }}
      >
        {sortedLevels.map((level, idx) => {
          const isActive = level.level_num === activeLevel;
          const completion = getLevelCompletion(level, moduleStatuses);
          const completed = completion >= 1;
          const locked = isLevelLocked(level, moduleStatuses);
          const nextLevel = sortedLevels[idx + 1];

          const orbSize = isActive ? 56 : 44;

          return (
            <div
              key={level.id}
              style={{ display: 'flex', alignItems: 'center', flex: idx < sortedLevels.length - 1 ? 1 : 0 }}
            >
              {/* Orb */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {/* Pulsing ring for active */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: '-10px',
                      borderRadius: '50%',
                      border: `3px solid ${level.color}`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <motion.button
                  onClick={() => !locked && onSelectLevel(level.level_num)}
                  whileHover={!locked ? { scale: 1.08 } : {}}
                  whileTap={!locked ? { scale: 0.92 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  title={`Level ${level.level_num}: ${level.title}`}
                  style={{
                    width: orbSize,
                    height: orbSize,
                    borderRadius: '50%',
                    border: `3px solid ${locked ? '#9ca3af' : '#0f0f0f'}`,
                    background: locked ? '#e5e7eb' : completed ? level.color : isActive ? level.color : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    boxShadow: isActive
                      ? `0 0 0 4px ${level.color}40, 3px 3px 0px #0f0f0f`
                      : locked
                      ? 'none'
                      : '2px 2px 0px #0f0f0f',
                    transition: 'box-shadow 0.2s ease',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {completed ? (
                    <CheckCircle2 size={isActive ? 24 : 18} color="#0f0f0f" />
                  ) : (
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 900,
                        fontSize: isActive ? '18px' : '14px',
                        color: locked ? '#9ca3af' : '#0f0f0f',
                        lineHeight: 1,
                      }}
                    >
                      {level.level_num}
                    </span>
                  )}
                </motion.button>

                {/* Level label below orb */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '6px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '10px',
                    color: locked ? '#9ca3af' : isActive ? '#0f0f0f' : '#4b5563',
                  }}
                >
                  L{level.level_num}
                </div>
              </div>

              {/* Rail segment between orbs */}
              {nextLevel && (
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    margin: '0 4px',
                    border: '1.5px solid #d1d5db',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: level.color,
                      borderRadius: '3px',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
