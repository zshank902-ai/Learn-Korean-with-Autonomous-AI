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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoadmap();
  }, [level]); // Refetch if store level changes


  const getCardStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bgClass: 'bg-[var(--color-surface)]', borderClass: 'border-[var(--color-primary)]', icon: <CheckCircle className="text-[var(--color-primary)]" size={32} />, markerBorder: 'border-[var(--color-primary)]', markerBg: 'bg-[var(--color-primary)]' };
      case 'active':
        return { bgClass: 'bg-[var(--color-primary-container)]', borderClass: 'border-[var(--color-primary)]', icon: <GraduationCap className="text-[var(--color-primary)]" size={32} />, markerBorder: 'border-[var(--color-primary)]', markerBg: 'bg-[var(--color-primary)]' };
      case 'locked':
      default:
        return { bgClass: 'bg-[var(--color-surface-container-low)]', borderClass: 'border-[var(--color-outline-variant)]', icon: <Lock className="text-[var(--color-on-surface-variant)]" size={32} />, markerBorder: 'border-[var(--color-outline-variant)]', markerBg: 'bg-[var(--color-outline-variant)]' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 relative font-sans">
      {/* Central Line Path */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[var(--color-outline-variant)] transform -translate-x-1/2 rounded-full hidden md:block"></div>

      <div className="space-y-12 relative z-10">
        {levels.map((lvl, idx) => {
          const style = getCardStyle(lvl.status);
          const isEven = idx % 2 === 0;

          return (
            <div key={lvl.id} className={`flex flex-col md:flex-row items-center justify-between w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
              
              <div className="w-full md:w-[45%]">
                <div 
                  className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm ${lvl.status === 'active' ? 'scale-105 shadow-md' : 'hover:-translate-y-1'} ${style.bgClass} ${style.borderClass} ${lvl.status === 'locked' ? 'opacity-70' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-outline-variant)] shrink-0 shadow-sm">
                      {style.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--color-on-surface)] font-serif">{lvl.title}</h3>
                      <p className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-widest">{lvl.focus}</p>
                    </div>
                  </div>

                  {/* Modules Stepper */}
                  {lvl.modules && lvl.modules.length > 0 && lvl.status !== 'locked' && (
                    <div className="my-6 bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-outline-variant)] shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-3">Curriculum Modules</h4>
                      <div className="flex flex-col gap-2">
                        {lvl.modules.map((mod, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${lvl.status === 'completed' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]'}`}>
                              {lvl.status === 'completed' ? '✓' : i + 1}
                            </div>
                            <span className="text-sm font-semibold text-[var(--color-on-surface)]">{mod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lvl.status === 'locked' && (
                    <div className="mt-4 w-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] py-3 rounded-xl border border-[var(--color-outline-variant)] font-bold text-center flex items-center justify-center gap-2">
                      <Lock size={18} /> Locked - Pass Level {lvl.id - 1} First
                    </div>
                  )}
                  {lvl.status === 'completed' && (
                    <div className="mt-4 w-full bg-[var(--color-surface)] text-[var(--color-primary)] py-3 rounded-xl border border-[var(--color-primary)] font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle size={20} /> Mastered
                    </div>
                  )}
                </div>
              </div>

              {/* Node Marker */}
              <div className={`hidden md:flex w-12 h-12 absolute left-1/2 transform -translate-x-1/2 rounded-full border bg-[var(--color-surface)] items-center justify-center z-20 ${style.markerBorder}`}>
                <div className={`w-4 h-4 rounded-full ${style.markerBg}`}></div>
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
