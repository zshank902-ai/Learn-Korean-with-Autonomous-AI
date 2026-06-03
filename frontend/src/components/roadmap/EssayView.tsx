'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import type { EssayGradeResult, RubricScores } from '@/lib/roadmapTypes';

interface RawQuestion {
  question?: string;
  prompt?: string;
}

interface EssayViewProps {
  moduleId: string;
  level: number;
  onComplete: (score: number) => void;
}

interface CharMeta {
  color: string;
  label: string;
}

function getCharMeta(level: number, count: number): CharMeta {
  if (level <= 2) {
    if (count < 150 || count > 350) return { color: '#DC2626', label: 'Out of range' };
    if (count >= 200 && count <= 300) return { color: '#16A34A', label: 'Perfect length' };
    return { color: '#EA580C', label: 'Aim for 200–300 chars' };
  }
  if (level === 3) {
    if (count < 150 || count > 350) return { color: '#DC2626', label: 'Out of range' };
    if (count >= 200 && count <= 300) return { color: '#16A34A', label: 'Perfect length' };
    return { color: '#EA580C', label: 'Aim for 200–300 chars' };
  }
  if (level === 4) {
    if (count < 250) return { color: '#DC2626', label: 'Too short' };
    if (count > 550) return { color: '#DC2626', label: 'Too long' };
    if (count >= 300 && count <= 500) return { color: '#16A34A', label: 'Perfect length' };
    return { color: '#EA580C', label: 'Aim for 300–500 chars' };
  }
  // Level 5-6
  if (count < 500) return { color: '#DC2626', label: 'Too short' };
  if (count > 800) return { color: '#DC2626', label: 'Too long' };
  if (count >= 600 && count <= 700) return { color: '#16A34A', label: 'Perfect length' };
  return { color: '#EA580C', label: 'Aim for 600–700 chars' };
}

const RUBRIC_KEYS: (keyof RubricScores)[] = ['content', 'structure', 'vocabulary', 'grammar'];
const RUBRIC_COLORS: Record<keyof RubricScores, string> = {
  content: '#6366F1',
  structure: '#F59E0B',
  vocabulary: '#10B981',
  grammar: '#EF4444',
};

export default function EssayView({ moduleId, level, onComplete }: EssayViewProps) {
  const [prompt, setPrompt] = useState('');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<EssayGradeResult | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [gradeError, setGradeError] = useState(false);
  const [modelAnswerOpen, setModelAnswerOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.ROADMAP}/module/${moduleId}/questions`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json() as { questions?: RawQuestion[] } | RawQuestion[];
        let raw: RawQuestion[] = [];
        if (Array.isArray(data)) raw = data;
        else if ('questions' in data && Array.isArray(data.questions)) raw = data.questions;
        const first = raw[0];
        setPrompt(first?.question ?? first?.prompt ?? '');
      } catch {
        setFetchError(true);
        setPrompt(
          level <= 2
            ? '좋아하는 계절에 대해 쓰세요. (Write about your favorite season.)'
            : level <= 4
            ? '현대 기술이 우리 삶에 미치는 영향에 대해 쓰세요. (Write about the impact of modern technology on our lives.)'
            : '한국의 교육 시스템의 장단점을 분석하세요. (Analyze the pros and cons of Korea\'s education system.)'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, [moduleId, level]);

  const handleSubmit = useCallback(async () => {
    if (!essay.trim() || grading || completed) return;
    setGrading(true);
    setGradeError(false);
    try {
      const res = await fetch(`${API_ENDPOINTS.ROADMAP}/essay/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay, level, prompt_hint: prompt }),
      });
      if (!res.ok) throw new Error('grading failed');
      const data = await res.json() as EssayGradeResult;
      setResult(data);
    } catch {
      setGradeError(true);
      // Fallback mock result
      const mockResult: EssayGradeResult = {
        totalScore: 70,
        rubricScores: { content: 18, structure: 17, vocabulary: 18, grammar: 17 },
        feedback: 'AI grading is temporarily unavailable. This is a placeholder score. Please try again later.',
        modelAnswer: '',
      };
      setResult(mockResult);
    } finally {
      setGrading(false);
    }
  }, [essay, grading, completed, prompt, level]);

  const handleComplete = useCallback(() => {
    if (result && !completed) {
      setCompleted(true);
      onComplete(result.totalScore);
    }
  }, [result, completed, onComplete]);

  const charCount = essay.length;
  const charMeta = getCharMeta(level, charCount);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[var(--color-surface-container)] border-t-[var(--color-primary)] rounded-full"
        />
        <p className="font-bold text-[var(--color-on-surface-variant)]">Loading writing prompt…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {(fetchError || gradeError) && (
        <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 text-yellow-800 font-bold text-sm">
          <AlertTriangle size={16} />
          AI is temporarily unavailable. Proceeding with best effort.
        </div>
      )}

      {/* Prompt */}
      <div
        className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm"
      >
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Writing Prompt</p>
        <p className="text-xl font-black text-[var(--color-on-surface)] leading-relaxed font-serif drop-shadow-sm">{prompt}</p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={essay}
          onChange={e => setEssay(e.target.value)}
          disabled={grading || !!result}
          placeholder="한국어로 에세이를 쓰세요… (Write your essay in Korean…)"
          rows={8}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl p-5 font-bold text-[var(--color-on-surface)] text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none disabled:bg-[var(--color-surface-container-low)] shadow-sm"
        />

        {/* Character counter */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">
            {charMeta.label}
          </span>
          <motion.span
            key={charMeta.color}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-sm font-black"
            style={{ color: charMeta.color }}
          >
            {charCount} chars
          </motion.span>
        </div>
      </div>

      {/* Submit */}
      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!essay.trim() || grading || charCount < 50}
          className="sahara-btn w-full py-4 rounded-2xl font-extrabold text-[15px] uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
        >
          {grading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              AI is grading your essay…
            </>
          ) : (
            'Submit for AI Grading'
          )}
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Total score */}
            <div
              className="bg-[var(--color-surface-container)] rounded-3xl border border-[var(--color-outline-variant)] p-6 flex flex-col items-center gap-2 shadow-sm"
            >
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Total Score</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-[64px] font-extrabold text-[var(--color-on-surface)] font-serif drop-shadow-sm"
              >
                {result.totalScore}
              </motion.p>
              <p className="text-[var(--color-on-surface-variant)] font-bold text-sm">out of 100</p>
            </div>

            {/* Rubric bars */}
            <div
              className="sahara-card bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-6 flex flex-col gap-5 shadow-sm"
            >
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-on-surface-variant)]">Score Breakdown</p>
              {RUBRIC_KEYS.map((key, i) => {
                const val = result.rubricScores[key];
                const pct = (val / 25) * 100;
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black capitalize" style={{ color: RUBRIC_COLORS[key] }}>
                        {key}
                      </span>
                      <span className="text-[13px] font-bold text-[var(--color-on-surface)]">{val} / 25</span>
                    </div>
                    <div className="w-full h-[10px] bg-[var(--color-surface-container-high)] rounded-full border border-[var(--color-outline-variant)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.1 * i + 0.3, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: RUBRIC_COLORS[key] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Feedback */}
            <div
              className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-6 shadow-sm"
            >
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-3">AI Feedback</p>
              <div className="max-h-40 overflow-y-auto pr-2">
                <p className="text-[14px] font-bold text-[var(--color-on-surface)] leading-relaxed">{result.feedback}</p>
              </div>
            </div>

            {/* Model Answer collapsible */}
            {result.modelAnswer && (
              <div className="border border-[var(--color-outline-variant)] rounded-3xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setModelAnswerOpen(o => !o)}
                  className="w-full flex items-center justify-between px-6 py-5 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface)]">Model Answer</span>
                  {modelAnswerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <AnimatePresence>
                  {modelAnswerOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-[var(--color-surface)] border-t border-[var(--color-outline-variant)]">
                        <p className="text-[14px] font-bold text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
                          {result.modelAnswer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Continue button */}
            {!completed && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="sahara-btn w-full py-4 rounded-2xl font-extrabold text-[15px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm mt-2"
              >
                ✓ Complete Module
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
