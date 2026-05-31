"use client";

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useKMasteryStore } from '@/store/useKMasteryStore';

export interface ProgressModule {
  module_id: string;
  title: string;
  status: "locked" | "active" | "completed";
  progress_percent: number;
}

export interface ProgressResponse {
  modules: ProgressModule[];
  level_complete: boolean;
}

export function useTopikProgress(levelNum: number) {
  const { token } = useAuthStore();
  const { updateXP } = useKMasteryStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/progress/topik/${levelNum}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error("Failed to fetch roadmap progress");
      
      const data = await res.json();
      setProgressData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [levelNum, token]);

  const completeModule = async (moduleId: string, xpAwarded: number = 0) => {
    if (!token) return null;

    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/progress/complete-module`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topik_level: levelNum,
          module_id: moduleId
        })
      });

      if (!res.ok) throw new Error("Failed to complete module");

      const responseData = await res.json();

      if (xpAwarded > 0) {
        await updateXP(xpAwarded);
      }

      await fetchProgress();
      return responseData; // e.g. { level_complete: boolean }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    isLoading,
    error,
    progressData,
    fetchProgress,
    completeModule
  };
}
