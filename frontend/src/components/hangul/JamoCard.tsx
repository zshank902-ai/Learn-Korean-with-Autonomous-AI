import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { JamoData } from '@/data/hangulData';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface JamoCardProps {
  data: JamoData;
  showRomanization: boolean;
}

const JamoCardComponent: React.FC<JamoCardProps> = ({ data, showRomanization }) => {
  const { speak } = useSpeechSynthesis();

  let bgColor = '#FFD600'; // Consonant
  if (data.type === 'vowel') bgColor = '#00E5FF'; // Cyan
  if (data.type === 'tense') bgColor = '#FF4B4B'; // Coral

  return (
    <motion.button
      onClick={() => speak(data.char)}
      whileHover={{ y: -4, boxShadow: '6px 6px 0px #0A0A0A' }}
      whileTap={{ y: 2, x: 2, boxShadow: '2px 2px 0px #0A0A0A' }}
      style={{
        background: bgColor,
        border: '3px solid #0A0A0A',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '4px 4px 0px #0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        minHeight: '220px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <span style={{ fontSize: '72px', fontWeight: 900, fontFamily: '"Noto Sans KR", sans-serif', color: '#0A0A0A', lineHeight: 1 }}>
        {data.char}
      </span>
      
      {showRomanization ? (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', color: '#0A0A0A' }}>
            {data.romanization}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', color: '#333' }}>
            {data.ipa}
          </span>
          <p style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: '#0A0A0A', textAlign: 'center', lineHeight: 1.4 }}>
            {data.mnemonic}
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '16px', height: '60px' }} /> // Spacer to maintain card size
      )}
    </motion.button>
  );
};

export const JamoCard = memo(JamoCardComponent);
