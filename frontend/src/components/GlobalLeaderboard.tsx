"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';

interface LeaderboardUser {
  id: string | number;
  nickname?: string;
  full_name?: string;
  xp: number;
  level: number;
  avatar_url?: string;
}

export default function GlobalLeaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.USER_STATS.replace('/stats', '/leaderboard'));
        if (res.ok) {
          const data = await res.json();
          const mapped = (Array.isArray(data) ? data : []).map((u: {rank?: number; user_id?: number | string; nickname?: string; xp?: number; level?: number}, i: number) => ({
            id: u.user_id ?? i + 1,
            nickname: u.nickname ?? `User ${u.user_id}`,
            xp: u.xp ?? 0,
            level: u.level ?? 1,
          }));
          if (mapped.length > 0) {
            setUsers(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      }

      // Fallback: use mock data if API is down or returned empty
      const mockData = [
        { id: 1, nickname: "SeoulKing", xp: 12500, level: 12 },
        { id: 2, nickname: "KPopFan99", xp: 9800, level: 9 },
        { id: 3, nickname: "TopikMaster", xp: 8450, level: 8 },
        { id: 4, nickname: "LearnKorean24", xp: 6200, level: 6 },
        { id: 5, nickname: "BusanExplorer", xp: 4100, level: 4 }
      ];
      setTimeout(() => {
        setUsers(mockData);
        setLoading(false);
      }, 300);
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (rank: number) => {
    switch(rank) {
      case 1: return { bg: 'bg-yellow-400', text: 'text-yellow-900', shadow: 'shadow-[0_0_12px_rgba(250,204,21,0.5)]' }; // Gold
      case 2: return { bg: 'bg-gray-300', text: 'text-gray-900', shadow: 'shadow-[0_0_12px_rgba(209,213,219,0.5)]' }; // Silver
      case 3: return { bg: 'bg-amber-700', text: 'text-amber-100', shadow: 'shadow-[0_0_12px_rgba(180,83,9,0.5)]' }; // Bronze
      default: return { bg: 'bg-[rgba(255,255,255,0.1)]', text: 'text-[var(--color-on-surface-variant)]', shadow: '' };
    }
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-400/20 border border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.2)]">
          <Trophy className="text-yellow-400 drop-shadow-md" size={20} />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md font-sans">Leaderboard</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-[rgba(255,255,255,0.05)] rounded-2xl border border-[rgba(255,255,255,0.1)]" />
            ))}
          </div>
        ) : (
          users.map((user, index) => {
            const rank = index + 1;
            const rankStyle = getRankStyle(rank);
            const isMe = user.id === 1;

            return (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isMe ? 'bg-[var(--color-primary-container)]/30 border-[var(--color-primary-container)]/50 shadow-[0_0_12px_rgba(79,70,229,0.3)]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)]'}`}
              >
                <div 
                  className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm border border-[rgba(255,255,255,0.2)] ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow}`}
                >
                  {rank <= 3 ? <Medal size={14} /> : rank}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{user.nickname || user.full_name || "Anonymous"}</p>
                  <p className="text-xs font-extrabold text-[var(--color-primary-container)]">Lv. {user.level}</p>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-[var(--color-secondary-container)]">{user.xp.toLocaleString()} XP</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
