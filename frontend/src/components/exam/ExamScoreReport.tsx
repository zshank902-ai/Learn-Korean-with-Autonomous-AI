'use client';

import React from 'react';
import Link from 'next/link';
import type { TopikIResult, TopikIIResult, EssayRubric } from '@/lib/examTypes';

type ExamType = 'topik-i' | 'topik-ii';

interface ExamScoreReportProps {
  examType: ExamType;
  result: TopikIResult | TopikIIResult;
  onReviewMistakes?: () => void;
}

function CertBadge({ level, score }: { level: number; score: number }) {
  if (level === 0) {
    return (
      <div className="bg-[#fef2f2] border border-[#ef4444] rounded-3xl p-6 md:p-8 text-center shadow-sm">
        <p className="m-0 text-3xl font-bold text-[#991B1B] font-serif">불합격</p>
        <p className="mt-2 text-sm font-semibold text-[#EF4444] font-sans">Not Passed · Score: {score}</p>
      </div>
    );
  }
  return (
    <div className="bg-[#e8f5e9] border border-[#81c784] rounded-3xl p-6 md:p-8 text-center shadow-sm">
      <p className="m-0 text-sm font-bold text-[#2e7d32] uppercase tracking-widest font-sans">
        🎓 Certificate Awarded
      </p>
      <p className="mt-2 text-4xl font-bold text-[#1b5e20] font-serif">
        TOPIK Level {level}
      </p>
      <p className="mt-2 text-base font-semibold text-[#388e3c] font-sans">합격 · Score: {score}</p>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--color-on-surface)] font-sans">{label}</span>
        <span className="text-sm font-bold text-[var(--color-primary)] font-sans">
          {score} / {max}
        </span>
      </div>
      <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${pct >= 60 ? 'bg-[#2e7d32]' : 'bg-[var(--color-primary)]'}`}
          style={{
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}

function RubricBars({ rubric }: { rubric: EssayRubric }) {
  const items = [
    { key: 'content', label: '내용 (Content)' },
    { key: 'structure', label: '구조 (Structure)' },
    { key: 'vocabulary', label: '어휘 (Vocabulary)' },
    { key: 'grammar', label: '문법 (Grammar)' },
  ] as const;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
      <p className="m-0 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest font-sans">
        AI Essay Rubric
      </p>
      {items.map(({ key, label }) => (
        <ScoreBar key={key} label={label} score={rubric.rubricScores[key]} max={25} />
      ))}
      {rubric.feedback && (
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--color-on-surface)] font-sans mt-2">
          💡 {rubric.feedback}
        </div>
      )}
    </div>
  );
}

export default function ExamScoreReport({ examType, result, onReviewMistakes }: ExamScoreReportProps) {
  const isTopikI = examType === 'topik-i';

  const totalScore = result.totalScore;
  const maxScore = isTopikI ? 200 : 300;
  const levelAwarded = result.levelAwarded;
  const xp = result.xpGained;

  const listeningScore = result.listeningScore;
  const readingScore = result.readingScore;
  const writingScore = !isTopikI ? (result as TopikIIResult).writingScore : null;
  const essayRubric = !isTopikI ? (result as TopikIIResult).essayRubric : null;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto font-sans">
      {/* Total Score Display */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-[32px] p-8 md:p-10 text-center shadow-md">
        <p className="m-0 mb-2 text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
          {isTopikI ? 'TOPIK I Final Score' : 'TOPIK II Final Score'}
        </p>
        <div className="text-[88px] font-bold text-[var(--color-on-surface)] leading-none font-serif drop-shadow-sm">
          {totalScore}
        </div>
        <p className="mt-2 mb-6 text-base font-semibold text-[var(--color-on-surface-variant)]">
          / {maxScore} points
        </p>

        <CertBadge level={levelAwarded} score={totalScore} />

        {xp > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-2xl px-5 py-2.5 shadow-sm">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-base text-[var(--color-on-surface)] font-serif">
              +{xp} XP Earned
            </span>
          </div>
        )}
      </div>

      {/* Section Breakdown */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        <p className="m-0 text-base font-bold text-[var(--color-on-surface)] font-serif">
          Section Breakdown
        </p>
        {writingScore !== null && <ScoreBar label="쓰기 (Writing)" score={writingScore} max={100} />}
        <ScoreBar label="듣기 (Listening)" score={listeningScore} max={100} />
        <ScoreBar label="읽기 (Reading)" score={readingScore} max={100} />
      </div>

      {/* Essay Rubric */}
      {essayRubric && <RubricBars rubric={essayRubric} />}

      {/* CTA Buttons */}
      <div className="flex gap-4 flex-wrap">
        {onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            className="flex-1 min-w-[200px] sahara-btn-secondary p-4 font-bold text-[15px] rounded-2xl uppercase tracking-widest"
          >
            🔍 Review Mistakes
          </button>
        )}
        <Link href="/roadmap" className="flex-1 min-w-[200px] no-underline">
          <button
            className="w-full sahara-btn p-4 font-bold text-[15px] rounded-2xl uppercase tracking-widest"
          >
            ← Return to Roadmap
          </button>
        </Link>
      </div>
    </div>
  );
}
