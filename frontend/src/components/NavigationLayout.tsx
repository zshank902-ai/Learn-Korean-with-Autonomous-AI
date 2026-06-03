'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LayoutDashboard, CreditCard, User, Menu, X, Flame, Coins, Map, Type, Settings, HelpCircle } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import AnimatedXPBar from './AnimatedXPBar';
import { useAudio } from '@/hooks/useAudio';
import Footer from './Footer';

const navLinks = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/roadmap',    label: 'Roadmap',    icon: Map },
  { href: '/hangul',     label: 'Hangul',     icon: Type },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/profile',    label: 'Profile',    icon: User },
];

const secondaryLinks = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

const footerLinks = [
  { href: '/help', label: 'Help Center', icon: HelpCircle },
];

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { xp, level, streak, coins } = useKMasteryStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { playSound } = useAudio();

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Hide sidebar on exam pages or login page
  const hideSidebar = pathname?.startsWith('/exam') || pathname === '/login' || pathname === '/';

  if (hideSidebar) {
    return (
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Brand / Header */}
      <div className="px-6 mb-8 mt-2">
        <Link href="/" onClick={() => playSound('click')} className="block mb-6">
          <h1 className="font-serif text-2xl text-[var(--color-primary)] font-bold tracking-tight">K-Mastery</h1>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full object-cover border border-[var(--color-outline-variant)] bg-[var(--color-primary-container)] flex items-center justify-center overflow-hidden shrink-0">
            <span className="font-serif font-bold text-[var(--color-on-primary-container)] text-lg">J</span>
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-[var(--color-on-surface)] leading-tight">Welcome, User</h2>
            <p className="font-sans text-xs text-[var(--color-on-surface-variant)]">Level {level} Proficiency</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-surface-container)] rounded-full border border-[var(--color-outline-variant)]">
               <Flame size={14} className="text-[var(--color-primary)]" />
               <span className="text-[var(--color-on-surface)] font-bold text-xs">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-surface-container)] rounded-full border border-[var(--color-outline-variant)]">
               <Coins size={14} className="text-yellow-600" />
               <span className="text-[var(--color-on-surface)] font-bold text-xs">{coins}</span>
            </div>
          </div>
          <div className="mt-1 w-full max-w-[180px]">
             <AnimatedXPBar currentXP={xp} level={level} />
          </div>
        </div>

        <Link href="/roadmap" onClick={() => playSound('click')} className="block mt-6 w-full bg-[var(--color-primary)] text-white font-sans text-sm py-2.5 px-4 rounded-lg hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors shadow-sm font-semibold text-center border border-transparent hover:border-[var(--color-outline-variant)]">
          Start Daily Lesson
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => playSound('click')}
              className={`flex items-center gap-3 py-2.5 px-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-semibold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-secondary-container)]/50 font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[var(--color-primary)]' : ''} />
              <span className="font-sans text-sm">{label}</span>
            </Link>
          );
        })}

        <div className="my-4 border-t border-[var(--color-outline-variant)]/40 mx-4"></div>

        {secondaryLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => playSound('click')}
              className={`flex items-center gap-3 py-2.5 px-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-semibold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-secondary-container)]/50 font-medium'
              }`}
            >
              <Icon size={20} />
              <span className="font-sans text-sm">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="px-4 mt-auto mb-6">
        {footerLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => playSound('click')}
            className="flex items-center gap-3 py-2 px-3 mx-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-secondary-container)]/50 rounded-lg transition-all font-medium"
          >
            <Icon size={20} />
            <span className="font-sans text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="bg-[var(--color-surface-container-low)] h-screen w-64 fixed left-0 top-0 border-r border-[var(--color-outline-variant)]/60 flex-col py-6 hidden md:flex z-50">
        <SidebarContent />
      </nav>

      {/* Mobile Top App Bar */}
      <header className="md:hidden bg-[var(--color-surface-container-low)] w-full top-0 sticky border-b border-[var(--color-outline-variant)]/60 shadow-sm flex justify-between items-center px-6 py-4 z-40">
        <Link href="/" onClick={() => playSound('click')}>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-primary)]">K-Mastery</h1>
        </Link>
        <button
          onClick={() => {
            playSound('click');
            setMobileOpen(true);
          }}
          className="text-[var(--color-on-surface-variant)] p-1 rounded-md hover:bg-[var(--color-surface-variant)] transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[var(--color-surface-container-low)] border-r border-[var(--color-outline-variant)]/60 shadow-xl z-50 flex flex-col py-6 md:hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => {
                    playSound('click');
                    setMobileOpen(false);
                  }}
                  className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </main>
    </>
  );
}
