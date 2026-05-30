import React from 'react';
import Link from 'next/link';
import { Sparkles, BrainCircuit, Mic, ArrowRight } from 'lucide-react';

/**
 * Principal Architect: Neo-Brutalist Landing Page.
 * Replaces redundant dashboard modules with a clean entry portal.
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#EEF2FF] text-[#1E1B4B] selection:bg-[#818CF8]/30 overflow-hidden font-sans relative flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F97316] border-4 border-[#1E1B4B] rounded-xl flex items-center justify-center" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
            <span className="text-2xl font-black text-white" style={{ fontFamily: 'Fredoka, cursive' }}>K</span>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Fredoka, cursive' }}>K-Mastery</span>
        </div>
        <Link 
          href="/dashboard" 
          className="bg-white border-4 border-[#1E1B4B] px-6 py-2 rounded-xl font-black uppercase tracking-widest hover:-translate-y-1 transition-transform"
          style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-5xl mx-auto mt-10 md:mt-0">
        <div className="bg-[#FEF3C7] border-4 border-[#1E1B4B] px-6 py-2 rounded-full mb-8 inline-flex items-center gap-3 transform -rotate-2" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
          <Sparkles className="text-[#F59E0B]" size={20} />
          <span className="font-black uppercase tracking-widest text-[#1E1B4B]">Live</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1]" style={{ fontFamily: 'Fredoka, cursive' }}>
          Master Korean with <br className="hidden md:block"/>
          <span className="text-[#4F46E5] inline-block transform -rotate-1 relative">
            <span className="relative z-10">Autonomous AI</span>
            <span className="absolute bottom-2 left-0 right-0 h-4 bg-[#818CF8]/30 -z-10 transform -rotate-2"></span>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl font-bold text-[#1E1B4B]/70 max-w-2xl mb-12">
          Stop memorizing flashcards. Learn dynamically with an interactive conversational AI Tutor and real-time grammar correction.
        </p>

        <Link 
          href="/dashboard" 
          className="bg-[#F97316] text-white border-4 border-[#1E1B4B] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xl flex items-center gap-4 hover:-translate-y-2 transition-transform hover:shadow-[12px_12px_0px_#1E1B4B]"
          style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
        >
          Launch Dashboard <ArrowRight size={24} />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="bg-[#4F46E5] border-t-8 border-[#1E1B4B] py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border-4 border-[#1E1B4B] hover:-translate-y-2 transition-transform" style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
            <div className="w-16 h-16 bg-[#EEF2FF] border-4 border-[#1E1B4B] rounded-2xl flex items-center justify-center mb-6" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
              <BrainCircuit className="text-[#4F46E5]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>Smart Corrector</h3>
            <p className="font-bold text-[#1E1B4B]/70">Real-time LLM-powered syntax and grammar correction that streams feedback instantly as you type.</p>
          </div>

          <div className="bg-[#D1FAE5] p-8 rounded-3xl border-4 border-[#1E1B4B] hover:-translate-y-2 transition-transform" style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
            <div className="w-16 h-16 bg-white border-4 border-[#1E1B4B] rounded-2xl flex items-center justify-center mb-6" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
              <Mic className="text-[#059669]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>Cloud Voice AI</h3>
            <p className="font-bold text-[#1E1B4B]/70">Practice your speaking skills with ultra-low latency voice dictation powered by cloud Whisper models.</p>
          </div>

          <div className="bg-[#FEF3C7] p-8 rounded-3xl border-4 border-[#1E1B4B] hover:-translate-y-2 transition-transform" style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
            <div className="w-16 h-16 bg-white border-4 border-[#1E1B4B] rounded-2xl flex items-center justify-center mb-6" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
              <Sparkles className="text-[#F59E0B]" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>Long-Term Memory</h3>
            <p className="font-bold text-[#1E1B4B]/70">The AI Tutor remembers your hobbies and previous grammar mistakes to personalize every conversation!</p>
          </div>

        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#F97316] rounded-full border-4 border-[#1E1B4B] opacity-20 -z-10" />
      <div className="absolute bottom-60 right-20 w-48 h-48 bg-[#4F46E5] rounded-xl border-4 border-[#1E1B4B] rotate-12 opacity-20 -z-10" />
    </main>
  );
}
