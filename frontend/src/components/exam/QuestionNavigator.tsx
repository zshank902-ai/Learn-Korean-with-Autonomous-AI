'use client';

import React from 'react';

interface QuestionNavigatorProps {
  total: number;
  answers: Record<string, number>;
  currentIndex: number;
  questionIds: string[];
  onJump: (index: number) => void;
  submitted: boolean;
  correctAnswers?: Record<string, number>; // after submit for coloring
}

export default function QuestionNavigator({
  total,
  answers,
  currentIndex,
  questionIds,
  onJump,
  submitted,
  correctAnswers,
}: QuestionNavigatorProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] font-sans">
        Question Navigator
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-2">
        {Array.from({ length: total }, (_, i) => {
          const qId = questionIds[i];
          const isAnswered = qId !== undefined && answers[qId] !== undefined;
          const isCurrent = i === currentIndex;
          let bgClass = 'bg-[var(--color-surface-container)]'; // unanswered
          let borderClass = 'border-[var(--color-outline-variant)]';
          let textClass = 'text-[var(--color-on-surface-variant)]';

          if (submitted && correctAnswers && qId) {
            const isCorrect = answers[qId] === correctAnswers[qId];
            bgClass = isCorrect ? 'bg-[#e8f5e9]' : 'bg-[#fef2f2]';
            borderClass = isCorrect ? 'border-[#81c784]' : 'border-[#ef4444]';
            textClass = isCorrect ? 'text-[#2e7d32]' : 'text-[#b91c1c]';
          } else if (isCurrent) {
            bgClass = 'bg-[var(--color-primary)]';
            borderClass = 'border-[var(--color-primary)]';
            textClass = 'text-white';
          } else if (isAnswered) {
            bgClass = 'bg-[#e8f5e9]';
            borderClass = 'border-[#81c784]';
            textClass = 'text-[#2e7d32]';
          }

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              title={`Question ${i + 1}`}
              className={`w-9 h-9 rounded-xl border ${borderClass} ${bgClass} ${textClass} text-sm font-bold cursor-pointer transition-all duration-200 hover:scale-110 font-sans`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-5 flex-wrap">
        {[
          { bgClass: 'bg-[var(--color-surface-container)]', borderClass: 'border-[var(--color-outline-variant)]', label: 'Unanswered' },
          { bgClass: 'bg-[#e8f5e9]', borderClass: 'border-[#81c784]', label: 'Answered' },
          { bgClass: 'bg-[var(--color-primary)]', borderClass: 'border-[var(--color-primary)]', label: 'Current' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded border ${l.bgClass} ${l.borderClass}`} />
            <span className="text-xs font-semibold text-[var(--color-on-surface-variant)] font-sans">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
