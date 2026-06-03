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
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 mb-6 shadow-sm">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime(formatAudioTime((e.target as HTMLAudioElement).currentTime))}
          onLoadedMetadata={(e) => setDuration(formatAudioTime((e.target as HTMLAudioElement).duration))}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className={`w-14 h-14 rounded-full bg-[var(--color-primary)] text-white text-xl cursor-pointer flex items-center justify-center shrink-0 border-none shadow-sm transition-transform hover:scale-105 ${!audioUrl && !ttsSupported ? 'opacity-40' : 'opacity-100'}`}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          disabled={!audioUrl && !ttsSupported}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Animated waveform bars */}
        <div className="flex gap-1 items-end h-8">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="w-1 rounded-sm bg-[var(--color-primary)] opacity-80"
              style={{
                height: isPlaying ? `${8 + Math.sin(i * 0.8) * 12 + 12}px` : '8px',
                transition: 'height 0.15s ease',
                animation: isPlaying ? `bar-bounce-${i % 5} 0.6s ease infinite alternate` : 'none',
              }}
            />
          ))}
        </div>

        <div className="ml-auto text-right">
          {audioUrl ? (
            <p className="m-0 text-[var(--color-on-surface)] text-sm font-semibold font-sans">
              {currentTime} / {duration}
            </p>
          ) : (
            <p className="m-0 text-[var(--color-primary)] text-[13px] font-bold font-sans">
              {isPlaying ? '🔊 읽는 중…' : '🔊 TTS 음성'}
            </p>
          )}
          <p className="mt-1 mb-0 text-[var(--color-on-surface-variant)] text-xs font-medium font-sans">
            재생 {playCount}회
          </p>
        </div>
      </div>

      {/* TTS info banner */}
      {!audioUrl && (
        <div className="mt-4 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--color-on-surface-variant)] font-sans flex items-center gap-2">
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
    <div className="flex flex-col gap-6 font-sans">
      {/* Question header */}
      <div className="flex items-center gap-3">
        <div className="bg-[var(--color-primary)] text-white rounded-xl px-4 py-1.5 font-bold text-[15px] shadow-sm">
          Q{q.questionNumber}
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg px-3.5 py-1 text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
          Listening
        </div>
      </div>

      {/* Audio player */}
      <AudioPlayer audioUrl={q.audioUrl} questionText={q.questionText} options={q.options} />

      {/* Question text */}
      {q.questionText && (
        <p className="m-0 text-lg font-bold text-[var(--color-on-surface)] leading-relaxed font-serif">
          {q.questionText}
        </p>
      )}

      {/* MCQ Options */}
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const isSelected = answers[q.id] === i;
          const isCorrect = submitted && q.correctAnswer === i;
          const isWrong = submitted && isSelected && q.correctAnswer !== i;

          let bgClass = 'bg-[var(--color-surface)]';
          let borderClass = 'border-[var(--color-outline-variant)]';
          let textClass = 'text-[var(--color-on-surface)]';
          let indicatorBg = 'bg-[var(--color-surface-container)]';
          let indicatorText = 'text-[var(--color-on-surface-variant)]';

          if (isCorrect) {
            bgClass = 'bg-[#e8f5e9]';
            borderClass = 'border-[#81c784]';
            textClass = 'text-[#2e7d32]';
            indicatorBg = 'bg-[#81c784]';
            indicatorText = 'text-white';
          } else if (isWrong) {
            bgClass = 'bg-[#fef2f2]';
            borderClass = 'border-[#ef4444]';
            textClass = 'text-[#b91c1c]';
            indicatorBg = 'bg-[#ef4444]';
            indicatorText = 'text-white';
          } else if (isSelected) {
            bgClass = 'bg-[var(--color-surface-container)]';
            borderClass = 'border-[var(--color-primary)]';
            textClass = 'text-[var(--color-primary)]';
            indicatorBg = 'bg-[var(--color-primary)]';
            indicatorText = 'text-white';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && onAnswer(q.id, i)}
              disabled={submitted}
              className={`flex items-center gap-3.5 ${bgClass} border ${borderClass} rounded-2xl px-5 py-4 ${
                submitted ? 'cursor-default' : 'cursor-pointer hover:border-[var(--color-primary)] hover:-translate-y-0.5'
              } text-left w-full transition-all duration-200 ease-out ${
                isSelected ? 'shadow-sm' : 'shadow-none'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full ${indicatorBg} ${indicatorText} flex items-center justify-center text-sm font-bold shrink-0 transition-colors`}
              >
                {OPTION_LABELS[i]}
              </span>
              <span className={`text-[15px] font-semibold ${textClass} leading-snug transition-colors`}>
                {opt}
              </span>
              {isCorrect && <span className="ml-auto text-lg text-[#2e7d32]">✓</span>}
              {isWrong && <span className="ml-auto text-lg text-[#b91c1c]">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation after submit */}
      {submitted && q.explanation && (
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-2xl px-5 py-4 text-sm font-medium leading-relaxed text-[var(--color-on-surface)] mt-2">
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}
