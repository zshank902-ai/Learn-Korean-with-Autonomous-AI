'use client';

import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, X } from 'lucide-react';
import type { MockExamResult, EssayGradeResult, RubricScores } from '@/lib/roadmapTypes';
import { useKMasteryStore } from '@/store/useKMasteryStore';

interface ScoreScreenProps {
  result: MockExamResult | EssayGradeResult;
  resultType: 'mock' | 'essay';
  onClose: () => void;
  xpEarned: number;
}

function isMockExamResult(r: MockExamResult | EssayGradeResult): r is MockExamResult {
  return 'passed' in r && 'sectionScores' in r;
}

function isEssayGradeResult(r: MockExamResult | EssayGradeResult): r is EssayGradeResult {
  return 'rubricScores' in r;
}

// Animated count-up hook
function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number;
    startTime.current = null;

    const animate = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return count;
}

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function CircularProgress({ percent, size = 120, strokeWidth = 10, color = '#6366f1' }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-container-high)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: '22px',
            color: 'var(--color-on-surface)',
          }}
        >
          {percent}%
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '10px',
            color: 'var(--color-on-surface-variant)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Readiness
        </span>
      </div>
    </div>
  );
}

interface SectionBarProps {
  label: string;
  score: number;
  maxScore: number;
  color: string;
}

function SectionBar({ label, score, maxScore, color }: SectionBarProps) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            color: 'var(--color-on-surface-variant)',
            textTransform: 'capitalize',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: '12px',
            color,
          }}
        >
          {score} / {maxScore}
        </span>
      </div>
      <div
        style={{
          height: '8px',
          background: 'var(--color-surface-container-low)',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1px solid var(--color-outline-variant)',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '999px' }}
        />
      </div>
    </div>
  );
}

// XP burst particle
function XPBurst({ xp }: { xp: number }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {particles.map((i) => {
        const angle = (i / 12) * 360;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * 60;
        const ty = Math.sin(rad) * 60;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: tx, y: ty, scale: 0.3 }}
            transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
            }}
          />
        );
      })}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#fef9c3',
          border: '1px solid #ca8a04',
          borderRadius: '10px',
          padding: '8px 16px',
        }}
      >
        <Zap size={18} color="#ca8a04" />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: '20px',
            color: '#92400e',
          }}
        >
          +{xp} XP
        </span>
      </div>
    </div>
  );
}

export default function ScoreScreen({ result, resultType, onClose, xpEarned }: ScoreScreenProps) {
  const updateXP = useKMasteryStore((s) => s.updateXP);
  const xpTriggeredRef = useRef(false);

  const totalScore = result.totalScore;
  const animatedScore = useCountUp(totalScore);

  // Derive pass/fail and readiness for both result types
  const passed = isMockExamResult(result) ? result.passed : result.totalScore >= 70;
  const readinessPercent = isMockExamResult(result) ? result.readinessPercent : Math.round((result.totalScore / 100) * 100);
  const weakAreas = isMockExamResult(result) ? result.weakAreas : [];

  // Trigger XP on pass
  useEffect(() => {
    if (passed && !xpTriggeredRef.current && xpEarned > 0) {
      xpTriggeredRef.current = true;
      void updateXP(xpEarned);
    }
  }, [passed, xpEarned, updateXP]);

  // Build section bars
  const sectionBars: Array<{ label: string; score: number; maxScore: number; color: string }> = [];

  if (isEssayGradeResult(result)) {
    const rubric: RubricScores = result.rubricScores;
    const rubricColors: Record<keyof RubricScores, string> = {
      content: '#6366f1',
      structure: '#0891b2',
      vocabulary: '#16a34a',
      grammar: '#d97706',
    };
    (Object.keys(rubric) as Array<keyof RubricScores>).forEach((key) => {
      sectionBars.push({ label: key, score: rubric[key], maxScore: 30, color: rubricColors[key] });
    });
  } else if (isMockExamResult(result)) {
    const colors = ['#6366f1', '#0891b2', '#16a34a', '#d97706'];
    Object.entries(result.sectionScores).forEach(([section, score], idx) => {
      sectionBars.push({
        label: section,
        score,
        maxScore: result.maxScore,
        color: colors[idx % colors.length],
      });
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '560px',
        width: '100%',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '8px',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} color="var(--color-on-surface-variant)" />
      </button>

      {/* Score + pass/fail */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {resultType === 'essay' ? 'Essay Score' : 'Exam Score'}
        </p>
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          style={{
            fontWeight: 900,
            fontSize: '80px',
            lineHeight: 1,
            color: passed ? '#16a34a' : '#dc2626',
          }}
        >
          {animatedScore}
        </motion.span>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.4 }}
          style={{
            background: passed ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${passed ? '#16a34a' : '#dc2626'}`,
            borderRadius: '999px',
            padding: '6px 24px',
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: '16px',
              color: passed ? '#15803d' : '#b91c1c',
              letterSpacing: '0.1em',
            }}
          >
            {passed ? '✅ PASSED' : '❌ FAILED'}
          </span>
        </motion.div>

        {/* XP burst — only show on pass */}
        {passed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <XPBurst xp={xpEarned} />
          </motion.div>
        )}
      </div>

      {/* Section breakdown bars */}
      {sectionBars.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'var(--color-surface-container-low)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <p style={{ margin: 0, fontWeight: 800, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            {resultType === 'essay' ? '📝 Rubric Breakdown' : '📊 Section Scores'}
          </p>
          {sectionBars.map((bar) => (
            <SectionBar key={bar.label} {...bar} />
          ))}
        </div>
      )}

      {/* Bottom row: readiness ring + weak areas */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <CircularProgress
          percent={readinessPercent}
          color={passed ? '#16a34a' : '#6366f1'}
          size={110}
          strokeWidth={9}
        />

        {weakAreas.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <p
              style={{
                margin: '0 0 8px',
                fontWeight: 800,
                fontSize: '12px',
                color: 'var(--color-on-surface-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              ⚠️ Weak Areas
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {weakAreas.map((area) => (
                <span
                  key={area}
                  style={{
                    background: '#ffebee',
                    border: '1px solid #ef5350',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: '11px',
                    color: '#c62828',
                  }}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {isEssayGradeResult(result) && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <p
              style={{
                margin: '0 0 6px',
                fontWeight: 800,
                fontSize: '12px',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              💬 Feedback
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'var(--color-on-surface-variant)',
                lineHeight: 1.5,
              }}
            >
              {result.feedback}
            </p>
          </div>
        )}
      </div>

      {/* Stars decoration */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.5 + i * 0.12 }}
          >
            <Star
              size={22}
              color={i < (passed ? 3 : 1) ? '#f59e0b' : '#d1d5db'}
              fill={i < (passed ? 3 : 1) ? '#f59e0b' : 'none'}
            />
          </motion.div>
        ))}
      </div>

      {/* Close CTA */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '12px 0',
          borderRadius: '10px',
          border: '1px solid var(--color-outline-variant)',
          background: passed ? '#dcfce7' : 'var(--color-surface-container-low)',
          color: 'var(--color-on-surface)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          fontSize: '14px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {passed ? '🎉 계속 학습하기' : '🔄 다시 도전하기'}
      </motion.button>
    </motion.div>
  );
}
