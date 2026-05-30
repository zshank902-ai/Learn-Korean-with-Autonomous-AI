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
      <div style={{ minHeight: '100vh', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontWeight: 900, fontSize: '18px', color: '#1E1B4B' }}>Loading Exam…</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Generating TOPIK-I questions</p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div style={{ minHeight: '100vh', background: '#EEF2FF', padding: '32px 20px 80px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f0f0f', marginBottom: '24px', fontFamily: 'Fredoka, cursive' }}>
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
      <div style={{ minHeight: '100vh', background: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', color: '#ffffff' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', fontFamily: 'Fredoka, cursive' }}>
            Listening Complete!
          </h2>
          <p style={{ fontSize: '16px', color: '#818CF8', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
            Starting Reading section in…
          </p>
          <div style={{ fontSize: '72px', fontWeight: 900, color: '#F97316', fontFamily: 'Fredoka, cursive' }}>
            {transitionCount}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2FF', fontFamily: 'Inter, sans-serif' }}>
      {/* Exam Header */}
      <div
        style={{
          background: '#ffffff',
          border: '0 0 3px #0f0f0f',
          borderBottom: '3px solid #0f0f0f',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 0px #0f0f0f',
        }}
      >
        <Link href="/roadmap" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#1E1B4B', fontFamily: 'Fredoka, cursive', cursor: 'pointer' }}>
            K-Mastery
          </div>
        </Link>
        <div
          style={{
            background: phase === 'listening' ? '#EEF2FF' : '#FEF3C7',
            border: '2.5px solid #0f0f0f',
            borderRadius: '10px',
            padding: '4px 14px',
            fontWeight: 800,
            fontSize: '13px',
            color: '#0f0f0f',
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
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f0f0f' }}>
            Q{currentIndex + 1} / {totalQCount}
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {answeredCount}/{totalQCount} answered
          </span>
          <button
            onClick={phase === 'listening' ? submitListening : submitReading}
            disabled={sectionSubmitted}
            style={{
              background: '#4F46E5',
              color: '#ffffff',
              border: '2.5px solid #0f0f0f',
              borderRadius: '12px',
              padding: '8px 18px',
              fontWeight: 900,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #0f0f0f',
              textTransform: 'uppercase',
              opacity: sectionSubmitted ? 0.5 : 1,
            }}
          >
            Submit Section →
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 40px', display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
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
                background: '#ffffff',
                border: '3px solid #0f0f0f',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '5px 5px 0px #0f0f0f',
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
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '2.5px solid #0f0f0f',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 900,
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.4 : 1,
                boxShadow: '2px 2px 0px #0f0f0f',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQCount - 1, i + 1))}
              disabled={currentIndex === totalQCount - 1}
              style={{
                flex: 1,
                background: '#1E1B4B',
                color: '#ffffff',
                border: '2.5px solid #0f0f0f',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 900,
                cursor: currentIndex === totalQCount - 1 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === totalQCount - 1 ? 0.4 : 1,
                boxShadow: '2px 2px 0px #0f0f0f',
                fontFamily: 'Inter, sans-serif',
              }}
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
      <div style={{ minHeight: '100vh', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontWeight: 900, color: '#1E1B4B', fontFamily: 'Inter, sans-serif' }}>Loading…</p>
      </div>
    }>
      <TopikIExamInner />
    </Suspense>
  );
}

