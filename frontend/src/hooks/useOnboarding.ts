import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';

interface OnboardingResult {
  difficulty: string;
  reasoning: string;
}

export function useOnboarding() {
  const { user, token, fetchProfile } = useAuthStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check onboarding status on mount
  useEffect(() => {
    let alive = true;
    const checkStatus = async () => {
      if (!user || !token) {
        if (alive) setIsChecking(false);
        return;
      }
      
      try {
        const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/onboarding/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to check status");
        const data = await res.json();
        
        if (alive) {
          if (data.onboarding_done === false) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }
      } catch (err) {
        console.error("Status check failed:", err);
      } finally {
        if (alive) setIsChecking(false);
      }
    };
    
    checkStatus();
    
    return () => { alive = false; };
  }, [user, token]);

  const submitAnswers = async (answers: Record<string, string | boolean>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/onboarding/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quiz_answers: answers })
      });
      
      if (!res.ok) throw new Error("Failed to analyze answers");
      
      const data = await res.json();
      setResult(data);
      
      // Update global user object silently
      await fetchProfile();
      
    } catch (err: unknown) {
      console.error(err);
      setError("We encountered a small glitch reaching the AI. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAndComplete = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    isChecking,
    isSubmitting,
    result,
    error,
    submitAnswers,
    closeAndComplete
  };
}
