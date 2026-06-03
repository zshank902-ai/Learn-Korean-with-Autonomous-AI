'use client';

import React, { useState } from 'react';
import { JAMO_DATA } from '@/data/hangulData';
import { JamoCard } from './JamoCard';

export default function JamoExplorer() {
  const [showRomanization, setShowRomanization] = useState(true);

  // Grouping
  const basicConsonants = JAMO_DATA.filter(d => d.type === 'consonant');
  const tenseConsonants = JAMO_DATA.filter(d => d.type === 'tense');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const basicVowels = JAMO_DATA.filter(d => d.type === 'vowel' && d.romanization.length <= 2 && !d.romanization.includes('e') && !d.romanization.includes('w')); 
  // Above basic vowel logic is a bit naive for Korean, let's group by explicit sets:
  const BASIC_VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
  const basicV = JAMO_DATA.filter(d => BASIC_VOWELS.includes(d.char));
  const compoundV = JAMO_DATA.filter(d => d.type === 'vowel' && !BASIC_VOWELS.includes(d.char));

  const renderSection = (title: string, data: typeof JAMO_DATA) => (
    <div className="mb-12">
      <h2 className="text-2xl font-extrabold font-serif text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)] pb-2 mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
        {data.map(d => (
          <JamoCard key={d.char} data={d} showRomanization={showRomanization} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold font-serif text-[var(--color-on-surface)]">자모 EXPLORER</h1>
        
        <button
          onClick={() => setShowRomanization(!showRomanization)}
          className={`sahara-btn px-6 py-3 ${!showRomanization ? 'sahara-btn-secondary' : ''}`}
        >
          {showRomanization ? 'Hide Romanization' : 'Show Romanization'}
        </button>
      </div>

      {renderSection('Basic Consonants (기본 자음)', basicConsonants)}
      {renderSection('Tense Consonants (쌍자음)', tenseConsonants)}
      {renderSection('Basic Vowels (기본 모음)', basicV)}
      {renderSection('Compound Vowels (이중 모음)', compoundV)}
    </div>
  );
}
