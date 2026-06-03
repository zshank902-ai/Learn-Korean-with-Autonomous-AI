"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Eye, EyeOff, Loader2, Key } from 'lucide-react';

const securitySchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Requires 1 uppercase letter")
    .regex(/[0-9]/, "Requires 1 number"),
  confirm_password: z.string().min(1, "Please confirm password")
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"]
});

type SecurityForm = z.infer<typeof securitySchema>;

export default function SecurityTab() {
  const { token, user } = useAuthStore();
  const toast = useToast();
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isValid, isDirty }, reset } = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    mode: 'onChange'
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchNewPassword = watch('new_password', '');

  // Calculate strength based on rules matched
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++; // bonus for special char
    return score;
  };

  const strength = calculateStrength(watchNewPassword);

  const onSubmit = async (data: SecurityForm) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
          confirm_password: data.confirm_password
        })
      });

      const resData = await res.json();

      if (!res.ok) {
        // Backend returns 401 for incorrect current password
        if (res.status === 401) {
          setServerError(resData.detail || "Incorrect current password");
          return;
        }
        throw new Error(resData.detail || "Failed to update password");
      }

      toast.success("Password updated successfully");
      reset(); // Clear all fields
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user signed up via Google/Github, they don't have a password.
  // The backend restricts this, so we disable the UI here too.
  const isSocialAuth = user?.oauth_provider != null;

  if (isSocialAuth) {
    return (
      <div className="p-8 text-center sahara-card bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] shadow-sm font-sans">
        <Key className="mx-auto text-[var(--color-on-surface-variant)] mb-4" size={40} />
        <h3 className="text-lg font-extrabold text-[var(--color-on-surface)] mb-2 font-serif">Social Login Account</h3>
        <p className="text-[var(--color-on-surface-variant)] font-semibold max-w-md mx-auto">
          You signed in using a social provider ({user.oauth_provider}). Your password is managed securely by them.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Current Password */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-on-surface-variant)] mb-2">Current Password</label>
        <div className="relative">
          <input 
            type={showCurrent ? "text" : "password"}
            {...register('current_password')}
            className={`w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl py-4 px-4 pr-12 font-semibold text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all ${
              errors.current_password || serverError ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : ''
            }`}
          />
          <button 
            type="button" 
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
          >
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.current_password && <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.current_password.message}</p>}
        {serverError && <p className="text-[#EF4444] text-sm font-bold mt-1">{serverError}</p>}
      </div>

      <hr className="border-[var(--color-outline-variant)] rounded-full" />

      {/* New Password */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-on-surface-variant)] mb-2">New Password</label>
        <div className="relative">
          <input 
            type={showNew ? "text" : "password"}
            {...register('new_password')}
            className={`w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl py-4 px-4 pr-12 font-semibold text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all ${
              errors.new_password ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : ''
            }`}
          />
          <button 
            type="button" 
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {/* Strength Indicator */}
        {watchNewPassword.length > 0 && (
          <div className="mt-3 flex gap-2 h-2">
            <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-[#EF4444]' : 'bg-[var(--color-surface-container)]'}`} />
            <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-[#F59E0B]' : 'bg-[var(--color-surface-container)]'}`} />
            <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-[#10B981]' : 'bg-[var(--color-surface-container)]'}`} />
            <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-container)]'}`} />
          </div>
        )}
        
        {errors.new_password && <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.new_password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-on-surface-variant)] mb-2">Confirm New Password</label>
        <input 
          type={showNew ? "text" : "password"}
          {...register('confirm_password')}
          className={`w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl py-4 px-4 font-semibold text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all ${
            errors.confirm_password ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : ''
          }`}
        />
        {errors.confirm_password && <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.confirm_password.message}</p>}
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={!isDirty || !isValid || isSubmitting}
          className="px-8 py-3 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] font-bold rounded-xl hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
        </button>
      </div>

    </form>
  );
}
