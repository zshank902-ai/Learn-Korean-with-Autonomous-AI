'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
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
              border: isActive ? `2.5px solid #0f0f0f` : '2px solid #d1d5db',
              background: isActive ? level.color : '#ffffff',
              color: isActive ? '#0f0f0f' : '#4b5563',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isActive
                ? `3px 3px 0px #0f0f0f`
                : '1px 1px 0px #9ca3af',
              transition: 'box-shadow 0.15s ease, background 0.15s ease',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {completed && (
              <CheckCircle2
                size={14}
                style={{ color: isActive ? '#0f0f0f' : '#16a34a', flexShrink: 0 }}
              />
            )}
            <span>L{level.level_num} {level.title.split(' ').slice(-1)[0]}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
