"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Book, RefreshCcw, CheckCircle2, Zap, BrainCircuit, Play, Volume2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAudio } from '@/hooks/useAudio';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { audioService } from '@/services/audioService';
import { API_ENDPOINTS } from '@/lib/apiConfig';

export default function FlashcardsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { flashcardDeck, currentCardIndex, loadFlashcards, rateCard, xp } = useKMasteryStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
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
      url.searchParams.append('limit', '800');

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
    <div className="min-h-[calc(100vh-80px)] bg-[#EEF2FF] flex flex-col pt-8 px-6 text-[#1E1B4B]">
      
      {isComplete && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
        </div>
      )}

      {/* Top Header & Filter */}
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center justify-center md:justify-start gap-4" style={{ fontFamily: 'Fredoka, cursive' }}>
            <div className="w-14 h-14 bg-[#4F46E5] rounded-2xl flex items-center justify-center border-4 border-[#1E1B4B]" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
              <Book className="text-white" size={28} />
            </div>
            Daily Review
          </h1>
          <p className="font-bold text-[#1E1B4B]/60 text-lg">Master 20 words a day to level up rapidly.</p>
        </div>

        {/* Progress Tracker */}
        {!isComplete && flashcardDeck.length > 0 && (
          <div className="bg-white rounded-2xl border-3 border-[#1E1B4B] px-6 py-4 hidden md:block" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-[#1E1B4B]/50 uppercase tracking-widest text-xs">Session</span>
              <span className="font-black text-[#4F46E5]" style={{ fontFamily: 'Fredoka, cursive' }}>
                {currentCardIndex} / {flashcardDeck.length}
              </span>
            </div>
            <div className="h-3 w-40 rounded-full border-2 border-[#1E1B4B] bg-[#EEF2FF] overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentCardIndex / flashcardDeck.length) * 100}%` }}
                className="h-full bg-[#F97316] rounded-full"
              />
            </div>
          </div>
        )}

        {/* Level Selector UI */}
        <div className="flex gap-2 bg-white border-4 border-[#1E1B4B] rounded-2xl p-2" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
          {['All', '1', '2', '3'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 font-black uppercase text-sm rounded-xl transition-colors ${selectedLevel === lvl ? 'bg-[#1E1B4B] text-white' : 'hover:bg-[#EEF2FF] text-[#1E1B4B]'}`}
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
              className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-12 text-center max-w-lg w-full"
              style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
            >
              <div className="w-24 h-24 rounded-full border-4 border-[#1E1B4B] mx-auto mb-6 flex items-center justify-center bg-[#16A34A]"
                   style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-[#1E1B4B] mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>Session Complete!</h2>
              <p className="text-xl font-semibold text-[#1E1B4B]/60 mb-8">You've reviewed all cards for today.</p>
              
              <button 
                onClick={fetchFlashcards} 
                className="bg-[#1E1B4B] text-white px-8 py-4 rounded-2xl font-black text-xl hover:bg-[#4F46E5] transition-all flex items-center justify-center gap-3 w-full transition-transform hover:-translate-y-1"
                style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
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
                    className="absolute inset-0 backface-hidden bg-white border-4 border-[#1E1B4B] rounded-3xl p-8 flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', boxShadow: '8px 8px 0px #1E1B4B' }}
                  >
                    <div className="absolute top-6 left-6 px-3 py-1 bg-[#EEF2FF] border-2 border-[#1E1B4B] rounded-full text-xs font-black uppercase text-[#4F46E5]">
                      Lv. {currentCard.level}
                    </div>
                    
                    <button 
                      onClick={(e) => playAudio(e, currentCard.front, currentCard.audio_path)}
                      className="absolute top-5 right-5 w-12 h-12 bg-[#F97316] border-2 border-[#1E1B4B] rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
                      style={{ boxShadow: '2px 2px 0px #1E1B4B' }}
                    >
                      <Play size={20} className="ml-1" />
                    </button>

                    <h2 className="text-6xl md:text-8xl font-black text-[#1E1B4B] text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {currentCard.front}
                    </h2>
                    {/* Romanization display below Korean text */}
                    {currentCard.romanization && (
                      <p className="mt-4 text-2xl font-bold text-[#1E1B4B]/40 tracking-widest uppercase">
                        {currentCard.romanization}
                      </p>
                    )}
                  </div>

                  {/* Back */}
                  <div 
                    className="absolute inset-0 backface-hidden bg-[#1E1B4B] border-4 border-[#1E1B4B] rounded-3xl p-8 flex flex-col items-center justify-center text-white"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', boxShadow: '8px 8px 0px rgba(0,0,0,0.2)' }}
                  >
                    <button 
                      onClick={(e) => playAudio(e, currentCard.front, currentCard.audio_path)}
                      className="absolute top-5 right-5 w-12 h-12 bg-[#F97316] border-2 border-[#1E1B4B] rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
                      style={{ boxShadow: '2px 2px 0px #1E1B4B' }}
                    >
                      <Play size={20} className="ml-1" />
                    </button>
                    <p className="text-lg font-bold text-white/50 uppercase tracking-widest mb-2">Translation</p>
                    <h2 className="text-5xl md:text-6xl font-black text-center mb-8" style={{ fontFamily: 'Fredoka, cursive' }}>
                      {currentCard.back}
                    </h2>
                    
                    {/* Example Section (Fallback defaults if API returns incomplete data) */}
                    <div className="w-full max-w-md bg-white/10 rounded-2xl p-6 border-2 border-white/20 mt-4 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-[#F97316] uppercase tracking-widest">Example</p>
                        <button 
                            onClick={(e) => playAudio(e, currentCard.example?.korean || currentCard.front)}
                            className="text-white/50 hover:text-white transition-colors"
                        >
                            <Volume2 size={20} />
                        </button>
                      </div>
                      <p className="text-xl font-medium mb-1 leading-relaxed">
                        {currentCard.example?.korean || "예문이 아직 없습니다."}
                      </p>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {currentCard.example?.english || "No example sentence provided."}
                      </p>
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
                        className="py-4 px-2 rounded-2xl bg-[#EF4444] text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                        style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
                      >
                        <span className="block font-black text-lg">Again</span>
                        <span className="block text-xs font-bold opacity-80">&lt; 1m</span>
                      </button>
                      <button
                        onClick={() => handleRate('hard')}
                        className="py-4 px-2 rounded-2xl bg-[#F97316] text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                        style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
                      >
                        <span className="block font-black text-lg">Hard</span>
                        <span className="block text-xs font-bold opacity-80">2d</span>
                      </button>
                      <button
                        onClick={() => handleRate('good')}
                        className="py-4 px-2 rounded-2xl bg-[#16A34A] text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                        style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
                      >
                        <span className="block font-black text-lg">Good</span>
                        <span className="block text-xs font-bold opacity-80">+10 XP</span>
                      </button>
                      <button
                        onClick={() => handleRate('easy')}
                        className="py-4 px-2 rounded-2xl bg-[#4F46E5] text-white cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                        style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
                      >
                        <span className="block font-black text-lg">Easy</span>
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
              className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-12 text-center max-w-lg w-full"
              style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
            >
              <div className="w-24 h-24 rounded-full border-4 border-[#1E1B4B] mx-auto mb-6 flex items-center justify-center bg-[#F97316]"
                   style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
                <Book size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black text-[#1E1B4B] mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>No Cards Found</h2>
              <p className="text-xl font-semibold text-[#1E1B4B]/60 mb-8">
                There are no flashcards available for {selectedLevel === 'All' ? 'any level' : `TOPIK ${selectedLevel}`} yet. Check back later!
              </p>
            </motion.div>
          ) : (
            <motion.div key="loading" className="flex flex-col items-center justify-center h-64 gap-6">
               <div className="w-16 h-16 border-4 border-[#1E1B4B] border-t-[#4F46E5] rounded-full animate-spin" />
               <p className="font-black text-[#1E1B4B] text-2xl" style={{ fontFamily: 'Fredoka, cursive' }}>Loading Cards...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
