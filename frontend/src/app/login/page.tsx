"use client";

import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const router = useRouter();
  const { setToken, fetchProfile } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login Request
        const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Login failed");
        
        setToken(data.access_token);
        await fetchProfile();
        sessionStorage.setItem('just_logged_in', 'true');
        router.push('/dashboard');
        
      } else {
        // Register Request
        const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nickname, full_name: fullName })
        });

        let data;
        try {
          data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          throw new Error("Server returned an invalid response. Please try again later.");
        }

        if (!response.ok) {
          if (Array.isArray(data.detail)) {
            // Handle Pydantic Validation Error array
            throw new Error(data.detail[0].msg || "Validation error");
          }
          throw new Error(data.detail || "Registration failed");
        }
        
        setToken(data.access_token);
        await fetchProfile();
        sessionStorage.setItem('just_logged_in', 'true');
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setErrorMsg("");
    
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    
    if (provider === 'google') {
      const redirectUri = encodeURIComponent(`${appUrl}/login/callback/google`);
      const scope = encodeURIComponent('openid email profile');
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('oauth_state', state);
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    } else {
      const redirectUri = encodeURIComponent(`${appUrl}/login/callback/github`);
      const scope = encodeURIComponent('read:user user:email');
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('oauth_state', state);
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg("");
  };

  return (
    <div className="min-h-[100dvh] bg-transparent flex items-center justify-center p-4 md:p-6 text-white py-8 md:py-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl glass-card rounded-3xl flex flex-col md:flex-row overflow-hidden border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        {/* Left Panel - Branding */}
        <div className="w-full md:w-1/2 bg-[rgba(195,192,255,0.1)] p-8 md:p-12 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.1)] relative overflow-hidden backdrop-blur-md">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 glass-card bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]">
              <span className="text-3xl font-black text-[var(--color-primary-container)] drop-shadow-sm font-sans">K</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 font-sans drop-shadow-md">
              Welcome to <br />
              K-Mastery <span className="text-[var(--color-primary-container)]">AI</span>
            </h1>
            <p className="font-bold text-lg text-white/80 max-w-sm">
              The world's most advanced autonomous Korean learning OS.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 bg-[rgba(255,255,255,0.05)] p-6 rounded-2xl border border-[rgba(255,255,255,0.2)] backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <Sparkles className="text-[var(--color-primary-container)] mb-2 drop-shadow-md" size={24} />
            <p className="font-bold text-sm italic text-white/90">
              "Master TOPIK Level 6 with zero-latency Edge AI and adaptive gamification."
            </p>
          </div>

          <div className="absolute top-20 -right-20 w-64 h-64 bg-[var(--color-primary-container)] rounded-full blur-[100px] opacity-20" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-[#F97316] rounded-full blur-[100px] opacity-10" />
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-[rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold mb-2 font-sans drop-shadow-md">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-[var(--color-on-surface-variant)] font-bold">
              {isLogin ? 'Welcome back! Enter your details.' : 'Join the revolution today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {!isLogin && (
                <>
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden mb-6"
                  >
                    <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                      <input 
                        required={!isLogin}
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full neumorphic-input rounded-xl py-4 pl-12 pr-4 font-bold text-white placeholder-[rgba(255,255,255,0.4)]"
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden mb-6"
                  >
                    <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Nickname</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                      <input 
                        required={!isLogin}
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="e.g. BusanKing99"
                        className="w-full neumorphic-input rounded-xl py-4 pl-12 pr-4 font-bold text-white placeholder-[rgba(255,255,255,0.4)]"
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full neumorphic-input rounded-xl py-4 pl-12 pr-4 font-bold text-white placeholder-[rgba(255,255,255,0.4)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full neumorphic-input rounded-xl py-4 pl-12 pr-4 font-bold text-white placeholder-[rgba(255,255,255,0.4)]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[#EF4444] p-4 rounded-xl font-bold flex items-center gap-2 backdrop-blur-md">
                <AlertCircle size={20} /> {errorMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full glass-btn text-white py-4 rounded-xl font-extrabold uppercase tracking-widest flex justify-center items-center gap-2 hover:-translate-y-1 transition-transform disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Social Sign-In Divider & Buttons */}
          <div className="mt-6 space-y-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[rgba(255,255,255,0.2)]"></div>
              <span className="flex-shrink mx-4 text-xs font-extrabold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Or Continue With</span>
              <div className="flex-grow border-t border-[rgba(255,255,255,0.2)]"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="glass-btn-secondary text-white py-3 rounded-xl font-extrabold uppercase tracking-wider flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-transform disabled:opacity-50 cursor-pointer text-[13px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="glass-btn-secondary text-white py-3 rounded-xl font-extrabold uppercase tracking-wider flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-transform disabled:opacity-50 cursor-pointer text-[13px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="font-bold text-[var(--color-on-surface-variant)]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={toggleMode}
              className="mt-2 text-[var(--color-primary-container)] font-extrabold uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'Sign Up Now' : 'Sign In'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
