'use client';

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ExamTimer from '@/components/exam/ExamTimer';
import WritingSection from '@/components/exam/WritingSection';
import ListeningSection from '@/components/exam/ListeningSection';
import ReadingSection from '@/components/exam/ReadingSection';
import QuestionNavigator from '@/components/exam/QuestionNavigator';
import ExamScoreReport from '@/components/exam/ExamScoreReport';
import type {
  TopikIIWritingQuestion,
  TopikIIListeningQuestion,
  TopikIIReadingQuestion,
  TopikIIQuestionsResponse,
  TopikIIResult,
  TopikIIPhase,
  TopikIQuestion,
} from '@/lib/examTypes';

// ── Fallback data ─────────────────────────────────────────────────────────────
const FALLBACK_WRITING: TopikIIWritingQuestion[] = [
  {
    questionNumber: 51,
    type: 'sentence_completion',
    passageText: '사람들은 건강을 위해 운동을 합니다. 특히 걷기는 ( ㉠ ) 좋은 운동입니다.',
    blankLabel: '㉠',
    charMin: 0,
    charMax: 50,
  },
  {
    questionNumber: 52,
    type: 'sentence_completion',
    passageText: '환경 문제를 해결하기 위해서는 개인의 노력이 ( ㉠ ) 사회 전체의 변화도 필요합니다.',
    blankLabel: '㉠',
    charMin: 0,
    charMax: 50,
  },
  {
    questionNumber: 53,
    type: 'short_essay',
    topic: '좋아하는 계절',
    hints: ['좋아하는 계절은 무엇입니까?', '그 계절을 좋아하는 이유는 무엇입니까?', '그 계절에 무엇을 합니까?'],
    charMin: 200,
    charMax: 300,
  },
  {
    questionNumber: 54,
    type: 'long_essay',
    topic: '현대 사회에서 인터넷이 인간관계에 미치는 영향에 대해 논하시오.',
    charMin: 600,
    charMax: 700,
  },
];

function buildFallbackMCQ(
  section: 'listening' | 'reading',
  count: number
): TopikIIListeningQuestion[] | TopikIIReadingQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${section[0]}_${i + 1}`,
    section,
    questionNumber: i + 1,
    type: 'text_mcq' as const,
    questionText: `${section === 'listening' ? '듣기' : '읽기'} ${i + 1}번. 알맞은 것을 고르십시오.`,
    options: ['보기 ①', '보기 ②', '보기 ③', '보기 ④'] as [string, string, string, string],
    correctAnswer: 0,
    explanation: '정답을 선택하세요.',
  })) as TopikIIListeningQuestion[] | TopikIIReadingQuestion[];
}

// ── Score helpers ─────────────────────────────────────────────────────────────
function scoreTopikIIMCQ(
  questions: TopikIIListeningQuestion[] | TopikIIReadingQuestion[],
  answers: Record<string, number>
): number {
  if (questions.length === 0) return 0;
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  return Math.round((correct / questions.length) * 100);
}

function awardTopikIILevel(total: number): 0 | 3 | 4 | 5 | 6 {
  if (total >= 230) return 6;
  if (total >= 190) return 5;
  if (total >= 150) return 4;
  if (total >= 120) return 3;
  return 0;
}

// ── Main Component ────────────────────────────────────────────────────────────
function TopikIIExamInner() {
  const searchParams = useSearchParams();
  const targetLevel = parseInt(searchParams.get('targetLevel') ?? '3', 10);

  const [phase, setPhase] = useState<TopikIIPhase>('writing');
  const [writingQs, setWritingQs] = useState<TopikIIWritingQuestion[]>(FALLBACK_WRITING);
  const [listeningQs, setListeningQs] = useState<TopikIIListeningQuestion[]>([]);
  const [readingQs, setReadingQs] = useState<TopikIIReadingQuestion[]>([]);

  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({
    51: '', 52: '', 53: '', 54: '',
  });
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, number>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<TopikIIResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [breakRemaining, setBreakRemaining] = useState(900); // 15 min default
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const url = `/api/proxy/exam/topik-ii/questions?targetLevel=${targetLevel}&seed=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API unavailable');
        const data: TopikIIQuestionsResponse = await res.json();
        setWritingQs(data.writingQuestions.length ? data.writingQuestions : FALLBACK_WRITING);
        setListeningQs(data.listeningQuestions);
        setReadingQs(data.readingQuestions);
      } catch {
        setWritingQs(FALLBACK_WRITING);
        setListeningQs(buildFallbackMCQ('listening', 50) as TopikIIListeningQuestion[]);
        setReadingQs(buildFallbackMCQ('reading', 50) as TopikIIReadingQuestion[]);
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [targetLevel]);

  // Break countdown
  useEffect(() => {
    if (phase !== 'break') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBreakRemaining(900);
    breakTimerRef.current = setInterval(() => {
      setBreakRemaining((s) => {
        if (s <= 1) {
          clearInterval(breakTimerRef.current!);
          setPhase('listening');
          setCurrentIndex(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(breakTimerRef.current!);
  }, [phase]);

  function submitWriting() {
    setPhase('break');
  }

  const handleListeningExpire = useCallback(() => {
    if (phase === 'listening') {
      setPhase('reading');
      setCurrentIndex(0);
    }
  }, [phase]);

  const handleReadingExpire = useCallback(() => {
    if (phase === 'reading') void submitFinal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, readingAnswers, listeningAnswers]);

  async function submitFinal() {
    setIsGrading(true);
    const listeningScore = scoreTopikIIMCQ(listeningQs, listeningAnswers);
    const readingScore = scoreTopikIIMCQ(readingQs, readingAnswers);

    // Grade essays via backend
    let writingScore = 0;
    let essayRubric = null;
    try {
      const essayText = (writingAnswers[53] ?? '') + '\n\n' + (writingAnswers[54] ?? '');
      const gradeRes = await fetch('/api/proxy/roadmap/essay/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay: essayText, level: targetLevel, prompt_hint: writingQs[2]?.topic ?? '' }),
      });
      if (gradeRes.ok) {
        const gradeData = await gradeRes.json();
        essayRubric = gradeData;
        writingScore = Math.min(gradeData.totalScore ?? 0, 100);
      }
    } catch {
      writingScore = 50; // default partial credit
    }

    const total = Math.round((listeningScore + readingScore + writingScore) * (300 / 300));
    const level = awardTopikIILevel(Math.min(total, 300));

    setResult({
      writingScore,
      listeningScore,
      readingScore,
      totalScore: Math.min(total, 300),
      levelAwarded: level,
      xpGained: level > 0 ? level * 200 : 100,
      essayRubric,
      listeningAnswers,
      readingAnswers,
      listeningQuestions: listeningQs,
      readingQuestions: readingQs,
    });
    setIsGrading(false);
    setPhase('results');
  }

  const currentMCQQuestions = phase === 'listening'
    ? (listeningQs as unknown as TopikIQuestion[])
    : (readingQs as unknown as TopikIQuestion[]);
  const currentMCQAnswers = phase === 'listening' ? listeningAnswers : readingAnswers;
  const questionIds = currentMCQQuestions.map((q) => q.id);

  function handleMCQAnswer(qId: string, idx: number) {
    if (phase === 'listening') setListeningAnswers((p) => ({ ...p, [qId]: idx }));
    else setReadingAnswers((p) => ({ ...p, [qId]: idx }));
  }

  const formatBreak = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (isLoading || isGrading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', fontFamily: '"Manrope", sans-serif' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>{isGrading ? '🤖' : '📋'}</div>
          <p style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-on-background)' }}>
            {isGrading ? 'AI is grading your essays…' : 'Loading Exam…'}
          </p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginTop: '8px' }}>
            {isGrading ? 'This may take up to 15 seconds' : 'Generating TOPIK-II questions'}
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '32px 20px 80px', fontFamily: '"Manrope", sans-serif' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-on-background)', marginBottom: '24px', fontFamily: '"EB Garamond", serif' }}>
            📊 TOPIK II — Exam Results
          </h1>
          <ExamScoreReport examType="topik-ii" result={result} />
        </div>
      </div>
    );
  }

  if (phase === 'break') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '24px',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
            maxWidth: '420px',
            width: '100%',
            fontFamily: '"Manrope", sans-serif',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>☕</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '8px', fontFamily: '"EB Garamond", serif' }}>
            쓰기 시험 완료
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '15px', marginBottom: '24px' }}>
            잠시 휴식 후 듣기 시험이 시작됩니다.
          </p>
          <div style={{ fontSize: '56px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"EB Garamond", serif', marginBottom: '24px' }}>
            {formatBreak(breakRemaining)}
          </div>
          <button
            onClick={() => {
              clearInterval(breakTimerRef.current!);
              setPhase('listening');
              setCurrentIndex(0);
            }}
            style={{
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 32px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(194, 101, 42, 0.3)',
              textTransform: 'uppercase',
              fontFamily: '"Manrope", sans-serif',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            지금 시작하기 →
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Exam Header (for listening / reading phases) ────────────────────────────
  const showMCQHeader = phase === 'listening' || phase === 'reading';
  const totalQCount = currentMCQQuestions.length;
  const answeredCount = Object.keys(currentMCQAnswers).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', fontFamily: '"Manrope", sans-serif' }}>
      {/* Header */}
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
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"EB Garamond", serif', cursor: 'pointer' }}>
            K-Mastery
          </span>
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
          {phase === 'writing' ? '✏️ Writing' : phase === 'listening' ? '🎧 Listening' : '📖 Reading'}
        </div>

        {showMCQHeader && (
          <ExamTimer
            key={phase}
            startSeconds={phase === 'listening' ? 3600 : 4200}
            onExpire={phase === 'listening' ? handleListeningExpire : handleReadingExpire}
          />
        )}
        {phase === 'writing' && (
          <ExamTimer key="writing" startSeconds={4200} onExpire={submitWriting} />
        )}

        {showMCQHeader && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              Q{currentIndex + 1} / {totalQCount}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
              {answeredCount}/{totalQCount} answered
            </span>
            <button
              onClick={() => {
                if (phase === 'listening') {
                  setPhase('reading');
                  setCurrentIndex(0);
                } else {
                  void submitFinal();
                }
              }}
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(194, 101, 42, 0.3)',
                textTransform: 'uppercase',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              {phase === 'listening' ? 'Next Section →' : 'Submit Exam →'}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 60px' }}>
        {phase === 'writing' && (
          <WritingSection
            questions={writingQs}
            answers={writingAnswers}
            onAnswer={(qNum, val) => setWritingAnswers((p) => ({ ...p, [qNum]: val }))}
            onSubmit={submitWriting}
          />
        )}

        {showMCQHeader && (
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
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
                      questions={currentMCQQuestions}
                      answers={currentMCQAnswers}
                      onAnswer={handleMCQAnswer}
                      currentIndex={currentIndex}
                      submitted={false}
                    />
                  ) : (
                    <ReadingSection
                      questions={currentMCQQuestions}
                      answers={currentMCQAnswers}
                      onAnswer={handleMCQAnswer}
                      currentIndex={currentIndex}
                      submitted={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

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

            <div style={{ width: '280px', flexShrink: 0 }}>
              <QuestionNavigator
                total={totalQCount}
                answers={currentMCQAnswers}
                currentIndex={currentIndex}
                questionIds={questionIds}
                onJump={setCurrentIndex}
                submitted={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopikIIExamPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontWeight: 700, color: 'var(--color-on-background)', fontFamily: '"Manrope", sans-serif' }}>Loading…</p>
      </div>
    }>
      <TopikIIExamInner />
    </Suspense>
  );
}
