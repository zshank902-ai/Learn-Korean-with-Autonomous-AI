'use client';

import type { TopikLevel } from '@/lib/roadmapTypes';

interface LevelMetaBarProps {
  level: TopikLevel;
}

interface ChipProps {
  icon: string;
  label: string;
  value: string | number;
  accentColor?: string;
}

function Chip({ icon, label, value, accentColor = '#6366f1' }: ChipProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: '#ffffff',
        border: '2px solid #0f0f0f',
        borderRadius: '8px',
        padding: '6px 12px',
        boxShadow: '2px 2px 0px #0f0f0f',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '15px', flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '11px',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          fontSize: '13px',
          color: accentColor,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function LevelMetaBar({ level }: LevelMetaBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        padding: '12px 0',
      }}
    >
      <Chip icon="📊" label="Exam" value={level.exam_type} accentColor="#7c3aed" />
      <Chip
        icon="🎯"
        label="Pass Score"
        value={`${level.pass_score} / ${level.max_score}`}
        accentColor="#db2777"
      />
      <Chip
        icon="📚"
        label="Vocab"
        value={`${level.target_vocab.toLocaleString()} words`}
        accentColor="#0891b2"
      />
      <Chip
        icon="🏅"
        label="XP Reward"
        value={`+${level.xp_reward} XP`}
        accentColor="#d97706"
      />

      {/* Section chips */}
      {level.sections.map((section) => (
        <div
          key={section.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: level.color,
            border: '2px solid #0f0f0f',
            borderRadius: '8px',
            padding: '6px 12px',
            boxShadow: '2px 2px 0px #0f0f0f',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: '12px',
              color: '#0f0f0f',
            }}
          >
            {section.name}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              color: '#374151',
            }}
          >
            {section.questions}Q · {section.time_min}min
          </span>
        </div>
      ))}
    </div>
  );
}
