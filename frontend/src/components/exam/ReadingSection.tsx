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
            background: '#EEF2FF',
            border: '2px solid #4F46E5',
            borderRadius: '6px',
            padding: '0 12px',
            color: '#4F46E5',
            fontWeight: 900,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Question header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: '#F97316',
            color: '#ffffff',
            borderRadius: '12px',
            border: '3px solid #0f0f0f',
            padding: '6px 14px',
            fontWeight: 900,
            fontSize: '14px',
            boxShadow: '2px 2px 0px #0f0f0f',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Q{q.questionNumber}
        </div>
        <div
          style={{
            background: '#FEF3C7',
            border: '2px solid #0f0f0f',
            borderRadius: '10px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#92400E',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Reading
        </div>
      </div>

      {/* Passage block */}
      {q.passageText && (
        <div
          style={{
            background: '#FAFAFA',
            border: '2.5px solid #0f0f0f',
            borderRadius: '16px',
            padding: '20px 24px',
            boxShadow: '3px 3px 0px #e5e7eb',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: 2,
              color: '#0f0f0f',
              fontFamily: 'Inter, sans-serif',
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
          fontSize: '17px',
          fontWeight: 700,
          color: '#0f0f0f',
          lineHeight: 1.7,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {q.questionText}
      </p>

      {/* MCQ Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, i) => {
          const isSelected = answers[q.id] === i;
          const isCorrect = submitted && q.correctAnswer === i;
          const isWrong = submitted && isSelected && q.correctAnswer !== i;

          let bg = '#ffffff';
          let border = '#d1d5db';
          let color = '#0f0f0f';

          if (isCorrect) { bg = '#D1FAE5'; border = '#059669'; color = '#065F46'; }
          else if (isWrong) { bg = '#FEE2E2'; border = '#EF4444'; color = '#991B1B'; }
          else if (isSelected) { bg = '#EEF2FF'; border = '#4F46E5'; color = '#1E1B4B'; }

          return (
            <button
              key={i}
              onClick={() => !submitted && onAnswer(q.id, i)}
              disabled={submitted}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: bg,
                border: `3px solid ${border}`,
                borderRadius: '14px',
                padding: '13px 16px',
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `3px 3px 0px ${border}` : '2px 2px 0px #e5e7eb',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!submitted) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <span
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isSelected || isCorrect ? border : '#e5e7eb',
                  color: isSelected || isCorrect ? '#ffffff' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {OPTION_LABELS[i]}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 600, color, lineHeight: 1.5 }}>{opt}</span>
              {isCorrect && <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 900 }}>✓</span>}
              {isWrong && <span style={{ marginLeft: 'auto', color: '#EF4444', fontWeight: 900 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && q.explanation && (
        <div
          style={{
            background: '#FFFBEB',
            border: '2.5px solid #F59E0B',
            borderRadius: '14px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#92400E',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}
