import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface TTSButtonProps {
  text: string;
  size?: 'small' | 'large';
}

const TTSButtonComponent: React.FC<TTSButtonProps> = ({ text, size = 'small' }) => {
  const { speak, isSupported } = useSpeechSynthesis();

  if (!isSupported) {
    return <span style={{ fontSize: '12px', color: '#FF4B4B' }}>🔇 Not Supported</span>;
  }

  const p = size === 'small' ? '8px 12px' : '16px 24px';
  const fs = size === 'small' ? '14px' : '18px';

  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      whileHover={{ y: -2, boxShadow: '4px 4px 0px #0A0A0A' }}
      whileTap={{ y: 2, x: 2, boxShadow: '0px 0px 0px #0A0A0A' }}
      style={{
        background: '#0A0A0A',
        color: '#FAFAFA',
        border: '2px solid #0A0A0A',
        borderRadius: '8px',
        padding: p,
        fontSize: fs,
        fontWeight: 900,
        fontFamily: '"Space Grotesk", sans-serif',
        boxShadow: '2px 2px 0px #0A0A0A',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>🔊</span> {size === 'large' && 'Speak'}
    </motion.button>
  );
};

export const TTSButton = memo(TTSButtonComponent);
