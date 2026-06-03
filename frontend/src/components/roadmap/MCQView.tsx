'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, AlertTriangle, Volume2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import type { MCQQuestion } from '@/lib/roadmapTypes';

interface RawQuestion {
  question?: string;
  options?: string[] | [string, string, string, string];
  correct?: number;
  correct_index?: number;
  explanation?: string;
  answer_index?: number;
}

interface MCQViewProps {
  moduleId: string;
  level: number;
  onComplete: (score: number) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
const TIME_LIMIT = 60;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MCQView({ moduleId, level: _level, onComplete }: MCQViewProps) {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [xpFlash, setXpFlash] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingRef = useRef(false);

  const speakText = useCallback((textToSpeak: string) => {
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    
    const url = `${API_ENDPOINTS.ROADMAP}/tts?text=${encodeURIComponent(textToSpeak)}`;
    const audio = new Audio(url);
    audio.playbackRate = 0.8;
    
    audio.onended = () => { playingRef.current = false; setPlaying(false); };
    audio.onerror = () => { playingRef.current = false; setPlaying(false); };
    audio.play().catch(() => { playingRef.current = false; setPlaying(false); });
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.ROADMAP}/module/${moduleId}/questions?page=1`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json() as { questions?: RawQuestion[] } | RawQuestion[];
        let raw: RawQuestion[] = [];
        if (Array.isArray(data)) raw = data;
        else if ('questions' in data && Array.isArray(data.questions)) raw = data.questions;

        const mapped: MCQQuestion[] = raw
          .filter(q => Array.isArray(q.options) && q.options.length >= 4)
          .map(q => ({
            question: q.question ?? '',
            options: (q.options as [string, string, string, string]).slice(0, 4) as [string, string, string, string],
            correct: q.correct ?? q.correct_index ?? q.answer_index ?? 0,
            explanation: q.explanation ?? '',
          }));

        setQuestions(mapped.length > 0 ? mapped : getFallback());
      } catch {
        setFetchError(true);
        setQuestions(getFallback());
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [moduleId]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Auto-advance as wrong
          setRevealed(true);
          setSelected(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startTimer();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, currentIndex, startTimer, questions.length]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (revealed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(optionIndex);
    setRevealed(true);
    const q = questions[currentIndex];
    if (optionIndex === q.correct) {
      setScore(s => s + 1);
      setXpFlash(true);
      setTimeout(() => setXpFlash(false), 1200);
    }
  }, [revealed, questions, currentIndex]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      const finalScore = Math.round((score / questions.length) * 100);
      onComplete(finalScore);
      return;
    }
    setCurrentIndex(nextIndex);
    setSelected(null);
    setRevealed(false);
    startTimer();
  }, [currentIndex, questions.length, score, onComplete, startTimer]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[var(--color-surface-container)] border-t-[var(--color-primary)] rounded-full"
        />
        <p className="font-bold text-[var(--color-on-surface-variant)]">Loading questions…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="font-bold text-gray-400">No questions available.</p>
      </div>
    );
  }

  const q = questions[currentIndex];
  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerWarning = timeLeft < 15;

  const getOptionStyle = (idx: number): string => {
    if (!revealed) {
      return 'bg-[var(--color-surface)] border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] hover:border-[var(--color-primary)]';
    }
    if (idx === q.correct) return 'bg-[#e8f5e9] border-[#4caf50] text-[#2e7d32]';
    if (idx === selected && idx !== q.correct) return 'bg-[#ffebee] border-[#ef5350] text-[#c62828]';
    return 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] opacity-50';
  };

  return (
    <div className="flex flex-col gap-5">
      {fetchError && (
        <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 text-yellow-800 font-bold text-sm">
          <AlertTriangle size={16} />
          AI is temporarily unavailable. Proceeding with best effort.
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">
          {currentIndex + 1} / {questions.length}
        </span>
        <div className={`flex items-center gap-1.5 font-bold text-[13px] ${timerWarning ? 'text-red-500' : 'text-[var(--color-on-surface)]'}`}>
          <motion.div
            animate={timerWarning ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: timerWarning ? Infinity : 0 }}
          >
            <Clock size={16} />
          </motion.div>
          {timeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-3 bg-[var(--color-surface-container-high)] rounded-full border border-[var(--color-outline-variant)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${timerWarning ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* XP flash */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div
            key="xp"
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -40, opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-24 right-8 text-2xl font-black text-green-500 pointer-events-none z-50"
          >
            +10 XP ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          <div
            className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-8 flex flex-col gap-4 shadow-sm"
          >
            {moduleId.includes('listening') && (
              <div className="flex items-center gap-4 mb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakText(q.question)}
                  disabled={playing}
                  className="w-14 h-14 bg-[var(--color-surface-container)] rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center shadow-sm"
                >
                  <Volume2 size={24} className={playing ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'} />
                </motion.button>
                <p className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
                  {playing ? 'Playing Audio...' : 'Tap to Listen'}
                </p>
              </div>
            )}
            <p className="text-xl font-black text-[var(--color-on-surface)] leading-relaxed font-serif drop-shadow-sm">
              {moduleId.includes('listening') && !revealed ? 'Listen to the audio and choose the correct option.' : q.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileHover={!revealed ? { scale: 1.02 } : {}}
                whileTap={!revealed ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border font-bold text-left transition-all shadow-sm ${getOptionStyle(idx)}`}
              >
                <span
                  className="w-8 h-8 rounded-xl border border-current flex items-center justify-center text-xs font-black shrink-0 bg-[var(--color-surface-container)]"
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="text-[15px]">{opt}</span>
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && q.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm"
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">Explanation</p>
                <p className="text-[14px] font-bold text-[var(--color-on-surface)] leading-relaxed">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="sahara-btn self-end flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-wider text-[13px] shadow-sm mt-2"
            >
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next'}
              <ChevronRight size={18} />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getFallback(): MCQQuestion[] {
  return [
    {
      question: '다음 중 "학교"의 뜻은 무엇입니까?',
      options: ['Hospital', 'School', 'Library', 'Park'],
      correct: 1,
      explanation: '학교 (hakgyo) means "school" in Korean.',
    },
    {
      question: '"감사합니다" is used to express:',
      options: ['Apology', 'Greeting', 'Gratitude', 'Farewell'],
      correct: 2,
      explanation: '감사합니다 (gamsahamnida) is the formal expression for "thank you".',
    },
    {
      question: 'Which particle marks the subject of a sentence?',
      options: ['을/를', '이/가', '은/는', '에서'],
      correct: 1,
      explanation: '이/가 marks the subject. 은/는 marks the topic. 을/를 marks the object.',
    },
  ];
}
