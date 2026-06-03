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
    { id: 1, name: 'First Word', icon: <Target size={24} />, bg: '#F97316', earned: true },
    { id: 2, name: '7-Day Streak', icon: <Flame size={24} />, bg: '#EF4444', earned: true },
    { id: 3, name: 'Perfect Pronunciation', icon: <Award size={24} />, bg: '#818CF8', earned: true },
    { id: 4, name: '10k XP Club', icon: <Zap size={24} />, bg: '#4F46E5', earned: xp >= 10000 },
    { id: 5, name: 'TOPIK II Master', icon: <Hexagon size={24} />, bg: '#16A34A', earned: level >= 3 },
  ];

  const stats = [
    { label: 'Total XP', value: xp.toLocaleString(), color: '#4F46E5' },
    { label: 'Current Streak', value: `${streak} Days`, color: '#F97316' },
    { label: 'K-Coins', value: coins.toLocaleString(), color: '#FBBF24' },
    { label: 'Words Learned', value: '342', color: '#16A34A' },
  ];

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 max-w-screen-xl mx-auto text-white pt-8 md:pt-10 relative z-10">
      <ToastContainer />
      {/* Header Profile Card */}
      <div className="glass-card rounded-3xl border border-[rgba(255,255,255,0.2)] p-6 md:p-12 mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Background decorative blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-primary-container)] rounded-full blur-[100px] pointer-events-none opacity-20" />
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border border-[rgba(255,255,255,0.2)] flex items-center justify-center relative z-10 glass-card bg-[rgba(255,255,255,0.05)] shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
            <User size={64} className="text-[var(--color-primary-container)] drop-shadow-md" />
          </div>
          {/* Level Badge overlapping avatar */}
          <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-[rgba(255,255,255,0.3)] flex items-center justify-center font-extrabold text-lg md:text-xl z-20 text-white rotate-12 bg-[rgba(253,186,116,0.2)] backdrop-blur-md shadow-[0_0_15px_rgba(253,186,116,0.3)] font-sans">
            Lv.{level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white font-sans drop-shadow-md">
            {user?.nickname || user?.full_name || 'Student'}
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-bold mb-6">Learning Korean</p>
          
          <div className="max-w-md">
            <AnimatedXPBar currentXP={xp} level={level} />
          </div>
        </div>
      </div>

      {xp === 0 ? (
        <div className="glass-card rounded-3xl border border-[rgba(255,255,255,0.2)] p-6 md:p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 glass-card bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
            <Target size={40} className="text-[var(--color-primary-container)] drop-shadow-md" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 font-sans drop-shadow-md">
            Zero Progress Yet!
          </h2>
          <p className="text-[var(--color-on-surface-variant)] font-bold text-lg max-w-md mx-auto mb-8">
            Your journey begins now. Complete your first lesson to start earning XP, building your streak, and unlocking badges!
          </p>
          <Link href="/roadmap" className="inline-block px-8 py-4 glass-btn text-white font-extrabold text-xl rounded-xl transition-all hover:-translate-y-1">
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
                  className="glass-card rounded-2xl border border-[rgba(255,255,255,0.1)] p-5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-md"
                >
                  <p className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 font-sans">{stat.label}</p>
                  <p className="text-2xl font-extrabold font-sans drop-shadow-sm" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <StreakCalendar />
          </div>

          {/* Right Column: Badges */}
          <div className="glass-card rounded-3xl border border-[rgba(255,255,255,0.2)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3 font-sans drop-shadow-sm">
              <Award className="text-[var(--color-secondary-container)] drop-shadow-md" size={28} /> Badges
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl border ${badge.earned ? 'border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]' : 'border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] opacity-60'}`}
                >
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${badge.earned ? 'border border-[rgba(255,255,255,0.3)] shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] text-white' : 'border-[rgba(255,255,255,0.1)] opacity-40 grayscale bg-[rgba(255,255,255,0.1)] text-[var(--color-on-surface-variant)]'}`}
                    style={badge.earned ? { background: badge.bg } : {}}
                  >
                    {badge.icon}
                  </div>
                  <p className={`font-bold text-sm ${badge.earned ? 'text-white drop-shadow-sm' : 'text-[var(--color-on-surface-variant)]'}`}>
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
