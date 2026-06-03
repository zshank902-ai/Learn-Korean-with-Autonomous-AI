"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sparkles, BrainCircuit, Mic, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-transparent text-[var(--color-on-background)] overflow-hidden font-sans relative flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center sahara-card border border-[var(--color-outline-variant)]">
            <span className="text-2xl font-black text-[var(--color-primary)] font-serif">K</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tighter uppercase font-serif text-[var(--color-on-background)]">K-Mastery</span>
        </div>
        {isAuthenticated ? (
          <button 
            onClick={handleSignOut}
            className="sahara-btn-secondary px-6 py-2 uppercase tracking-widest text-sm"
          >
            Sign Out
          </button>
        ) : (
          <Link 
            href="/login" 
            className="sahara-btn px-6 py-2 uppercase tracking-widest text-sm"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-5xl mx-auto mt-10 md:mt-0">
        <div className="sahara-card px-6 py-2 rounded-full mb-8 inline-flex items-center gap-3 transform -rotate-2 border border-[var(--color-outline-variant)]">
          <Sparkles className="text-[var(--color-primary)]" size={20} />
          <span className="font-extrabold uppercase tracking-widest text-[var(--color-on-surface)] text-sm">Live</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] font-serif text-[var(--color-on-background)]">
          Master Korean with <br className="hidden md:block"/>
          <span className="text-[var(--color-primary)] inline-block transform -rotate-1 relative">
            <span className="relative z-10">Autonomous AI</span>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-[var(--color-on-surface-variant)] max-w-2xl mb-12">
          Stop memorizing flashcards. Learn dynamically with an interactive conversational AI Tutor and real-time grammar correction.
        </p>

        <Link 
          href={isAuthenticated ? "/dashboard" : "/login"} 
          className="sahara-btn px-10 py-5 rounded-2xl font-extrabold uppercase tracking-widest text-xl flex items-center gap-4 hover:-translate-y-2 transition-transform"
        >
          {isAuthenticated ? "Return to Dashboard" : "Launch Dashboard"} <ArrowRight size={24} />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="border-t border-[var(--color-outline-variant)] py-24 relative z-10 bg-[var(--color-surface-container-lowest)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="sahara-card p-8 rounded-3xl hover:-translate-y-2 transition-transform border border-[var(--color-outline-variant)]">
            <div className="w-16 h-16 bg-[var(--color-primary-container)] border border-[var(--color-outline-variant)] rounded-2xl flex items-center justify-center mb-6">
              <BrainCircuit className="text-[var(--color-on-primary-container)]" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 font-serif text-[var(--color-on-surface)]">Smart Corrector</h3>
            <p className="font-medium text-[var(--color-on-surface-variant)]">Real-time LLM-powered syntax and grammar correction that streams feedback instantly as you type.</p>
          </div>

          <div className="sahara-card p-8 rounded-3xl hover:-translate-y-2 transition-transform border border-[var(--color-outline-variant)]">
            <div className="w-16 h-16 bg-[var(--color-secondary-container)] border border-[var(--color-outline-variant)] rounded-2xl flex items-center justify-center mb-6">
              <Mic className="text-[var(--color-on-secondary-container)]" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 font-serif text-[var(--color-on-surface)]">Cloud Voice AI</h3>
            <p className="font-medium text-[var(--color-on-surface-variant)]">Practice your speaking skills with ultra-low latency voice dictation powered by cloud Whisper models.</p>
          </div>

          <div className="sahara-card p-8 rounded-3xl hover:-translate-y-2 transition-transform border border-[var(--color-outline-variant)]">
            <div className="w-16 h-16 bg-[var(--color-tertiary-container)] border border-[var(--color-outline-variant)] rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="text-[var(--color-on-tertiary-container)]" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 font-serif text-[var(--color-on-surface)]">Long-Term Memory</h3>
            <p className="font-medium text-[var(--color-on-surface-variant)]">The AI Tutor remembers your hobbies and previous grammar mistakes to personalize every conversation!</p>
          </div>

        </div>
      </div>
    </main>
  );
}
