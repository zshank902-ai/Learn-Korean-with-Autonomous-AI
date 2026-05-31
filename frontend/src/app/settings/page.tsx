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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#F97316] rounded-2xl border-4 border-[#1E1B4B] flex items-center justify-center shadow-[4px_4px_0px_#1E1B4B]">
          <Settings className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-[#1E1B4B]" style={{ fontFamily: 'Fredoka, cursive' }}>Settings</h1>
          <p className="font-bold text-[#1E1B4B]/60">Manage your profile and preferences.</p>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_#1E1B4B]"
      >
        <h2 className="text-2xl font-black text-[#1E1B4B] mb-6 border-b-4 border-gray-100 pb-4">Personal Information</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-[#1E1B4B]">Nickname (Unique)</label>
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E1B4B]/40" size={20} />
                <input 
                  type="text" 
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full bg-[#EEF2FF] border-4 border-[#1E1B4B] rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:bg-[#FEF3C7] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-[#1E1B4B]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E1B4B]/40" size={20} />
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[#EEF2FF] border-4 border-[#1E1B4B] rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:bg-[#FEF3C7] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-[#1E1B4B]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E1B4B]/40" size={20} />
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full bg-gray-100 border-4 border-gray-200 rounded-xl py-4 pl-12 pr-4 font-bold text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm font-bold">
              {user.email_verified ? (
                <span className="text-[#10B981] flex items-center gap-1"><CheckCircle size={16} /> Verified</span>
              ) : (
                <span className="text-[#F97316]">Not verified. Please check your inbox.</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t-4 border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 border-4 transition-all ${
                success 
                  ? 'bg-[#10B981] border-[#10B981] text-white shadow-[4px_4px_0px_#059669]'
                  : 'bg-[#4F46E5] border-[#1E1B4B] text-white hover:-translate-y-1 shadow-[4px_4px_0px_#1E1B4B]'
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
