"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, fetchProfile } = useAuthStore();
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Zustand persist to hydrate from localStorage
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(useAuthStore.persist.hasHydrated());
    
    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration before checking auth

    let isMounted = true;
    const checkAuth = async () => {
      // If there's no token in localStorage (Zustand persist), boot them to login
      if (!token) {
        if (isMounted) setIsVerifying(false);
        router.push('/login');
        return;
      }

      if (!isAuthenticated) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort(new Error("Verification timeout"));
        }, 5000); // Strict 5 second timeout

        try {
          await fetchProfile(controller.signal);
          clearTimeout(timeoutId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (isMounted) {
            // Check if it's an abort error
            if (err.name === 'AbortError' || err.message === 'Verification timeout') {
              setErrorMsg("Network timeout while verifying session. Please check your connection.");
            } else {
              setErrorMsg(err.message || "Failed to verify session.");
            }
            setIsVerifying(false);
          }
          // Do NOT automatically redirect here if it's a timeout, let the user click retry
          return;
        }
      }
      
      if (isMounted) setIsVerifying(false);
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [hasHydrated, isAuthenticated, token, router, fetchProfile]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center font-sans">
        <div className="sahara-card bg-[var(--color-surface)] p-8 border border-[var(--color-outline-variant)] rounded-3xl flex flex-col items-center gap-4 shadow-sm">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
          <h2 className="text-2xl font-bold text-[var(--color-on-surface)] font-serif">Loading Secure Session...</h2>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center font-sans">
        <div className="sahara-card bg-[var(--color-surface)] p-8 border border-[var(--color-outline-variant)] rounded-3xl flex flex-col items-center gap-4 text-center max-w-md shadow-sm">
          <div className="text-red-500 font-bold text-xl mb-2 flex items-center gap-2">
            ⚠️ Connection Error
          </div>
          <p className="text-[var(--color-on-surface-variant)] font-semibold mb-4">{errorMsg}</p>
          <button 
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/login');
            }}
            className="sahara-btn w-full text-white py-3 rounded-xl font-bold transition-transform hover:-translate-y-1"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // If token is missing and we finished verifying (e.g., about to redirect), return null to prevent flashing children
  if (!token) return null;

  // Once verified, render the protected children
  return <>{children}</>;
}
