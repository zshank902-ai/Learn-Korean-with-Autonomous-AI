'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  romanization: string;
  example?: { korean: string; english: string };
}

interface RawCard {
  id?: string;
  front?: string;
  korean?: string;
  back?: string;
  english?: string;
  romanization?: string;
  pronunciation?: string;
  example?: { korean: string; english: string };
}

interface FlashcardDeckProps {
  moduleId: string;
  level: number;
  onComplete: (score: number) => void;
}

type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export default function FlashcardDeck({ moduleId: _moduleId, level, onComplete }: FlashcardDeckProps) {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [queue, setQueue] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [xpPop, setXpPop] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      // Intercept 'hangul-basics' and supply the foundation alphabet
      if (_moduleId === 'hangul-basics') {
        const hangulDemo: FlashcardData[] = [
          { id: 'h1', front: 'ㄱ', back: 'g/k', romanization: 'g' },
          { id: 'h2', front: 'ㄴ', back: 'n', romanization: 'n' },
          { id: 'h3', front: 'ㄷ', back: 'd/t', romanization: 'd' },
          { id: 'h4', front: 'ㄹ', back: 'r/l', romanization: 'r/l' },
          { id: 'h5', front: 'ㅁ', back: 'm', romanization: 'm' },
          { id: 'h6', front: 'ㅂ', back: 'b/p', romanization: 'b' },
          { id: 'h7', front: 'ㅅ', back: 's', romanization: 's' },
          { id: 'h8', front: 'ㅇ', back: 'ng (silent at start)', romanization: 'ng' },
          { id: 'h9', front: 'ㅈ', back: 'j/ch', romanization: 'j' },
          { id: 'h10', front: 'ㅊ', back: 'ch', romanization: 'ch' },
          { id: 'v1', front: 'ㅏ', back: 'a', romanization: 'a' },
          { id: 'v2', front: 'ㅑ', back: 'ya', romanization: 'ya' },
          { id: 'v3', front: 'ㅓ', back: 'eo', romanization: 'eo' },
          { id: 'v4', front: 'ㅕ', back: 'yeo', romanization: 'yeo' },
          { id: 'v5', front: 'ㅗ', back: 'o', romanization: 'o' },
          { id: 'v6', front: 'ㅛ', back: 'yo', romanization: 'yo' },
          { id: 'v7', front: 'ㅜ', back: 'u', romanization: 'u' },
          { id: 'v8', front: 'ㅠ', back: 'yu', romanization: 'yu' },
          { id: 'v9', front: 'ㅡ', back: 'eu', romanization: 'eu' },
          { id: 'v10', front: 'ㅣ', back: 'i', romanization: 'i' }
        ];
        setCards(hangulDemo);
        setQueue(hangulDemo);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_ENDPOINTS.FLASHCARDS}?level=${level}&limit=20`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json() as { flashcards?: RawCard[]; cards?: RawCard[] } | RawCard[];
        let raw: RawCard[] = [];
        if (Array.isArray(data)) raw = data;
        else if ('flashcards' in data && Array.isArray(data.flashcards)) raw = data.flashcards;
        else if ('cards' in data && Array.isArray(data.cards)) raw = data.cards;

        const mapped: FlashcardData[] = raw.map((c, i) => ({
          id: c.id ?? String(i),
          front: c.front ?? c.korean ?? '???',
          back: c.back ?? c.english ?? '???',
          romanization: c.romanization ?? c.pronunciation ?? '',
          example: c.example,
        }));
        setCards(mapped);
        setQueue(mapped);
      } catch {
        setError(true);
        // Fallback demo cards
        const demo: FlashcardData[] = [
          { id: '1', front: '안녕하세요', back: 'Hello (formal)', romanization: 'annyeonghaseyo' },
          { id: '2', front: '감사합니다', back: 'Thank you', romanization: 'gamsahamnida' },
          { id: '3', front: '사랑해요', back: 'I love you', romanization: 'saranghaeyo' },
          { id: '4', front: '공부하다', back: 'To study', romanization: 'gongbuhada' },
          { id: '5', front: '학교', back: 'School', romanization: 'hakgyo' },
        ];
        setCards(demo);
        setQueue(demo);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [level, _moduleId]);

  const playAudio = async (e: React.MouseEvent, textToSpeak: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (playing) return;
    setPlaying(true);
    
    const url = `${API_ENDPOINTS.ROADMAP}/tts?text=${encodeURIComponent(textToSpeak)}`;
    const audio = new Audio(url);
    audio.playbackRate = 0.8;
    
    audio.onended = () => setPlaying(false);
    audio.onerror = () => {
      console.error("Audio playback failed");
      setPlaying(false);
    };
    
    audio.play().catch(e => {
      console.error("Audio play error:", e);
      setPlaying(false);
    });
  };

  const handleRate = useCallback((rating: SRSRating) => {
    const isCorrect = rating === 'good' || rating === 'easy';
    const xpGain = rating === 'easy' ? 20 : rating === 'good' ? 10 : 0;

    if (isCorrect) {
      setCorrect(c => c + 1);
      if (xpGain > 0) {
        setXpPop(`+${xpGain} XP`);
        setTimeout(() => setXpPop(null), 1200);
      }
    } else {
      setIncorrect(i => i + 1);
    }

    const next = [...queue];
    const current = next[currentIndex];

    if (rating === 'again') {
      next.splice(currentIndex, 1);
      next.push(current);
    } else {
      next.splice(currentIndex, 1);
    }

    setIsFlipped(false);

    if (next.length === 0) {
      const total = correct + incorrect + 1;
      const finalCorrect = isCorrect ? correct + 1 : correct;
      const score = Math.round((finalCorrect / total) * 100);
      setDone(true);
      setTimeout(() => onComplete(score), 600);
      return;
    }

    setQueue(next);
    setCurrentIndex(0);
  }, [queue, currentIndex, correct, incorrect, onComplete]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#1E1B4B] border-t-transparent rounded-full"
        />
        <p className="font-bold text-[#1E1B4B]">Loading flashcards…</p>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center h-64 gap-4"
      >
        <div className="text-6xl">🎉</div>
        <p className="text-2xl font-black text-[#1E1B4B]">Deck Complete!</p>
        <p className="font-bold text-gray-600">Score: {correct}/{correct + incorrect} correct</p>
      </motion.div>
    );
  }

  const currentCard = queue[currentIndex];
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-[#EA580C]" />
        <h3 className="text-xl font-black text-[#1E1B4B]">No Flashcards Found</h3>
        <p className="text-gray-500 font-bold">
          The vocabulary database for this level is currently empty. Check back later!
        </p>
      </div>
    );
  }

  const total = cards.length;
  const reviewed = total - queue.filter((_, i) => i >= currentIndex).length + (total - queue.length);

  const srsButtons: { label: string; rating: SRSRating; color: string; bg: string }[] = [
    { label: 'Again', rating: 'again', color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Hard', rating: 'hard', color: '#EA580C', bg: '#FFEDD5' },
    { label: 'Good', rating: 'good', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Easy', rating: 'easy', color: '#2563EB', bg: '#DBEAFE' },
  ];

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {error && (
        <div className="w-full flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 text-yellow-800 font-bold text-sm">
          <AlertTriangle size={16} />
          AI is temporarily unavailable. Proceeding with best effort.
        </div>
      )}

      <div className="w-full flex items-center justify-between">
        <span className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest">
          Card {Math.min(reviewed + 1, total)} of {total}
        </span>
        <span className="text-sm font-bold text-green-600">{correct} ✓</span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full border-2 border-[#1E1B4B]">
        <motion.div
          className="h-full bg-[#1E1B4B] rounded-full"
          animate={{ width: `${Math.min(((total - queue.length) / total) * 100, 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence>
        {xpPop && (
          <motion.div
            key="xppop"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -30, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/3 right-8 text-2xl font-black text-green-500 pointer-events-none z-50"
          >
            {xpPop}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative w-full max-w-sm cursor-pointer"
        style={{ perspective: '1000px', height: 'auto' }}
        onClick={() => setIsFlipped(f => !f)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d', width: '100%', height: '240px', position: 'relative' }}
        >
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 bg-white border-4 border-[#1E1B4B] rounded-3xl flex flex-col items-center justify-center gap-4 p-6"
          >
            <button
              onClick={e => playAudio(e, currentCard.front)}
              className="absolute top-4 right-4 w-10 h-10 bg-blue-100 border-2 border-[#1E1B4B] rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors"
              aria-label="Play audio"
            >
              <Volume2 size={18} className="text-[#1E1B4B]" />
            </button>
            <span className="text-5xl font-black text-[#1E1B4B]">{currentCard.front}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tap to reveal</span>
          </div>

          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 bg-[#1E1B4B] border-4 border-[#1E1B4B] rounded-3xl flex flex-col items-center justify-center gap-3 p-6"
          >
            <button
              onClick={e => playAudio(e, currentCard.front)}
              className="absolute top-4 right-4 w-10 h-10 bg-indigo-900 border-2 border-indigo-400 rounded-xl flex items-center justify-center hover:bg-indigo-800 transition-colors"
              aria-label="Play audio"
            >
              <Volume2 size={18} className="text-white" />
            </button>
            <span className="text-3xl font-black text-white">{currentCard.back}</span>
            {currentCard.romanization && (
              <span className="text-sm font-bold text-blue-300 italic">{currentCard.romanization}</span>
            )}
            
            {/* Example fallback defaults */}
            <div className="w-full mt-1 bg-white/10 rounded-2xl p-4 border-2 border-white/20 relative group text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest">Example</span>
                <button
                  onClick={(e) => { e.stopPropagation(); playAudio(e, currentCard.example?.korean || currentCard.front); }}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-[#F97316] transition-colors"
                  aria-label="Play example audio"
                >
                  <Volume2 size={14} className="text-white" />
                </button>
              </div>
              <p className="text-md font-medium text-white mb-1 leading-relaxed">
                {currentCard.example?.korean || "예문이 아직 없습니다."}
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                {currentCard.example?.english || "No example sentence provided."}
              </p>
            </div>

            <div className="flex items-center gap-1 mt-1">
              <RotateCcw size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-bold">Tap card to flip back</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SRS Buttons — only show when flipped */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-4 gap-3 w-full max-w-sm"
          >
            {srsButtons.map(({ label, rating, color, bg }) => (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
                className="py-3 rounded-2xl border-4 border-[#1E1B4B] font-black text-sm transition-transform active:scale-95 hover:-translate-y-1"
                style={{ background: bg, color, boxShadow: '4px 4px 0px #1E1B4B' }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!isFlipped && (
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Tap card to flip · Rate yourself after
        </p>
      )}
    </div>
  );
}
