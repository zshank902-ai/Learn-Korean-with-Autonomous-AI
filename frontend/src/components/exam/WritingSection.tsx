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

  const color = isOver ? '#EF4444' : isOk && count > 0 ? '#059669' : '#F97316';
  const barWidth = Math.min(100, (count / max) * 100);
  const barColor = isOver ? '#EF4444' : isOk && count > 0 ? '#059669' : '#F97316';

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {count} 자
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
          {min}–{max}자
        </span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden', border: '1.5px solid #d1d5db' }}>
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            background: barColor,
            borderRadius: '999px',
            transition: 'width 0.2s ease, background 0.2s ease',
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
        background: '#ffffff',
        border: '3px solid #0f0f0f',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '5px 5px 0px #0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            background: '#4F46E5',
            color: '#fff',
            borderRadius: '10px',
            border: '2.5px solid #0f0f0f',
            padding: '4px 14px',
            fontWeight: 900,
            fontSize: '14px',
            boxShadow: '2px 2px 0px #0f0f0f',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Q{q.questionNumber}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          문장 완성 (Sentence Completion)
        </span>
      </div>

      {/* Passage */}
      {q.passageText && (
        <div
          style={{
            background: '#F9FAFB',
            border: '2.5px solid #e5e7eb',
            borderRadius: '14px',
            padding: '16px 20px',
            fontSize: '16px',
            lineHeight: 2,
            color: '#0f0f0f',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {q.passageText.split(q.blankLabel ?? '㉠').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part}
                <span
                  style={{
                    display: 'inline-block',
                    background: '#EEF2FF',
                    border: '2px solid #4F46E5',
                    borderRadius: '6px',
                    padding: '0 8px',
                    color: '#4F46E5',
                    fontWeight: 900,
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
        <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>
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
            border: '2.5px solid #0f0f0f',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
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
  return (
    <div
      style={{
        background: '#ffffff',
        border: '3px solid #0f0f0f',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '5px 5px 0px #0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            background: '#F97316',
            color: '#fff',
            borderRadius: '10px',
            border: '2.5px solid #0f0f0f',
            padding: '4px 14px',
            fontWeight: 900,
            fontSize: '14px',
            boxShadow: '2px 2px 0px #0f0f0f',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Q{q.questionNumber}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {q.questionNumber === 53 ? '단문 쓰기 (Short Essay)' : '장문 쓰기 (Long Essay)'}
        </span>
      </div>

      {/* Topic card */}
      <div
        style={{
          background: '#FEF3C7',
          border: '2.5px solid #F59E0B',
          borderRadius: '14px',
          padding: '16px 20px',
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
          주제 (Topic)
        </p>
        <p style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>
          {q.topic ?? '주어진 주제에 대해 글을 쓰시오.'}
        </p>
        {q.hints && q.hints.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#92400E', fontFamily: 'Inter, sans-serif' }}>
              ※ 아래 내용을 포함하여 쓰시오.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {q.hints.map((hint, i) => (
                <p key={i} style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#78350F', fontFamily: 'Inter, sans-serif' }}>
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
          rows={q.questionNumber === 54 ? 12 : 6}
          placeholder="여기에 쓰세요..."
          style={{
            width: '100%',
            border: `2.5px solid ${value.length < q.charMin ? '#F97316' : value.length > q.charMax ? '#EF4444' : '#059669'}`,
            borderRadius: '12px',
            padding: '16px',
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.8,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <CharCounter count={value.length} min={q.charMin} max={q.charMax} />
      </div>
    </div>
  );
}

export default function WritingSection({ questions, answers, onAnswer, onSubmit }: WritingSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div
        style={{
          background: '#EEF2FF',
          border: '2.5px solid #4F46E5',
          borderRadius: '14px',
          padding: '14px 20px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>
          📝 <strong>쓰기 시험 (Writing Section)</strong> — 4문항 · 70분 · 100점
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4b5563' }}>
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
        style={{
          background: '#4F46E5',
          color: '#ffffff',
          border: '3px solid #0f0f0f',
          borderRadius: '16px',
          padding: '16px',
          fontWeight: 900,
          fontSize: '16px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '4px 4px 0px #0f0f0f',
          fontFamily: 'Inter, sans-serif',
          transition: 'transform 0.1s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
      >
        쓰기 제출 → 듣기 시작 (Submit Writing → Start Listening)
      </button>
    </div>
  );
}
