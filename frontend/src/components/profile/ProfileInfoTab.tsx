"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Loader2, CheckCircle, XCircle, User, Upload } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().max(100, "Max 100 characters").optional(),
  nickname: z.string()
    .min(3, "Min 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileInfoTab() {
  const { user, token, fetchProfile } = useAuthStore();
  const toast = useToast();
  
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Avatar local state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isDirty, isValid }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      nickname: user?.nickname || '',
    },
    mode: 'onBlur'
  });

  const watchNickname = watch('nickname');

  // Debounced Nickname Check
  const checkNickname = useCallback(async (nickname: string) => {
    if (!nickname || nickname === user?.nickname) {
      setNicknameStatus('idle');
      return;
    }
    
    // Quick regex check before hitting API to save calls
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(nickname)) {
      setNicknameStatus('taken');
      return;
    }

    setIsCheckingNickname(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/profile/check-nickname?nickname=${nickname}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNicknameStatus(data.available ? 'available' : 'taken');
    } catch (e) {
      setNicknameStatus('idle');
    } finally {
      setIsCheckingNickname(false);
    }
  }, [token, user?.nickname]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (watchNickname) {
        checkNickname(watchNickname);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [watchNickname, checkNickname]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const onSubmit = async (data: ProfileForm) => {
    if (nicknameStatus === 'taken') {
      toast.error("Please choose an available nickname");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let uploadedAvatarUrl = user?.avatar_url;
      
      // Simulate avatar upload for now (until cloud storage is ready)
      if (selectedFile) {
        // MOCK UPLOAD - In reality you'd POST FormData to a presigned URL or /api/upload
        uploadedAvatarUrl = avatarPreview;
        await new Promise(r => setTimeout(r, 1000));
      }

      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: data.full_name,
          nickname: data.nickname,
          avatar_url: uploadedAvatarUrl
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update profile");
      }

      await fetchProfile();
      toast.success("Profile updated successfully");
      reset({ full_name: data.full_name, nickname: data.nickname }); // reset isDirty state
      setSelectedFile(null); // clear file state so it's not "dirty"
      
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValidToSubmit = (isDirty || !!selectedFile) && isValid && nicknameStatus !== 'taken';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Avatar Upload */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-[1rem] border-3 border-[#1E1B4B] bg-[#EEF2FF] flex items-center justify-center overflow-hidden"
             style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <User className="text-[#4F46E5]" size={40} />
          )}
        </div>
        <div>
          <h3 className="font-bold text-[#1E1B4B] text-lg mb-2">Profile Picture</h3>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-white border-2 border-[#1E1B4B] rounded-lg font-bold text-[#1E1B4B] hover:bg-[#EEF2FF] transition-colors flex items-center gap-2"
                   style={{ boxShadow: '2px 2px 0px #1E1B4B' }}>
              <Upload size={16} />
              Change Photo
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <p className="text-xs text-[#1E1B4B]/50 font-bold mt-2">JPEG, PNG, or WebP. Max 2MB.</p>
        </div>
      </div>

      <hr className="border-[#1E1B4B]/10 border-2 rounded-full" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Full Name</label>
          <input 
            {...register('full_name')}
            className={`w-full p-4 rounded-xl border-3 font-bold bg-white text-[#1E1B4B] placeholder:text-[#1E1B4B]/30 outline-none transition-all ${
              errors.full_name ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#1E1B4B] focus:border-[#4F46E5]'
            }`}
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
            placeholder="e.g. John Doe"
          />
          {errors.full_name && <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-black text-[#1E1B4B] mb-2 uppercase tracking-wide">Nickname (Unique)</label>
          <div className="relative">
            <input 
              {...register('nickname')}
              className={`w-full p-4 pr-12 rounded-xl border-3 font-bold bg-white text-[#1E1B4B] placeholder:text-[#1E1B4B]/30 outline-none transition-all ${
                errors.nickname || nicknameStatus === 'taken' ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#1E1B4B] focus:border-[#4F46E5]'
              }`}
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
              placeholder="e.g. jdoe99"
            />
            
            {/* Nickname Status Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCheckingNickname ? (
                <Loader2 className="animate-spin text-[#4F46E5]" size={20} />
              ) : nicknameStatus === 'available' ? (
                <CheckCircle className="text-[#10B981]" size={20} />
              ) : nicknameStatus === 'taken' ? (
                <XCircle className="text-[#EF4444]" size={20} />
              ) : null}
            </div>
          </div>
          {errors.nickname && <p className="text-[#EF4444] text-sm font-bold mt-1">{errors.nickname.message}</p>}
          {nicknameStatus === 'taken' && !errors.nickname && <p className="text-[#EF4444] text-sm font-bold mt-1">This nickname is already taken.</p>}
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={!isFormValidToSubmit || isSubmitting}
            className="px-8 py-3 bg-[#1E1B4B] text-white font-black rounded-xl border-3 border-transparent hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 shadow-[4px_4px_0px_#4F46E5] flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
