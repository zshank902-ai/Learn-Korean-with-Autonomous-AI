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
        background: '#ffffff',
        border: '3px solid #0f0f0f',
        borderRadius: '18px',
        padding: '16px 20px',
        boxShadow: '4px 4px 0px #0f0f0f',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Question Navigator
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
          gap: '6px',
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const qId = questionIds[i];
          const isAnswered = qId !== undefined && answers[qId] !== undefined;
          const isCurrent = i === currentIndex;
          let bg = '#e5e7eb';       // unanswered gray
          let border = '#9ca3af';
          let color = '#4b5563';

          if (submitted && correctAnswers && qId) {
            const isCorrect = answers[qId] === correctAnswers[qId];
            bg = isCorrect ? '#D1FAE5' : '#FEE2E2';
            border = isCorrect ? '#059669' : '#EF4444';
            color = isCorrect ? '#059669' : '#EF4444';
          } else if (isCurrent) {
            bg = '#1E1B4B';
            border = '#1E1B4B';
            color = '#ffffff';
          } else if (isAnswered) {
            bg = '#D1FAE5';
            border = '#059669';
            color = '#059669';
          }

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              title={`Question ${i + 1}`}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: `2.5px solid ${border}`,
                background: bg,
                color,
                fontSize: '12px',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'transform 0.1s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[
          { color: '#e5e7eb', border: '#9ca3af', label: 'Unanswered' },
          { color: '#D1FAE5', border: '#059669', label: 'Answered' },
          { color: '#1E1B4B', border: '#1E1B4B', label: 'Current' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: l.color, border: `2px solid ${l.border}` }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
