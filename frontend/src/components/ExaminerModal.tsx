"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Send, Loader2, X, AlertOctagon } from 'lucide-react';
import { WS_ENDPOINTS, API_ENDPOINTS } from '@/lib/apiConfig';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAuthStore } from '@/store/useAuthStore';
import Confetti from 'react-confetti';

interface ExaminerModalProps {
  level: number;
  onClose: () => void;
}

export default function ExaminerModal({ level, onClose }: ExaminerModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const handlePassRef = useRef<(() => Promise<void>) | null>(null);
  const { setLevel } = useKMasteryStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handlePass = async () => {
    setIsPassed(true);
    // Send API request to increment level permanently
    try {
      const res = await fetch(API_ENDPOINTS.BASE_URL + '/v1/user/level-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLevel(data.new_level);
        setTimeout(() => onClose(), 4000); // Close after showing confetti
      }
    } catch (e) {
      console.error("Failed to level up", e);
    }
  };

  // Keep ref up-to-date so WebSocket handler is never stale
  // eslint-disable-next-line react-hooks/refs
  handlePassRef.current = handlePass;

  const connect = useCallback(() => {
    const token = useAuthStore.getState().token;
    const url = token ? `${WS_ENDPOINTS.TUTOR_CHAT}?token=${token}` : WS_ENDPOINTS.TUTOR_CHAT;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stream') {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'ai') {
            return [...prev.slice(0, -1), { ...last, content: last.content + data.chunk }];
          }
          return [...prev, { role: 'ai', content: data.chunk }];
        });
      } else if (data.type === 'done') {
        setIsStreaming(false);
        // Check if the AI emitted the PASS JSON payload in the last message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'ai') {
            try {
              // Try to parse the message content to see if it's the PASS JSON
              const parsed = JSON.parse(last.content);
              if (parsed.status === "PASS") {
                // Use ref to avoid stale closure
                handlePassRef.current?.();
                return [...prev.slice(0, -1), { role: 'ai', content: parsed.message }];
              }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              // Not JSON, ignore
            }
          }
          return prev;
        });
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);


  const handleSend = () => {
    if (!input.trim() || !wsRef.current) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsStreaming(true);

    const newHistory = [...messages, { role: 'user', content: text }].map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content
    }));
    
    // Pass is_exam=true to trigger the strict prompt!
    wsRef.current.send(JSON.stringify({ type: 'chat', history: newHistory, level, is_exam: true }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {isPassed && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-2xl sahara-card bg-[var(--color-surface)] rounded-3xl border border-[var(--color-outline-variant)] flex flex-col h-[600px] overflow-hidden shadow-sm"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-[var(--color-surface-container)] rounded-full hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] transition-colors">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-[var(--color-surface-container-low)] p-6 border-b border-[var(--color-outline-variant)] flex items-center gap-4 text-[var(--color-on-surface)]">
          <div className="w-12 h-12 bg-[var(--color-surface)] rounded-xl flex items-center justify-center border border-[var(--color-outline-variant)] shadow-sm">
            <ShieldAlert size={28} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif">Level {level} Exam</h2>
            <p className="font-semibold text-[var(--color-on-surface-variant)] text-sm">Pass the strict examiner to unlock the next level.</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--color-surface)]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-on-surface-variant)] gap-4">
              <AlertOctagon size={48} className="opacity-50" />
              <p className="text-center font-semibold max-w-xs">
                The Examiner is waiting. Type "안녕하세요" to begin your test.
              </p>
            </div>
          )}
          
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 rounded-2xl font-semibold max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isStreaming && (
             <div className="flex justify-start">
               <div className="px-5 py-3 rounded-2xl bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] flex items-center">
                 <Loader2 size={16} className="text-[var(--color-primary)] animate-spin" />
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)] flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Answer the examiner..."
            disabled={isStreaming || isPassed}
            className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--color-on-surface)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] text-sm transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || isPassed}
            className="w-14 rounded-xl flex items-center justify-center sahara-btn disabled:opacity-50 cursor-pointer transition-transform hover:-translate-y-1"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
