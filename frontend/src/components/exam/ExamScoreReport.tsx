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
      <div
        style={{
          background: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '24px',
          padding: '24px 32px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
        }}
      >
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#991B1B', fontFamily: '"EB Garamond", serif' }}>불합격</p>
        <p style={{ margin: '8px 0 0', fontSize: '14px', fontWeight: 600, color: '#EF4444', fontFamily: '"Manrope", sans-serif' }}>Not Passed · Score: {score}</p>
      </div>
    );
  }
  return (
    <div
      style={{
        background: '#e8f5e9',
        border: '1px solid #81c784',
        borderRadius: '24px',
        padding: '24px 32px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(129, 199, 132, 0.15)',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Manrope", sans-serif' }}>
        🎓 Certificate Awarded
      </p>
      <p style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: 700, color: '#1b5e20', fontFamily: '"EB Garamond", serif' }}>
        TOPIK Level {level}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: '15px', fontWeight: 600, color: '#388e3c', fontFamily: '"Manrope", sans-serif' }}>합격 · Score: {score}</p>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: '"Manrope", sans-serif' }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"Manrope", sans-serif' }}>
          {score} / {max}
        </span>
      </div>
      <div style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 60 ? '#2e7d32' : 'var(--color-primary)',
            borderRadius: '999px',
            transition: 'width 0.6s ease',
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
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)'
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Manrope", sans-serif' }}>
        AI Essay Rubric
      </p>
      {items.map(({ key, label }) => (
        <ScoreBar key={key} label={label} score={rubric.rubricScores[key]} max={25} />
      ))}
      {rubric.feedback && (
        <div
          style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--color-on-surface)',
            fontFamily: '"Manrope", sans-serif',
          }}
        >
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '680px',
        margin: '0 auto',
        fontFamily: '"Manrope", sans-serif'
      }}
    >
      {/* Total Score Display */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '32px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(58, 48, 42, 0.08)',
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isTopikI ? 'TOPIK I Final Score' : 'TOPIK II Final Score'}
        </p>
        <div
          style={{
            fontSize: '88px',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            lineHeight: 1,
            fontFamily: '"EB Garamond", serif',
          }}
        >
          {totalScore}
        </div>
        <p style={{ margin: '8px 0 24px', fontSize: '16px', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
          / {maxScore} points
        </p>

        <CertBadge level={levelAwarded} score={totalScore} />

        {xp > 0 && (
          <div
            style={{
              marginTop: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: '16px',
              padding: '10px 20px',
            }}
          >
            <span style={{ fontSize: '18px' }}>⭐</span>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-on-surface)', fontFamily: '"EB Garamond", serif' }}>
              +{xp} XP Earned
            </span>
          </div>
        )}
      </div>

      {/* Section Breakdown */}
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
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-on-surface)', fontFamily: '"EB Garamond", serif' }}>
          Section Breakdown
        </p>
        {writingScore !== null && <ScoreBar label="쓰기 (Writing)" score={writingScore} max={100} />}
        <ScoreBar label="듣기 (Listening)" score={listeningScore} max={100} />
        <ScoreBar label="읽기 (Reading)" score={readingScore} max={100} />
      </div>

      {/* Essay Rubric */}
      {essayRubric && <RubricBars rubric={essayRubric} />}

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            className="sahara-btn-secondary"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: '16px',
              fontFamily: '"Manrope", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            🔍 Review Mistakes
          </button>
        )}
        <Link href="/roadmap" style={{ flex: 1, minWidth: '200px', textDecoration: 'none' }}>
          <button
            className="sahara-btn"
            style={{
              width: '100%',
              padding: '16px',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: '16px',
              fontFamily: '"Manrope", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            ← Return to Roadmap
          </button>
        </Link>
      </div>
    </div>
  );
}
