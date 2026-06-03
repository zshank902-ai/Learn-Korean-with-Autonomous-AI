'use client';

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ExamTimer from '@/components/exam/ExamTimer';
import ListeningSection from '@/components/exam/ListeningSection';
import ReadingSection from '@/components/exam/ReadingSection';
import QuestionNavigator from '@/components/exam/QuestionNavigator';
import ExamScoreReport from '@/components/exam/ExamScoreReport';
import type {
  TopikIQuestion,
  TopikIQuestionsResponse,
  TopikIResult,
  TopikIPhase,
} from '@/lib/examTypes';

// ── Fallback questions (used when API is unavailable) ────────────────────────
function buildFallbackListening(): TopikIQuestion[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `l_${i + 1}`,
    section: 'listening' as const,
    questionNumber: i + 1,
    type: 'text_mcq' as const,
    questionText: `듣기 ${i + 1}번. 다음을 듣고 알맞은 것을 고르십시오.`,
    options: ['보기 ①', '보기 ②', '보기 ③', '보기 ④'],
    correctAnswer: 0,
    explanation: '오디오를 듣고 답을 선택하세요.',
  }));
}

function buildFallbackReading(): TopikIQuestion[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: `r_${i + 1}`,
    section: 'reading' as const,
    questionNumber: i + 1,
    type: 'text_mcq' as const,
    questionText: `읽기 ${i + 1}번. 다음을 읽고 알맞은 것을 고르십시오.`,
    options: ['보기 ①', '보기 ②', '보기 ③', '보기 ④'],
    correctAnswer: 0,
    explanation: '지문을 읽고 답을 선택하세요.',
  }));
}

// ── Score calculators ─────────────────────────────────────────────────────────
function scoreSection(questions: TopikIQuestion[], answers: Record<string, number>): number {
  if (questions.length === 0) return 0;
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  return Math.round((correct / questions.length) * 100);
}

function awardLevel(total: number): 0 | 1 | 2 {
  if (total >= 140) return 2;
  if (total >= 80) return 1;
  return 0;
}

function TopikIExamInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');           // 'full' | null
  const practice = searchParams.get('practice');   // 'listening' | 'reading' | null

  // Determine which sections to run
  const startPhase: TopikIPhase =
    practice === 'reading' ? 'reading' :
    'listening';

  const [phase, setPhase] = useState<TopikIPhase>(startPhase);
  const [listeningQs, setListeningQs] = useState<TopikIQuestion[]>([]);
  const [readingQs, setReadingQs] = useState<TopikIQuestion[]>([]);
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, number>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionSubmitted, setSectionSubmitted] = useState(false);
  const [result, setResult] = useState<TopikIResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transitionCount, setTransitionCount] = useState(3);
  const transitionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const url = `/api/proxy/exam/topik-i/questions?seed=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API unavailable');
        const data: TopikIQuestionsResponse = await res.json();
        setListeningQs(data.listeningQuestions);
        setReadingQs(data.readingQuestions);
      } catch {
        setListeningQs(buildFallbackListening());
        setReadingQs(buildFallbackReading());
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  // Listening timer expire → auto-submit listening
  const handleListeningExpire = useCallback(() => {
    if (phase === 'listening') submitListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Reading timer expire → auto-submit reading and compute results
  const handleReadingExpire = useCallback(() => {
    if (phase === 'reading') submitReading();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, readingAnswers]);

  function submitListening() {
    setSectionSubmitted(true);
    if (mode === 'full' || practice !== 'listening') {
      // Transition to reading after 3s
      setPhase('transition');
      setSectionSubmitted(false);
      setCurrentIndex(0);
      let count = 3;
      setTransitionCount(count);
      transitionRef.current = setInterval(() => {
        count -= 1;
        setTransitionCount(count);
        if (count === 0) {
          clearInterval(transitionRef.current!);
          setPhase('reading');
        }
      }, 1000);
    } else {
      // Practice listening only → show results
      buildAndSetResult(listeningAnswers, {});
    }
  }

  function submitReading() {
    buildAndSetResult(listeningAnswers, readingAnswers);
  }

  function buildAndSetResult(la: Record<string, number>, ra: Record<string, number>) {
    const listeningScore = scoreSection(listeningQs, la);
    const readingScore = scoreSection(readingQs, ra);
    const total = Math.round((listeningScore + readingScore) / 2 * 2);
    const level = awardLevel(total);
    setResult({
      listeningScore,
      readingScore,
      totalScore: Math.min(total, 200),
      levelAwarded: level,
      xpGained: level > 0 ? level * 150 : 50,
      listeningAnswers: la,
      readingAnswers: ra,
      listeningQuestions: listeningQs,
      readingQuestions: readingQs,
    });
    setPhase('results');
  }

  const currentQuestions = phase === 'listening' ? listeningQs : readingQs;
  const currentAnswers = phase === 'listening' ? listeningAnswers : readingAnswers;
  const questionIds = currentQuestions.map((q) => q.id);

  function handleAnswer(qId: string, idx: number) {
    if (phase === 'listening') {
      setListeningAnswers((prev) => ({ ...prev, [qId]: idx }));
    } else {
      setReadingAnswers((prev) => ({ ...prev, [qId]: idx }));
    }
  }

  const answeredCount = Object.keys(currentAnswers).length;
  const totalQCount = currentQuestions.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-extrabold text-xl text-[var(--color-on-background)] font-serif">Loading Exam…</p>
          <p className="text-[var(--color-on-surface-variant)] text-sm mt-2 font-medium">Generating TOPIK-I questions</p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-8 pb-20 font-sans">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[var(--color-on-background)] mb-6 font-serif">
            📊 TOPIK I — Exam Results
          </h1>
          <ExamScoreReport
            examType="topik-i"
            result={result}
            onReviewMistakes={() => {
              setPhase('reading');
              setSectionSubmitted(true);
              setCurrentIndex(0);
            }}
          />
        </div>
      </div>
    );
  }

  if (phase === 'transition') {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-[var(--color-on-surface)]"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-extrabold mb-2 font-serif text-[var(--color-on-surface)]">
            Listening Complete!
          </h2>
          <p className="text-lg text-[var(--color-on-surface-variant)] mb-6 font-medium">
            Starting Reading section in…
          </p>
          <div className="text-[80px] font-extrabold text-[var(--color-primary)] font-serif leading-none">
            {transitionCount}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">
      {/* Exam Header */}
      <div
        className="bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)] py-4 px-6 flex items-center gap-4 flex-wrap sticky top-0 z-50 shadow-sm"
      >
        <Link href="/roadmap" className="no-underline">
          <div className="text-2xl font-extrabold text-[var(--color-primary)] font-serif cursor-pointer">
            K-Mastery
          </div>
        </Link>
        <div
          className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl py-1.5 px-4 font-bold text-sm text-[var(--color-on-surface)] uppercase tracking-wide"
        >
          {phase === 'listening' ? '🎧 Listening' : '📖 Reading'}
        </div>

        <ExamTimer
          key={phase}
          startSeconds={phase === 'listening' ? 2400 : 3600}
          onExpire={phase === 'listening' ? handleListeningExpire : handleReadingExpire}
        />

        <div className="ml-auto flex items-center gap-4">
          <span className="text-base font-bold text-[var(--color-on-surface)]">
            Q{currentIndex + 1} / {totalQCount}
          </span>
          <span className="text-sm text-[var(--color-on-surface-variant)] font-medium">
            {answeredCount}/{totalQCount} answered
          </span>
          <button
            onClick={phase === 'listening' ? submitListening : submitReading}
            disabled={sectionSubmitted}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${sectionSubmitted ? 'bg-[var(--color-surface-container)] text-[var(--color-outline-variant)] cursor-not-allowed opacity-60' : 'sahara-btn'}`}
          >
            Submit Section →
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 flex gap-8 flex-col lg:flex-row items-start">
        {/* Question area */}
        <div className="flex-1 min-w-[300px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="sahara-card rounded-3xl p-8"
            >
              {phase === 'listening' ? (
                <ListeningSection
                  questions={listeningQs}
                  answers={listeningAnswers}
                  onAnswer={handleAnswer}
                  currentIndex={currentIndex}
                  submitted={sectionSubmitted}
                />
              ) : (
                <ReadingSection
                  questions={readingQs}
                  answers={readingAnswers}
                  onAnswer={handleAnswer}
                  currentIndex={currentIndex}
                  submitted={sectionSubmitted}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next navigation */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${currentIndex === 0 ? 'bg-[var(--color-surface-container)] text-[var(--color-outline-variant)] cursor-not-allowed opacity-50' : 'sahara-btn-secondary bg-[var(--color-surface)] hover:bg-[var(--color-surface-container-low)]'}`}
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQCount - 1, i + 1))}
              disabled={currentIndex === totalQCount - 1}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${currentIndex === totalQCount - 1 ? 'bg-[var(--color-surface-container)] text-[var(--color-outline-variant)] cursor-not-allowed opacity-50' : 'sahara-btn'}`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right sidebar: navigator */}
        <div className="w-full lg:w-[320px] shrink-0 sticky top-28">
          <QuestionNavigator
            total={totalQCount}
            answers={currentAnswers}
            currentIndex={currentIndex}
            questionIds={questionIds}
            onJump={setCurrentIndex}
            submitted={sectionSubmitted}
          />
        </div>
      </div>
    </div>
  );
}

export default function TopikIExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center font-sans">
        <p className="font-extrabold text-[var(--color-on-background)] font-serif text-xl">Loading…</p>
      </div>
    }>
      <TopikIExamInner />
    </Suspense>
  );
}

