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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: '24px' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        <AnimatePresence>
          {isRecording && [0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: '#FF4B4B',
                zIndex: 0
              }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); handlePointerDown(e); }}
          onPointerUp={(e) => { e.preventDefault(); onRelease(); }}
          onPointerCancel={(e) => { e.preventDefault(); onRelease(); }}
          whileHover={!disabled ? { x: -2, y: -2, boxShadow: '6px 6px 0px #000' } : {}}
          whileTap={!disabled ? { x: 2, y: 2, boxShadow: '0px 0px 0px #000' } : {}}
          animate={{
            backgroundColor: isRecording ? '#FF4B4B' : (isProcessing ? '#ffffff' : '#FFD600'),
            borderColor: '#0f0f0f',
            rotate: isProcessing ? 360 : 0
          }}
          transition={{
            rotate: isProcessing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 },
            backgroundColor: { duration: 0.2 }
          }}
          disabled={disabled}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px solid #0f0f0f',
            boxShadow: '4px 4px 0px #0f0f0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
          }}
        >
          {isProcessing ? (
            <Loader2 size={32} color="#0f0f0f" />
          ) : isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <MicOff size={32} color="#ffffff" />
            </motion.div>
          ) : (
            <Mic size={32} color="#0f0f0f" />
          )}
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginTop: '16px', height: '40px', alignItems: 'center' }}>
        {bars.map((height, i) => (
          <motion.div
            key={i}
            animate={{ height }}
            transition={{ type: 'tween', duration: 0.1 }}
            style={{ width: '4px', backgroundColor: isRecording || isProcessing ? '#FF4B4B' : '#d1d5db', borderRadius: '2px' }}
          />
        ))}
      </div>

      <motion.p
        animate={{ color: isRecording || isProcessing ? '#0f0f0f' : '#6b7280' }}
        style={{ marginTop: '12px', fontWeight: 900, fontSize: '16px' }}
      >
        {isRecording ? '듣는 중...' : isProcessing ? '분석 중...' : '탭하여 말하기'}
      </motion.p>
    </div>
  );
}
