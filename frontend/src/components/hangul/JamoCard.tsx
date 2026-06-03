import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { JamoData } from '@/data/hangulData';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useHangulStore } from '@/store/hangulStore';

interface JamoCardProps {
  data: JamoData;
  showRomanization: boolean;
}

const JamoCardComponent: React.FC<JamoCardProps> = ({ data, showRomanization }) => {
  const { speak } = useSpeechSynthesis();
  const { setSelectedJamo } = useHangulStore();

  // Using Sahara colors
  let bgColorClass = 'bg-[var(--color-secondary-container)] border-[var(--color-outline-variant)] text-[var(--color-on-secondary-container)]'; // Consonant
  if (data.type === 'vowel') bgColorClass = 'bg-[var(--color-primary-container)] border-[var(--color-outline-variant)] text-[var(--color-on-primary-container)]'; // Vowel
  if (data.type === 'tense') bgColorClass = 'bg-[var(--color-tertiary-container)] border-[var(--color-outline-variant)] text-[var(--color-on-tertiary-container)]'; // Tense

  return (
    <motion.button
      onClick={() => {
        speak(data.char);
        setSelectedJamo(data.char);
      }}
      whileHover={{ y: -4 }}
      whileTap={{ y: 2, scale: 0.98 }}
      className={`sahara-card flex flex-col items-center justify-center p-6 cursor-pointer min-h-[220px] relative overflow-hidden w-full ${bgColorClass}`}
    >
      <span className="text-[72px] font-extrabold font-serif leading-none drop-shadow-sm">
        {data.char}
      </span>
      
      {showRomanization ? (
        <div className="mt-4 flex flex-col items-center gap-1">
          <span className="text-xl font-extrabold font-sans">
            {data.romanization}
          </span>
          <span className="text-sm font-bold opacity-80 font-sans">
            {data.ipa}
          </span>
          <p className="mt-3 text-xs font-semibold text-center leading-relaxed opacity-90 font-sans">
            {data.mnemonic}
          </p>
        </div>
      ) : (
        <div className="mt-4 h-[60px]" /> // Spacer to maintain card size
      )}
    </motion.button>
  );
};

export const JamoCard = memo(JamoCardComponent);
