"use client";

import React, { useEffect, useState } from 'react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Lock, CheckCircle, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoadmapLevel {
  id: number;
  title: string;
  focus: string;
  status: 'completed' | 'active' | 'locked';
  modules: string[];
}

export default function LearningRoadmap() {
  const [levels, setLevels] = useState<RoadmapLevel[]>([]);
  const { level } = useKMasteryStore();
  const router = useRouter();

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.TOPIK_ROADMAP);
      const data = await res.json();
      setLevels(data.levels);
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]); // Refetch if store level changes


  const getCardStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#D1FAE5', border: '#10B981', icon: <CheckCircle className="text-[#059669]" size={32} /> };
      case 'active':
        return { bg: '#FEF3C7', border: '#F59E0B', icon: <GraduationCap className="text-[#B45309]" size={32} /> };
      case 'locked':
      default:
        return { bg: '#F3F4F6', border: '#9CA3AF', icon: <Lock className="text-[#6B7280]" size={32} /> };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 relative">
      {/* Central Line Path */}
      <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-[#1E1B4B] transform -translate-x-1/2 rounded-full hidden md:block"></div>

      <div className="space-y-12 relative z-10">
        {levels.map((lvl, idx) => {
          const style = getCardStyle(lvl.status);
          const isEven = idx % 2 === 0;

          return (
            <div key={lvl.id} className={`flex flex-col md:flex-row items-center justify-between w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
              
              <div className="w-full md:w-[45%]">
                <div 
                  className={`p-6 rounded-3xl border-4 border-[#1E1B4B] transition-transform ${lvl.status === 'active' ? 'scale-105 shadow-[12px_12px_0px_#1E1B4B]' : 'hover:-translate-y-2'}`}
                  style={{ 
                    background: style.bg, 
                    boxShadow: lvl.status === 'active' ? '12px 12px 0px #1E1B4B' : '8px 8px 0px #1E1B4B',
                    opacity: lvl.status === 'locked' ? 0.7 : 1
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white border-4 border-[#1E1B4B] shrink-0" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
                      {style.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>{lvl.title}</h3>
                      <p className="text-sm font-bold opacity-70 uppercase tracking-widest">{lvl.focus}</p>
                    </div>
                  </div>

                  {/* Modules Stepper */}
                  {lvl.modules && lvl.modules.length > 0 && lvl.status !== 'locked' && (
                    <div className="my-6 bg-white/50 rounded-2xl p-4 border-2 border-[#1E1B4B]">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#1E1B4B] mb-3">Curriculum Modules</h4>
                      <div className="flex flex-col gap-2">
                        {lvl.modules.map((mod, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 border-[#1E1B4B] flex items-center justify-center text-[10px] font-black ${lvl.status === 'completed' ? 'bg-[#10B981] text-white' : 'bg-white text-[#1E1B4B]'}`}>
                              {lvl.status === 'completed' ? '✓' : i + 1}
                            </div>
                            <span className="text-sm font-bold text-[#1E1B4B]">{mod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lvl.status === 'locked' && (
                    <div className="mt-4 w-full bg-gray-200 text-gray-500 py-3 rounded-xl border-4 border-gray-400 font-black uppercase text-center flex items-center justify-center gap-2">
                      <Lock size={18} /> Locked - Pass Level {lvl.id - 1} First
                    </div>
                  )}
                  {lvl.status === 'completed' && (
                    <div className="mt-4 w-full bg-[#10B981] text-white py-3 rounded-xl border-4 border-[#1E1B4B] font-black uppercase text-center flex items-center justify-center gap-2">
                      <CheckCircle size={20} /> Mastered
                    </div>
                  )}
                </div>
              </div>

              {/* Node Marker */}
              <div className="hidden md:flex w-12 h-12 absolute left-1/2 transform -translate-x-1/2 rounded-full border-4 border-[#1E1B4B] items-center justify-center bg-white z-20">
                <div className="w-4 h-4 rounded-full" style={{ background: style.border }}></div>
              </div>

              {/* Empty Space for Staggered Look */}
              <div className="w-full md:w-[45%]"></div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
