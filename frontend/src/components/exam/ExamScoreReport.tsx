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
          background: '#FEE2E2',
          border: '4px solid #EF4444',
          borderRadius: '20px',
          padding: '16px 32px',
          textAlign: 'center',
          boxShadow: '4px 4px 0px #EF4444',
        }}
      >
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#991B1B', fontFamily: 'Fredoka, cursive' }}>불합격</p>
        <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>Not Passed · Score: {score}</p>
      </div>
    );
  }
  return (
    <div
      style={{
        background: '#D1FAE5',
        border: '4px solid #059669',
        borderRadius: '20px',
        padding: '16px 32px',
        textAlign: 'center',
        boxShadow: '4px 4px 0px #059669',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        🎓 Certificate Awarded
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: 900, color: '#064E3B', fontFamily: 'Fredoka, cursive' }}>
        TOPIK Level {level}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: '#059669' }}>합격 · Score: {score}</p>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 900, color: '#4F46E5', fontFamily: 'Inter, sans-serif' }}>
          {score} / {max}
        </span>
      </div>
      <div style={{ background: '#e5e7eb', border: '2px solid #0f0f0f', borderRadius: '999px', height: '14px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct >= 60 ? '#059669' : '#F97316',
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
        background: '#F9FAFB',
        border: '2.5px solid #0f0f0f',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800, color: '#0f0f0f', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
        AI Essay Rubric
      </p>
      {items.map(({ key, label }) => (
        <ScoreBar key={key} label={label} score={rubric.rubricScores[key]} max={25} />
      ))}
      {rubric.feedback && (
        <div
          style={{
            background: '#FFFBEB',
            border: '2px solid #F59E0B',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            color: '#92400E',
            fontFamily: 'Inter, sans-serif',
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
      }}
    >
      {/* Total Score Display */}
      <div
        style={{
          background: '#ffffff',
          border: '4px solid #0f0f0f',
          borderRadius: '24px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '8px 8px 0px #0f0f0f',
        }}
      >
        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
          {isTopikI ? 'TOPIK I Final Score' : 'TOPIK II Final Score'}
        </p>
        <div
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: '#1E1B4B',
            lineHeight: 1,
            fontFamily: 'Fredoka, cursive',
          }}
        >
          {totalScore}
        </div>
        <p style={{ margin: '4px 0 16px', fontSize: '16px', fontWeight: 700, color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
          / {maxScore} points
        </p>

        <CertBadge level={levelAwarded} score={totalScore} />

        {xp > 0 && (
          <div
            style={{
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FEF3C7',
              border: '2.5px solid #F59E0B',
              borderRadius: '12px',
              padding: '8px 18px',
              boxShadow: '2px 2px 0px #F59E0B',
            }}
          >
            <span style={{ fontSize: '18px' }}>⭐</span>
            <span style={{ fontWeight: 900, fontSize: '16px', color: '#92400E', fontFamily: 'Fredoka, cursive' }}>
              +{xp} XP Earned
            </span>
          </div>
        )}
      </div>

      {/* Section Breakdown */}
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
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>
          Section Breakdown
        </p>
        {writingScore !== null && <ScoreBar label="쓰기 (Writing)" score={writingScore} max={100} />}
        <ScoreBar label="듣기 (Listening)" score={listeningScore} max={100} />
        <ScoreBar label="읽기 (Reading)" score={readingScore} max={100} />
      </div>

      {/* Essay Rubric */}
      {essayRubric && <RubricBars rubric={essayRubric} />}

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            style={{
              flex: 1,
              minWidth: '180px',
              background: '#ffffff',
              color: '#0f0f0f',
              border: '3px solid #0f0f0f',
              borderRadius: '14px',
              padding: '14px',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #0f0f0f',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            🔍 Review Mistakes
          </button>
        )}
        <Link href="/roadmap" style={{ flex: 1, minWidth: '180px', textDecoration: 'none' }}>
          <button
            style={{
              width: '100%',
              background: '#4F46E5',
              color: '#ffffff',
              border: '3px solid #0f0f0f',
              borderRadius: '14px',
              padding: '14px',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #0f0f0f',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            ← Return to Roadmap
          </button>
        </Link>
      </div>
    </div>
  );
}
