'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TopikLevel, TopikLevelNum, ModuleStatus } from '@/lib/roadmapTypes';
import { useKMasteryStore } from '@/store/useKMasteryStore';

interface LevelSelectorProps {
  levels: TopikLevel[];
  activeLevel: TopikLevelNum;
  onSelect: (n: TopikLevelNum) => void;
}

export default function LevelSelector({ levels, activeLevel, onSelect }: LevelSelectorProps) {
  const moduleStatuses = useKMasteryStore((s) => s.moduleStatuses);

  function isLevelCompleted(level: TopikLevel): boolean {
    return level.modules.length > 0 &&
      level.modules.every((m) => moduleStatuses[m.id] === 'completed');
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        padding: '4px 0',
      }}
    >
      {levels.map((level) => {
        const isActive = level.level_num === activeLevel;
        const completed = isLevelCompleted(level);

        return (
          <motion.button
            key={level.id}
            onClick={() => onSelect(level.level_num)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '999px',
              border: isActive ? `1px solid var(--color-primary)` : '1px solid var(--color-outline-variant)',
              background: isActive ? level.color : 'var(--color-surface)',
              color: isActive ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {completed && (
              <CheckCircle2
                size={14}
                style={{ color: isActive ? 'var(--color-on-surface)' : '#16a34a', flexShrink: 0 }}
              />
            )}
            <span>L{level.level_num} {level.title.split(' ').slice(-1)[0]}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
