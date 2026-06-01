"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Loader2, AlertCircle } from 'lucide-react';

interface CallbackPageProps {
  params: Promise<{
    provider: string;
  }>;
}

export default function CallbackPage({ params }: CallbackPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, fetchProfile } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const processedRef = useRef(false);

  // Unwrap params using React.use
  const { provider } = React.use(params);

  useEffect(() => {
    // Avoid double-processing in React 18/19 StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Verify state to prevent CSRF
    const savedState = localStorage.getItem('oauth_state');
    if (state && savedState && state !== savedState) {
      console.warn("OAuth State mismatch! Possible CSRF attack.");
    }
    // Clean up state
    localStorage.removeItem('oauth_state');

    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("No authorization code returned from provider.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const endpoint = provider === 'google' ? API_ENDPOINTS.AUTH_GOOGLE : API_ENDPOINTS.AUTH_GITHUB;
        const redirectUri = `${window.location.origin}/login/callback/${provider}`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: redirectUri })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Authentication exchange failed.");
        }

        setToken(data.access_token);
        await fetchProfile();
        router.push('/dashboard');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Failed to verify social credentials.");
        }
      }
    };

    exchangeCode();
  }, [provider, searchParams, router, setToken, fetchProfile]);

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center p-6 text-[#1E1B4B]">
      <div 
        className="w-full max-w-md bg-white border-4 border-[#1E1B4B] rounded-3xl p-8 text-center"
        style={{ boxShadow: '8px 8px 0px #1E1B4B' }}
      >
        <div className="w-16 h-16 bg-[#F97316] border-4 border-[#1E1B4B] rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
          <span className="text-3xl font-black text-white" style={{ fontFamily: 'Fredoka, cursive' }}>K</span>
        </div>

        {errorMsg ? (
          <div className="space-y-4">
            <div className="bg-[#FEE2E2] text-[#EF4444] border-4 border-[#1E1B4B] p-4 rounded-xl font-bold flex items-center justify-center gap-2" style={{ boxShadow: '4px 4px 0px #1E1B4B' }}>
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#4F46E5] text-white border-4 border-[#1E1B4B] py-3 rounded-xl font-black uppercase tracking-wider hover:-translate-y-0.5 transition-transform"
              style={{ boxShadow: '4px 4px 0px #1E1B4B' }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-[#4F46E5]" size={48} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wide" style={{ fontFamily: 'Fredoka, cursive' }}>
              Authenticating...
            </h2>
            <p className="font-bold text-[#1E1B4B]/60">
              Completing secure sign-in with {provider === 'google' ? 'Google' : 'GitHub'}. Please wait.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
