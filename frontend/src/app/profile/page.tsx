"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Award, Flame, Zap, Target, Hexagon } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAuthStore } from '@/store/useAuthStore';
import StreakCalendar from '@/components/StreakCalendar';
import AnimatedXPBar from '@/components/AnimatedXPBar';
import AccountSettings from '@/components/profile/AccountSettings';
import { ToastContainer } from '@/hooks/useToast';

export default function ProfilePage() {
  const { xp, level, streak, coins } = useKMasteryStore();
  const { user } = useAuthStore();

  const badges = [
    { id: 1, name: 'First Word', icon: <Target size={24} />, bgClass: 'bg-[#C2652A]', earned: true },
    { id: 2, name: '7-Day Streak', icon: <Flame size={24} />, bgClass: 'bg-[#EF4444]', earned: true },
    { id: 3, name: 'Perfect Pronunciation', icon: <Award size={24} />, bgClass: 'bg-[#818CF8]', earned: true },
    { id: 4, name: '10k XP Club', icon: <Zap size={24} />, bgClass: 'bg-[#4F46E5]', earned: xp >= 10000 },
    { id: 5, name: 'TOPIK II Master', icon: <Hexagon size={24} />, bgClass: 'bg-[#16A34A]', earned: level >= 3 },
  ];

  const stats = [
    { label: 'Total XP', value: xp.toLocaleString(), textClass: 'text-[#4F46E5]' },
    { label: 'Current Streak', value: `${streak} Days`, textClass: 'text-[#C2652A]' },
    { label: 'K-Coins', value: coins.toLocaleString(), textClass: 'text-[#FBBF24]' },
    { label: 'Words Learned', value: '342', textClass: 'text-[#16A34A]' },
  ];

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 relative z-10 font-sans text-[var(--color-on-surface)]">
      <ToastContainer />
      {/* Header Profile Card */}
      <div className="sahara-card rounded-3xl border border-[var(--color-outline-variant)] p-6 md:p-12 mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden">
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border border-[var(--color-outline-variant)] flex items-center justify-center relative z-10 sahara-card bg-[var(--color-surface)] shadow-sm">
            <User size={64} className="text-[var(--color-primary)] drop-shadow-sm" />
          </div>
          {/* Level Badge overlapping avatar */}
          <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-[var(--color-outline-variant)] flex items-center justify-center font-extrabold text-lg md:text-xl z-20 text-[var(--color-on-primary)] rotate-12 bg-[var(--color-primary)] shadow-sm font-sans">
            Lv.{level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-[var(--color-on-surface)] font-serif drop-shadow-sm">
            {user?.nickname || user?.full_name || 'Student'}
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-bold mb-6">Learning Korean</p>
          
          <div className="max-w-md">
            <AnimatedXPBar currentXP={xp} level={level} />
          </div>
        </div>
      </div>

      {xp === 0 ? (
        <div className="sahara-card rounded-3xl border border-[var(--color-outline-variant)] p-6 md:p-12 text-center shadow-sm">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] shadow-sm">
            <Target size={40} className="text-[var(--color-primary)] drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--color-on-surface)] mb-4 font-serif drop-shadow-sm">
            Zero Progress Yet!
          </h2>
          <p className="text-[var(--color-on-surface-variant)] font-bold text-lg max-w-md mx-auto mb-8">
            Your journey begins now. Complete your first lesson to start earning XP, building your streak, and unlocking badges!
          </p>
          <Link href="/roadmap" className="inline-block px-8 py-4 sahara-btn text-white font-bold text-xl rounded-xl transition-all hover:-translate-y-1">
            START LEARNING
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Streak */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] p-5 text-center shadow-sm"
                >
                  <p className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 font-sans">{stat.label}</p>
                  <p className={`text-2xl font-extrabold font-serif drop-shadow-sm ${stat.textClass}`}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <StreakCalendar />
          </div>

          {/* Right Column: Badges */}
          <div className="sahara-card rounded-3xl border border-[var(--color-outline-variant)] p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-6 flex items-center gap-3 font-serif drop-shadow-sm">
              <Award className="text-[var(--color-primary)] drop-shadow-sm" size={28} /> Badges
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl border ${badge.earned ? 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-sm' : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] opacity-60'}`}
                >
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${badge.earned ? `border border-[var(--color-outline-variant)] shadow-sm text-white ${badge.bgClass}` : 'border-[var(--color-outline-variant)] opacity-40 grayscale bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]'}`}
                  >
                    {badge.icon}
                  </div>
                  <p className={`font-bold text-sm ${badge.earned ? 'text-[var(--color-on-surface)] drop-shadow-sm' : 'text-[var(--color-on-surface-variant)]'}`}>
                    {badge.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Account Settings Section */}
      <AccountSettings />
      
    </div>
  );
}
