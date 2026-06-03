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
      case 0: return 'var(--color-surface-container-low)'; // empty
      case 1: return 'var(--color-primary-container)'; // light
      case 2: return 'rgba(194,101,42,0.5)'; // medium
      case 3: return 'rgba(194,101,42,0.8)'; // heavy
      case 4: return 'var(--color-primary)'; // max
      default: return 'var(--color-surface-container-low)';
    }
  };

  return (
    <div className="sahara-card rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-6 shadow-sm font-sans">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-on-surface)] font-serif drop-shadow-sm">Activity Heatmap</h2>
          <p className="text-[var(--color-on-surface-variant)] font-semibold text-sm">Your learning consistency</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wide">Longest Streak</p>
          <p className="text-xl font-bold text-[var(--color-primary)] drop-shadow-sm">24 Days</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {/* Days labels */}
          <div className="flex flex-col gap-2 pt-6 pr-2 text-xs font-bold text-[var(--color-on-surface-variant)]">
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
                  className={`w-4 h-4 rounded-md border ${day.isToday ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50' : 'border-[var(--color-outline-variant)]'}`}
                  style={{ background: getColor(day.intensity) }}
                  title={`Activity level: ${day.intensity}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs font-bold text-[var(--color-on-surface-variant)]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-3 h-3 rounded-[4px] border border-[var(--color-outline-variant)]" style={{ background: getColor(i) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
