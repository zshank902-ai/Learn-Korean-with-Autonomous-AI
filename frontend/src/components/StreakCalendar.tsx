"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function StreakCalendar() {
  // Generate mock data for the last 12 weeks
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let w = 0; w < 12; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        // Random intensity 0-4 for demo, with higher probability of 0 for realistic gaps
        // eslint-disable-next-line react-hooks/purity
        const intensity = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
        
        // Ensure today (last week, last day) has intensity if we have a streak
        const isToday = w === 11 && d === today.getDay();
        
        week.push({
          dayIndex: d,
          intensity: isToday ? 3 : intensity,
          isToday
        });
      }
      data.push(week);
    }
    return data;
  }, []);

  const getColor = (intensity: number) => {
    switch(intensity) {
      case 0: return '#EEF2FF'; // empty
      case 1: return '#C7D2FE'; // light indigo
      case 2: return '#818CF8'; // medium indigo
      case 3: return '#4F46E5'; // primary indigo
      case 4: return '#312E81'; // dark indigo
      default: return '#EEF2FF';
    }
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] p-6"
         style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>Activity Heatmap</h2>
          <p className="text-[#1E1B4B]/60 font-semibold text-sm">Your learning consistency</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#1E1B4B]/50 uppercase tracking-widest">Longest Streak</p>
          <p className="text-xl font-black text-[#F97316]">24 Days</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {/* Days labels */}
          <div className="flex flex-col gap-2 pt-6 pr-2 text-xs font-bold text-[#1E1B4B]/40">
            <span className="h-4 flex items-center">Mon</span>
            <span className="h-4 flex items-center mt-2">Wed</span>
            <span className="h-4 flex items-center mt-2">Fri</span>
          </div>

          {/* Grid */}
          {heatmapData.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-2">
              {week.map((day, dIdx) => (
                <motion.div
                  key={dIdx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (wIdx * 7 + dIdx) * 0.005 }}
                  className={`w-4 h-4 rounded-md border ${day.isToday ? 'border-[#F97316] ring-2 ring-[#F97316]/50' : 'border-[#1E1B4B]/10'}`}
                  style={{ background: getColor(day.intensity) }}
                  title={`Activity level: ${day.intensity}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs font-bold text-[#1E1B4B]/50">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-3 h-3 rounded-[4px]" style={{ background: getColor(i) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
