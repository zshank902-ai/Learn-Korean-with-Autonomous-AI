"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LayoutDashboard, CreditCard, User, Menu, X, Flame, Coins, Map, Type } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import AnimatedXPBar from './AnimatedXPBar';
import { useAudio } from '@/hooks/useAudio';

const navLinks = [
  { href: '/',           label: 'Home',       icon: BookOpen },
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/hangul',     label: 'Hangul',     icon: Type },
  { href: '/roadmap',    label: 'Roadmap',    icon: Map },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/profile',    label: 'Profile',    icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { xp, level, streak, coins } = useKMasteryStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { playSound } = useAudio();

  return (
    <>
      {/* Floating Navbar */}
      <nav
        className="fixed top-4 left-4 right-4 z-50 bg-white border-4 border-[#1E1B4B] rounded-3xl px-5 py-3 flex items-center justify-between"
        style={{ boxShadow: '6px 6px 0px #1E1B4B' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" onClick={() => playSound('click')} className="flex items-center gap-3 group" aria-label="K-Mastery home">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center border-3 border-[#1E1B4B] transition-transform group-hover:-rotate-6"
            style={{ background: '#4F46E5', border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
          >
            <span className="text-white font-black text-xl" style={{ fontFamily: 'Fredoka, cursive' }}>K</span>
          </div>
          <span className="font-black text-xl text-[#1E1B4B] hidden sm:block" style={{ fontFamily: 'Fredoka, cursive' }}>
            K-Mastery
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => playSound('click')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'border-[#1E1B4B] text-white'
                    : 'border-transparent text-[#1E1B4B]/60 hover:text-[#1E1B4B] hover:bg-[#EEF2FF]'
                }`}
                style={isActive ? { background: '#4F46E5', boxShadow: '3px 3px 0px #1E1B4B' } : {}}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: Stats + Mobile toggle */}
        <div className="flex items-center gap-4">
          {/* Streak badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-3 border-[#1E1B4B]"
            style={{ background: '#F97316', border: '3px solid #1E1B4B', boxShadow: '2px 2px 0px #1E1B4B' }}
          >
            <Flame size={14} className="text-white" />
            <span className="text-white font-black text-sm" style={{ fontFamily: 'Fredoka, cursive' }}>
              {streak}
            </span>
          </div>

          {/* XP bar */}
          <div className="hidden lg:block w-40">
            <AnimatedXPBar currentXP={xp} level={level} />
          </div>

          {/* Coins badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-3 border-[#1E1B4B]"
            style={{ background: '#818CF8', border: '3px solid #1E1B4B', boxShadow: '2px 2px 0px #1E1B4B' }}
          >
            <Coins size={14} className="text-white" />
            <span className="text-white font-black text-sm" style={{ fontFamily: 'Fredoka, cursive' }}>
              {coins}
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 rounded-xl border-3 border-[#1E1B4B] flex items-center justify-center cursor-pointer"
            style={{ background: '#EEF2FF', border: '3px solid #1E1B4B' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} className="text-[#1E1B4B]" /> : <Menu size={20} className="text-[#1E1B4B]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-4 right-4 z-40 bg-white border-4 border-[#1E1B4B] rounded-3xl p-5 flex flex-col gap-2"
            style={{ boxShadow: '6px 6px 0px #1E1B4B' }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    playSound('click');
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-base transition-all cursor-pointer border-2 ${
                    isActive
                      ? 'border-[#1E1B4B] text-white'
                      : 'border-transparent text-[#1E1B4B] hover:bg-[#EEF2FF]'
                  }`}
                  style={isActive ? { background: '#4F46E5', boxShadow: '3px 3px 0px #1E1B4B' } : {}}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
            {/* Mobile XP bar */}
            <div className="mt-3 px-2">
              <AnimatedXPBar currentXP={xp} level={level} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
