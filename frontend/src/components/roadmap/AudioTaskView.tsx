'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import type { MCQQuestion } from '@/lib/roadmapTypes';

interface RawQuestion {
  question?: string;
  audioText?: string;
  options?: string[] | [string, string, string, string];
  correct?: number;
  correct_index?: number;
  answer_index?: number;
  explanation?: string;
}

interface AudioTaskViewProps {
  moduleId: string;
  level: number;
  onComplete: (score: number) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AudioTaskView({ moduleId, level: _level, onComplete }: AudioTaskViewProps) {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeechSupported(true);
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.ROADMAP}/module/${moduleId}/questions`);
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
            audioText: q.audioText,
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

  const speakText = useCallback((textToSpeak: string) => {
    const playAudio = () => {
      if (playingRef.current) return;
      playingRef.current = true;
      setPlaying(true);
      
      const url = `${API_ENDPOINTS.ROADMAP}/tts?text=${encodeURIComponent(textToSpeak)}`;
      const audio = new Audio(url);
      audio.playbackRate = 0.8;
      
      audio.onended = () => {
        playingRef.current = false;
        setPlaying(false);
      };
      audio.onerror = () => {
        console.error("Audio playback failed");
        playingRef.current = false;
        setPlaying(false);
      };
      
      audio.play().catch(e => {
        console.error("Audio play error:", e);
        playingRef.current = false;
        setPlaying(false);
      });
    };

    playAudio();
  }, []);

  // Auto-play when question changes
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const q = questions[currentIndex];
      if (q) {
        const textToSpeak = q.audioText || q.question;
        const timer = setTimeout(() => speakText(textToSpeak), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, loading, questions, speakText]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    const q = questions[currentIndex];
    if (optionIndex === q.correct) setScore(s => s + 1);
  }, [revealed, questions, currentIndex]);

  const handleNext = useCallback(() => {
    setPlaying(false);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      onComplete(Math.round((score / questions.length) * 100));
      return;
    }
    setCurrentIndex(nextIndex);
    setSelected(null);
    setRevealed(false);
  }, [currentIndex, questions.length, score, onComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[var(--color-surface-container)] border-t-[var(--color-primary)] rounded-full"
        />
        <p className="font-bold text-[var(--color-on-surface-variant)]">Loading listening tasks…</p>
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

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest">
          {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-[11px] font-bold text-[var(--color-primary)]">{score} correct</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-[var(--color-surface-container-high)] rounded-full border border-[var(--color-outline-variant)] overflow-hidden">
        <motion.div
          className="h-full bg-[var(--color-primary)] rounded-full"
          animate={{ width: `${(currentIndex / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          {/* Audio card */}
          <div
            className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-8 flex flex-col items-center gap-5 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Listening Task</p>

            {/* Play button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => speakText(q.audioText || q.question)}
              disabled={playing}
              className="relative w-20 h-20 bg-[var(--color-surface-container)] rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center shadow-sm disabled:opacity-70"
              aria-label="Play audio"
            >
              {playing && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)]"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <Volume2 size={32} className={playing ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'} />
            </motion.button>

            {speechSupported ? (
              <p className="text-sm font-bold text-[var(--color-on-surface-variant)]">
                {playing ? 'Playing…' : 'Tap to play audio again'}
              </p>
            ) : (
              /* Fallback: show text directly */
              <div className="w-full bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]">
                <p className="text-xl font-black text-[var(--color-on-surface)] text-center">{q.audioText || q.question}</p>
              </div>
            )}
          </div>

          <p className="text-xl font-black text-[var(--color-on-surface)] text-center mb-2 font-serif drop-shadow-sm">
            {q.question}
          </p>
          <p className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest text-center">
            Choose the correct answer:
          </p>

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
                <span className="w-8 h-8 rounded-xl border border-current flex items-center justify-center text-xs font-black shrink-0 bg-[var(--color-surface-container)]">
                  {OPTION_LABELS[idx]}
                </span>
                <span className="text-[15px]">{opt}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {revealed && q.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0 }}
                className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-5 shadow-sm"
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-2">Explanation</p>
                <p className="text-[14px] font-bold text-[var(--color-on-surface)]">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="sahara-btn self-end flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-wider text-[13px] shadow-sm mt-2"
            >
              {currentIndex + 1 >= questions.length ? 'Finish' : 'Next'}
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
      question: '안녕하세요, 저는 학생입니다.',
      options: ['Hello, I am a teacher.', 'Hello, I am a student.', 'Goodbye, I am a student.', 'Hello, are you a student?'],
      correct: 1,
      explanation: '안녕하세요 = Hello, 저는 = I am, 학생 = student.',
    },
    {
      question: '오늘 날씨가 좋습니다.',
      options: ['Today is cold.', 'Today is rainy.', 'The weather is good today.', 'Yesterday was nice.'],
      correct: 2,
      explanation: '오늘 = today, 날씨 = weather, 좋습니다 = is good.',
    },
  ];
}
