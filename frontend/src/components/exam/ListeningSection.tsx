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
        background: '#1E1B4B',
        border: '3px solid #0f0f0f',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '4px 4px 0px #0f0f0f',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#4F46E5',
            border: '3px solid #ffffff',
            color: '#ffffff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: !audioUrl && !ttsSupported ? 0.4 : 1,
          }}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          disabled={!audioUrl && !ttsSupported}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Animated waveform bars */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '32px' }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              style={{
                width: '4px',
                borderRadius: '2px',
                background: '#818CF8',
                height: isPlaying ? `${8 + Math.sin(i * 0.8) * 12 + 12}px` : '8px',
                transition: 'height 0.15s ease',
                animation: isPlaying ? `bar-bounce-${i % 5} 0.6s ease infinite alternate` : 'none',
              }}
            />
          ))}
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          {audioUrl ? (
            <p style={{ margin: 0, color: '#ffffff', fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              {currentTime} / {duration}
            </p>
          ) : (
            <p style={{ margin: 0, color: '#818CF8', fontSize: '12px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              {isPlaying ? '🔊 읽는 중…' : '🔊 TTS 음성'}
            </p>
          )}
          <p style={{ margin: '2px 0 0', color: '#818CF8', fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
            재생 {playCount}회
          </p>
        </div>
      </div>

      {/* TTS info banner */}
      {!audioUrl && (
        <div style={{
          marginTop: '10px',
          background: 'rgba(129,140,248,0.15)',
          border: '1.5px solid #818CF8',
          borderRadius: '10px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#a5b4fc',
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Question header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: '#4F46E5',
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
            background: '#EEF2FF',
            border: '2px solid #0f0f0f',
            borderRadius: '10px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#4b5563',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'Inter, sans-serif',
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
            color: '#0f0f0f',
            lineHeight: 1.7,
            fontFamily: 'Inter, sans-serif',
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
                gap: '14px',
                background: bg,
                border: `3px solid ${border}`,
                borderRadius: '14px',
                padding: '14px 18px',
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isSelected || isCorrect ? border : '#e5e7eb',
                  color: isSelected || isCorrect ? '#ffffff' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {OPTION_LABELS[i]}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 600, color, lineHeight: 1.5 }}>{opt}</span>
              {isCorrect && (
                <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✓</span>
              )}
              {isWrong && (
                <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation after submit */}
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
