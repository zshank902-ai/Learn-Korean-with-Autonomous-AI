'use client';

import React from 'react';
import type { TopikIIWritingQuestion } from '@/lib/examTypes';

interface WritingSectionProps {
  questions: TopikIIWritingQuestion[];
  answers: Record<number, string>;
  onAnswer: (questionNumber: 51 | 52 | 53 | 54, value: string) => void;
  onSubmit: () => void;
}

function CharCounter({ count, min, max }: { count: number; min: number; max: number }) {
  const isUnder = count < min;
  const isOver = count > max;
  const isOk = !isUnder && !isOver;

  const color = isOver ? '#ef4444' : isOk && count > 0 ? '#2e7d32' : 'var(--color-primary)';
  const barWidth = Math.min(100, (count / max) * 100);
  const barColor = isOver ? '#ef4444' : isOk && count > 0 ? '#2e7d32' : 'var(--color-primary)';

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color,
          }}
        >
          {count} 자
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>
          {min}–{max}자
        </span>
      </div>
      <div style={{ background: 'var(--color-surface-container-high)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            background: barColor,
            borderRadius: '999px',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

function SentenceCompletion({
  q,
  value,
  onChange,
}: {
  q: TopikIIWritingQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '12px',
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(194, 101, 42, 0.2)',
          }}
        >
          Q{q.questionNumber}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          문장 완성 (Sentence Completion)
        </span>
      </div>

      {/* Passage */}
      {q.passageText && (
        <div
          style={{
            background: 'var(--color-surface-container-low)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '16px',
            padding: '20px',
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--color-on-surface)',
          }}
        >
          {q.passageText.split(q.blankLabel ?? '㉠').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part}
                <span
                  style={{
                    display: 'inline-block',
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '6px',
                    padding: '0 8px',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    margin: '0 4px',
                  }}
                >
                  {q.blankLabel ?? '㉠'}
                </span>
              </React.Fragment>
            ) : (
              part
            )
          )}
        </div>
      )}

      <div>
        <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
          {q.blankLabel ?? '㉠'}에 들어갈 말을 쓰시오.
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={q.charMax}
          rows={2}
          placeholder="답을 쓰세요..."
          style={{
            width: '100%',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            background: 'var(--color-surface)',
            color: 'var(--color-on-surface)',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)' }}
        />
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
          {value.length} / {q.charMax}자
        </p>
      </div>
    </div>
  );
}

function EssayQuestion({
  q,
  value,
  onChange,
}: {
  q: TopikIIWritingQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const borderColor = value.length < q.charMin ? 'var(--color-primary)' : value.length > q.charMax ? '#ef4444' : '#2e7d32';

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '12px',
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(194, 101, 42, 0.2)',
          }}
        >
          Q{q.questionNumber}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {q.questionNumber === 53 ? '단문 쓰기 (Short Essay)' : '장문 쓰기 (Long Essay)'}
        </span>
      </div>

      {/* Topic card */}
      <div
        style={{
          background: 'var(--color-surface-container-low)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          주제 (Topic)
        </p>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: '"EB Garamond", serif', lineHeight: 1.5 }}>
          {q.topic ?? '주어진 주제에 대해 글을 쓰시오.'}
        </p>
        {q.hints && q.hints.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
              ※ 아래 내용을 포함하여 쓰시오.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {q.hints.map((hint, i) => (
                <p key={i} style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'var(--color-on-surface)', lineHeight: 1.5 }}>
                  · {hint}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Essay textarea */}
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={q.questionNumber === 54 ? 14 : 8}
          placeholder="여기에 쓰세요..."
          style={{
            width: '100%',
            border: `1px solid ${value.length > 0 ? borderColor : 'var(--color-outline-variant)'}`,
            borderRadius: '16px',
            padding: '20px',
            fontSize: '16px',
            fontFamily: 'inherit',
            lineHeight: 1.8,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            background: 'var(--color-surface)',
            color: 'var(--color-on-surface)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${value.length > 0 ? borderColor : 'var(--color-primary)'}20`; e.currentTarget.style.borderColor = value.length > 0 ? borderColor : 'var(--color-primary)'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = value.length > 0 ? borderColor : 'var(--color-outline-variant)'; }}
        />
        <CharCounter count={value.length} min={q.charMin} max={q.charMax} />
      </div>
    </div>
  );
}

export default function WritingSection({ questions, answers, onAnswer, onSubmit }: WritingSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontFamily: '"Manrope", sans-serif' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
        }}
      >
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
          📝 <strong>쓰기 시험 (Writing Section)</strong> — 4문항 · 70분 · 100점
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
          Q51-52: 빈칸에 알맞은 말을 쓰시오 (max 50자) | Q53: 200-300자 | Q54: 600-700자
        </p>
      </div>

      {questions.map((q) => {
        const val = answers[q.questionNumber] ?? '';
        const onChange = (v: string) => onAnswer(q.questionNumber as 51 | 52 | 53 | 54, v);

        if (q.type === 'sentence_completion') {
          return <SentenceCompletion key={q.questionNumber} q={q} value={val} onChange={onChange} />;
        }
        return <EssayQuestion key={q.questionNumber} q={q} value={val} onChange={onChange} />;
      })}

      <button
        onClick={onSubmit}
        className="sahara-btn"
        style={{
          padding: '20px',
          fontWeight: 700,
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderRadius: '16px',
        }}
      >
        쓰기 제출 → 듣기 시작 (Submit Writing → Start Listening)
      </button>
    </div>
  );
}
