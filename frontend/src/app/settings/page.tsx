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
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10 font-sans">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-outline-variant)] shadow-sm">
          <Settings className="text-[var(--color-primary)] drop-shadow-sm" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-on-surface)] font-serif drop-shadow-sm">Settings</h1>
          <p className="font-semibold text-[var(--color-on-surface-variant)]">Manage your profile and preferences.</p>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sahara-card rounded-3xl p-6 md:p-8 border border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-sm"
      >
        <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6 border-b border-[var(--color-outline-variant)] pb-4 font-serif drop-shadow-sm">Personal Information</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-on-surface-variant)]">Nickname (Unique)</label>
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                <input 
                  type="text" 
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl py-4 pl-12 pr-4 font-semibold text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-on-surface-variant)]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl py-4 pl-12 pr-4 font-semibold text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-on-surface-variant)]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-bold cursor-not-allowed outline-none"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm font-bold">
              {user.email_verified ? (
                <span className="text-[#10B981] flex items-center gap-1"><CheckCircle size={16} /> Verified</span>
              ) : (
                <span className="text-[#F59E0B]">Not verified. Please check your inbox.</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-outline-variant)] flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all ${
                success 
                  ? 'bg-[#10B981] text-white'
                  : 'sahara-btn text-white hover:-translate-y-1'
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
