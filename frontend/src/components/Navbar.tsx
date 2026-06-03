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
      {/* Top Bar for Stats */}
      <div className="fixed top-0 left-0 right-0 p-4 z-40 flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-3 group" onClick={() => playSound('click')}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-primary-container)] border border-[rgba(255,255,255,0.2)] shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-transform group-hover:scale-105">
            <span className="text-white font-extrabold text-xl font-sans">K</span>
          </div>
          <span className="font-extrabold text-xl text-[var(--color-on-background)] hidden sm:block tracking-tight drop-shadow-md">
            K-Mastery
          </span>
        </Link>
        <div className="pointer-events-auto flex items-center gap-3">
           <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)]">
              <Flame size={16} className="text-[var(--color-secondary-container)]" />
              <span className="text-white font-bold text-sm">{streak}</span>
           </div>
           <div className="glass-card hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)]">
              <Coins size={16} className="text-yellow-400" />
              <span className="text-white font-bold text-sm">{coins}</span>
           </div>
           <div className="hidden lg:block w-32 pointer-events-auto">
              <AnimatedXPBar currentXP={xp} level={level} />
           </div>
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card rounded-full px-3 py-3 flex items-center justify-between gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => playSound('click')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--color-primary-container)] text-white shadow-[0_0_12px_rgba(79,70,229,0.6)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className={isActive ? 'drop-shadow-md' : ''} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Nav Links */}
        <div className="flex md:hidden items-center gap-1">
          {navLinks.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => playSound('click')}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--color-primary-container)] text-white shadow-[0_0_12px_rgba(79,70,229,0.6)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-md' : ''} />
              </Link>
            );
          })}
          <Link
            href="/profile"
            onClick={() => playSound('click')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              pathname === '/profile'
                ? 'bg-[var(--color-primary-container)] text-white shadow-[0_0_12px_rgba(79,70,229,0.6)]'
                : 'text-[var(--color-on-surface-variant)] hover:text-white'
            }`}
          >
            <User size={20} />
          </Link>
        </div>
      </nav>
    </>
  );
}
