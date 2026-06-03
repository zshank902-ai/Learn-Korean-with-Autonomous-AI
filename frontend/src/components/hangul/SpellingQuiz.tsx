'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHangulStore } from '@/store/hangulStore';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface QuizQuestion {
  type: 'A' | 'B' | 'C' | 'D';
  target: string;
  options: string[];
  answer: string;
  prompt: string;
}

export default function SpellingQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selected, setSelected] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);

  const { speak } = useSpeechSynthesis();
  const { recordQuizResult, addXP, setTab } = useHangulStore();

  useEffect(() => {
    fetch('/api/v1/hangul/quiz?count=20')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        // Fallback for demo
        setQuestions([
          { type: 'A', prompt: 'What Jamo is this?', target: 'ㄱ', options: ['g/k', 'n', 'd/t', 'r/l'], answer: 'g/k' },
          { type: 'B', prompt: 'Which syllable block is this?', target: 'han', options: ['한', '가', '바', '나'], answer: '한' },
          { type: 'D', prompt: 'Listen & Choose', target: '물', options: ['불', '물', '풀', '술'], answer: '물' }
        ]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || isFinished) return;
    
    // Auto-play audio for mode D
    if (questions[currentIndex]?.type === 'D') {
      speak(questions[currentIndex].target);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, loading, isFinished]);

  const handleTimeout = () => {
    recordQuizResult(false);
    nextQuestion();
  };

  const handleSelect = (option: string) => {
    if (selected) return; // Prevent double click
    
    setSelected(option);
    const correct = option === questions[currentIndex].answer;
    setIsCorrect(correct);
    recordQuizResult(correct);
    
    if (correct) {
      setScore(s => s + 1);
      addXP(5);
    }

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    setSelected(null);
    setIsCorrect(null);
    setTimeLeft(30);
    
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      // POST progress
      fetch('/api/v1/hangul/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: '1', xp_earned: score * 5, accuracy: score / questions.length, mode: 'quiz' })
      }).catch(console.error);
    } else {
      setCurrentIndex(c => c + 1);
    }
  };

  if (loading) return <div className="p-16 text-center font-extrabold text-2xl font-serif text-[var(--color-on-surface)]">Loading Quiz...</div>;

  if (isFinished) {
    return (
      <div className="py-10 flex flex-col items-center">
        <h1 className="text-6xl mb-4">🏁</h1>
        <h2 className="text-4xl font-extrabold font-serif mb-8 text-[var(--color-on-surface)]">QUIZ COMPLETE</h2>
        
        <div className="sahara-card rounded-3xl p-10 w-full max-w-md text-center">
          <h3 className="text-lg font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest font-sans">Final Score</h3>
          <p className={`text-7xl font-extrabold font-serif my-4 drop-shadow-sm ${score >= 7 ? 'text-[#10B981]' : 'text-[var(--color-error)]'}`}>{score} / {questions.length}</p>
          <p className="text-xl font-bold text-[var(--color-primary-container)] bg-[var(--color-surface)] border border-[var(--color-outline-variant)] py-3 rounded-xl font-sans inline-block px-6">+{score * 5} XP Earned!</p>
        </div>
        
        <button onClick={() => setTab('jamo')} className="mt-12 sahara-btn px-8 py-4 text-xl">
          Back to Explorer
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold font-serif text-[var(--color-on-surface)]">SPELLING QUIZ</h1>
        <div className="text-xl font-bold font-sans text-[var(--color-on-surface-variant)]">Question {currentIndex + 1} of {questions.length}</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-4 border border-[var(--color-outline-variant)] rounded-full overflow-hidden mb-10 bg-[var(--color-surface-container)]">
        <div style={{ width: `${(timeLeft / 30) * 100}%` }} className={`h-full transition-[width] duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'}`} />
      </div>

      <div className="flex flex-col items-center gap-12">
        
        {/* Question Area */}
        <div className="text-center w-full max-w-md">
          <h2 className="text-xl font-bold text-[var(--color-on-surface-variant)] mb-4 uppercase tracking-widest font-sans">{q.prompt}</h2>
          
          <div className="sahara-card rounded-3xl p-10 min-w-[300px] flex items-center justify-center">
            {q.type === 'D' ? (
              <button onClick={() => speak(q.target)} className="text-6xl bg-transparent border-none cursor-pointer hover:scale-110 transition-transform">🔊</button>
            ) : (
              <span className="text-[80px] font-extrabold font-serif drop-shadow-sm leading-none">{q.target}</span>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {q.options.map((opt, i) => {
            const isSelected = selected === opt;
            let bgClass = 'bg-[var(--color-surface)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]';
            
            if (selected) {
              if (opt === q.answer) {
                bgClass = 'bg-[#10B981] text-white border-[#10B981]'; // Green if correct answer
              } else if (isSelected) {
                bgClass = 'bg-[var(--color-error)] text-white border-[var(--color-error)]'; // Red if wrong selection
              } else {
                bgClass = 'bg-[var(--color-surface)] text-[var(--color-outline-variant)] border-[var(--color-surface-container)] opacity-50 cursor-not-allowed';
              }
            }

            return (
              <motion.button
                key={i}
                whileHover={selected ? {} : { y: -2 }}
                whileTap={selected ? {} : { y: 2 }}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                className={`p-6 text-2xl font-extrabold rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${bgClass} ${q.type === 'A' ? 'font-sans' : 'font-serif'}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
