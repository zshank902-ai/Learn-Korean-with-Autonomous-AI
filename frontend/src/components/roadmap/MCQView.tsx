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
          className="w-12 h-12 border-4 border-[#1E1B4B] border-t-transparent rounded-full"
        />
        <p className="font-bold text-[#1E1B4B]">Loading questions…</p>
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
      return 'bg-white border-[#1E1B4B] text-[#1E1B4B] hover:bg-[#F5F3FF] hover:border-[#6366F1]';
    }
    if (idx === q.correct) return 'bg-green-50 border-green-500 text-green-700';
    if (idx === selected && idx !== q.correct) return 'bg-red-50 border-red-400 text-red-600';
    return 'bg-gray-50 border-gray-300 text-gray-400';
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
        <span className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest">
          {currentIndex + 1} / {questions.length}
        </span>
        <div className={`flex items-center gap-1.5 font-black text-sm ${timerWarning ? 'text-red-500' : 'text-[#1E1B4B]'}`}>
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
      <div className="w-full h-3 bg-gray-200 rounded-full border-2 border-[#1E1B4B] overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${timerWarning ? 'bg-red-500' : 'bg-[#6366F1]'}`}
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
            className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-6"
            style={{ boxShadow: '6px 6px 0px #1E1B4B' }}
          >
            {moduleId.includes('listening') && (
              <div className="flex items-center gap-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakText(q.question)}
                  disabled={playing}
                  className="w-14 h-14 bg-[#EEF2FF] rounded-full border-4 border-[#1E1B4B] flex items-center justify-center shadow-sm"
                >
                  <Volume2 size={24} className={playing ? 'text-[#6366F1]' : 'text-[#1E1B4B]'} />
                </motion.button>
                <p className="text-sm font-bold text-[#1E1B4B]/60 uppercase tracking-widest">
                  {playing ? 'Playing Audio...' : 'Tap to Listen'}
                </p>
              </div>
            )}
            <p className="text-xl font-black text-[#1E1B4B] leading-relaxed">
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
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-4 font-bold text-left transition-all ${getOptionStyle(idx)}`}
                style={{ boxShadow: '3px 3px 0px #1E1B4B' }}
              >
                <span
                  className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center text-xs font-black shrink-0"
                >
                  {OPTION_LABELS[idx]}
                </span>
                {opt}
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
                className="bg-[#F5F3FF] border-4 border-[#6366F1] rounded-2xl p-4"
              >
                <p className="text-xs font-black uppercase tracking-widest text-[#6366F1] mb-1">Explanation</p>
                <p className="text-sm font-bold text-[#1E1B4B]">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="self-end flex items-center gap-2 bg-[#1E1B4B] text-white px-6 py-3 rounded-xl border-4 border-[#1E1B4B] font-black hover:bg-[#312E81] transition-colors"
              style={{ boxShadow: '4px 4px 0px #6366F1' }}
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
