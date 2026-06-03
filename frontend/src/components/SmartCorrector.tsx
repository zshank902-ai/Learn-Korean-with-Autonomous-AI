"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAIStore } from '@/store/useAIStore';

/**
 * Principal Architect: Streaming-ready Smart Corrector (Sahara Theme).
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

  const aiFeedback = latestPrediction ? {
    corrected: typeof latestPrediction.corrected === 'string' ? latestPrediction.corrected : '',
    explanation: typeof latestPrediction.explanation === 'string' ? latestPrediction.explanation : '',
  } : null;
  const streamingText = streamingBuffer;
  const isAiLoading = isProcessing;

  return (
    <motion.div 
      layout
      className="sahara-card p-8 relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 p-4">
        <div className={`w-4 h-4 rounded-full border border-[var(--color-outline-variant)] ${
          status === 'ready' ? 'bg-green-500' : 
          status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
        }`} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--color-primary-container)] border border-[var(--color-outline-variant)]">
          <Sparkles className={`text-[var(--color-on-primary-container)] ${isAiLoading ? 'animate-spin' : ''}`} size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--color-on-surface)] font-serif tracking-tight drop-shadow-sm">Smart Corrector</h2>
          <p className="text-[var(--color-on-surface-variant)] font-bold text-sm">Real-time grammar & dialect feedback.</p>
        </div>
      </div>

      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Type your Korean sentence here..."
        className="w-full h-32 bg-[#ffffff] border border-[var(--color-outline-variant)] rounded-2xl p-6 text-xl font-bold text-[var(--color-on-surface)] focus:outline-none transition-all placeholder:text-[var(--color-on-surface-variant)] resize-none mb-6 shadow-[inset_0_2px_4px_rgba(58,48,42,0.02)]"
      />

      <AnimatePresence mode="wait">
        {isAiLoading ? (
          <motion.div 
            key="loading"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 text-[var(--color-primary)] justify-center py-8 border border-dashed border-[var(--color-primary)] rounded-2xl bg-[var(--color-primary-container)]"
          >
            <Sparkles className="animate-spin" size={24} />
            <span className="font-bold">Analyzing your grammar...</span>
          </motion.div>
        ) : aiFeedback ? (
          <motion.div
            key="feedback"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-[var(--color-secondary-container)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(58,48,42,0.04)]"
          >
            <div className="flex items-start gap-4">
              <CheckCircle2 className="text-emerald-600 mt-1 shrink-0" size={24} />
              <div>
                <p className="text-sm uppercase tracking-widest font-black text-emerald-600 mb-2 drop-shadow-sm">AI Suggestion</p>
                <p className="text-2xl font-extrabold mb-3 text-[var(--color-on-surface)]">{aiFeedback.corrected}</p>
                <p className="text-[var(--color-on-surface-variant)] font-bold italic min-h-[1.25rem]">
                  "{streamingText}"
                  <span className="inline-block w-2 h-5 bg-emerald-500 ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="placeholder"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 text-[var(--color-on-surface-variant)] justify-center py-8 border border-dashed border-[var(--color-outline-variant)] rounded-2xl bg-[var(--color-surface-container-low)]"
          >
            <AlertCircle size={24} />
            <span className="font-bold">Start typing to see AI magic...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
