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

  let colorClass = 'text-[var(--color-primary)]';
  let bgClass = 'bg-[var(--color-primary)]';
  
  if (isOver) {
    colorClass = 'text-[#ef4444]';
    bgClass = 'bg-[#ef4444]';
  } else if (isOk && count > 0) {
    colorClass = 'text-[#2e7d32]';
    bgClass = 'bg-[#2e7d32]';
  }

  const barWidth = Math.min(100, (count / max) * 100);

  return (
    <div className="mt-2.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-sm font-bold ${colorClass}`}>
          {count} 자
        </span>
        <span className="text-[13px] font-medium text-[var(--color-on-surface-variant)]">
          {min}–{max}자
        </span>
      </div>
      <div className="bg-[var(--color-surface-container-high)] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${bgClass}`}
          style={{ width: `${barWidth}%` }}
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
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="bg-[var(--color-primary)] text-white rounded-xl px-4 py-1.5 font-bold text-[15px] shadow-sm">
          Q{q.questionNumber}
        </div>
        <span className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          문장 완성 (Sentence Completion)
        </span>
      </div>

      {/* Passage */}
      {q.passageText && (
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-5 text-base leading-relaxed text-[var(--color-on-surface)]">
          {q.passageText.split(q.blankLabel ?? '㉠').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part}
                <span className="inline-block bg-[var(--color-surface-container)] border border-[var(--color-primary)] rounded-md px-2 text-[var(--color-primary)] font-bold mx-1">
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
        <p className="m-0 mb-2.5 text-[15px] font-semibold text-[var(--color-on-surface)]">
          {q.blankLabel ?? '㉠'}에 들어갈 말을 쓰시오.
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={q.charMax}
          rows={2}
          placeholder="답을 쓰세요..."
          className="w-full border border-[var(--color-outline-variant)] rounded-2xl p-4 text-base font-inherit resize-y outline-none box-border bg-[var(--color-surface)] text-[var(--color-on-surface)] transition-colors duration-200 focus:border-[var(--color-primary)]"
        />
        <p className="m-0 mt-1.5 text-[13px] text-[var(--color-on-surface-variant)]">
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
  const isUnder = value.length < q.charMin;
  const isOver = value.length > q.charMax;
  const isOk = !isUnder && !isOver;

  let borderColorClass = 'border-[var(--color-outline-variant)]';
  let focusRingClass = 'focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]';
  
  if (value.length > 0) {
    if (isOver) {
      borderColorClass = 'border-[#ef4444]';
      focusRingClass = 'focus:ring-2 focus:ring-[#ef4444]/20 focus:border-[#ef4444]';
    } else if (isOk) {
      borderColorClass = 'border-[#2e7d32]';
      focusRingClass = 'focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32]';
    } else {
      borderColorClass = 'border-[var(--color-primary)]';
      focusRingClass = 'focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]';
    }
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="bg-[var(--color-primary)] text-white rounded-xl px-4 py-1.5 font-bold text-[15px] shadow-sm">
          Q{q.questionNumber}
        </div>
        <span className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          {q.questionNumber === 53 ? '단문 쓰기 (Short Essay)' : '장문 쓰기 (Long Essay)'}
        </span>
      </div>

      {/* Topic card */}
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-5">
        <p className="m-0 mb-2 text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          주제 (Topic)
        </p>
        <p className="m-0 text-lg font-semibold text-[var(--color-on-surface)] font-serif leading-relaxed">
          {q.topic ?? '주어진 주제에 대해 글을 쓰시오.'}
        </p>
        {q.hints && q.hints.length > 0 && (
          <div className="mt-4">
            <p className="m-0 mb-2 text-[13px] font-semibold text-[var(--color-primary)]">
              ※ 아래 내용을 포함하여 쓰시오.
            </p>
            <div className="flex flex-col gap-1.5">
              {q.hints.map((hint, i) => (
                <p key={i} className="m-0 text-[15px] font-medium text-[var(--color-on-surface)] leading-relaxed">
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
          className={`w-full border ${borderColorClass} rounded-2xl p-5 text-base font-inherit leading-relaxed resize-y outline-none box-border bg-[var(--color-surface)] text-[var(--color-on-surface)] transition-all duration-200 ${focusRingClass}`}
        />
        <CharCounter count={value.length} min={q.charMin} max={q.charMax} />
      </div>
    </div>
  );
}

export default function WritingSection({ questions, answers, onAnswer, onSubmit }: WritingSectionProps) {
  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-5 shadow-sm">
        <p className="m-0 text-base font-semibold text-[var(--color-on-surface)]">
          📝 <strong>쓰기 시험 (Writing Section)</strong> — 4문항 · 70분 · 100점
        </p>
        <p className="m-0 mt-1.5 text-sm text-[var(--color-on-surface-variant)]">
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
        className="sahara-btn rounded-2xl p-5 font-bold text-base uppercase tracking-wider"
      >
        쓰기 제출 → 듣기 시작 (Submit Writing → Start Listening)
      </button>
    </div>
  );
}

