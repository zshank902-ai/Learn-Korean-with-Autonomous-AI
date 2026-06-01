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

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', fontWeight: 900 }}>Loading Quiz...</div>;

  if (isFinished) {
    return (
      <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>🏁</h1>
        <h2 style={{ fontSize: '32px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', marginBottom: '32px' }}>QUIZ COMPLETE</h2>
        
        <div style={{ background: '#FAFAFA', border: '6px solid #0f0f0f', borderRadius: '32px', padding: '40px', boxShadow: '12px 12px 0px #0f0f0f', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#6b7280', textTransform: 'uppercase' }}>Final Score</h3>
          <p style={{ fontSize: '72px', fontWeight: 900, margin: '16px 0', color: score >= 7 ? '#10B981' : '#FF4B4B' }}>{score} / {questions.length}</p>
          <p style={{ fontSize: '20px', fontWeight: 900, color: '#00E5FF', background: '#0f0f0f', padding: '12px', borderRadius: '12px' }}>+{score * 5} XP Earned!</p>
        </div>
        
        <button onClick={() => setTab('jamo')} style={{ marginTop: '48px', padding: '16px 32px', background: '#FFD600', border: '4px solid #0f0f0f', borderRadius: '16px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '6px 6px 0px #0f0f0f' }}>
          Back to Explorer
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif' }}>SPELLING QUIZ</h1>
        <div style={{ fontSize: '20px', fontWeight: 900 }}>Question {currentIndex + 1} of {questions.length}</div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '24px', border: '4px solid #0f0f0f', borderRadius: '12px', overflow: 'hidden', marginBottom: '40px', background: '#FAFAFA' }}>
        <div style={{ width: `${(timeLeft / 30) * 100}%`, height: '100%', background: timeLeft <= 5 ? '#FF4B4B' : '#00E5FF', transition: 'width 1s linear' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
        
        {/* Question Area */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>{q.prompt}</h2>
          
          <div style={{ background: '#fff', border: '6px solid #0f0f0f', borderRadius: '24px', padding: '40px', boxShadow: '8px 8px 0px #0f0f0f', minWidth: '300px' }}>
            {q.type === 'D' ? (
              <button onClick={() => speak(q.target)} style={{ fontSize: '64px', background: 'transparent', border: 'none', cursor: 'pointer' }}>🔊</button>
            ) : (
              <span style={{ fontSize: '80px', fontWeight: 900, fontFamily: '"Noto Sans KR", sans-serif' }}>{q.target}</span>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '600px' }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === opt;
            let bg = '#FAFAFA';
            let color = '#0f0f0f';
            
            if (selected) {
              if (opt === q.answer) {
                bg = '#10B981'; // Green if correct answer
                color = '#fff';
              } else if (isSelected) {
                bg = '#FF4B4B'; // Red if wrong selection
                color = '#fff';
              }
            }

            return (
              <motion.button
                key={i}
                whileHover={{ y: selected ? 0 : -4, boxShadow: selected ? '4px 4px 0px #0f0f0f' : '8px 8px 0px #0f0f0f' }}
                whileTap={{ y: selected ? 0 : 4, x: selected ? 0 : 4, boxShadow: '0px 0px 0px #0f0f0f' }}
                onClick={() => handleSelect(opt)}
                disabled={!!selected}
                style={{
                  padding: '24px',
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: q.type === 'A' ? '"Space Grotesk", sans-serif' : '"Noto Sans KR", sans-serif',
                  background: bg,
                  color: color,
                  border: '4px solid #0f0f0f',
                  borderRadius: '16px',
                  cursor: selected ? 'default' : 'pointer',
                  boxShadow: '4px 4px 0px #0f0f0f',
                  transition: 'background 0.2s'
                }}
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
