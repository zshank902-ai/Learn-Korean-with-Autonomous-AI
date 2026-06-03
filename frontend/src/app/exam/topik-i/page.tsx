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
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: '"Manrope", sans-serif' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-on-background)' }}>Loading Exam…</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>Generating TOPIK-I questions</p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '32px 20px 80px', fontFamily: '"Manrope", sans-serif' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-on-background)', marginBottom: '24px', fontFamily: '"EB Garamond", serif' }}>
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
      <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', color: 'var(--color-on-surface)' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', fontFamily: '"EB Garamond", serif' }}>
            Listening Complete!
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', marginBottom: '24px', fontFamily: '"Manrope", sans-serif' }}>
            Starting Reading section in…
          </p>
          <div style={{ fontSize: '72px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"EB Garamond", serif' }}>
            {transitionCount}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', fontFamily: '"Manrope", sans-serif' }}>
      {/* Exam Header */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-outline-variant)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
        }}
      >
        <Link href="/roadmap" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"EB Garamond", serif', cursor: 'pointer' }}>
            K-Mastery
          </div>
        </Link>
        <div
          style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '12px',
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--color-on-surface)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {phase === 'listening' ? '🎧 Listening' : '📖 Reading'}
        </div>

        <ExamTimer
          key={phase}
          startSeconds={phase === 'listening' ? 2400 : 3600}
          onExpire={phase === 'listening' ? handleListeningExpire : handleReadingExpire}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            Q{currentIndex + 1} / {totalQCount}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            {answeredCount}/{totalQCount} answered
          </span>
          <button
            onClick={phase === 'listening' ? submitListening : submitReading}
            disabled={sectionSubmitted}
            style={{
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: sectionSubmitted ? 'not-allowed' : 'pointer',
              boxShadow: sectionSubmitted ? 'none' : '0 4px 12px rgba(194, 101, 42, 0.3)',
              textTransform: 'uppercase',
              opacity: sectionSubmitted ? 0.6 : 1,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { if (!sectionSubmitted) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            Submit Section →
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 60px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Question area */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
              }}
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
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              style={{
                flex: 1,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '16px',
                padding: '14px',
                fontWeight: 700,
                color: 'var(--color-on-surface)',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.5 : 1,
                fontFamily: '"Manrope", sans-serif',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (currentIndex !== 0) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-outline-variant)'; }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQCount - 1, i + 1))}
              disabled={currentIndex === totalQCount - 1}
              style={{
                flex: 1,
                background: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '14px',
                fontWeight: 700,
                cursor: currentIndex === totalQCount - 1 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === totalQCount - 1 ? 0.5 : 1,
                boxShadow: currentIndex === totalQCount - 1 ? 'none' : '0 4px 12px rgba(194, 101, 42, 0.3)',
                fontFamily: '"Manrope", sans-serif',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => { if (currentIndex !== totalQCount - 1) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right sidebar: navigator */}
        <div style={{ width: '280px', flexShrink: 0 }}>
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
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontWeight: 700, color: 'var(--color-on-background)', fontFamily: '"Manrope", sans-serif' }}>Loading…</p>
      </div>
    }>
      <TopikIExamInner />
    </Suspense>
  );
}

