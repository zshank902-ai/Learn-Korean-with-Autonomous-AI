'use client';

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, Reorder } from 'framer-motion';
import { useHangulStore } from '@/store/hangulStore';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface LookupResult {
  word: string;
  meaning: string;
  example: string;
  romanization: string;
  difficulty: number;
}

const PRESETS = [
  { target: '한국', en: 'Korea' },
  { target: '사랑', en: 'Love' },
  { target: '학교', en: 'School' },
  { target: '물', en: 'Water' },
  { target: '밥', en: 'Rice/Meal' }
];

export default function WordBuilder() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { composedSyllables, removeSyllable, clearSyllables, reorderSyllables, setTab } = useHangulStore();
  const { speak } = useSpeechSynthesis();
  
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [saved, setSaved] = useState(false);

  // We map composedSyllables to objects for Framer Reorder
  const [items, setItems] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(composedSyllables.map((s, i) => ({ id: `${i}-${s}`, text: s })));
  }, [composedSyllables]);

  const word = composedSyllables.join('');

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!word) {
        setLookupResult(null);
        return;
      }
      setIsLookingUp(true);
      try {
        const res = await fetch(`/api/v1/hangul/lookup?word=${encodeURIComponent(word)}`);
        const data = await res.json();
        setLookupResult(data);
        setSaved(false);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLookingUp(false);
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [word]);

  const handleSave = async () => {
    if (!word) return;
    try {
      const res = await fetch('/api/v1/hangul/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: '1', word, syllables: composedSyllables })
      });
      if (res.ok) setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-extrabold font-serif mb-10 text-[var(--color-on-surface)]">단어 WORD BUILDER</h1>

      {/* Preset Challenges */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {PRESETS.map((p) => {
          const unlocked = word === p.target;
          return (
            <div key={p.target} className={`px-4 py-2 rounded-xl font-bold font-sans border transition-all ${unlocked ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm' : 'bg-[var(--color-surface)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]'}`}>
              {unlocked ? '✅ ' : '🔒 '}{p.target} ({p.en})
            </div>
          );
        })}
      </div>

      <div className="sahara-card rounded-3xl p-10 min-h-[300px]">
        
        {items.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-on-surface-variant)] flex flex-col items-center">
            <div className="text-6xl mb-4">🧩</div>
            <h3 className="text-2xl font-extrabold text-[var(--color-on-surface)] font-serif mb-2">No syllables yet</h3>
            <p className="font-medium">Go to the Syllable Builder to create blocks and add them here!</p>
            <button onClick={() => setTab('builder')} className="mt-6 sahara-btn px-6 py-3">
              Go to Builder
            </button>
          </div>
        ) : (
          <>
            <Reorder.Group axis="x" values={items} onReorder={(newItems) => {
              setItems(newItems);
            }} className="flex gap-4 list-none p-0 m-0 mb-8 min-h-[120px]">
              {items.map((item, idx) => (
                <Reorder.Item key={item.id} value={item} className="relative">
                  <div className="w-[120px] h-[120px] bg-[var(--color-primary-container)] border border-[var(--color-outline-variant)] rounded-2xl flex items-center justify-center text-6xl font-extrabold font-serif text-[var(--color-on-primary-container)] shadow-sm cursor-grab">
                    {item.text}
                  </div>
                  <button onClick={() => removeSyllable(idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-error)] text-white rounded-full font-bold flex items-center justify-center z-10 shadow-sm border border-[var(--color-error-container)] hover:scale-110 transition-transform">×</button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="flex gap-4 mb-8">
              <button onClick={() => speak(word)} className="sahara-btn-secondary px-6 py-3 border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-container)]">🔊 Speak Word</button>
              <button onClick={clearSyllables} className="sahara-btn-secondary px-6 py-3 border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error-container)]">🗑️ Clear All</button>
            </div>

            {isLookingUp ? (
              <div className="font-bold text-[var(--color-on-surface-variant)]">Looking up dictionary...</div>
            ) : lookupResult ? (
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-extrabold font-serif text-[var(--color-on-surface)] m-0">{lookupResult.word} <span className="text-lg text-[var(--color-on-surface-variant)] font-sans font-medium tracking-wide">[{lookupResult.romanization}]</span></h2>
                    <p className="text-xl font-bold text-[var(--color-on-surface)] mt-2">{lookupResult.meaning}</p>
                    {lookupResult.example && (
                      <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-xl border-l-4 border-[var(--color-primary)]">
                        <p className="m-0 font-medium text-[var(--color-on-surface)]">{lookupResult.example}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="bg-[var(--color-secondary-container)] px-3 py-1 rounded-lg font-bold text-[var(--color-on-secondary-container)] border border-[var(--color-outline-variant)]">
                      TOPIK Lv. {lookupResult.difficulty || '?'}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <button onClick={handleSave} disabled={saved} className={`px-6 py-3 font-bold rounded-xl transition-all ${saved ? 'bg-[#10B981] text-white cursor-default' : 'sahara-btn'}`}>
                    {saved ? '✅ Saved to Vocabulary' : '💾 Save Word'}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
