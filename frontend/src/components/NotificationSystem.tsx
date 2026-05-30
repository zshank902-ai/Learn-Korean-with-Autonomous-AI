"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Info, CheckCircle } from 'lucide-react';
import { useKMasteryStore, Notification } from '@/store/useKMasteryStore';

export default function NotificationSystem() {
  const { notifications, removeNotification } = useKMasteryStore();

  return (
    <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <NotificationToast key={n.id} notification={n} onExpire={() => removeNotification(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationToast({ notification, onExpire }: { notification: Notification; onExpire: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onExpire, 4000);
    return () => clearTimeout(timer);
  }, [onExpire]);

  const config = {
    xp:      { icon: <Zap size={20} className="text-white" />,       bg: '#4F46E5', label: 'XP Gained' },
    streak:  { icon: <Flame size={20} className="text-white" />,     bg: '#F97316', label: 'Streak!' },
    info:    { icon: <Info size={20} className="text-white" />,      bg: '#818CF8', label: 'Info' },
    success: { icon: <CheckCircle size={20} className="text-white" />, bg: '#16A34A', label: 'Nice Work!' },
  };

  const { icon, bg, label } = config[notification.type] ?? config.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.8, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex items-center gap-4 bg-white border-4 border-[#1E1B4B] rounded-2xl px-5 py-3 min-w-[220px] relative overflow-hidden"
      style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
    >
      {/* Colored icon bubble */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-[#1E1B4B]" style={{ background: bg }}>
        {icon}
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest font-black text-[#1E1B4B]/50">
          {notification.message || label}
        </div>
        <div className="text-xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>
          {notification.value}
        </div>
      </div>

      {/* Expiry progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        className="absolute bottom-0 left-0 right-0 h-1 origin-left rounded-b-xl"
        style={{ background: bg }}
      />
    </motion.div>
  );
}
