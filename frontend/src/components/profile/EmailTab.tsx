"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function EmailTab() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, token, fetchProfile } = useAuthStore();
  const toast = useToast();
  
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendVerification = async () => {
    if (cooldown > 0) return;

    setIsSending(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/email/send-verification`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Please wait before requesting again (Rate Limit Exceeded).");
        }
        throw new Error("Failed to send verification email.");
      }

      toast.success("Check your inbox — verification link sent!");
      setCooldown(60); // 60 second cooldown
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <label className="block text-sm font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Current Email</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E1B4B]/40">
            <Mail size={20} />
          </div>
          <input 
            type="email"
            readOnly
            value={user?.email || ''}
            className="w-full pl-12 pr-4 py-4 rounded-xl border-3 border-[#1E1B4B]/20 bg-gray-50 text-[#1E1B4B] font-bold cursor-not-allowed outline-none"
          />
        </div>
        <p className="text-xs text-[#1E1B4B]/50 font-bold mt-2">Contact support to change your email address.</p>
      </div>

      <div className="bg-[#EEF2FF] rounded-2xl border-3 border-[#1E1B4B] p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
           style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
        
        <div className="flex items-center gap-4">
          {user?.email_verified ? (
            <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center border-2 border-[#1E1B4B] text-white">
              <ShieldCheck size={24} />
            </div>
          ) : (
            <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center border-2 border-[#1E1B4B] text-white">
              <AlertCircle size={24} />
            </div>
          )}
          
          <div>
            <h3 className="font-black text-[#1E1B4B] text-lg">Verification Status</h3>
            <p className={`font-bold ${user?.email_verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
              {user?.email_verified ? 'Verified ✓' : 'Not verified'}
            </p>
          </div>
        </div>

        {!user?.email_verified && (
          <button 
            onClick={handleSendVerification}
            disabled={isSending || cooldown > 0}
            className="px-6 py-3 w-full sm:w-auto bg-[#4F46E5] text-white font-black rounded-xl border-3 border-[#1E1B4B] hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ boxShadow: '3px 3px 0px #1E1B4B' }}
          >
            {isSending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : cooldown > 0 ? (
              `Wait ${cooldown}s`
            ) : (
              "Send Link"
            )}
          </button>
        )}
      </div>

    </div>
  );
}
