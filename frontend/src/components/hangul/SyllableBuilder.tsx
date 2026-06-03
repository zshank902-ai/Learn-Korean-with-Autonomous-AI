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
    <div className="py-8">
      <h1 className="text-3xl font-extrabold font-serif mb-10 text-[var(--color-on-surface)]">받침 SYLLABLE BUILDER</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Picker */}
        <div className="flex flex-col gap-6">
          <div className="sahara-card p-6">
            <h3 className="text-lg font-bold mb-4 font-sans uppercase tracking-widest text-[var(--color-on-surface-variant)]">CONSONANTS (자음)</h3>
            <div className="flex flex-wrap gap-2">
              {CHOSEONG.map(c => (
                <button
                  key={`c-${c}`}
                  onClick={(e) => handlePickerClick(c, 'consonant', e)}
                  className="w-12 h-12 text-2xl font-extrabold font-serif rounded-lg cursor-pointer bg-[var(--color-secondary-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-secondary-container)] hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="sahara-card p-6">
            <h3 className="text-lg font-bold mb-4 font-sans uppercase tracking-widest text-[var(--color-on-surface-variant)]">VOWELS (모음)</h3>
            <div className="flex flex-wrap gap-2">
              {JUNGSEONG.map(v => (
                <button
                  key={`v-${v}`}
                  onClick={(e) => handlePickerClick(v, 'vowel', e)}
                  className="w-12 h-12 text-2xl font-extrabold font-serif rounded-lg cursor-pointer bg-[var(--color-primary-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-primary-container)] hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Builder Area */}
        <div className="flex flex-col gap-8">
          
          {/* Main Composed Preview */}
          <div className={`sahara-card rounded-3xl p-10 flex flex-col items-center border-2 ${isValid ? 'border-[var(--color-primary)]' : (cho || jung) ? 'border-[var(--color-error)]' : 'border-[var(--color-outline-variant)]'}`}>
            <div className="h-40 flex items-center justify-center">
              <span className={`text-[140px] font-extrabold font-serif drop-shadow-sm ${isValid ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-outline-variant)]'}`}>
                {isValid ? composed : '?'}
              </span>
            </div>
            
            {/* Breakdown */}
            <div className="mt-6 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl p-4 w-full text-center font-bold text-lg font-sans">
              <span className="text-[var(--color-secondary)]">{cho || '_'}</span>
              <span className="text-[var(--color-on-surface-variant)] mx-2">+</span>
              <span className="text-[var(--color-primary)]">{jung || '_'}</span>
              <span className="text-[var(--color-on-surface-variant)] mx-2">+</span>
              <span className="text-[var(--color-secondary)]">{jong || '_'}</span>
              <span className="text-[var(--color-on-surface-variant)] mx-2">=</span>
              <span className="text-[var(--color-on-surface)]">{isValid ? `${getRom(cho)}${getRom(jung)}${getRom(jong)}` : '?'}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6 w-full">
              <motion.button
                whileHover={isValid ? { y: -2 } : {}}
                whileTap={isValid ? { y: 1 } : {}}
                onClick={() => speak(composed)}
                disabled={!isValid}
                className={`flex-1 p-4 rounded-xl font-bold text-lg font-sans transition-all ${isValid ? 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] border border-[var(--color-outline-variant)] hover:bg-[var(--color-secondary)] hover:text-white cursor-pointer' : 'bg-[var(--color-surface-container)] text-[var(--color-outline-variant)] cursor-not-allowed border border-[var(--color-outline-variant)]'}`}
              >
                🔊 SPEAK IT
              </motion.button>
              
              <motion.button
                whileHover={isValid ? { y: -2 } : {}}
                whileTap={isValid ? { y: 1 } : {}}
                onClick={() => {
                  if (isValid) {
                    addComposedSyllable(composed);
                    setCho(''); setJung(''); setJong('');
                    setTab('words');
                  }
                }}
                disabled={!isValid}
                className={`flex-1 p-4 rounded-xl font-bold text-lg font-sans transition-all ${isValid ? 'sahara-btn' : 'bg-[var(--color-surface-container)] text-[var(--color-outline-variant)] cursor-not-allowed border border-[var(--color-outline-variant)]'}`}
              >
                ➕ ADD TO WORD
              </motion.button>
            </div>
          </div>

          {/* Slots */}
          <div className="flex gap-4">
            <div ref={choRef} className={`flex-1 h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-5xl font-extrabold font-serif ${cho ? 'bg-[var(--color-secondary-container)] border-[var(--color-outline)] text-[var(--color-on-secondary-container)] border-solid' : 'border-[var(--color-outline-variant)] text-transparent'}`}>{cho || '_'}</div>
            <div ref={jungRef} className={`flex-1 h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-5xl font-extrabold font-serif ${jung ? 'bg-[var(--color-primary-container)] border-[var(--color-outline)] text-[var(--color-on-primary-container)] border-solid' : 'border-[var(--color-outline-variant)] text-transparent'}`}>{jung || '_'}</div>
            <div ref={jongRef} className={`flex-1 h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-5xl font-extrabold font-serif ${jong ? 'bg-[var(--color-secondary-container)] border-[var(--color-outline)] text-[var(--color-on-secondary-container)] border-solid' : 'border-[var(--color-outline-variant)] text-transparent'}`}>{jong || '_'}</div>
          </div>
          
        </div>
      </div>

      {/* Flying Animation */}
      <AnimatePresence>
        {flyingChar && (
          <motion.div
            initial={{ position: 'fixed', left: flyingChar.rect.left, top: flyingChar.rect.top, width: flyingChar.rect.width, height: flyingChar.rect.height, zIndex: 9999 }}
            className={`flex items-center justify-center text-2xl font-extrabold font-serif rounded-lg border border-[var(--color-outline-variant)] shadow-sm ${flyingChar.target === 'jung' ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]' : 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'}`}
            // eslint-disable-next-line react-hooks/refs
            animate={{ left: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().left, top: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().top, width: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().width, height: (flyingChar.target === 'cho' ? choRef : flyingChar.target === 'jung' ? jungRef : jongRef).current?.getBoundingClientRect().height }}
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
