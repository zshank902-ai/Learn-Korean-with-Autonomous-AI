"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AIChatBox from '@/components/AIChatBox';

export default function TutorPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-80px)] bg-[#EEF2FF] p-6 lg:p-12 text-[#1E1B4B]">
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
          
          {/* Main Chat Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="mb-6">
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3" style={{ fontFamily: 'Fredoka, cursive' }}>
                <div className="w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center border-4 border-[#1E1B4B]" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
                  <Sparkles className="text-white" size={24} />
                </div>
                Conversational Tutor
              </h1>
              <p className="font-bold text-lg text-[#1E1B4B]/70">
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
            <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-6" style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-[#4F46E5]" size={24} />
                <h2 className="text-xl font-black uppercase tracking-wider">How to Practice</h2>
              </div>
              <ul className="space-y-4 font-bold text-sm text-[#1E1B4B]/80">
                <li className="flex gap-2">
                  <span className="text-[#F97316]">1.</span>
                  Don't be afraid to make mistakes.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F97316]">2.</span>
                  The AI will reply in natural Korean.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F97316]">3.</span>
                  If you make a grammar error, the AI will gently correct you in English before continuing.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F97316]">4.</span>
                  Try asking "이 문장이 자연스럽나요?" (Is this sentence natural?).
                </li>
              </ul>
            </div>

            <div className="bg-[#4F46E5] rounded-3xl border-4 border-[#1E1B4B] p-6 text-white" style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
              <div className="flex items-center gap-3 mb-4">
                <Mic size={24} />
                <h2 className="text-xl font-black uppercase tracking-wider">Pronunciation Mode</h2>
              </div>
              <p className="font-bold text-sm text-white/80 mb-4">
                Coming soon! Practice your speaking and get real-time accent scoring directly in the chat.
              </p>
              <div className="px-4 py-2 bg-black/20 rounded-xl text-xs font-black inline-block border-2 border-[#1E1B4B]">
                IN DEVELOPMENT
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
