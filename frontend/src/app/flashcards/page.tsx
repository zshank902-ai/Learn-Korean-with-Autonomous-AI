"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Book, RefreshCcw, CheckCircle2, Zap, BrainCircuit, Play, Volume2, Sparkles, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAudio } from '@/hooks/useAudio';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { audioService } from '@/services/audioService';
import { API_ENDPOINTS } from '@/lib/apiConfig';

export default function FlashcardsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { flashcardDeck, currentCardIndex, loadFlashcards, rateCard, translateCard, xp } = useKMasteryStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { playSound } = useAudio();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      const url = new URL(API_ENDPOINTS.FLASHCARDS, window.location.origin);
      if (selectedLevel !== 'All') {
        url.searchParams.append('level', selectedLevel);
      }
      url.searchParams.append('limit', '20');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      loadFlashcards(data);
    } catch (error) {
      console.error("Failed to fetch flashcards from backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFlashcards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel]);

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setIsFlipped(false);
    
    // Play sound based on rating
    if (rating === 'again' || rating === 'hard') playSound('error');
    else playSound('success');

    setTimeout(() => {
      rateCard(rating);
    }, 150);
  };

  const handleTranslate = async (e: React.MouseEvent, wordId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      await translateCard(wordId);
    } finally {
      setIsTranslating(false);
    }
  };

  const playAudio = async (e: React.MouseEvent, textToSpeak: string, customAudioPath?: string) => {
    e.preventDefault();
    e.stopPropagation(); // Don't trigger card flip
    if (playing) return;
    setPlaying(true);
    
    if (customAudioPath) {
      // Use official NIKL native audio
      const audio = new Audio(customAudioPath);
      audio.playbackRate = 0.8; // Slowed down for beginners
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        console.error("Audio playback failed");
        setPlaying(false);
      };
      audio.play().catch(e => {
        console.error("Audio play error:", e);
        setPlaying(false);
      });
    } else {
      // Fallback to Browser Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "ko-KR";
        utterance.rate = 0.75; // Slower for language learners to hear spelling
        utterance.onend = () => setPlaying(false);
        utterance.onerror = () => setPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlaying(false);
      }
    }
  };

  const isComplete = flashcardDeck.length > 0 && currentCardIndex >= flashcardDeck.length;
  const currentCard = flashcardDeck[currentCardIndex];

  // Trigger confetti on complete
  useEffect(() => {
    if (isComplete) playSound('levelup');
  }, [isComplete, playSound]);

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 relative z-10 font-sans flex flex-col min-h-[calc(100vh-100px)]">
      
      {isComplete && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
        </div>
      )}

      {/* Top Header & Filter */}
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 flex items-center justify-center md:justify-start gap-4 font-serif tracking-tight drop-shadow-sm text-[var(--color-on-surface)]">
            <div className="w-14 h-14 bg-[var(--color-surface-container)] rounded-2xl flex items-center justify-center border border-[var(--color-outline-variant)] shadow-sm">
              <Book className="text-[var(--color-primary)]" size={28} />
            </div>
            Daily Review
          </h1>
          <p className="font-medium text-[var(--color-on-surface-variant)] text-lg">Master 20 words a day to level up rapidly.</p>
        </div>

        {/* Progress Tracker */}
        {!isComplete && flashcardDeck.length > 0 && (
          <div className="sahara-card px-6 py-4 hidden md:block">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">Session</span>
              <span className="font-extrabold text-[var(--color-on-surface)]">
                {currentCardIndex} / {flashcardDeck.length}
              </span>
            </div>
            <div className="h-3 w-40 rounded-full overflow-hidden bg-[var(--color-surface-container-high)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentCardIndex / flashcardDeck.length) * 100}%` }}
                className="h-full bg-[var(--color-primary)] rounded-full shadow-[0_0_8px_rgba(194,101,42,0.4)]"
              />
            </div>
          </div>
        )}

        {/* Level Selector UI */}
        <div className="flex gap-2 sahara-card p-2 border border-[var(--color-outline-variant)]">
          {['All', '1', '2', '3'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 font-bold uppercase text-sm rounded-xl transition-all duration-300 ${selectedLevel === lvl ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(194,101,42,0.3)]' : 'hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'}`}
            >
              {lvl === 'All' ? 'Mix' : `TOPIK ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-10 perspective-1000">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div 
              key="complete"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: 'spring', bounce: 0.5 } }}
              className="sahara-card rounded-3xl p-12 text-center max-w-lg w-full"
            >
              <div className="w-24 h-24 rounded-full border border-[var(--color-outline-variant)] mx-auto mb-6 flex items-center justify-center bg-[#e8f5e9]">
                <CheckCircle2 size={48} className="text-[#2e7d32]" />
              </div>
              <h2 className="text-4xl font-extrabold text-[var(--color-on-surface)] mb-4 font-serif tracking-tight drop-shadow-sm">Session Complete!</h2>
              <p className="text-xl font-semibold text-[var(--color-on-surface-variant)] mb-8">You've reviewed all cards for today.</p>
              
              <button 
                onClick={fetchFlashcards} 
                className="sahara-btn text-white px-8 py-4 rounded-2xl font-extrabold text-xl transition-all flex items-center justify-center gap-3 w-full hover:-translate-y-1 shadow-[0_4px_12px_rgba(194,101,42,0.3)]"
              >
                <RefreshCcw size={24} /> Study More Cards
              </button>
            </motion.div>
          ) : currentCard ? (
            <div key="flashcard-container" className="w-full max-w-2xl flex flex-col items-center">
              {/* The 3D Card */}
              <div 
                className="w-full aspect-[4/3] max-h-[400px] relative cursor-pointer [perspective:1000px]"
                onClick={() => {
                  playSound('click');
                  setIsFlipped(!isFlipped);
                }}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d [transform-style:preserve-3d]"
                  animate={{ rotateX: isFlipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {/* Front */}
                  <div 
                    className="absolute inset-0 backface-hidden [backface-visibility:hidden] sahara-card rounded-3xl p-8 flex flex-col items-center justify-center border border-[var(--color-outline-variant)] shadow-[0_4px_16px_rgba(58,48,42,0.08)] bg-[var(--color-surface)]"
                  >
                    <div className="absolute top-6 left-6 px-3 py-1 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-full text-xs font-bold uppercase text-[var(--color-on-surface-variant)] shadow-sm">
                      Lv. {currentCard.level}
                    </div>
                    
                    <button 
                      onClick={(e) => playAudio(e, currentCard.front, currentCard.audio_path)}
                      className="absolute top-5 right-5 w-12 h-12 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl flex items-center justify-center text-[var(--color-on-surface)] hover:scale-105 transition-transform shadow-sm"
                    >
                      <Play size={20} className="ml-1" />
                    </button>

                    <h2 className="text-6xl md:text-8xl font-extrabold text-[var(--color-on-surface)] text-center font-serif tracking-tight drop-shadow-sm">
                      {currentCard.front}
                    </h2>
                    {/* Romanization display below Korean text */}
                    {currentCard.romanization && (
                      <p className="mt-4 text-2xl font-bold text-[var(--color-on-surface-variant)] tracking-widest uppercase">
                        {currentCard.romanization}
                      </p>
                    )}
                  </div>

                  {/* Back */}
                  <div 
                    className="absolute inset-0 backface-hidden [backface-visibility:hidden] [transform:rotateX(180deg)] sahara-card bg-[var(--color-surface-container-low)] rounded-3xl p-8 flex flex-col items-center justify-center text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] shadow-[0_4px_16px_rgba(58,48,42,0.08)]"
                  >
                    <button 
                      onClick={(e) => playAudio(e, currentCard.front, currentCard.audio_path)}
                      className="absolute top-5 right-5 w-12 h-12 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl flex items-center justify-center text-[var(--color-on-surface)] hover:scale-105 transition-transform shadow-sm"
                    >
                      <Play size={20} className="ml-1" />
                    </button>
                    <p className="text-lg font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Translation</p>
                    <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-[var(--color-on-surface)] font-serif tracking-tight drop-shadow-sm">
                      {currentCard.back}
                    </h2>
                    
                    {/* Example Section */}
                    <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-outline-variant)] mt-4 relative group shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest">Example</p>
                        <button 
                            onClick={(e) => playAudio(e, currentCard.example?.korean || currentCard.front)}
                            className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                        >
                            <Volume2 size={20} />
                        </button>
                      </div>
                      <p className="text-xl font-medium mb-1 leading-relaxed text-[var(--color-on-surface)]">
                        {currentCard.example?.korean || "예문이 아직 없습니다."}
                      </p>
                      <div className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mt-2">
                        {currentCard.example?.english ? (
                          currentCard.example.english
                        ) : currentCard.example?.korean ? (
                          <button 
                            onClick={(e) => handleTranslate(e, currentCard.id)}
                            disabled={isTranslating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sahara-btn text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
                          >
                            {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {isTranslating ? "Translating..." : "Translate with AI"}
                          </button>
                        ) : (
                          "No example sentence provided."
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons (Only visible when flipped) */}
              <div className="w-full mt-12 h-20">
                <AnimatePresence>
                  {isFlipped && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-4 gap-4 w-full"
                    >
                      <button
                        onClick={() => handleRate('again')}
                        className="py-4 px-2 rounded-2xl bg-[#fef2f2] text-[#991b1b] cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[#fecaca] shadow-[0_2px_8px_rgba(239,68,68,0.1)]"
                      >
                        <span className="block font-bold text-lg font-sans">Again</span>
                        <span className="block text-xs font-semibold opacity-80">&lt; 1m</span>
                      </button>
                      <button
                        onClick={() => handleRate('hard')}
                        className="py-4 px-2 rounded-2xl bg-[#fff7ed] text-[#9a3412] cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[#fed7aa] shadow-[0_2px_8px_rgba(249,115,22,0.1)]"
                      >
                        <span className="block font-bold text-lg font-sans">Hard</span>
                        <span className="block text-xs font-semibold opacity-80">2d</span>
                      </button>
                      <button
                        onClick={() => handleRate('good')}
                        className="py-4 px-2 rounded-2xl bg-[#f0fdf4] text-[#166534] cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[#bbf7d0] shadow-[0_2px_8px_rgba(34,197,94,0.1)]"
                      >
                        <span className="block font-bold text-lg font-sans">Good</span>
                        <span className="block text-xs font-semibold opacity-80">+10 XP</span>
                      </button>
                      <button
                        onClick={() => handleRate('easy')}
                        className="py-4 px-2 rounded-2xl bg-[var(--color-primary)] text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[var(--color-primary)] shadow-[0_4px_12px_rgba(194,101,42,0.3)]"
                      >
                        <span className="block font-bold text-lg font-sans">Easy</span>
                        <span className="block text-xs font-semibold opacity-90">+20 XP</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : !isLoading ? (
            <motion.div 
              key="empty"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="sahara-card rounded-3xl p-12 text-center max-w-lg w-full border border-[var(--color-outline-variant)] shadow-sm"
            >
              <div className="w-24 h-24 rounded-full border border-[var(--color-outline-variant)] mx-auto mb-6 flex items-center justify-center bg-[var(--color-surface-container)]">
                <Book size={48} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-4xl font-extrabold text-[var(--color-on-surface)] mb-4 font-serif drop-shadow-sm">No Cards Found</h2>
              <p className="text-xl font-semibold text-[var(--color-on-surface-variant)] mb-8">
                There are no flashcards available for {selectedLevel === 'All' ? 'any level' : `TOPIK ${selectedLevel}`} yet. Check back later!
              </p>
            </motion.div>
          ) : (
            <motion.div key="loading" className="flex flex-col items-center justify-center h-64 gap-6">
               <div className="w-16 h-16 border-4 border-[var(--color-surface-container)] border-t-[var(--color-primary)] rounded-full animate-spin shadow-sm" />
               <p className="font-extrabold text-[var(--color-on-surface)] text-2xl font-serif drop-shadow-sm">Loading Cards...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
