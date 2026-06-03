"use client";

import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Lock, CheckCircle2, Play, BookOpen, RefreshCcw, Zap } from 'lucide-react';
import type { TopikModule } from '@/lib/roadmapTypes';
import { useToast } from '@/hooks/useToast';

export interface ModuleCardProps {
  module: TopikModule;
  status: 'locked' | 'active' | 'completed';
  progressPercent: number;
  levelColor: string;
  onStart: (module: TopikModule) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shimmer = {
  animate: { backgroundPosition: ['200% center', '-200% center'] },
  transition: { duration: 2.5, repeat: Infinity, ease: 'linear' as const },
};

export default function ModuleCard({ module, status, progressPercent, levelColor, onStart }: ModuleCardProps) {
  const toast = useToast();
  
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const borderColor = isLocked ? 'var(--color-outline-variant)' : isCompleted ? '#10B981' : levelColor;
  const bgColor = isLocked ? 'var(--color-surface-container-low)' : 'var(--color-surface)';

  const handleCardClick = () => {
    if (isLocked) {
      toast.info("This module is locked. Complete the previous module first.");
      return;
    }
    onStart(module);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={!isLocked ? { y: -4, boxShadow: '0 8px 24px rgba(58, 48, 42, 0.08)' } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      role={isLocked ? 'presentation' : 'button'}
      aria-disabled={isLocked}
      style={{
        position: 'relative',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: isLocked ? 'none' : '0 2px 12px rgba(58, 48, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        opacity: isCompleted ? 0.85 : 1, // Dimmed if completed
        height: '100%',
        pointerEvents: isLocked ? 'none' : 'auto', // Strictly block interactions on card
      }}
    >
      {/* Active state pulsing border effect */}
      {isActive && (
        <style>{`
          @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 var(--color-primary-container); }
            70% { box-shadow: 0 0 0 6px rgba(194,101,42,0); }
            100% { box-shadow: 0 0 0 0 rgba(194,101,42,0); }
          }
        `}</style>
      )}
      {isActive && (
        <div style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: '16px',
          border: '1px solid transparent',
          animation: 'pulse-border 2s infinite',
          pointerEvents: 'none'
        }} />
      )}

      {/* Lock overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            title={module.prerequisite ? `Complete ${module.prerequisite.replace(/^[a-z0-9]+_/, '').replace('_', ' ')} to unlock` : "Locked module"}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(250, 245, 238, 0.5)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 10,
              pointerEvents: 'auto', // Catch clicks to show toast
            }}
            onClick={(e) => {
              e.stopPropagation();
              toast.info("This module is locked");
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(58, 48, 42, 0.05)',
              }}
            >
              <Lock size={18} color="var(--color-on-surface-variant)" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px', lineHeight: 1 }}>{module.icon}</span>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '14px',
                color: 'var(--color-on-surface)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {module.title}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '11px',
                color: 'var(--color-on-surface-variant)',
                margin: '2px 0 0',
                textTransform: 'capitalize',
              }}
            >
              {module.type.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* XP badge / Completed checkmark */}
        {isCompleted ? (
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <div style={{ background: '#10B981', borderRadius: '50%', padding: '4px', border: '2px solid var(--color-surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CheckCircle2 size={16} className="text-white" />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              background: 'var(--color-surface-container)',
              border: `1px solid var(--color-outline-variant)`,
              borderRadius: '6px',
              padding: '3px 8px',
              flexShrink: 0,
            }}
          >
            <Zap size={11} color="var(--color-primary)" />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '11px',
                color: 'var(--color-primary)',
              }}
            >
              {module.xp} XP
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          fontSize: '12px',
          color: 'var(--color-on-surface-variant)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {module.description}
      </p>

      {/* Bottom Actions section */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* CTA Button */}
        <button
          disabled={isLocked}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 0',
            borderRadius: '12px',
            border: 'none',
            background: isLocked ? 'var(--color-surface-container-high)' : isCompleted ? '#e8f5e9' : 'var(--color-primary)',
            color: isLocked ? 'var(--color-on-surface-variant)' : isCompleted ? '#2e7d32' : 'white',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            boxShadow: isLocked || isCompleted ? 'none' : '0 4px 12px rgba(194,101,42,0.25)',
            width: '100%',
          }}
        >
          {isLocked ? (
            'Locked'
          ) : isCompleted ? (
            <>
              <RefreshCcw size={14} />
              Review →
            </>
          ) : (
            <>
              <Play size={14} />
              시작하기
            </>
          )}
        </button>

        {/* Progress bar for active */}
        {isActive && progressPercent > 0 && (
          <div
            style={{
              background: 'var(--color-surface-container-high)',
              borderRadius: '999px',
              height: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: levelColor,
                borderRadius: '999px',
              }}
            />
          </div>
        )}

      </div>
    </motion.div>
  );
}
