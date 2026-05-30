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
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: '"IBM Plex Mono", monospace' }}>
      
      {/* Background Rain effect (simplified via CSS) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, fontSize: '24px', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
        {'ㄱ ㅏ ㄴ ㄷ ㄹ ㅏ ㅁ ㅓ ㅂ ㅅ ㅗ ㅇ ㅈ ㅜ ㅊ ㅋ ㅡ ㅌ ㅍ ㅣ ㅎ '.repeat(1000)}
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Global Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <Link href="/roadmap" style={{ display: 'inline-block', marginBottom: '16px', fontWeight: 900, color: '#0f0f0f', textDecoration: 'none', borderBottom: '2px solid #0f0f0f' }}>
              ← Back to Roadmap
            </Link>
            <h1 style={{ fontSize: '48px', fontWeight: 900, margin: 0, fontFamily: '"Space Grotesk", sans-serif', textTransform: 'uppercase', letterSpacing: '-1px' }}>
              <span style={{ color: '#00E5FF', textShadow: '4px 4px 0px #0f0f0f' }}>한글</span> PLAYGROUND
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {/* Progress Ring / Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#6b7280' }}>Mastered</span>
              <span style={{ fontSize: '24px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif' }}>{masteredJamo.size} <span style={{ color: '#6b7280', fontSize: '16px' }}>/ 40</span></span>
            </div>
            
            {/* XP Badge */}
            <motion.div 
              key={sessionXP}
              initial={{ scale: 1.2 }} animate={{ scale: 1 }}
              style={{ background: '#FFD600', border: '3px solid #0f0f0f', padding: '12px 24px', borderRadius: '16px', boxShadow: '4px 4px 0px #0f0f0f', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ fontSize: '24px' }}>⚡</span>
              <span style={{ fontSize: '24px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif' }}>{sessionXP} XP</span>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', borderBottom: '4px solid #0f0f0f', marginBottom: '40px' }}>
          {tabs.map(tab => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  background: active ? '#0f0f0f' : '#fff',
                  color: active ? '#FFD600' : '#0f0f0f',
                  border: '3px solid #0f0f0f',
                  borderRadius: '12px 12px 0 0',
                  fontWeight: 900,
                  fontSize: '16px',
                  fontFamily: '"Space Grotesk", sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transform: active ? 'translateY(4px)' : 'none',
                  borderBottom: active ? 'none' : '3px solid #0f0f0f',
                  position: 'relative',
                  zIndex: active ? 20 : 10
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </div>

      </div>
    </div>
  );
}
