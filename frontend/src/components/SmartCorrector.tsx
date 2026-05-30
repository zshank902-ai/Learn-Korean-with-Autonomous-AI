"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAIStore } from '@/store/useAIStore';

/**
 * Principal Architect: Streaming-ready Smart Corrector (Neo-Brutalism).
 */
export default function SmartCorrector() {
  const [input, setInput] = useState("");
  const { 
    status,
    connect, 
    send, 
    streamingBuffer, 
    latestPrediction, 
    isProcessing,
    clearBuffer
  } = useAIStore();
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connect();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [connect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInput(text);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length > 2) {
      debounceRef.current = setTimeout(() => {
        send({
          type: "correction",
          text: text
        });
      }, 500);
    } else {
      clearBuffer();
    }
  };

  // Type-safe extraction from Record<string, unknown>
  const aiFeedback = latestPrediction ? {
    corrected: typeof latestPrediction.corrected === 'string' ? latestPrediction.corrected : '',
    explanation: typeof latestPrediction.explanation === 'string' ? latestPrediction.explanation : '',
  } : null;
  const streamingText = streamingBuffer;
  const isAiLoading = isProcessing;

  return (
    <motion.div 
      layout
      className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-8 relative overflow-hidden group h-full"
      style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
    >
      <div className="absolute top-0 right-0 p-4">
        <div className={`w-4 h-4 rounded-full border-2 border-[#1E1B4B] ${
          status === 'ready' ? 'bg-[#4ADE80]' : 
          status === 'connecting' ? 'bg-[#FBBF24] animate-pulse' : 'bg-[#EF4444]'
        }`} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-[#EEF2FF] rounded-2xl flex items-center justify-center border-4 border-[#1E1B4B]" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
          <Sparkles className={`text-[#4F46E5] ${isAiLoading ? 'animate-spin' : ''}`} size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>Smart Corrector</h2>
          <p className="text-[#1E1B4B]/60 font-bold text-sm">Real-time grammar & dialect feedback.</p>
        </div>
      </div>

      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Type your Korean sentence here..."
        className="w-full h-32 bg-[#EEF2FF] border-4 border-[#1E1B4B] rounded-2xl p-6 text-xl font-bold text-[#1E1B4B] focus:outline-none transition-all placeholder:text-[#1E1B4B]/30 resize-none mb-6"
        style={{ boxShadow: 'inset 4px 4px 0px rgba(30,27,75,0.05)' }}
      />

      <AnimatePresence mode="wait">
        {aiFeedback ? (
          <motion.div
            key="feedback"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-[#D1FAE5] border-4 border-[#1E1B4B] rounded-2xl overflow-hidden"
            style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
          >
            <div className="flex items-start gap-4">
              <CheckCircle2 className="text-[#059669] mt-1 shrink-0" size={24} />
              <div>
                <p className="text-sm uppercase tracking-widest font-black text-[#059669] mb-2">AI Suggestion</p>
                <p className="text-2xl font-black mb-3 text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>{aiFeedback.corrected}</p>
                <p className="text-[#1E1B4B]/60 font-bold italic min-h-[1.25rem]">
                  "{streamingText}"
                  <span className="inline-block w-2 h-5 bg-[#059669] ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="placeholder"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-[#1E1B4B]/40 justify-center py-8 border-4 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-[#EEF2FF]"
          >
            <AlertCircle size={24} />
            <span className="font-bold">Start typing to see AI magic...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
