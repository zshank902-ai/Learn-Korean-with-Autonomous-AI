"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AIChatBox from '@/components/AIChatBox';

export default function TutorPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-80px)] bg-[var(--color-background)] p-6 lg:p-12 text-[var(--color-on-surface)] font-sans">
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
          
          {/* Main Chat Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 font-serif text-[var(--color-on-surface)]">
                <div className="w-12 h-12 bg-[var(--color-primary-container)] rounded-xl flex items-center justify-center border border-[var(--color-outline-variant)] shadow-sm">
                  <Sparkles className="text-[var(--color-primary)]" size={24} />
                </div>
                Conversational Tutor
              </h1>
              <p className="font-semibold text-lg text-[var(--color-on-surface-variant)]">
                Practice real-world Korean. I'll correct your mistakes instantly!
              </p>
            </div>
            
            <div className="flex-1 min-h-[500px]">
              <AIChatBox />
            </div>
          </motion.div>

          {/* Right Sidebar - Tutor Guidelines */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-96 flex flex-col gap-6"
          >
            <div className="sahara-card bg-[var(--color-surface)] rounded-3xl border border-[var(--color-outline-variant)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[var(--color-on-surface)]">
                <BookOpen className="text-[var(--color-primary)]" size={24} />
                <h2 className="text-xl font-bold uppercase tracking-wider">How to Practice</h2>
              </div>
              <ul className="space-y-4 font-semibold text-sm text-[var(--color-on-surface-variant)]">
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">1.</span>
                  Don't be afraid to make mistakes.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">2.</span>
                  The AI will reply in natural Korean.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">3.</span>
                  If you make a grammar error, the AI will gently correct you in English before continuing.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-primary)] font-bold">4.</span>
                  Try asking "이 문장이 자연스럽나요?" (Is this sentence natural?).
                </li>
              </ul>
            </div>

            <div className="bg-[var(--color-surface-container-low)] rounded-3xl border border-[var(--color-outline-variant)] p-6 text-[var(--color-on-surface)] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Mic size={24} className="text-[var(--color-primary)]" />
                <h2 className="text-xl font-bold uppercase tracking-wider">Pronunciation Mode</h2>
              </div>
              <p className="font-semibold text-sm text-[var(--color-on-surface-variant)] mb-4">
                Coming soon! Practice your speaking and get real-time accent scoring directly in the chat.
              </p>
              <div className="px-4 py-2 bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] rounded-xl text-xs font-bold inline-block border border-[var(--color-outline-variant)]">
                IN DEVELOPMENT
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
