'use client';

import React from 'react';
import { useHangulStore } from '@/store/hangulStore';
import { motion, AnimatePresence } from 'framer-motion';

import JamoExplorer from '@/components/hangul/JamoExplorer';
import SyllableBuilder from '@/components/hangul/SyllableBuilder';
import WordBuilder from '@/components/hangul/WordBuilder';
import PronunciationDrill from '@/components/hangul/PronunciationDrill';
import SpellingQuiz from '@/components/hangul/SpellingQuiz';
import JamoDetailView from '@/components/hangul/JamoDetailView';

export default function HangulPage() {
  const { currentTab, setTab, selectedJamo } = useHangulStore();

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 relative z-10 font-sans text-[var(--color-on-surface)]">
      <AnimatePresence mode="wait">
        {selectedJamo ? (
          <JamoDetailView key="detail-view" />
        ) : (
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 'jamo' && <JamoExplorer />}
            {currentTab === 'builder' && <SyllableBuilder />}
            {currentTab === 'words' && <WordBuilder />}
            {currentTab === 'drill' && <PronunciationDrill onBack={() => setTab('jamo')} />}
            {currentTab === 'quiz' && <SpellingQuiz />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
