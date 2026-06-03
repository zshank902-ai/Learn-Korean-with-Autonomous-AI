'use client';

import React from 'react';
import type { TopikIQuestion } from '@/lib/examTypes';

const OPTION_LABELS = ['①', '②', '③', '④'] as const;

interface ReadingSectionProps {
  questions: TopikIQuestion[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
  currentIndex: number;
  submitted: boolean;
}

function renderPassageWithBlanks(text: string) {
  const parts = text.split(/(\(_{6,}\)|\( *_{3,} *\))/g);
  return parts.map((part, i) => {
    if (/\(_{3,}\)|\( *_{3,} *\)/.test(part)) {
      return (
        <span
          key={i}
          className="inline-block bg-[var(--color-surface-container)] border border-[var(--color-primary)] rounded-md px-3 text-[var(--color-primary)] font-bold text-[15px] mx-1"
        >
          ______
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ReadingSection({
  questions,
  answers,
  onAnswer,
  currentIndex,
  submitted,
}: ReadingSectionProps) {
  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Question header */}
      <div className="flex items-center gap-3">
        <div className="bg-[var(--color-primary)] text-white rounded-xl px-4 py-1.5 font-bold text-[15px] shadow-sm">
          Q{q.questionNumber}
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg px-3.5 py-1 text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          Reading
        </div>
      </div>

      {/* Passage block */}
      {q.passageText && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm">
          <p className="m-0 text-base leading-relaxed text-[var(--color-on-surface)] font-medium">
            {renderPassageWithBlanks(q.passageText)}
          </p>
        </div>
      )}

      {/* Question text */}
      <p className="m-0 text-lg font-bold text-[var(--color-on-surface)] leading-relaxed font-serif">
        {q.questionText}
      </p>

      {/* MCQ Options */}
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const isSelected = answers[q.id] === i;
          const isCorrect = submitted && q.correctAnswer === i;
          const isWrong = submitted && isSelected && q.correctAnswer !== i;

          let bgClass = 'bg-[var(--color-surface)]';
          let borderClass = 'border-[var(--color-outline-variant)]';
          let textClass = 'text-[var(--color-on-surface)]';
          let circleBgClass = 'bg-[var(--color-surface-container)]';
          let circleTextClass = 'text-[var(--color-on-surface-variant)]';

          if (isCorrect) { 
            bgClass = 'bg-[#e8f5e9]'; 
            borderClass = 'border-[#81c784]'; 
            textClass = 'text-[#2e7d32]'; 
            circleBgClass = 'bg-[#81c784]';
            circleTextClass = 'text-white';
          }
          else if (isWrong) { 
            bgClass = 'bg-[#fef2f2]'; 
            borderClass = 'border-[#ef4444]'; 
            textClass = 'text-[#b91c1c]'; 
            circleBgClass = 'bg-[#ef4444]';
            circleTextClass = 'text-white';
          }
          else if (isSelected) { 
            bgClass = 'bg-[var(--color-surface-container)]'; 
            borderClass = 'border-[var(--color-primary)]'; 
            textClass = 'text-[var(--color-primary)]'; 
            circleBgClass = 'bg-[var(--color-primary)]';
            circleTextClass = 'text-white';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && onAnswer(q.id, i)}
              disabled={submitted}
              className={`flex items-center gap-3.5 ${bgClass} border ${borderClass} rounded-2xl px-5 py-4 ${submitted ? 'cursor-default' : 'cursor-pointer'} text-left w-full transition-all duration-200 ${isSelected ? 'shadow-md' : 'shadow-none hover:shadow-sm'} ${!submitted && !isSelected ? 'hover:border-[var(--color-primary)] hover:-translate-y-0.5' : ''}`}
            >
              <span className={`w-8 h-8 rounded-full ${circleBgClass} ${circleTextClass} flex items-center justify-center text-sm font-bold shrink-0`}>
                {OPTION_LABELS[i]}
              </span>
              <span className={`text-[15px] font-semibold leading-relaxed ${textClass}`}>{opt}</span>
              {isCorrect && <span className="ml-auto text-[#2e7d32] font-bold">✓</span>}
              {isWrong && <span className="ml-auto text-[#b91c1c] font-bold">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && q.explanation && (
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-2xl px-5 py-4 text-sm font-medium leading-relaxed text-[var(--color-on-surface)]">
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}
