"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2, ArrowRight, ArrowLeft, LogOut, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

type Option = {
  label: string;
  value: string | boolean;
};

type Question = {
  key: string;
  title: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    key: 'experience_level',
    title: 'Have you studied Korean before?',
    options: [
      { label: 'Never', value: 'none' },
      { label: 'A little (basics only)', value: 'beginner' },
      { label: 'Intermediate level', value: 'intermediate' }
    ]
  },
  {
    key: 'took_topik_before',
    title: 'Have you taken the TOPIK exam before?',
    options: [
      { label: 'No, never', value: false },
      { label: 'Yes, TOPIK I', value: true },
      { label: 'Yes, TOPIK II', value: true } // Same boolean flag for backend simplicity, though we could differentiate
    ]
  },
  {
    key: 'main_goal',
    title: "What's your main goal for learning Korean?",
    options: [
      { label: 'Travel & daily life ✈️', value: 'travel' },
      { label: 'K-Drama & K-Pop 🎬', value: 'kdrama' },
      { label: 'Pass the TOPIK exam 📝', value: 'topik_exam' },
      { label: 'Work & business 💼', value: 'work' }
    ]
  },
  {
    key: 'study_time_per_day',
    title: 'How much time can you study each day?',
    options: [
      { label: '5–10 minutes', value: '5min' },
      { label: '15–20 minutes', value: '15min' },
      { label: '30+ minutes', value: '30min_plus' }
    ]
  },
  {
    key: 'biggest_challenge',
    title: "What's your biggest challenge with Korean?",
    options: [
      { label: 'The alphabet (Hangul)', value: 'hangul' },
      { label: 'Pronunciation', value: 'pronunciation' },
      { label: 'Grammar rules', value: 'grammar' },
      { label: 'Vocabulary memorization', value: 'vocabulary' }
    ]
  }
];

export default function OnboardingModal() {
  const { 
    isOpen, 
    isChecking, 
    isSubmitting, 
    result, 
    error, 
    submitAnswers, 
    closeAndComplete 
  } = useOnboarding();
  const { logout } = useAuthStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [direction, setDirection] = useState(1);

  if (isChecking || !isOpen) return null;

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentQuestion((prev) => prev + 1);
    } else {
      submitAnswers(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSelect = (key: string, value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const q = QUESTIONS[currentQuestion];
  const isSelected = (val: string | boolean) => answers[q.key] === val;
  const canProceed = answers[q.key] !== undefined;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] w-full max-w-lg rounded-3xl border border-[var(--color-outline-variant)] overflow-hidden shadow-sm flex flex-col relative"
      >
        {/* Logout Button for trapped users */}
        <button 
          onClick={() => logout()}
          className="absolute top-4 right-4 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors z-10 p-2 bg-[var(--color-surface-container)] rounded-full"
          title="Sign out and switch accounts"
        >
          <LogOut size={20} />
        </button>

        {isSubmitting ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] font-serif">🤖 AI is personalizing your learning path...</h2>
            <p className="text-[var(--color-on-surface-variant)] font-semibold">This will only take a moment.</p>
          </div>
        ) : result ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-2 shadow-sm">
              <CheckCircle className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)] font-serif">Your learning profile is ready!</h2>
            
            <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-6 rounded-2xl w-full text-left">
              <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-bold uppercase rounded-full mb-3 tracking-wide">
                Difficulty: {result.difficulty}
              </span>
              <p className="text-[var(--color-on-surface)] text-lg font-semibold">{result.reasoning}</p>
            </div>

            <button
              onClick={closeAndComplete}
              className="mt-6 w-full py-4 sahara-btn text-white font-bold text-xl rounded-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Let's start learning <ArrowRight size={24} />
            </button>
          </div>
        ) : (
          <>
            {/* Progress Bar Header */}
            <div className="p-6 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]">
              <div className="flex justify-between items-center text-sm font-bold text-[var(--color-on-surface-variant)] mb-3">
                <span className="uppercase tracking-wide">Onboarding</span>
                <span>{currentQuestion + 1} / {QUESTIONS.length}</span>
              </div>
              <div className="h-2 w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[var(--color-primary)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6 md:p-8 min-h-[320px] relative overflow-hidden flex flex-col justify-center bg-[var(--color-surface)]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentQuestion}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-on-surface)] mb-6 text-center leading-tight font-serif">
                    {q.title}
                  </h2>
                  <div className="space-y-3">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(q.key, opt.value)}
                        className={`w-full p-4 rounded-xl border font-bold flex items-center justify-between transition-all text-left ${
                          isSelected(opt.value)
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
                            : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]'
                        }`}
                      >
                        {opt.label}
                        {isSelected(opt.value) && <CheckCircle size={20} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {error && (
              <div className="px-6 pb-4 text-[#ef4444] text-center font-semibold text-sm">
                {error}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="p-6 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-[var(--color-on-surface-variant)] disabled:opacity-30 hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                <ArrowLeft size={18} /> Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="px-8 py-3 sahara-btn text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-1"
              >
                {currentQuestion === QUESTIONS.length - 1 ? 'Submit' : 'Next'} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
