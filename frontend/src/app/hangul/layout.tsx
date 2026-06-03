'use client';

import React from 'react';
import Link from 'next/link';
import { useHangulStore, HangulTab } from '@/store/hangulStore';
import { motion } from 'framer-motion';

export default function HangulLayout({ children }: { children: React.ReactNode }) {
  const { currentTab, setTab, sessionXP, masteredJamo } = useHangulStore();

  const tabs: { id: HangulTab; label: string; icon: string }[] = [
    { id: 'jamo', label: '자모 Explorer', icon: '🔍' },
    { id: 'builder', label: 'Syllable Builder', icon: '🏗️' },
    { id: 'words', label: 'Word Builder', icon: '📝' },
    { id: 'drill', label: 'Pronunciation', icon: '🎤' },
    { id: 'quiz', label: 'Spelling Quiz', icon: '🧠' }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">
      
      {/* Background Rain effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5 text-2xl overflow-hidden whitespace-pre-wrap font-serif text-[var(--color-primary)]">
        {'ㄱ ㅏ ㄴ ㄷ ㄹ ㅏ ㅁ ㅓ ㅂ ㅅ ㅗ ㅇ ㅈ ㅜ ㅊ ㅋ ㅡ ㅌ ㅍ ㅣ ㅎ '.repeat(1000)}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-6 md:p-8 flex-1 flex flex-col">
        
        {/* Global Header */}
        <div className="flex justify-between items-start mb-10 flex-wrap gap-4">
          <div>
            <Link href="/roadmap" className="inline-block mb-4 font-bold text-[var(--color-primary)] no-underline hover:underline decoration-2 underline-offset-4">
              ← Back to Roadmap
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold m-0 font-serif uppercase tracking-tight text-[var(--color-on-background)] drop-shadow-sm">
              <span className="text-[var(--color-primary)]">한글</span> PLAYGROUND
            </h1>
          </div>

          <div className="flex gap-6 items-center">
            {/* Progress Ring / Stats */}
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold uppercase text-[var(--color-on-surface-variant)] tracking-wider">Mastered</span>
              <span className="text-2xl font-extrabold font-serif text-[var(--color-on-surface)] drop-shadow-sm">
                {masteredJamo.size} <span className="text-[var(--color-on-surface-variant)] text-base font-sans">/ 40</span>
              </span>
            </div>
            
            {/* XP Badge */}
            <motion.div 
              key={sessionXP}
              initial={{ scale: 1.2 }} animate={{ scale: 1 }}
              className="bg-[var(--color-primary-container)] border border-[var(--color-outline-variant)] py-3 px-5 rounded-2xl shadow-sm flex items-center gap-2"
            >
              <span className="text-2xl drop-shadow-sm">⚡</span>
              <span className="text-xl font-extrabold font-serif text-[var(--color-on-primary-container)]">{sessionXP} XP</span>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-4 border-b border-[var(--color-outline-variant)] mb-10 hide-scrollbar">
          {tabs.map(tab => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`px-6 py-4 rounded-t-2xl font-bold text-base flex items-center gap-2 transition-all whitespace-nowrap ${
                  active 
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] border-t border-l border-r border-[var(--color-outline-variant)] border-b-0 shadow-sm translate-y-[1px] -mb-[1px]' 
                    : 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)] border border-transparent mb-0'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}
