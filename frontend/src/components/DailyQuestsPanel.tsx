"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';

interface Quest {
  id: string;
  title: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export default function DailyQuestsPanel() {
  const { updateXP } = useKMasteryStore();
  
  // Simulated initial state for quests
  const [quests, setQuests] = useState<Quest[]>([
    { id: '1', title: 'Complete 3 pronunciation drills', target: 3, progress: 1, reward: 50, completed: false },
    { id: '2', title: 'Correct 5 sentences with AI', target: 5, progress: 5, reward: 100, completed: true },
    { id: '3', title: 'Maintain a 3-day streak', target: 3, progress: 3, reward: 150, completed: true },
  ]);

  const claimReward = (questId: string, reward: number) => {
    // In a real app, we would mark this claimed in the backend
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, title: q.title + ' (Claimed)' } : q));
    updateXP(reward);
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-6 h-full flex flex-col"
         style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>
      <div className="flex items-center gap-3 mb-6 border-b-4 border-[#1E1B4B] pb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border-3 border-[#1E1B4B]"
             style={{ background: '#F97316', border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}>
          <Target className="text-white" size={20} />
        </div>
        <h2 className="text-2xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>Daily Quests</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {quests.map((quest, i) => (
          <motion.div 
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-2xl border-3 border-[#1E1B4B] ${quest.completed ? 'bg-[#EEF2FF]' : 'bg-white'}`}
            style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                {quest.completed ? (
                  <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
                ) : (
                  <Circle className="text-[#1E1B4B]/30 mt-0.5 shrink-0" size={20} />
                )}
                <div>
                  <h3 className={`font-bold ${quest.completed ? 'text-[#1E1B4B]/60 line-through' : 'text-[#1E1B4B]'}`}>
                    {quest.title}
                  </h3>
                  <p className="text-xs font-black text-[#F97316] uppercase mt-1">+{quest.reward} XP</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs font-bold mb-1 text-[#1E1B4B]/60">
                <span>Progress</span>
                <span>{quest.progress} / {quest.target}</span>
              </div>
              <div className="h-3 w-full rounded-full border-2 border-[#1E1B4B] overflow-hidden bg-white">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ background: quest.completed ? '#16A34A' : '#4F46E5' }}
                />
              </div>
            </div>

            {quest.completed && !quest.title.includes('(Claimed)') && (
              <button 
                onClick={() => claimReward(quest.id, quest.reward)}
                className="mt-3 w-full py-2 bg-[#F97316] text-white font-bold rounded-xl border-2 border-[#1E1B4B] hover:-translate-y-0.5 transition-transform"
                style={{ boxShadow: '2px 2px 0px #1E1B4B' }}
              >
                Claim Reward
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
