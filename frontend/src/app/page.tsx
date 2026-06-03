"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sparkles, BrainCircuit, Mic, ArrowRight } from 'lucide-react';

/**
 * Principal Architect: Neo-Brutalist Landing Page.
 * Replaces redundant dashboard modules with a clean entry portal.
 */
export default function LandingPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-transparent text-white overflow-hidden font-sans relative flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-card bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)]" style={{ boxShadow: 'inset 0 0 10px rgba(255,255,255,0.1)' }}>
            <span className="text-2xl font-black text-[var(--color-primary-container)] drop-shadow-sm font-sans">K</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tighter uppercase drop-shadow-md font-sans">K-Mastery</span>
        </div>
        {isAuthenticated ? (
          <button 
            onClick={handleSignOut}
            className="glass-btn-secondary text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest hover:-translate-y-1 transition-transform cursor-pointer text-sm"
          >
            Sign Out
          </button>
        ) : (
          <Link 
            href="/login" 
            className="glass-btn text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest hover:-translate-y-1 transition-transform text-sm"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-5xl mx-auto mt-10 md:mt-0">
        <div className="glass-card px-6 py-2 rounded-full mb-8 inline-flex items-center gap-3 transform -rotate-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-md">
          <Sparkles className="text-[var(--color-primary-container)] drop-shadow-md" size={20} />
          <span className="font-extrabold uppercase tracking-widest text-white drop-shadow-sm text-sm">Live</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] font-sans drop-shadow-lg">
          Master Korean with <br className="hidden md:block"/>
          <span className="text-[var(--color-primary-container)] inline-block transform -rotate-1 relative">
            <span className="relative z-10 drop-shadow-[0_0_20px_rgba(195,192,255,0.6)]">Autonomous AI</span>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-[var(--color-on-surface-variant)] max-w-2xl mb-12">
          Stop memorizing flashcards. Learn dynamically with an interactive conversational AI Tutor and real-time grammar correction.
        </p>

        <Link 
          href={isAuthenticated ? "/dashboard" : "/login"} 
          className="glass-btn text-white px-10 py-5 rounded-2xl font-extrabold uppercase tracking-widest text-xl flex items-center gap-4 hover:-translate-y-2 transition-transform"
        >
          {isAuthenticated ? "Return to Dashboard" : "Launch Dashboard"} <ArrowRight size={24} />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="border-t border-[rgba(255,255,255,0.1)] py-24 relative z-10 bg-[rgba(0,0,0,0.2)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform border border-[rgba(255,255,255,0.1)]">
            <div className="w-16 h-16 bg-[rgba(195,192,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-2xl flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(195,192,255,0.2)]">
              <BrainCircuit className="text-[var(--color-primary-container)] drop-shadow-md" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 font-sans text-white drop-shadow-sm">Smart Corrector</h3>
            <p className="font-medium text-[var(--color-on-surface-variant)]">Real-time LLM-powered syntax and grammar correction that streams feedback instantly as you type.</p>
          </div>

          <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform border border-[rgba(255,255,255,0.1)]">
            <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] border border-[rgba(255,255,255,0.2)] rounded-2xl flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]">
              <Mic className="text-green-400 drop-shadow-md" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 font-sans text-white drop-shadow-sm">Cloud Voice AI</h3>
            <p className="font-medium text-[var(--color-on-surface-variant)]">Practice your speaking skills with ultra-low latency voice dictation powered by cloud Whisper models.</p>
          </div>

          <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform border border-[rgba(255,255,255,0.1)]">
            <div className="w-16 h-16 bg-[rgba(253,186,116,0.1)] border border-[rgba(255,255,255,0.2)] rounded-2xl flex items-center justify-center mb-6 shadow-[inset_0_0_15px_rgba(253,186,116,0.2)]">
              <Sparkles className="text-orange-300 drop-shadow-md" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 font-sans text-white drop-shadow-sm">Long-Term Memory</h3>
            <p className="font-medium text-[var(--color-on-surface-variant)]">The AI Tutor remembers your hobbies and previous grammar mistakes to personalize every conversation!</p>
          </div>

        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-[var(--color-primary-container)] rounded-full blur-[100px] opacity-10 -z-10" />
      <div className="absolute bottom-60 right-20 w-64 h-64 bg-[#F59E0B] rounded-full blur-[120px] opacity-10 -z-10" />
    </main>
  );
}
