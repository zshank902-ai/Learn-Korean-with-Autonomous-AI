'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHangulStore } from '@/store/hangulStore';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { JAMO_DATA } from '@/data/hangulData';

const CHOSEONG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSEONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function composeHangul(cho: string, jung: string, jong: string = ''): string {
  if (!cho || !jung) return '';
  const choIdx  = CHOSEONG.indexOf(cho);
  const jungIdx = JUNGSEONG.indexOf(jung);
  const jongIdx = JONGSEONG.indexOf(jong); // 0 if not found/empty
  if (choIdx < 0 || jungIdx < 0) return '?';
  return String.fromCharCode(0xAC00 + (choIdx * 21 + jungIdx) * 28 + (jongIdx < 0 ? 0 : jongIdx));
}

export default function SyllableBuilder() {
  const [cho, setCho] = useState('');
  const [jung, setJung] = useState('');
  const [jong, setJong] = useState('');
  
  const { speak } = useSpeechSynthesis();
  const addComposedSyllable = useHangulStore(s => s.addComposedSyllable);
  const setTab = useHangulStore(s => s.setTab);

  const composed = composeHangul(cho, jung, jong);
  const isValid = composed.length === 1 && composed !== '?';

  const [flyingChar, setFlyingChar] = useState<{ char: string, rect: DOMRect, target: 'cho'|'jung'|'jong' } | null>(null);

  const choRef = useRef<HTMLDivElement>(null);
  const jungRef = useRef<HTMLDivElement>(null);
  const jongRef = useRef<HTMLDivElement>(null);

  const handlePickerClick = (char: string, type: 'consonant' | 'vowel' | 'tense', e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    let target: 'cho' | 'jung' | 'jong' | null = null;
    if (type === 'vowel') {
      target = 'jung';
    } else {
      // Consonant or tense
      if (!cho) target = 'cho';
      else if (cho && !jung) {
        // Can't put two initial consonants
        setCho(char);
        setJung('');
        setJong('');
        return;
      }
      else if (cho && jung && !jong) target = 'jong';
      else {
        // Reset block
        setCho(char);
        setJung('');
        setJong('');
        return;
      }
    }

    if (target) {
      setFlyingChar({ char, rect, target });
    }
  };

  const handleAnimationComplete = () => {
    if (!flyingChar) return;
    if (flyingChar.target === 'cho') setCho(flyingChar.char);
    if (flyingChar.target === 'jung') setJung(flyingChar.char);
    if (flyingChar.target === 'jong') setJong(flyingChar.char);
    setFlyingChar(null);
  };

  // Helper to find romanization
  const getRom = (char: string) => JAMO_DATA.find(d => d.char === char)?.romanization || '';

  return (
    <div style={{ padding: '32px 0' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', marginBottom: '40px' }}>받침 SYLLABLE BUILDER</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        
        {/* Left: Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#FAFAFA', border: '4px solid #0A0A0A', borderRadius: '24px', padding: '24px', boxShadow: '8px 8px 0px #0A0A0A' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px' }}>CONSONANTS (자음)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CHOSEONG.map(c => (
                <button
                  key={`c-${c}`}
                  onClick={(e) => handlePickerClick(c, 'consonant', e)}
                  style={{ width: '48px', height: '48px', fontSize: '24px', fontWeight: 900, background: '#FFD600', border: '3px solid #0A0A0A', borderRadius: '8px', cursor: 'pointer', boxShadow: '2px 2px 0px #0A0A0A' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#FAFAFA', border: '4px solid #0A0A0A', borderRadius: '24px', padding: '24px', boxShadow: '8px 8px 0px #0A0A0A' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px' }}>VOWELS (모음)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {JUNGSEONG.map(v => (
                <button
                  key={`v-${v}`}
                  onClick={(e) => handlePickerClick(v, 'vowel', e)}
                  style={{ width: '48px', height: '48px', fontSize: '24px', fontWeight: 900, background: '#00E5FF', border: '3px solid #0A0A0A', borderRadius: '8px', cursor: 'pointer', boxShadow: '2px 2px 0px #0A0A0A' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Builder Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Main Composed Preview */}
          <div style={{ 
            background: '#ffffff', border: `6px solid ${isValid ? '#0A0A0A' : (cho || jung) ? '#FF4B4B' : '#0A0A0A'}`, 
            borderRadius: '32px', padding: '40px', boxShadow: '12px 12px 0px #0A0A0A',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '140px', fontWeight: 900, fontFamily: '"Noto Sans KR", sans-serif', color: isValid ? '#0A0A0A' : '#cbd5e1' }}>
                {isValid ? composed : '?'}
              </span>
            </div>
            
            {/* Breakdown */}
            <div style={{ marginTop: '24px', background: '#FAFAFA', border: '3px solid #0A0A0A', borderRadius: '12px', padding: '16px', width: '100%', textAlign: 'center', fontWeight: 900, fontSize: '18px' }}>
              <span style={{ color: '#d97706' }}>{cho || '_'}</span>
              <span style={{ color: '#6b7280', margin: '0 8px' }}>+</span>
              <span style={{ color: '#0284c7' }}>{jung || '_'}</span>
              <span style={{ color: '#6b7280', margin: '0 8px' }}>+</span>
              <span style={{ color: '#d97706' }}>{jong || '_'}</span>
              <span style={{ color: '#6b7280', margin: '0 8px' }}>=</span>
              <span>{isValid ? `${getRom(cho)}${getRom(jung)}${getRom(jong)}` : '?'}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', width: '100%' }}>
              <motion.button
                whileHover={{ y: -2, boxShadow: '4px 4px 0px #0A0A0A' }}
                whileTap={{ y: 2, x: 2, boxShadow: '0px 0px 0px #0A0A0A' }}
                onClick={() => speak(composed)}
                disabled={!isValid}
                style={{ flex: 1, padding: '16px', background: '#0A0A0A', color: '#fff', border: '3px solid #0A0A0A', borderRadius: '12px', fontWeight: 900, fontSize: '16px', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5, boxShadow: isValid ? '4px 4px 0px #0A0A0A' : 'none' }}
              >
                🔊 SPEAK IT
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2, boxShadow: '4px 4px 0px #0A0A0A' }}
                whileTap={{ y: 2, x: 2, boxShadow: '0px 0px 0px #0A0A0A' }}
                onClick={() => {
                  if (isValid) {
                    addComposedSyllable(composed);
                    setCho(''); setJung(''); setJong('');
                    setTab('words');
                  }
                }}
                disabled={!isValid}
                style={{ flex: 1, padding: '16px', background: '#10B981', color: '#fff', border: '3px solid #0A0A0A', borderRadius: '12px', fontWeight: 900, fontSize: '16px', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5, boxShadow: isValid ? '4px 4px 0px #0A0A0A' : 'none' }}
              >
                ➕ ADD TO WORD
              </motion.button>
            </div>
          </div>

          {/* Slots */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div ref={choRef} style={{ flex: 1, height: '100px', border: '4px dashed #9ca3af', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900, background: cho ? '#FEF9C3' : 'transparent', borderColor: cho ? '#0A0A0A' : '#9ca3af', borderStyle: cho ? 'solid' : 'dashed' }}>{cho}</div>
            <div ref={jungRef} style={{ flex: 1, height: '100px', border: '4px dashed #9ca3af', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900, background: jung ? '#E0F2FE' : 'transparent', borderColor: jung ? '#0A0A0A' : '#9ca3af', borderStyle: jung ? 'solid' : 'dashed' }}>{jung}</div>
            <div ref={jongRef} style={{ flex: 1, height: '100px', border: '4px dashed #9ca3af', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900, background: jong ? '#FEF9C3' : 'transparent', borderColor: jong ? '#0A0A0A' : '#9ca3af', borderStyle: jong ? 'solid' : 'dashed' }}>{jong}</div>
          </div>
          
        </div>
      </div>

      {/* Flying Animation */}
      <AnimatePresence>
        {flyingChar && (
          <motion.div
            initial={{ position: 'fixed', left: flyingChar.rect.left, top: flyingChar.rect.top, width: flyingChar.rect.width, height: flyingChar.rect.height, zIndex: 9999, background: flyingChar.target === 'jung' ? '#00E5FF' : '#FFD600', border: '3px solid #0f0f0f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#0f0f0f', boxShadow: '4px 4px 0px #0f0f0f' }}
            // eslint-disable-next-line react-hooks/refs
            animate={{ left: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().left, top: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().top, width: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().width, height: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().height, boxShadow: '0px 0px 0px #0f0f0f' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onAnimationComplete={handleAnimationComplete}
            exit={{ opacity: 0 }}
          >
            {flyingChar.char}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
