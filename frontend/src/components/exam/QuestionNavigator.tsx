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
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
      }}
    >
      <p
        style={{
          margin: '0 0 16px',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-on-surface-variant)',
          fontFamily: '"Manrope", sans-serif',
        }}
      >
        Question Navigator
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
          gap: '8px',
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const qId = questionIds[i];
          const isAnswered = qId !== undefined && answers[qId] !== undefined;
          const isCurrent = i === currentIndex;
          let bg = 'var(--color-surface-container)'; // unanswered
          let border = 'var(--color-outline-variant)';
          let color = 'var(--color-on-surface-variant)';

          if (submitted && correctAnswers && qId) {
            const isCorrect = answers[qId] === correctAnswers[qId];
            bg = isCorrect ? '#e8f5e9' : '#fef2f2';
            border = isCorrect ? '#81c784' : '#ef4444';
            color = isCorrect ? '#2e7d32' : '#b91c1c';
          } else if (isCurrent) {
            bg = 'var(--color-primary)';
            border = 'var(--color-primary)';
            color = '#ffffff';
          } else if (isAnswered) {
            bg = '#e8f5e9';
            border = '#81c784';
            color = '#2e7d32';
          }

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              title={`Question ${i + 1}`}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: `1px solid ${border}`,
                background: bg,
                color,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Manrope", sans-serif',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--color-surface-container)', border: 'var(--color-outline-variant)', label: 'Unanswered' },
          { color: '#e8f5e9', border: '#81c784', label: 'Answered' },
          { color: 'var(--color-primary)', border: 'var(--color-primary)', label: 'Current' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: l.color, border: `1px solid ${l.border}` }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: '"Manrope", sans-serif' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
