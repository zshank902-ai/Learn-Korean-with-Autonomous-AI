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
          className="w-12 h-12 border-4 border-[#1E1B4B] border-t-transparent rounded-full"
        />
        <p className="font-bold text-[#1E1B4B]">Loading listening tasks…</p>
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

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest">
          {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-sm font-bold text-green-600">{score} correct</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full border-2 border-[#1E1B4B]">
        <motion.div
          className="h-full bg-[#1E1B4B] rounded-full"
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
            className="bg-[#1E1B4B] border-4 border-[#1E1B4B] rounded-3xl p-6 flex flex-col items-center gap-4"
            style={{ boxShadow: '6px 6px 0px #6366F1' }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-blue-300">Listening Task</p>

            {/* Play button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => speakText(q.audioText || q.question)}
              disabled={playing}
              className="relative w-20 h-20 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-lg disabled:opacity-70"
              aria-label="Play audio"
            >
              {playing && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <Volume2 size={32} className={playing ? 'text-[#6366F1]' : 'text-[#1E1B4B]'} />
            </motion.button>

            {speechSupported ? (
              <p className="text-sm font-bold text-blue-200">
                {playing ? 'Playing…' : 'Tap to play audio again'}
              </p>
            ) : (
              /* Fallback: show text directly */
              <div className="w-full bg-white/10 rounded-2xl p-4">
                <p className="text-xl font-black text-white text-center">{q.audioText || q.question}</p>
              </div>
            )}
          </div>

          <p className="text-lg font-black text-[#1E1B4B] text-center mb-2">
            {q.question}
          </p>
          <p className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest text-center">
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
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-4 font-bold text-left transition-all ${getOptionStyle(idx)}`}
                style={{ boxShadow: '3px 3px 0px #1E1B4B' }}
              >
                <span className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center text-xs font-black shrink-0">
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
                exit={{ opacity: 0 }}
                className="bg-[#F5F3FF] border-4 border-[#6366F1] rounded-2xl p-4"
              >
                <p className="text-xs font-black uppercase tracking-widest text-[#6366F1] mb-1">Explanation</p>
                <p className="text-sm font-bold text-[#1E1B4B]">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="self-end flex items-center gap-2 bg-[#1E1B4B] text-white px-6 py-3 rounded-xl border-4 border-[#1E1B4B] font-black hover:bg-[#312E81] transition-colors"
              style={{ boxShadow: '4px 4px 0px #6366F1' }}
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
