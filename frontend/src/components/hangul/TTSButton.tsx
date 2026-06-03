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
    return <span className="text-xs text-[var(--color-error)]">🔇 Not Supported</span>;
  }

  const pClass = size === 'small' ? 'px-3 py-2' : 'px-6 py-4';
  const fsClass = size === 'small' ? 'text-sm' : 'text-lg';

  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 2, x: 2 }}
      className={`bg-[var(--color-on-surface)] text-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl ${pClass} ${fsClass} font-bold uppercase tracking-wider font-sans shadow-sm cursor-pointer inline-flex items-center gap-2`}
    >
      <span>🔊</span> {size === 'large' && 'Speak'}
    </motion.button>
  );
};

export const TTSButton = memo(TTSButtonComponent);
