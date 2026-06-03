"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Flame, Star } from 'lucide-react';

const DailyQuestsPanel = dynamic(() => import('@/components/DailyQuestsPanel'), { ssr: false });
const GlobalLeaderboard = dynamic(() => import('@/components/GlobalLeaderboard'), { ssr: false });
const SmartCorrector = dynamic(() => import('@/components/SmartCorrector'), { ssr: false });
const AIChatBox = dynamic(() => import('@/components/AIChatBox'), { ssr: false });
const LevelUpModal = dynamic(() => import('@/components/LevelUpModal'), { ssr: false });
const NotificationSystem = dynamic(() => import('@/components/NotificationSystem'), { ssr: false });
const WelcomePopup = dynamic(() => import('@/components/WelcomePopup'), { ssr: false });
const OnboardingModal = dynamic(() => import('@/components/OnboardingModal'), { ssr: false });

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
      <OnboardingModal />
      <div className="min-h-screen p-4 md:p-6 pb-24 lg:pb-6 relative z-10">
        <WelcomePopup />
        <LevelUpModal />
        <NotificationSystem />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 font-sans tracking-tight drop-shadow-md">
            Learning <span className="text-[var(--color-primary-container)]">Dashboard</span>
          </h1>
          <p className="text-xl text-[var(--color-on-surface-variant)] font-medium">
            Your daily mission control. Complete quests and level up!
          </p>
        </div>


      {/* Main Grid: 12-column layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-12rem)] lg:min-h-[800px]">
        
        {/* Left Column (3/12): Gamification */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-4">
          <div className="flex-none">
            <DailyQuestsPanel />
          </div>
          <div className="flex-none">
            <GlobalLeaderboard />
          </div>
        </div>

        {/* Center Column (6/12): AI Tutor & Stats */}
        <div className="lg:col-span-6 flex flex-col gap-6 lg:h-full">
          {/* Quick Stats Card */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-secondary-container)] shadow-[0_0_12px_rgba(236,106,6,0.4)] border border-[rgba(255,255,255,0.2)]">
                <Star className="text-white fill-white" size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">Current Rank</p>
                <h2 className="text-2xl font-extrabold text-white">
                  TOPIK Level {level}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">Next Level</p>
              <p className="text-xl font-extrabold text-[var(--color-primary-container)] drop-shadow-sm">
                {5000 - (xp % 5000)} XP
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <AIChatBox />
          </div>
        </div>

        {/* Right Column (3/12): Tools */}
        <div className="lg:col-span-3 flex flex-col gap-6 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-4">
          <div className="flex-none">
            <SmartCorrector />
          </div>
        </div>

      </div>
      </div>
    </ProtectedRoute>
  );
}
