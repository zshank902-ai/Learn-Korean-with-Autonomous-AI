"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Award, Flame, Zap, Target, Hexagon } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAuthStore } from '@/store/useAuthStore';
import StreakCalendar from '@/components/StreakCalendar';
import AnimatedXPBar from '@/components/AnimatedXPBar';

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
    <div className="min-h-screen bg-[#EEF2FF] p-6 max-w-screen-xl mx-auto text-[#1E1B4B] pt-10">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
           style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
        {/* Background decorative blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-[#1E1B4B] flex items-center justify-center relative z-10 bg-[#EEF2FF]"
               style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
            <User size={64} className="text-[#4F46E5]" />
          </div>
          {/* Level Badge overlapping avatar */}
          <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl border-3 border-[#1E1B4B] flex items-center justify-center font-black text-xl z-20 text-white rotate-12"
               style={{ background: '#F97316', boxShadow: '2px 2px 0px #1E1B4B', fontFamily: 'Fredoka, cursive' }}>
            Lv.{level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>
            {user?.username || 'Student'}
          </h1>
          <p className="text-lg text-[#1E1B4B]/60 font-bold mb-6">Learning Korean</p>
          
          <div className="max-w-md">
            <AnimatedXPBar currentXP={xp} level={level} />
          </div>
        </div>
      </div>

      {xp === 0 ? (
        <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-12 text-center"
             style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
          <div className="w-24 h-24 bg-[#EEF2FF] rounded-full border-4 border-[#1E1B4B] flex items-center justify-center mx-auto mb-6"
               style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
            <Target size={40} className="text-[#4F46E5]" />
          </div>
          <h2 className="text-3xl font-black text-[#1E1B4B] mb-4" style={{ fontFamily: 'Fredoka, cursive' }}>
            Zero Progress Yet!
          </h2>
          <p className="text-[#1E1B4B]/60 font-bold text-lg max-w-md mx-auto mb-8">
            Your journey begins now. Complete your first lesson to start earning XP, building your streak, and unlocking badges!
          </p>
          <Link href="/roadmap" className="inline-block px-8 py-4 bg-[#F97316] text-white font-black text-xl rounded-xl border-4 border-[#1E1B4B] hover:-translate-y-1 hover:shadow-[4px_6px_0px_#1E1B4B] active:translate-y-1 active:shadow-[0px_0px_0px_#1E1B4B] transition-all"
             style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
            START LEARNING
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Calendar */}
          <div className="lg:col-span-2 space-y-8">
          {/* Stat Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border-3 border-[#1E1B4B] p-5 text-center"
                style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
              >
                <p className="text-xs font-black text-[#1E1B4B]/40 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-2xl font-black" style={{ color: stat.color, fontFamily: 'Fredoka, cursive' }}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          <StreakCalendar />
        </div>

        {/* Right Column: Badges */}
        <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-6"
             style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>
          <h2 className="text-2xl font-black text-[#1E1B4B] mb-6 flex items-center gap-3" style={{ fontFamily: 'Fredoka, cursive' }}>
            <Award className="text-[#F97316]" size={28} /> Badges
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center text-center p-4 rounded-2xl border-3 ${badge.earned ? 'border-[#1E1B4B]' : 'border-[#1E1B4B]/20 bg-[#EEF2FF]/50'}`}
                style={badge.earned ? { boxShadow: '3px 3px 0px #1E1B4B' } : {}}
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${badge.earned ? 'border-2 border-[#1E1B4B]' : 'opacity-40 grayscale'}`}
                  style={badge.earned ? { background: badge.bg, color: 'white' } : { background: '#ccc' }}
                >
                  {badge.icon}
                </div>
                <p className={`font-bold text-sm ${badge.earned ? 'text-[#1E1B4B]' : 'text-[#1E1B4B]/40'}`}>
                  {badge.name}
                </p>
              </motion.div>
            ))}
          </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
