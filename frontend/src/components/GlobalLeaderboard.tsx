"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';

interface LeaderboardUser {
  user_id: number;
  username: string;
  xp: number;
  level: number;
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
          // Backend returns array; map to our interface
          const mapped = (Array.isArray(data) ? data : []).map((u: {rank?: number; user_id?: number | string; username?: string; xp?: number; level?: number}, i: number) => ({
            user_id: Number(u.user_id ?? i + 1),
            username: u.username ?? `User ${u.user_id}`,
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
        { user_id: 2, username: 'Minho_T', xp: 14500, level: 3 },
        { user_id: 1, username: 'You', xp: 12450, level: 3 },
        { user_id: 3, username: 'SarahJ', xp: 9800, level: 2 },
        { user_id: 4, username: 'BTS_Fan', xp: 7500, level: 2 },
        { user_id: 5, username: 'SeoulExplorer', xp: 4200, level: 1 },
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
      case 1: return { bg: '#FBBF24', color: 'white', border: '#1E1B4B' }; // Gold
      case 2: return { bg: '#94A3B8', color: 'white', border: '#1E1B4B' }; // Silver
      case 3: return { bg: '#B45309', color: 'white', border: '#1E1B4B' }; // Bronze
      default: return { bg: '#EEF2FF', color: '#1E1B4B', border: '#1E1B4B' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-6 h-full flex flex-col"
         style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>
      <div className="flex items-center gap-3 mb-6 border-b-4 border-[#1E1B4B] pb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border-3 border-[#1E1B4B]"
             style={{ background: '#FBBF24', border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}>
          <Trophy className="text-[#1E1B4B]" size={20} />
        </div>
        <h2 className="text-2xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>Leaderboard</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-[#EEF2FF] rounded-2xl border-3 border-[#1E1B4B]/20" />
            ))}
          </div>
        ) : (
          users.map((user, index) => {
            const rank = index + 1;
            const rankStyle = getRankStyle(rank);
            const isMe = user.user_id === 1;

            return (
              <motion.div 
                key={user.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-2xl border-3 border-[#1E1B4B] ${isMe ? 'bg-[#EEF2FF]' : 'bg-white'}`}
                style={{ border: '3px solid #1E1B4B', boxShadow: isMe ? '3px 3px 0px #4F46E5' : '2px 2px 0px #1E1B4B' }}
              >
                <div 
                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm border-2"
                  style={{ background: rankStyle.bg, color: rankStyle.color, borderColor: rankStyle.border }}
                >
                  {rank <= 3 ? <Medal size={14} /> : rank}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1E1B4B] truncate">{user.username}</p>
                  <p className="text-xs font-black text-[#4F46E5]">Lv. {user.level}</p>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="font-black text-[#F97316]">{user.xp.toLocaleString()} XP</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
