'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle2, X, ChevronRight, Coffee, Volume2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import type {
  MockExamConfig,
  MCQQuestion,
  MockExamResult,
  ExamType,
} from '@/lib/roadmapTypes';
import ScoreScreen from './ScoreScreen';

// ─── Types ─────────────────────────────────────────────────────────────────

type ExamPhase =
  | 'loading'
  | 'writing'
  | 'break'
  | 'listening'
  | 'reading'
  | 'submit'
  | 'results';

interface SectionAnswer {
  selected: number;
  correct: boolean;
}

interface MockExamRunnerProps {
  levelId: number;
  levelColor: string;
  xpEarned: number;
  onClose: () => void;
}

// ─── Helper: format seconds → MM:SS ────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function MockExamRunner({
  levelId,
  levelColor,
  xpEarned,
  onClose,
}: MockExamRunnerProps) {
  const [phase, setPhase] = useState<ExamPhase>('loading');
  const [config, setConfig] = useState<MockExamConfig | null>(null);
  const [examId, setExamId] = useState<string>('');
  const [questions, setQuestions] = useState<Record<string, MCQQuestion[]>>({});
  const [examType, setExamType] = useState<ExamType>('TOPIK-I');

  // Per-section state
  const [currentSection, setCurrentSection] = useState<'listening' | 'reading'>('listening');
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [sectionAnswers, setSectionAnswers] = useState<
    Record<string, Record<number, SectionAnswer>>
  >({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [playing, setPlaying] = useState(false);
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

  // Writing essay state
  const [essayText, setEssayText] = useState('');

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [breakRemaining, setBreakRemaining] = useState(30 * 60); // 30 min in seconds
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [error, setError] = useState<string>('');

  // ─── Fetch exam on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.ROADMAP}/mock/${levelId}/generate`);
        if (!res.ok) throw new Error('Failed to generate exam');
        const data = await res.json() as {
          examId: string;
          config: MockExamConfig;
          questions: Record<string, MCQQuestion[]>;
        };
        setExamId(data.examId);
        setConfig(data.config);
        setQuestions(data.questions);
        setExamType(data.config.examType);

        // Determine first phase
        if (data.config.examType === 'TOPIK-II') {
          const writingSection = data.config.sections.find(
            (s) => s.name.toLowerCase() === 'writing',
          );
          setTimeRemaining((writingSection?.time_min ?? 70) * 60);
          setPhase('writing');
        } else {
          const listeningSection = data.config.sections.find(
            (s) => s.name.toLowerCase() === 'listening',
          );
          setCurrentSection('listening');
          setTimeRemaining((listeningSection?.time_min ?? 40) * 60);
          setPhase('listening');
        }
      } catch {
        setError('Failed to load exam. Please try again.');
        setPhase('results');
      }
    };
    void loadExam();
  }, [levelId]);

  // ─── Main countdown timer ─────────────────────────────────────────────────
  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeRemaining(seconds);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Auto-advance phase when timer hits 0
  useEffect(() => {
    if (timeRemaining !== 0 || phase === 'loading' || phase === 'break' || phase === 'results') return;
    // eslint-disable-next-line react-hooks/immutability
    handlePhaseEnd();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, []);

  // ─── Phase transitions ────────────────────────────────────────────────────
  const handlePhaseEnd = useCallback(() => {
    if (phase === 'writing') {
      // Start 30-min break before MCQ sections
      setPhase('break');
      setBreakRemaining(30 * 60);
      breakTimerRef.current = setInterval(() => {
        setBreakRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(breakTimerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'listening') {
      const readingSection = config?.sections.find(
        (s) => s.name.toLowerCase() === 'reading',
      );
      setCurrentSection('reading');
      setCurrentQIdx(0);
      setSelectedOption(null);
      setShowExplanation(false);
      startTimer((readingSection?.time_min ?? 60) * 60);
      setPhase('reading');
    } else if (phase === 'reading') {
      setPhase('submit');
      // eslint-disable-next-line react-hooks/immutability
      void submitExam();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, config, startTimer]);

  // Auto-advance break → listening
  useEffect(() => {
    if (breakRemaining === 0 && phase === 'break') {
      const listeningSection = config?.sections.find(
        (s) => s.name.toLowerCase() === 'listening',
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentSection('listening');
      setCurrentQIdx(0);
      setSelectedOption(null);
      setShowExplanation(false);
      startTimer((listeningSection?.time_min ?? 60) * 60);
      setPhase('listening');
    }
  }, [breakRemaining, phase, config, startTimer]);

  // When MCQ phase starts, kick off the timer
  useEffect(() => {
    if (phase === 'listening') {
      const listeningSection = config?.sections.find(
        (s) => s.name.toLowerCase() === 'listening',
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (listeningSection) startTimer(listeningSection.time_min * 60);
    }
    if (phase === 'reading') {
      const readingSection = config?.sections.find(
        (s) => s.name.toLowerCase() === 'reading',
      );
      if (readingSection) startTimer(readingSection.time_min * 60);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── MCQ interaction ──────────────────────────────────────────────────────
  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // already answered
    const sectionQs = questions[currentSection] ?? [];
    const correctIdx = sectionQs[currentQIdx]?.correct ?? 0;
    setSelectedOption(idx);
    setShowExplanation(true);
    setSectionAnswers((prev) => ({
      ...prev,
      [currentSection]: {
        ...(prev[currentSection] ?? {}),
        [currentQIdx]: { selected: idx, correct: idx === correctIdx },
      },
    }));
  };

  const handleNextQuestion = () => {
    const sectionQs = questions[currentSection] ?? [];
    if (currentQIdx < sectionQs.length - 1) {
      setCurrentQIdx((p) => p + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // End of section
      handlePhaseEnd();
    }
  };

  // ─── Submit exam ──────────────────────────────────────────────────────────
  const submitExam = async () => {
    setPhase('submit');
    try {
      const answersPayload: Record<string, Record<number, SectionAnswer>> = { ...sectionAnswers };

      const res = await fetch(`${API_ENDPOINTS.ROADMAP}/mock/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload, user_id: 1 }),
      });

      if (!res.ok) throw new Error('Submit failed');
      const data = await res.json() as MockExamResult;
      setResult(data);
      setPhase('results');
    } catch {
      // Graceful fallback — compute score locally
      let totalCorrect = 0;
      let totalQ = 0;
      Object.values(sectionAnswers).forEach((section) => {
        Object.values(section).forEach((ans) => {
          if (ans.correct) totalCorrect++;
          totalQ++;
        });
      });
      const score = totalQ > 0 ? Math.round((totalCorrect / totalQ) * (config?.maxScore ?? 200)) : 0;
      setResult({
        totalScore: score,
        passed: score >= (config?.passScore ?? 80),
        sectionScores: {},
        weakAreas: [],
        passScore: config?.passScore ?? 80,
        maxScore: config?.maxScore ?? 200,
        readinessPercent: Math.min(Math.round((score / (config?.passScore ?? 80)) * 100), 100),
      });
      setPhase('results');
    }
  };

  // ─── Current MCQ question ─────────────────────────────────────────────────
  const currentQs = questions[currentSection] ?? [];
  const currentQ = currentQs[currentQIdx] as MCQQuestion | undefined;
  const isLowTime = timeRemaining < 300; // < 5 min
  const optionLabels = ['A', 'B', 'C', 'D'];

  // ─── Render phases ────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[var(--color-surface-container-low)] overflow-y-auto"
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--color-outline-variant)] shadow-sm"
            style={{ background: levelColor }}
          >
            <span className="text-lg">🏆</span>
          </div>
          <div>
            <p className="font-extrabold text-[var(--color-on-surface)] text-lg font-serif">
              TOPIK {levelId} Mock Exam
            </p>
            <p className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
              {examType} · {phase.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Countdown timer */}
        {(phase === 'listening' || phase === 'reading' || phase === 'writing') && (
          <motion.div
            animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] font-extrabold text-xl font-serif ${
              isLowTime ? 'bg-red-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-on-surface)]'
            }`}
          >
            <Timer size={20} />
            {formatTime(timeRemaining)}
          </motion.div>
        )}

        <button
          onClick={onClose}
          className="px-4 py-2 flex items-center gap-2 rounded-xl border border-red-400 bg-[#ffebee] hover:bg-red-100 text-[#c62828] transition-colors font-bold shadow-sm"
        >
          <X size={18} />
          <span className="hidden sm:inline">Quit Exam</span>
        </button>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* Loading */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-16 h-16 border-4 border-[var(--color-surface-container)] border-t-[var(--color-primary)] rounded-full"
              />
              <p className="font-extrabold text-[var(--color-on-surface)] text-2xl font-serif">
                Generating Your Exam...
              </p>
            </motion.div>
          )}

          {/* Writing Phase (TOPIK-II) */}
          {phase === 'writing' && (
            <motion.div key="writing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-8 mb-6 shadow-sm">
                <h2 className="font-extrabold text-2xl mb-2 text-[var(--color-on-surface)] font-serif">
                  ✏️ Writing Section
                </h2>
                <p className="text-[var(--color-on-surface-variant)] font-semibold mb-6">
                  Write a {levelId >= 5 ? '600-700' : '200-300'} character essay on a topic of your TOPIK level.
                </p>
                <p className="font-bold text-[var(--color-on-surface)] mb-3">Essay Prompt:</p>
                <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 mb-4 border border-[var(--color-outline-variant)]">
                  <p className="text-[var(--color-on-surface)]">
                    {levelId >= 5
                      ? '환경 문제를 해결하기 위한 방법에 대해 자신의 의견을 쓰십시오.'
                      : '여러분이 좋아하는 계절은 무엇입니까? 이유를 쓰십시오.'}
                  </p>
                </div>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="여기에 작문을 쓰세요..."
                  className="w-full h-48 p-5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-on-surface)] shadow-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm font-bold ${
                    essayText.length >= (levelId >= 5 ? 600 : 200) && essayText.length <= (levelId >= 5 ? 700 : 300)
                      ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {essayText.length} chars
                  </span>
                  <button
                    onClick={handlePhaseEnd}
                    className="sahara-btn px-6 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
                  >
                    Submit Writing <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Break Screen (TOPIK-II only) */}
          {phase === 'break' && (
            <motion.div key="break" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <div className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-12 text-center max-w-md shadow-sm">
                <Coffee size={64} className="text-[var(--color-primary)] mx-auto mb-4" />
                <h2 className="font-extrabold text-3xl mb-2 text-[var(--color-on-surface)] font-serif">
                  Break Time ☕
                </h2>
                <p className="text-[var(--color-on-surface-variant)] font-semibold mb-6">
                  Rest up before the listening + reading sections.
                </p>
                <div className="text-[56px] font-extrabold text-[var(--color-primary)] mb-4 font-serif">
                  {formatTime(breakRemaining)}
                </div>
                <button
                  onClick={() => setBreakRemaining(0)}
                  className="sahara-btn px-8 py-3 rounded-xl font-bold uppercase tracking-wider shadow-sm"
                >
                  Skip Break →
                </button>
              </div>
            </motion.div>
          )}

          {/* MCQ Phases: Listening & Reading */}
          {(phase === 'listening' || phase === 'reading') && (
            <motion.div key={phase} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{phase === 'listening' ? '🎧' : '📰'}</span>
                  <div>
                    <h2 className="font-extrabold text-2xl text-[var(--color-on-surface)] font-serif">
                      {phase === 'listening' ? 'Listening' : 'Reading'} Section
                    </h2>
                    <p className="text-[11px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
                      Question {currentQIdx + 1} of {currentQs.length}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-32 h-3 bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: levelColor }}
                    animate={{ width: `${((currentQIdx + 1) / Math.max(currentQs.length, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {currentQ ? (
                <motion.div
                  key={currentQIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-8 shadow-sm"
                >
                  {currentSection === 'listening' && (
                    <div className="flex items-center gap-4 mb-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakText(currentQ.audioText || currentQ.question)}
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
                  <p className="font-bold text-[var(--color-on-surface)] text-lg mb-6 leading-relaxed font-serif">
                    {currentSection === 'listening' && selectedOption === null ? 'Listen to the audio and choose the correct option.' : currentQ.question}
                  </p>

                  <div className="space-y-3 mb-6">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = currentQ.correct === idx;
                      let bgColor = 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-container)]';
                      if (selectedOption !== null) {
                        if (isCorrect) bgColor = 'bg-[#e8f5e9] border-[#4caf50]';
                        else if (isSelected) bgColor = 'bg-[#ffebee] border-[#ef5350]';
                      }
                      return (
                        <motion.button
                          key={idx}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectOption(idx)}
                          disabled={selectedOption !== null}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-outline-variant)] text-left font-semibold transition-colors shadow-sm ${bgColor} disabled:cursor-default`}
                        >
                          <span
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border border-[var(--color-outline-variant)]"
                            style={{ background: isSelected || (selectedOption !== null && isCorrect) ? levelColor : 'var(--color-surface-container)', color: 'var(--color-on-surface)' }}
                          >
                            {optionLabels[idx]}
                          </span>
                          <span className="text-[15px] text-[var(--color-on-surface)]">{opt}</span>
                          {selectedOption !== null && isCorrect && (
                            <CheckCircle2 size={18} className="text-green-600 ml-auto shrink-0" />
                          )}
                          {selectedOption !== null && isSelected && !isCorrect && (
                            <X size={18} className="text-red-500 ml-auto shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {showExplanation && currentQ.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-5 mb-4 text-[14px] text-[var(--color-on-surface)] font-medium shadow-sm"
                      >
                        💡 {currentQ.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedOption !== null && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleNextQuestion}
                      className="sahara-btn w-full py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                    >
                      {currentQIdx < currentQs.length - 1 ? 'Next Question' : 'Finish Section'}
                      <ChevronRight size={18} />
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 text-center">
                  <AlertTriangle size={32} className="text-yellow-600 mx-auto mb-2" />
                  <p className="font-bold text-yellow-800">
                    Questions are being generated by AI. Please wait a moment and refresh.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Submitting */}
          {phase === 'submit' && (
            <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-16 h-16 border-4 border-[var(--color-surface-container)] border-t-[var(--color-primary)] rounded-full"
              />
              <p className="font-extrabold text-2xl text-[var(--color-on-surface)] font-serif">
                Calculating Your Score...
              </p>
            </motion.div>
          )}

          {/* Results */}
          {phase === 'results' && result && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ScoreScreen
                result={result}
                resultType="mock"
                onClose={onClose}
                xpEarned={xpEarned}
              />
            </motion.div>
          )}

          {/* Error */}
          {phase === 'results' && !result && error && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <AlertTriangle size={48} className="text-red-500" />
              <p className="font-extrabold text-xl text-[var(--color-on-surface)]">{error}</p>
              <button
                onClick={onClose}
                className="sahara-btn px-6 py-3 rounded-xl font-bold uppercase tracking-wider shadow-sm"
              >
                Close
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
