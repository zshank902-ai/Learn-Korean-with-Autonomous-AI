'use client';

import React, { useState } from 'react';
import { JAMO_DATA } from '@/data/hangulData';
import { JamoCard } from './JamoCard';

export default function JamoExplorer() {
  const [showRomanization, setShowRomanization] = useState(true);

  // Grouping
  const basicConsonants = JAMO_DATA.filter(d => d.type === 'consonant');
  const tenseConsonants = JAMO_DATA.filter(d => d.type === 'tense');
  const basicVowels = JAMO_DATA.filter(d => d.type === 'vowel' && d.romanization.length <= 2 && !d.romanization.includes('e') && !d.romanization.includes('w')); 
  // Above basic vowel logic is a bit naive for Korean, let's group by explicit sets:
  const BASIC_VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
  const basicV = JAMO_DATA.filter(d => BASIC_VOWELS.includes(d.char));
  const compoundV = JAMO_DATA.filter(d => d.type === 'vowel' && !BASIC_VOWELS.includes(d.char));

  const renderSection = (title: string, data: typeof JAMO_DATA) => (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', textTransform: 'uppercase', borderBottom: '4px solid #0A0A0A', paddingBottom: '8px', marginBottom: '24px' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
        {data.map(d => (
          <JamoCard key={d.char} data={d} showRomanization={showRomanization} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif' }}>자모 EXPLORER</h1>
        
        <button
          onClick={() => setShowRomanization(!showRomanization)}
          style={{
            background: showRomanization ? '#00E5FF' : '#FAFAFA',
            border: '3px solid #0A0A0A',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 900,
            boxShadow: '4px 4px 0px #0A0A0A',
            cursor: 'pointer',
            fontFamily: '"Space Grotesk", sans-serif'
          }}
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
