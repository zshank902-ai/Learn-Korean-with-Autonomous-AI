'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { TopikIQuestion } from '@/lib/examTypes';

const OPTION_LABELS = ['①', '②', '③', '④'] as const;

interface ListeningSectionProps {
  questions: TopikIQuestion[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
  currentIndex: number;
  submitted: boolean;
}

// ── Audio Player (Web Speech API TTS fallback when no audioUrl) ───────────────
function AudioPlayer({
  audioUrl,
  questionText,
  options,
}: {
  audioUrl?: string;
  questionText: string;
  options: [string, string, string, string];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [ttsSupported, setTtsSupported] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech when question changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPlaying(false);
    setPlayCount(0);
    setCurrentTime('0:00');
  }, [questionText]);

  function formatAudioTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function speakKorean() {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();

    // Build full text: question + all 4 options labeled ①②③④
    const fullText = [
      questionText,
      ...options.map((o, i) => `${['일', '이', '삼', '사'][i]}번, ${o}`),
    ].join('. ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // Try to pick a Korean voice
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.startsWith('ko'));
    if (koVoice) utterance.voice = koVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlayCount((c) => c + 1);
  }

  function togglePlay() {
    if (audioUrl) {
      // Real audio file path
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => null);
        setPlayCount((c) => c + 1);
        setIsPlaying(true);
      }
    } else {
      // TTS fallback
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        speakKorean();
      }
    }
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(58, 48, 42, 0.05)',
      }}
    >
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime(formatAudioTime((e.target as HTMLAudioElement).currentTime))}
          onLoadedMetadata={(e) => setDuration(formatAudioTime((e.target as HTMLAudioElement).duration))}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#ffffff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: !audioUrl && !ttsSupported ? 0.4 : 1,
            border: 'none',
            boxShadow: '0 4px 12px rgba(194, 101, 42, 0.3)',
            transition: 'transform 0.2s',
          }}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          disabled={!audioUrl && !ttsSupported}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Animated waveform bars */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '32px' }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              style={{
                width: '4px',
                borderRadius: '2px',
                background: 'var(--color-primary)',
                height: isPlaying ? `${8 + Math.sin(i * 0.8) * 12 + 12}px` : '8px',
                transition: 'height 0.15s ease',
                animation: isPlaying ? `bar-bounce-${i % 5} 0.6s ease infinite alternate` : 'none',
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          {audioUrl ? (
            <p style={{ margin: 0, color: 'var(--color-on-surface)', fontSize: '14px', fontWeight: 600, fontFamily: '"Manrope", sans-serif' }}>
              {currentTime} / {duration}
            </p>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: '13px', fontWeight: 700, fontFamily: '"Manrope", sans-serif' }}>
              {isPlaying ? '🔊 읽는 중…' : '🔊 TTS 음성'}
            </p>
          )}
          <p style={{ margin: '4px 0 0', color: 'var(--color-on-surface-variant)', fontSize: '12px', fontWeight: 500, fontFamily: '"Manrope", sans-serif' }}>
            재생 {playCount}회
          </p>
        </div>
      </div>

      {/* TTS info banner */}
      {!audioUrl && (
        <div style={{
          marginTop: '16px',
          background: 'var(--color-surface-container)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '13px',
          color: 'var(--color-on-surface-variant)',
          fontFamily: '"Manrope", sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>💬</span>
          <span>▶ 버튼을 눌러 문제와 보기를 한국어 음성으로 들으세요</span>
        </div>
      )}

      <style>{`
        @keyframes bar-bounce-0 { to { height: 28px; } }
        @keyframes bar-bounce-1 { to { height: 20px; } }
        @keyframes bar-bounce-2 { to { height: 32px; } }
        @keyframes bar-bounce-3 { to { height: 16px; } }
        @keyframes bar-bounce-4 { to { height: 24px; } }
      `}</style>
    </div>
  );
}

export default function ListeningSection({
  questions,
  answers,
  onAnswer,
  currentIndex,
  submitted,
}: ListeningSectionProps) {
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
          Listening
        </div>
      </div>

      {/* Audio player */}
      <AudioPlayer audioUrl={q.audioUrl} questionText={q.questionText} options={q.options} />

      {/* Question text */}
      {q.questionText && (
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
      )}

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
              {isCorrect && (
                <span style={{ marginLeft: 'auto', fontSize: '18px', color: '#2e7d32' }}>✓</span>
              )}
              {isWrong && (
                <span style={{ marginLeft: 'auto', fontSize: '18px', color: '#b91c1c' }}>✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation after submit */}
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
