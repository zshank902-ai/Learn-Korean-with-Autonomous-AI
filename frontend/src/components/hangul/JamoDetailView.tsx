import React from 'react';
import { motion } from 'framer-motion';
import { useHangulStore } from '@/store/hangulStore';
import { JAMO_DATA } from '@/data/hangulData';

const GIYEOK_MOCK = {
  soundRules: [
    "Pronounced as a soft 'g' between vowels.",
    "Pronounced more like 'k' at the beginning or end of a word."
  ],
  vocab: [
    { word: '가방', romanization: 'gabang', meaning: 'bag' },
    { word: '고기', romanization: 'gogi', meaning: 'meat' },
    { word: '국가', romanization: 'gukga', meaning: 'nation / country' },
  ]
};

export default function JamoDetailView() {
  const { selectedJamo, setSelectedJamo } = useHangulStore();
  const jamoData = JAMO_DATA.find(d => d.char === selectedJamo);

  if (!jamoData) return null;

  // Fallback data if not Giyeok
  const soundRules = selectedJamo === 'ㄱ' ? GIYEOK_MOCK.soundRules : [jamoData.mnemonic];
  const vocab = selectedJamo === 'ㄱ' ? GIYEOK_MOCK.vocab : [
    { word: jamoData.exampleWord.split(' ')[0], romanization: jamoData.romanization, meaning: jamoData.exampleWord.split('-')[1]?.trim() || 'example' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 w-full"
    >
      {/* Breadcrumb & Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] font-sans text-sm mb-4">
          <button onClick={() => setSelectedJamo(null)} className="hover:text-[var(--color-primary)] transition-colors">
            Lessons
          </button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <button onClick={() => setSelectedJamo(null)} className="hover:text-[var(--color-primary)] transition-colors">
            {jamoData.type === 'vowel' ? 'Vowels' : 'Consonants'}
          </button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-[var(--color-primary)] font-medium capitalize">
            {jamoData.name.split(' ')[0]}
          </span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-primary)] font-bold tracking-tight mb-4 capitalize">
          {jamoData.name} ({jamoData.char})
        </h1>
        <p className="font-sans text-lg text-[var(--color-on-surface-variant)] max-w-2xl leading-relaxed">
          {jamoData.mnemonic}. The foundation of Korean syllables.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Character Display (Hanji Canvas) */}
        <div className="lg:col-span-8 bg-[var(--color-surface-container-lowest)] rounded-2xl shadow-warm-soft border border-[var(--color-outline-variant)] border-opacity-30 p-8 md:p-16 flex flex-col items-center justify-center hanji-texture min-h-[400px] relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
            <span className="font-serif text-[400px] text-[var(--color-tertiary)]">{jamoData.char}</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-64 h-64 flex items-center justify-center border-4 border-[var(--color-surface-container-highest)] rounded-xl mb-8 bg-white shadow-inner relative group cursor-pointer">
              <span className="font-serif text-9xl text-[var(--color-on-background)] group-hover:text-[var(--color-primary)] transition-colors duration-500">
                {jamoData.char}
              </span>
              
              <svg className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" viewBox="0 0 100 100">
                {/* Generic stroke overlay for mockup demonstration */}
                <path className="stroke-animated" d="M 20 20 L 80 20 L 80 80" fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
              </svg>
            </div>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] border-opacity-50 text-[var(--color-on-surface)] px-6 py-3 rounded-full hover:bg-[var(--color-surface-container-high)] transition-all font-sans text-sm font-medium shadow-sm">
                <span className="material-symbols-outlined text-[var(--color-primary)]">play_circle</span>
                Listen
              </button>
              <button className="flex items-center gap-2 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] border-opacity-50 text-[var(--color-on-surface)] px-6 py-3 rounded-full hover:bg-[var(--color-surface-container-high)] transition-all font-sans text-sm font-medium shadow-sm">
                <span className="material-symbols-outlined text-[var(--color-primary)]">draw</span>
                Practice
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Details */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Pronunciation Card */}
          <div className="bg-[var(--color-surface-container-low)] rounded-xl p-8 border border-[var(--color-outline-variant)] border-opacity-40 shadow-warm-soft">
            <h3 className="font-serif text-2xl text-[var(--color-on-surface)] mb-6 flex items-center gap-2 border-b border-[var(--color-outline-variant)] border-opacity-30 pb-4">
              <span className="material-symbols-outlined text-[var(--color-tertiary)]">record_voice_over</span>
              Pronunciation
            </h3>
            <div className="space-y-6">
              <div>
                <p className="font-sans text-sm text-[var(--color-secondary)] uppercase tracking-wider mb-1">Romanization</p>
                <p className="font-serif text-3xl text-[var(--color-primary)] font-medium">{jamoData.romanization}</p>
              </div>
              <div>
                <p className="font-sans text-sm text-[var(--color-secondary)] uppercase tracking-wider mb-2">Sound Rules</p>
                <ul className="space-y-3 font-sans text-[var(--color-on-surface-variant)] text-sm">
                  {soundRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--color-primary)] mt-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stroke Order Card */}
          <div className="bg-[var(--color-surface-container-low)] rounded-xl p-8 border border-[var(--color-outline-variant)] border-opacity-40 shadow-warm-soft flex-1">
            <h3 className="font-serif text-2xl text-[var(--color-on-surface)] mb-6 flex items-center gap-2 border-b border-[var(--color-outline-variant)] border-opacity-30 pb-4">
              <span className="material-symbols-outlined text-[var(--color-tertiary)]">gesture</span>
              Stroke Order
            </h3>
            <div className="flex items-center justify-center h-full pb-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex flex-col items-center opacity-40">
                  <div className="w-24 h-2 bg-[var(--color-outline-variant)] rounded-full mt-4 ml-4 relative">
                    <span className="absolute -top-6 -left-2 text-xs font-bold text-[var(--color-secondary)] bg-[var(--color-surface)] rounded-full w-5 h-5 flex items-center justify-center border border-[var(--color-outline-variant)]">1</span>
                  </div>
                  <div className="w-2 h-20 bg-[var(--color-outline-variant)] rounded-full absolute right-4 top-4"></div>
                </div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <path d="M 20 20 L 80 20 L 80 80" fill="none" opacity="0.6" stroke="var(--color-primary)" strokeDasharray="10 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"></path>
                </svg>
              </div>
            </div>
            <p className="font-sans text-xs text-center text-[var(--color-secondary)] italic mt-2">Drawn as a single continuous stroke.</p>
          </div>

        </div>
      </div>

      {/* Examples Section */}
      <div className="mt-12">
        <h2 className="font-serif text-3xl text-[var(--color-primary)] mb-8 border-b border-[var(--color-outline-variant)] border-opacity-30 pb-4">
          Vocabulary Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vocab.map((v, i) => (
            <div key={i} className="bg-[var(--color-surface-container-lowest)] rounded-xl p-6 border border-[var(--color-outline-variant)] border-opacity-40 hover:border-primary/40 hover:shadow-warm-soft transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <span className="font-serif text-4xl text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                  {v.word}
                </span>
                <button className="text-[var(--color-outline)] hover:text-[var(--color-primary)] transition-colors">
                  <span className="material-symbols-outlined text-xl">volume_up</span>
                </button>
              </div>
              <p className="font-sans text-lg font-medium text-[var(--color-on-surface)] mb-1">{v.romanization}</p>
              <p className="font-sans text-sm text-[var(--color-secondary)]">{v.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
