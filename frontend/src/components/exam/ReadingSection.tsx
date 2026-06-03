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
          style={{
            display: 'inline-block',
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-primary)',
            borderRadius: '6px',
            padding: '0 12px',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '15px',
            margin: '0 4px',
          }}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Manrope", sans-serif' }}>
      {/* Question header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: 'var(--color-primary)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(194, 101, 42, 0.2)',
          }}
        >
          Q{q.questionNumber}
        </div>
        <div
          style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '10px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-on-surface-variant)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Reading
        </div>
      </div>

      {/* Passage block */}
      {q.passageText && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: 1.8,
              color: 'var(--color-on-surface)',
              fontWeight: 500,
            }}
          >
            {renderPassageWithBlanks(q.passageText)}
          </p>
        </div>
      )}

      {/* Question text */}
      <p
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-on-surface)',
          lineHeight: 1.6,
          fontFamily: '"EB Garamond", serif',
        }}
      >
        {q.questionText}
      </p>

      {/* MCQ Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {q.options.map((opt, i) => {
          const isSelected = answers[q.id] === i;
          const isCorrect = submitted && q.correctAnswer === i;
          const isWrong = submitted && isSelected && q.correctAnswer !== i;

          let bg = 'var(--color-surface)';
          let border = 'var(--color-outline-variant)';
          let color = 'var(--color-on-surface)';

          if (isCorrect) { bg = '#e8f5e9'; border = '#81c784'; color = '#2e7d32'; }
          else if (isWrong) { bg = '#fef2f2'; border = '#ef4444'; color = '#b91c1c'; }
          else if (isSelected) { bg = 'var(--color-surface-container)'; border = 'var(--color-primary)'; color = 'var(--color-primary)'; }

          return (
            <button
              key={i}
              onClick={() => !submitted && onAnswer(q.id, i)}
              disabled={submitted}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '16px',
                padding: '16px 20px',
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(58, 48, 42, 0.08)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!submitted) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitted && !isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-outline-variant)';
                }
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isSelected || isCorrect || isWrong ? border : 'var(--color-surface-container)',
                  color: isSelected || isCorrect || isWrong ? '#ffffff' : 'var(--color-on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {OPTION_LABELS[i]}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 600, color, lineHeight: 1.5 }}>{opt}</span>
              {isCorrect && <span style={{ marginLeft: 'auto', color: '#2e7d32', fontWeight: 700 }}>✓</span>}
              {isWrong && <span style={{ marginLeft: 'auto', color: '#b91c1c', fontWeight: 700 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && q.explanation && (
        <div
          style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '16px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.6,
            color: 'var(--color-on-surface)',
          }}
        >
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}
