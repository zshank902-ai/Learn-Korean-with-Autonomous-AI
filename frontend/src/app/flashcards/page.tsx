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
    <div className="min-h-[calc(100vh-80px)] flex flex-col pt-8 px-6 relative z-10">
      
      {isComplete && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
        </div>
      )}

      {/* Top Header & Filter */}
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 flex items-center justify-center md:justify-start gap-4 font-sans tracking-tight drop-shadow-md text-white">
            <div className="w-14 h-14 bg-[var(--color-primary-container)] rounded-2xl flex items-center justify-center border border-[rgba(255,255,255,0.2)] shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Book className="text-white" size={28} />
            </div>
            Daily Review
          </h1>
          <p className="font-medium text-[var(--color-on-surface-variant)] text-lg">Master 20 words a day to level up rapidly.</p>
        </div>

        {/* Progress Tracker */}
        {!isComplete && flashcardDeck.length > 0 && (
          <div className="glass-card px-6 py-4 hidden md:block border border-[rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">Session</span>
              <span className="font-extrabold text-white">
                {currentCardIndex} / {flashcardDeck.length}
              </span>
            </div>
            <div className="h-3 w-40 rounded-full neumorphic-input overflow-hidden border-none bg-[rgba(0,0,0,0.4)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentCardIndex / flashcardDeck.length) * 100}%` }}
                className="h-full bg-[var(--color-secondary-container)] rounded-full shadow-[0_0_8px_var(--color-secondary-container)]"
              />
            </div>
          </div>
        )}

        {/* Level Selector UI */}
        <div className="flex gap-2 glass-card p-2 border border-[rgba(255,255,255,0.1)]">
          {['All', '1', '2', '3'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 font-bold uppercase text-sm rounded-xl transition-all duration-300 ${selectedLevel === lvl ? 'bg-[var(--color-primary-container)] text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-on-surface-variant)] hover:text-white'}`}
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
              className="glass-card rounded-3xl p-12 text-center max-w-lg w-full border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <div className="w-24 h-24 rounded-full border border-[rgba(255,255,255,0.2)] mx-auto mb-6 flex items-center justify-center bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <CheckCircle2 size={48} className="text-white drop-shadow-md" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 font-sans tracking-tight drop-shadow-md">Session Complete!</h2>
              <p className="text-xl font-semibold text-[var(--color-on-surface-variant)] mb-8">You've reviewed all cards for today.</p>
              
              <button 
                onClick={fetchFlashcards} 
                className="glass-btn text-white px-8 py-4 rounded-2xl font-extrabold text-xl transition-all flex items-center justify-center gap-3 w-full hover:-translate-y-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                <RefreshCcw size={24} /> Study More Cards
              </button>
            </motion.div>
          ) : currentCard ? (
            <div key="flashcard-container" className="w-full max-w-2xl flex flex-col items-center">
              {/* The 3D Card */}
              <div 
                className="w-full aspect-[4/3] max-h-[400px] relative cursor-pointer"
                onClick={() => {
                  playSound('click');
                  setIsFlipped(!isFlipped);
                }}
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{ rotateX: isFlipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div 
                    className="absolute inset-0 backface-hidden glass-card rounded-3xl p-8 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="absolute top-6 left-6 px-3 py-1 bg-[var(--color-primary-container)]/20 border border-[var(--color-primary-container)]/50 rounded-full text-xs font-extrabold uppercase text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                      Lv. {currentCard.level}
                    </div>
                    
                    <button 
                      onClick={(e) => playAudio(e, currentCard.front, currentCard.audio_path)}
                      className="absolute top-5 right-5 w-12 h-12 bg-[var(--color-secondary-container)] border border-[rgba(255,255,255,0.2)] rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_15px_rgba(236,106,6,0.4)]"
                    >
                      <Play size={20} className="ml-1 drop-shadow-sm" />
                    </button>

                    <h2 className="text-6xl md:text-8xl font-extrabold text-white text-center font-sans tracking-tight drop-shadow-lg">
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
                    className="absolute inset-0 backface-hidden glass-card bg-[rgba(30,27,75,0.6)] rounded-3xl p-8 flex flex-col items-center justify-center text-white border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                  >
                    <button 
                      onClick={(e) => playAudio(e, currentCard.front, currentCard.audio_path)}
                      className="absolute top-5 right-5 w-12 h-12 bg-[var(--color-secondary-container)] border border-[rgba(255,255,255,0.2)] rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_15px_rgba(236,106,6,0.4)]"
                    >
                      <Play size={20} className="ml-1 drop-shadow-sm" />
                    </button>
                    <p className="text-lg font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Translation</p>
                    <h2 className="text-5xl md:text-6xl font-extrabold text-center mb-8 text-white font-sans tracking-tight drop-shadow-md">
                      {currentCard.back}
                    </h2>
                    
                    {/* Example Section */}
                    <div className="w-full max-w-md bg-[rgba(255,255,255,0.05)] rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] mt-4 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-[var(--color-secondary-container)] uppercase tracking-widest">Example</p>
                        <button 
                            onClick={(e) => playAudio(e, currentCard.example?.korean || currentCard.front)}
                            className="text-[var(--color-on-surface-variant)] hover:text-white transition-colors"
                        >
                            <Volume2 size={20} />
                        </button>
                      </div>
                      <p className="text-xl font-medium mb-1 leading-relaxed text-white">
                        {currentCard.example?.korean || "예문이 아직 없습니다."}
                      </p>
                      <div className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mt-2">
                        {currentCard.example?.english ? (
                          currentCard.example.english
                        ) : currentCard.example?.korean ? (
                          <button 
                            onClick={(e) => handleTranslate(e, currentCard.id)}
                            disabled={isTranslating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-btn text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
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
                        className="py-4 px-2 rounded-2xl bg-red-500/80 backdrop-blur-md text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[rgba(255,255,255,0.2)] shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
                      >
                        <span className="block font-extrabold text-lg drop-shadow-sm font-sans">Again</span>
                        <span className="block text-xs font-bold opacity-80">&lt; 1m</span>
                      </button>
                      <button
                        onClick={() => handleRate('hard')}
                        className="py-4 px-2 rounded-2xl bg-[var(--color-secondary-container)]/80 backdrop-blur-md text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[rgba(255,255,255,0.2)] shadow-[0_4px_15px_rgba(236,106,6,0.4)]"
                      >
                        <span className="block font-extrabold text-lg drop-shadow-sm font-sans">Hard</span>
                        <span className="block text-xs font-bold opacity-80">2d</span>
                      </button>
                      <button
                        onClick={() => handleRate('good')}
                        className="py-4 px-2 rounded-2xl bg-green-500/80 backdrop-blur-md text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[rgba(255,255,255,0.2)] shadow-[0_4px_15px_rgba(34,197,94,0.4)]"
                      >
                        <span className="block font-extrabold text-lg drop-shadow-sm font-sans">Good</span>
                        <span className="block text-xs font-bold opacity-80">+10 XP</span>
                      </button>
                      <button
                        onClick={() => handleRate('easy')}
                        className="py-4 px-2 rounded-2xl bg-[var(--color-primary-container)]/80 backdrop-blur-md text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 border border-[rgba(255,255,255,0.2)] shadow-[0_4px_15px_rgba(79,70,229,0.4)]"
                      >
                        <span className="block font-extrabold text-lg drop-shadow-sm font-sans">Easy</span>
                        <span className="block text-xs font-bold opacity-80">+20 XP</span>
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
              className="glass-card rounded-3xl p-12 text-center max-w-lg w-full border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <div className="w-24 h-24 rounded-full border border-[rgba(255,255,255,0.2)] mx-auto mb-6 flex items-center justify-center bg-[var(--color-secondary-container)] shadow-[0_0_20px_rgba(236,106,6,0.5)]">
                <Book size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 font-sans drop-shadow-md">No Cards Found</h2>
              <p className="text-xl font-semibold text-[var(--color-on-surface-variant)] mb-8">
                There are no flashcards available for {selectedLevel === 'All' ? 'any level' : `TOPIK ${selectedLevel}`} yet. Check back later!
              </p>
            </motion.div>
          ) : (
            <motion.div key="loading" className="flex flex-col items-center justify-center h-64 gap-6">
               <div className="w-16 h-16 border-4 border-[rgba(255,255,255,0.1)] border-t-[var(--color-primary-container)] rounded-full animate-spin shadow-[0_0_15px_var(--color-primary-container)]" />
               <p className="font-extrabold text-white text-2xl font-sans drop-shadow-md">Loading Cards...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
