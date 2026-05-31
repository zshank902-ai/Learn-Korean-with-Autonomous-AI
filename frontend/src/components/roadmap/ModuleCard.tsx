"use client";

import { motion, AnimatePresence } from 'framer-motion';
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

const shimmer = {
  animate: { backgroundPosition: ['200% center', '-200% center'] },
  transition: { duration: 2.5, repeat: Infinity, ease: 'linear' as const },
};

export default function ModuleCard({ module, status, progressPercent, levelColor, onStart }: ModuleCardProps) {
  const toast = useToast();
  
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  const borderColor = isLocked ? '#d1d5db' : isCompleted ? '#16a34a' : levelColor;
  const bgColor = isLocked ? '#f9fafb' : '#ffffff';

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
      whileHover={!isLocked ? { y: -4, boxShadow: '5px 5px 0px #0f0f0f' } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      role={isLocked ? 'presentation' : 'button'}
      aria-disabled={isLocked}
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
        opacity: isCompleted ? 0.85 : 1, // Dimmed if completed
        height: '100%',
        pointerEvents: isLocked ? 'none' : 'auto', // Strictly block interactions on card
      }}
    >
      {/* Active state pulsing border effect */}
      {isActive && (
        <style>{`
          @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
        `}</style>
      )}
      {isActive && (
        <div style={{
          position: 'absolute',
          inset: '-2.5px',
          borderRadius: '16px',
          border: '2px solid transparent',
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
              background: 'rgba(20, 20, 20, 0.4)',
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

        {/* XP badge / Completed checkmark */}
        {isCompleted ? (
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <div className="bg-[#16a34a] rounded-full p-1 border-2 border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f]">
              <CheckCircle2 size={16} className="text-white" />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              background: '#fef9c3',
              border: `2px solid #ca8a04`,
              borderRadius: '6px',
              padding: '3px 8px',
              flexShrink: 0,
            }}
          >
            <Zap size={11} color={'#ca8a04'} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: '11px',
                color: '#ca8a04',
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
            borderRadius: '8px',
            border: '2px solid #0f0f0f',
            background: isLocked ? '#e5e7eb' : isCompleted ? '#dcfce7' : levelColor,
            color: isLocked ? '#9ca3af' : '#0f0f0f',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: '13px',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            boxShadow: isLocked ? 'none' : '2px 2px 0px #0f0f0f',
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
              background: '#e5e7eb',
              borderRadius: '999px',
              height: '4px',
              overflow: 'hidden',
              border: '1px solid #d1d5db',
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
