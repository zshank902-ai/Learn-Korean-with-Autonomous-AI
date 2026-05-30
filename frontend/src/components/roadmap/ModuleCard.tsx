'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, Play, BookOpen, RefreshCcw, Zap } from 'lucide-react';
import type { TopikModule, ModuleStatus } from '@/lib/roadmapTypes';

export interface ModuleCardProps {
  module: TopikModule;
  status: ModuleStatus;
  levelColor: string;
  onStart: (module: TopikModule) => void;
}

const shimmer = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
  },
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'linear' as const,
  },
};

export default function ModuleCard({ module, status, levelColor, onStart }: ModuleCardProps) {
  const isLocked = status === 'locked';
  const isAvailable = status === 'available';
  const isInProgress = status === 'in_progress';
  const isCompleted = status === 'completed';

  const borderColor = isLocked ? '#d1d5db' : isCompleted ? '#16a34a' : levelColor;
  const bgColor = isLocked ? '#f9fafb' : '#ffffff';

  return (
    <motion.div
      whileHover={!isLocked ? { y: -4, boxShadow: '5px 5px 0px #0f0f0f' } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      style={{
        position: 'relative',
        background: bgColor,
        border: `2.5px solid ${borderColor}`,
        borderRadius: '14px',
        padding: '20px',
        boxShadow: isLocked ? '2px 2px 0px #d1d5db' : '3px 3px 0px #0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        opacity: isLocked ? 0.75 : 1,
        height: '100%',
      }}
    >
      {/* Lock overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(240, 240, 240, 0.9)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 10,
              borderRadius: '12px',
              border: '2.5px dashed #9ca3af',
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid #374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 0px #374151',
              }}
            >
              <Lock size={18} color="#374151" />
            </div>
            
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 900,
                color: '#111827',
                textAlign: 'center',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Locked
            </p>
            
            {module.prerequisite && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#4b5563',
                  textAlign: 'center',
                  margin: 0,
                  textTransform: 'capitalize',
                }}
              >
                Prerequisite: {module.prerequisite.replace(/^[a-z0-9]+_/, '').replace('_', ' ')}
              </p>
            )}
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
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: '14px',
                color: '#0f0f0f',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {module.title}
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '11px',
                color: '#6b7280',
                margin: '2px 0 0',
                textTransform: 'capitalize',
              }}
            >
              {module.type.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* XP badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: isCompleted ? '#dcfce7' : '#fef9c3',
            border: `2px solid ${isCompleted ? '#16a34a' : '#ca8a04'}`,
            borderRadius: '6px',
            padding: '3px 8px',
            flexShrink: 0,
          }}
        >
          <Zap size={11} color={isCompleted ? '#16a34a' : '#ca8a04'} />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: '11px',
              color: isCompleted ? '#16a34a' : '#ca8a04',
            }}
          >
            {module.xp} XP
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          color: '#4b5563',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {module.description}
      </p>

      {/* Bottom Actions section pushed to the bottom of the card */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Progress bar for in_progress */}
        {isInProgress && (
          <div
            style={{
              background: '#e5e7eb',
              borderRadius: '999px',
              height: '6px',
              overflow: 'hidden',
              border: '1.5px solid #d1d5db',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: levelColor,
                borderRadius: '999px',
              }}
            />
          </div>
        )}

        {/* Completed checkmark with shimmer */}
        {isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <motion.div
              animate={shimmer.animate}
              transition={shimmer.transition}
              style={{
                background: 'linear-gradient(90deg, #16a34a 0%, #4ade80 50%, #16a34a 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" style={{ WebkitTextFillColor: 'unset' }} />
            </motion.div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                color: '#16a34a',
              }}
            >
              완료!
            </span>
          </div>
        )}

        {/* CTA Button */}
        {!isLocked && (
          <motion.button
            onClick={() => onStart(module)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 0',
              borderRadius: '8px',
              border: '2px solid #0f0f0f',
              background: isCompleted ? '#dcfce7' : isInProgress ? levelColor : levelColor,
              color: '#0f0f0f',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #0f0f0f',
              width: '100%',
            }}
          >
            {isCompleted ? (
              <>
                <RefreshCcw size={14} />
                복습하기
              </>
            ) : isInProgress ? (
              <>
                <BookOpen size={14} />
                계속하기
              </>
            ) : (
              <>
                <Play size={14} />
                시작하기
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
