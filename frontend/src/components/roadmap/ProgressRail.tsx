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
                      border: `2px solid var(--color-primary)`,
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
                    border: `1.5px solid ${locked ? 'var(--color-outline-variant)' : 'var(--color-primary)'}`,
                    background: locked ? 'var(--color-surface-container-low)' : completed ? 'var(--color-surface-container)' : isActive ? 'var(--color-surface-container)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    boxShadow: isActive
                      ? `0 0 0 4px var(--color-primary-container), 0 2px 12px rgba(58, 48, 42, 0.08)`
                      : locked
                      ? 'none'
                      : '0 2px 12px rgba(58, 48, 42, 0.04)',
                    transition: 'box-shadow 0.2s ease',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {completed ? (
                    <CheckCircle2 size={isActive ? 24 : 18} color="var(--color-primary)" />
                  ) : (
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 700,
                        fontSize: isActive ? '18px' : '14px',
                        color: locked ? 'var(--color-on-surface-variant)' : 'var(--color-primary)',
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
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '11px',
                    color: locked ? 'var(--color-on-surface-variant)' : isActive ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
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
                    height: '4px',
                    background: 'var(--color-surface-container-high)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    margin: '0 8px',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: 'var(--color-primary)',
                      borderRadius: '2px',
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
