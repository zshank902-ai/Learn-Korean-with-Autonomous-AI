import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useKMasteryStore } from './useKMasteryStore';

interface UserProfile {
  id: string;
  email: string;
  nickname: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  onboarding_done: boolean;
  oauth_provider?: string | null;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  setToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (signal?: AbortSignal) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      
      logout: () => {
        set({ token: null, isAuthenticated: false, user: null, error: null });
        useKMasteryStore.getState().reset();
      },

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      fetchProfile: async (signal?: AbortSignal) => {
        const { token } = get();
        if (!token) return;

        try {
          // You'll need to define AUTH_ME in your apiConfig: e.g. `${BASE_URL}/v1/auth/me`
          const response = await fetch(API_ENDPOINTS.AUTH_ME, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal,
          });

          if (!response.ok) {
            if (response.status === 401) {
              get().logout();
              throw new Error("Session expired");
            }
            throw new Error("Failed to fetch profile");
          }

          const userData = await response.json();
          set({ user: userData, isAuthenticated: true, error: null });
        } catch (error: any) {
          set({ error: error.message || "An unknown error occurred" });
          throw error; // Re-throw to allow ProtectedRoute to handle it
        }
      }
    }),
    {
      name: 'k-mastery-auth-storage', // unique name
      partialize: (state) => ({ token: state.token }), // only persist the token
    }
  )
);
