'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';

interface GrammarQuestion {
  id: string;
  sentence: string;
  blank_position: string;
  answer: string;
  context?: string;
}

interface RawQuestion {
  id?: string;
  question?: string;
  sentence?: string;
  blank?: string;
  answer?: string;
  context?: string;
}

interface CorrectResponse {
  corrected?: string;
  explanation?: string;
  is_correct?: boolean;
}

interface GrammarDrillViewProps {
  moduleId: string;
  level: number;
  onComplete: (score: number) => void;
}

export default function GrammarDrillView({ moduleId, level: _level, onComplete }: GrammarDrillViewProps) {
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<CorrectResponse | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<'theory' | 'drill'>('theory');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.ROADMAP}/module/${moduleId}/questions?page=1`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json() as { questions?: RawQuestion[] } | RawQuestion[];
        let raw: RawQuestion[] = [];
        if (Array.isArray(data)) raw = data;
        else if ('questions' in data && Array.isArray(data.questions)) raw = data.questions;

        const mapped: GrammarQuestion[] = raw.map((q, i) => ({
          id: q.id ?? String(i),
          sentence: q.sentence ?? q.question ?? '이것은 ___ 입니다.',
          blank_position: q.blank ?? '___',
          answer: q.answer ?? '',
          context: q.context,
        }));
        setQuestions(mapped);
      } catch {
        setFetchError(true);
        setQuestions([
          { id: '1', sentence: '저는 학생___ 입니다.', blank_position: '이', answer: '이', context: 'copula after consonant' },
          { id: '2', sentence: '오늘 날씨가 ___습니다.', blank_position: '좋', answer: '좋', context: 'adjective ending' },
          { id: '3', sentence: '저는 한국어를 ___습니다.', blank_position: '공부해', answer: '공부해', context: 'verb stem' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [moduleId]);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim() || submitted) return;
    setChecking(true);
    setSubmitted(true);
    const q = questions[currentIndex];
    const fullSentence = q.sentence.replace('___', userAnswer);

    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/analyze/correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: fullSentence }),
      });
      if (!res.ok) throw new Error('AI unavailable');
      const data = await res.json() as CorrectResponse;
      setFeedback(data);

      const roughMatch =
        data.is_correct === true ||
        userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase() ||
        (data.corrected !== undefined &&
          data.corrected.toLowerCase().includes(userAnswer.trim().toLowerCase()));

      setIsCorrect(roughMatch);
      if (roughMatch) setScore(s => s + 1);
    } catch {
      // Fallback: simple local comparison
      const roughMatch = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
      setIsCorrect(roughMatch);
      if (roughMatch) setScore(s => s + 1);
      setFeedback({
        corrected: roughMatch ? fullSentence : `${q.sentence.replace('___', q.answer)}`,
        explanation: 'AI is temporarily unavailable. Proceeding with best effort.',
      });
    } finally {
      setChecking(false);
    }
  }, [userAnswer, submitted, questions, currentIndex]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      const finalScore = Math.round((score / questions.length) * 100);
      onComplete(finalScore);
      return;
    }
    setCurrentIndex(nextIndex);
    setUserAnswer('');
    setFeedback(null);
    setIsCorrect(null);
    setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIndex, questions.length, score, onComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#1E1B4B] border-t-transparent rounded-full"
        />
        <p className="font-bold text-[#1E1B4B]">Loading grammar drills…</p>
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

  if (phase === 'theory') {
    return (
      <div className="flex flex-col gap-6 items-center justify-center py-2">
        <div className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-8 w-full" style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>
          <h3 className="text-2xl font-black text-[#1E1B4B] mb-4">Grammar Concept</h3>
          <p className="text-lg font-bold text-[#1E1B4B]/80 mb-6 leading-relaxed">
            In this module, you will practice using essential grammar particles and sentence structures. Pay close attention to the context hints!
          </p>
          <div className="bg-[#F5F3FF] border-4 border-[#6366F1] rounded-2xl p-5 mb-8">
            <h4 className="font-black text-[#6366F1] uppercase tracking-widest text-sm mb-2">Tip</h4>
            <p className="font-bold text-[#1E1B4B]">
              Look at the noun ending before the blank. If it ends in a consonant, use 이/은/을. If it ends in a vowel, use 가/는/를.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPhase('drill');
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-full bg-[#6366F1] text-white font-black py-4 rounded-2xl border-4 border-[#1E1B4B] text-lg shadow-[4px_4px_0px_#1E1B4B]"
          >
            Start Drill
          </motion.button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

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
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-bold text-green-600">{score} correct</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full border-2 border-[#1E1B4B]">
        <motion.div
          className="h-full bg-[#1E1B4B] rounded-full"
          animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-6 flex flex-col gap-4"
          style={{ boxShadow: '6px 6px 0px #1E1B4B' }}
        >
          {q.context && (
            <div className="text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-100 rounded-xl px-3 py-1 self-start">
              {q.context}
            </div>
          )}

          {/* Sentence with blank */}
          <p className="text-2xl font-black text-[#1E1B4B] leading-relaxed">
            {q.sentence.split('___').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block border-b-4 border-[#6366F1] min-w-[80px] mx-1 text-center text-[#6366F1]">
                    {submitted && userAnswer ? userAnswer : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>

          {/* Input */}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !submitted) handleSubmit(); }}
              disabled={submitted}
              placeholder="Type your answer…"
              className="flex-1 border-4 border-[#1E1B4B] rounded-xl px-4 py-3 font-bold text-lg text-[#1E1B4B] focus:outline-none focus:ring-4 focus:ring-[#6366F1]/30 disabled:bg-gray-100"
              style={{ boxShadow: '3px 3px 0px #1E1B4B' }}
              autoFocus
            />
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || checking}
                className="bg-[#1E1B4B] text-white px-6 py-3 rounded-xl border-4 border-[#1E1B4B] font-black disabled:opacity-50 hover:bg-[#312E81] transition-colors"
                style={{ boxShadow: '3px 3px 0px #6366F1' }}
              >
                {checking ? '…' : 'Check'}
              </button>
            )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl border-4 p-4 flex flex-col gap-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                  <span className={`font-black text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite…'}
                  </span>
                </div>
                {feedback.corrected && (
                  <p className="text-sm font-bold text-gray-700">
                    <span className="text-gray-400 font-black">Corrected: </span>{feedback.corrected}
                  </p>
                )}
                {feedback.explanation && (
                  <p className="text-sm text-gray-600 leading-relaxed">{feedback.explanation}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {submitted && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="self-end flex items-center gap-2 bg-[#6366F1] text-white px-6 py-3 rounded-xl border-4 border-[#1E1B4B] font-black hover:bg-[#4F46E5] transition-colors"
              style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
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
