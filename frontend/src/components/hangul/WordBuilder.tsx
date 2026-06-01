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
    <div style={{ padding: '32px 0' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', marginBottom: '40px' }}>단어 WORD BUILDER</h1>

      {/* Preset Challenges */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {PRESETS.map((p) => {
          const unlocked = word === p.target;
          return (
            <div key={p.target} style={{ padding: '8px 16px', background: unlocked ? '#10B981' : '#FAFAFA', color: unlocked ? '#fff' : '#0f0f0f', border: '3px solid #0f0f0f', borderRadius: '12px', fontWeight: 900, boxShadow: unlocked ? 'none' : '4px 4px 0px #0f0f0f' }}>
              {unlocked ? '✅ ' : '🔒 '}{p.target} ({p.en})
            </div>
          );
        })}
      </div>

      <div style={{ background: '#FAFAFA', border: '4px solid #0f0f0f', borderRadius: '32px', padding: '40px', boxShadow: '12px 12px 0px #0f0f0f', minHeight: '300px' }}>
        
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧩</div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0f0f0f' }}>No syllables yet</h3>
            <p>Go to the Syllable Builder to create blocks and add them here!</p>
            <button onClick={() => setTab('builder')} style={{ marginTop: '24px', padding: '12px 24px', background: '#FFD600', border: '3px solid #0f0f0f', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f' }}>
              Go to Builder
            </button>
          </div>
        ) : (
          <>
            <Reorder.Group axis="x" values={items} onReorder={(newItems) => {
              // Note: robust implementation would sync this back to Zustand
              setItems(newItems);
            }} style={{ display: 'flex', gap: '16px', listStyle: 'none', padding: 0, margin: '0 0 32px 0', minHeight: '120px' }}>
              {items.map((item, idx) => (
                <Reorder.Item key={item.id} value={item} style={{ position: 'relative' }}>
                  <div style={{ width: '120px', height: '120px', background: '#00E5FF', border: '4px solid #0f0f0f', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', fontWeight: 900, fontFamily: '"Noto Sans KR", sans-serif', boxShadow: '6px 6px 0px #0f0f0f', cursor: 'grab' }}>
                    {item.text}
                  </div>
                  <button onClick={() => removeSyllable(idx)} style={{ position: 'absolute', top: '-10px', right: '-10px', width: '32px', height: '32px', background: '#FF4B4B', color: '#fff', border: '3px solid #0f0f0f', borderRadius: '50%', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>×</button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <button onClick={() => speak(word)} style={{ padding: '12px 24px', background: '#0f0f0f', color: '#fff', border: '3px solid #0f0f0f', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f' }}>🔊 Speak Word</button>
              <button onClick={clearSyllables} style={{ padding: '12px 24px', background: '#FF4B4B', color: '#fff', border: '3px solid #0f0f0f', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '4px 4px 0px #0f0f0f' }}>🗑️ Clear All</button>
            </div>

            {isLookingUp ? (
              <div style={{ fontWeight: 900, color: '#6b7280' }}>Looking up dictionary...</div>
            ) : lookupResult ? (
              <div style={{ background: '#fff', border: '4px solid #0f0f0f', borderRadius: '16px', padding: '24px', boxShadow: '4px 4px 0px #0f0f0f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>{lookupResult.word} <span style={{ fontSize: '18px', color: '#6b7280' }}>[{lookupResult.romanization}]</span></h2>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f0f0f', marginTop: '8px' }}>{lookupResult.meaning}</p>
                    {lookupResult.example && (
                      <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #FFD600' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>{lookupResult.example}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span style={{ background: '#FFD600', padding: '4px 12px', border: '2px solid #0f0f0f', borderRadius: '8px', fontWeight: 900 }}>
                      TOPIK Lv. {lookupResult.difficulty || '?'}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <button onClick={handleSave} disabled={saved} style={{ padding: '12px 24px', background: saved ? '#10B981' : '#00E5FF', color: saved ? '#fff' : '#0f0f0f', border: '3px solid #0f0f0f', borderRadius: '12px', fontWeight: 900, cursor: saved ? 'default' : 'pointer', boxShadow: saved ? 'none' : '4px 4px 0px #0f0f0f' }}>
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
