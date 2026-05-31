"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Flame, Star } from 'lucide-react';

const DailyQuestsPanel = dynamic(() => import('@/components/DailyQuestsPanel'), { ssr: false });
const GlobalLeaderboard = dynamic(() => import('@/components/GlobalLeaderboard'), { ssr: false });
const SmartCorrector = dynamic(() => import('@/components/SmartCorrector'), { ssr: false });
const AIChatBox = dynamic(() => import('@/components/AIChatBox'), { ssr: false });
const LevelUpModal = dynamic(() => import('@/components/LevelUpModal'), { ssr: false });
const NotificationSystem = dynamic(() => import('@/components/NotificationSystem'), { ssr: false });
const WelcomePopup = dynamic(() => import('@/components/WelcomePopup'), { ssr: false });

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const { setStats, level, xp } = useKMasteryStore();

  useEffect(() => {
    let alive = true;
    const token = useAuthStore.getState().token;
    fetch(API_ENDPOINTS.USER_STATS, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async r => {
        if (!r.ok) throw new Error("API Error");
        return r.json();
      })
      .then(d => {
        if (alive) setStats({
          xp: d.total_xp ?? 0,
          streak: d.streak_count ?? 0,
          coins: d.coins ?? 0,
          level: d.current_level ?? undefined,
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#EEF2FF] p-4 md:p-6 pb-24 lg:pb-6 text-[#1E1B4B]">
        <WelcomePopup />
        <LevelUpModal />
        <NotificationSystem />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
            Learning <span className="text-[#4F46E5]">Dashboard</span>
          </h1>
          <p className="text-xl text-[#1E1B4B]/60 font-semibold">
            Your daily mission control. Complete quests and level up!
          </p>
        </div>


      {/* Main Grid: 12-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[800px]">
        
        {/* Left Column (3/12): Gamification */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
          <div className="flex-none">
            <DailyQuestsPanel />
          </div>
          <div className="flex-none">
            <GlobalLeaderboard />
          </div>
        </div>

        {/* Center Column (6/12): AI Tutor & Stats */}
        <div className="lg:col-span-6 flex flex-col gap-6 h-full">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-6 flex items-center justify-between"
               style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-[#1E1B4B]"
                   style={{ background: '#F97316', boxShadow: '4px 4px 0px #1E1B4B' }}>
                <Star className="text-white fill-white" size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E1B4B]/50 uppercase tracking-widest">Current Rank</p>
                <h2 className="text-2xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>
                  TOPIK Level {level}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#1E1B4B]/50 uppercase tracking-widest">Next Level</p>
              <p className="text-xl font-black text-[#4F46E5]">
                {5000 - (xp % 5000)} XP
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <AIChatBox />
          </div>
        </div>

        {/* Right Column (3/12): Tools */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4">
          <div className="flex-none">
            <SmartCorrector />
          </div>
        </div>

      </div>
      </div>
    </ProtectedRoute>
  );
}
