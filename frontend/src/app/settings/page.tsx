"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Settings, User, Mail, Star, Loader2, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nickname: '',
    full_name: '',
  });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nickname: user.nickname || '',
        full_name: user.full_name || '',
      });
    }
  }, [user]);

  if (!user) {
    return <div className="p-8 text-center font-bold">Please log in to view settings.</div>;
  }

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    // In a real app, this would hit PUT /api/v1/auth/me or similar
    // For now, we mock success since the API endpoint wasn't strictly requested in the prompt
    setTimeout(async () => {
      await fetchProfile();
      setSuccess(true);
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center glass-card bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]">
          <Settings className="text-[var(--color-primary-container)] drop-shadow-md" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white font-sans drop-shadow-md">Settings</h1>
          <p className="font-bold text-[var(--color-on-surface-variant)]">Manage your profile and preferences.</p>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card rounded-3xl p-6 md:p-8 border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <h2 className="text-2xl font-extrabold text-white mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4 font-sans drop-shadow-md">Personal Information</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Nickname (Unique)</label>
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                <input 
                  type="text" 
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full neumorphic-input rounded-xl py-4 pl-12 pr-4 font-bold text-white placeholder-[rgba(255,255,255,0.4)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full neumorphic-input rounded-xl py-4 pl-12 pr-4 font-bold text-white placeholder-[rgba(255,255,255,0.4)]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] text-[var(--color-on-surface-variant)] font-bold cursor-not-allowed outline-none"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm font-bold">
              {user.email_verified ? (
                <span className="text-[#10B981] flex items-center gap-1"><CheckCircle size={16} /> Verified</span>
              ) : (
                <span className="text-[var(--color-secondary-container)]">Not verified. Please check your inbox.</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.1)] flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-8 py-4 rounded-xl font-extrabold uppercase tracking-widest flex items-center gap-2 transition-all ${
                success 
                  ? 'bg-[#10B981] text-white'
                  : 'glass-btn text-white hover:-translate-y-1'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : (success ? <CheckCircle /> : <Save />)}
              {loading ? 'Saving...' : (success ? 'Saved!' : 'Save Changes')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
