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
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-5xl mb-4">{isGrading ? '🤖' : '📋'}</div>
          <p className="font-extrabold text-xl text-[var(--color-on-background)] font-serif">
            {isGrading ? 'AI is grading your essays…' : 'Loading Exam…'}
          </p>
          <p className="text-[var(--color-on-surface-variant)] text-sm mt-2 font-medium">
            {isGrading ? 'This may take up to 15 seconds' : 'Generating TOPIK-II questions'}
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-8 pb-20 font-sans">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[var(--color-on-background)] mb-6 font-serif">
            📊 TOPIK II — Exam Results
          </h1>
          <ExamScoreReport examType="topik-ii" result={result} />
        </div>
      </div>
    );
  }

  if (phase === 'break') {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-3xl p-12 text-center shadow-sm w-full max-w-md"
        >
          <div className="text-6xl mb-4">☕</div>
          <h2 className="text-3xl font-extrabold text-[var(--color-on-surface)] mb-2 font-serif">
            쓰기 시험 완료
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-base mb-6 font-medium">
            잠시 휴식 후 듣기 시험이 시작됩니다.
          </p>
          <div className="text-6xl font-extrabold text-[var(--color-primary)] font-serif mb-8 leading-none">
            {formatBreak(breakRemaining)}
          </div>
          <button
            onClick={() => {
              clearInterval(breakTimerRef.current!);
              setPhase('listening');
              setCurrentIndex(0);
            }}
            className="sahara-btn px-8 py-4 text-base w-full uppercase tracking-widest"
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
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">
      {/* Header */}
      <div
        className="bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)] py-4 px-6 flex items-center gap-4 flex-wrap sticky top-0 z-50 shadow-sm"
      >
        <Link href="/roadmap" className="no-underline">
          <span className="text-2xl font-extrabold text-[var(--color-primary)] font-serif cursor-pointer">
            K-Mastery
          </span>
        </Link>
        <div
          className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl py-1.5 px-4 font-bold text-sm text-[var(--color-on-surface)] uppercase tracking-wide"
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
          <div className="ml-auto flex items-center gap-4">
            <span className="text-base font-bold text-[var(--color-on-surface)]">
              Q{currentIndex + 1} / {totalQCount}
            </span>
            <span className="text-sm text-[var(--color-on-surface-variant)] font-medium">
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
              className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all sahara-btn"
            >
              {phase === 'listening' ? 'Next Section →' : 'Submit Exam →'}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 flex gap-8 flex-col lg:flex-row items-start">
        {phase === 'writing' && (
          <div className="w-full">
            <WritingSection
              questions={writingQs}
              answers={writingAnswers}
              onAnswer={(qNum, val) => setWritingAnswers((p) => ({ ...p, [qNum]: val }))}
              onSubmit={submitWriting}
            />
          </div>
        )}

        {showMCQHeader && (
          <div className="flex w-full gap-8 flex-col lg:flex-row items-start">
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
                      questions={currentMCQQuestions as any}
                      answers={currentMCQAnswers}
                      onAnswer={handleMCQAnswer}
                      currentIndex={currentIndex}
                      submitted={false}
                    />
                  ) : (
                    <ReadingSection
                      questions={currentMCQQuestions as any}
                      answers={currentMCQAnswers}
                      onAnswer={handleMCQAnswer}
                      currentIndex={currentIndex}
                      submitted={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

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

            <div className="w-full lg:w-[320px] shrink-0 sticky top-28">
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
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <p className="font-bold text-[var(--color-on-background)] font-sans">Loading…</p>
      </div>
    }>
      <TopikIIExamInner />
    </Suspense>
  );
}
