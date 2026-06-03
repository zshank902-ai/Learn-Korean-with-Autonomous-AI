'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { DrillPhase } from '@/hooks/usePronunciationDrill';

interface MicButtonProps {
  phase: DrillPhase;
  onTap: () => void;
  onRelease: () => void;
}

export default function MicButton({ phase, onTap, onRelease }: MicButtonProps) {
  const isRecording = phase === 'recording';
  const isProcessing = phase === 'processing';
  const disabled = phase === 'skipped' || phase === 'correct' || phase === 'advancing';

  // Sound wave visualizer logic
  const [bars, setBars] = useState([8, 16, 24, 16, 8]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setBars(bars.map(() => 8 + Math.random() * 32));
      }, 100);
    } else if (isProcessing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBars([20, 20, 20, 20, 20]); // Freeze at medium height
    } else {
      setBars([8, 16, 24, 16, 8]); // Reset to idle
    }
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, isProcessing]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    // We only trigger tap on mouse down to start recording immediately
    onTap();
  };

  return (
    <div className="flex flex-col items-center relative mt-6 font-sans">
      <div className="relative w-20 h-20 flex justify-center items-center">
        
        <AnimatePresence>
          {isRecording && [0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-[#ef4444] z-0"
            />
          ))}
        </AnimatePresence>

        <motion.button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); handlePointerDown(e); }}
          onPointerUp={(e) => { e.preventDefault(); onRelease(); }}
          onPointerCancel={(e) => { e.preventDefault(); onRelease(); }}
          whileHover={!disabled ? { x: -2, y: -2 } : {}}
          whileTap={!disabled ? { x: 2, y: 2 } : {}}
          animate={{
            backgroundColor: isRecording ? '#ef4444' : (isProcessing ? '#ffffff' : 'var(--color-primary)'),
            borderColor: 'var(--color-on-surface)',
            rotate: isProcessing ? 360 : 0
          }}
          transition={{
            rotate: isProcessing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 },
            backgroundColor: { duration: 0.2 }
          }}
          disabled={disabled}
          className={`relative z-[1] w-20 h-20 rounded-full border border-[var(--color-outline-variant)] shadow-sm flex items-center justify-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
        >
          {isProcessing ? (
            <Loader2 size={32} className="text-[var(--color-on-surface)]" />
          ) : isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <MicOff size={32} color="#ffffff" />
            </motion.div>
          ) : (
            <Mic size={32} className="text-[var(--color-on-surface)]" />
          )}
        </motion.button>
      </div>

      <div className="flex gap-1 mt-4 h-10 items-center">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            animate={{ height }}
            transition={{ type: 'tween', duration: 0.1 }}
            className={`w-1 rounded-sm ${isRecording || isProcessing ? 'bg-[#ef4444]' : 'bg-[var(--color-outline-variant)]'}`}
          />
        ))}
      </div>

      <motion.p
        animate={{ color: isRecording || isProcessing ? 'var(--color-on-surface)' : '#6b7280' }}
        className="mt-3 font-bold text-base"
      >
        {isRecording ? '듣는 중...' : isProcessing ? '분석 중...' : '탭하여 말하기'}
      </motion.p>
    </div>
  );
}
