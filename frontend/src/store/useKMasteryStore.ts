import { create } from 'zustand';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import type { TopikLevel, TopikModule, ModuleStatus, MockSession, RoadmapProgressResponse } from '@/lib/roadmapTypes';

export interface Notification {
  id: string;
  type: 'xp' | 'streak' | 'info' | 'success';
  message: string;
  value?: string | number;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  romanization: string; // Added for English spelling of Korean words
  example?: {
    korean: string;
    english: string;
  };
  level: string;
  interval: number; // SRS interval
}

interface KMasteryState {
  // Gamification State
  xp: number;
  level: number;
  streak: number;
  coins: number;
  
  // AI Feedback & Streaming
  aiFeedback: Record<string, unknown> | null;
  streamingText: string;
  isAiLoading: boolean;

  // Notification Queue
  notifications: Notification[];

  // 3D Scene State
  cameraTarget3D: [number, number, number];
  cameraPosition3D: [number, number, number];
  isScannerActive: boolean;

  // Flashcard State
  flashcardDeck: FlashCard[];
  currentCardIndex: number;

  // ── Roadmap State ──────────────────────────────────────────
  roadmapLevels: TopikLevel[];
  moduleStatuses: Record<string, ModuleStatus>;
  activeTopikLevel: 1 | 2 | 3 | 4 | 5 | 6;
  activeTopikModule: TopikModule | null;
  flashcardQueue: string[];
  currentMockExam: MockSession | null;
  roadmapLoading: boolean;

  // Actions
  updateXP: (amount: number) => Promise<void>;
  setStats: (stats: { xp: number, streak: number, coins: number, level?: number }) => void;
  setLevel: (level: number) => void;
  setCamera3D: (position: [number, number, number], target: [number, number, number]) => void;
  setScannerActive: (active: boolean) => void;
  setAiFeedback: (feedback: Record<string, unknown>) => void;
  appendStreamingText: (chunk: string) => void;
  clearStreamingText: () => void;
  setAiLoading: (loading: boolean) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  // Flashcard Actions
  advanceCard: () => void;
  rateCard: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
  loadFlashcards: (cards: FlashCard[]) => void;
  // Roadmap Actions
  setActiveTopikLevel: (n: 1 | 2 | 3 | 4 | 5 | 6) => void;
  setActiveTopikModule: (m: TopikModule | null) => void;
  updateModuleStatus: (id: string, status: ModuleStatus) => void;
  fetchRoadmap: () => Promise<void>;
  fetchRoadmapProgress: () => Promise<void>;
}

/**
 * Principal Architect: Global Store with Notification Queue.
 */
export const useKMasteryStore = create<KMasteryState>((set) => ({
  xp: 2450,
  level: 1,
  streak: 12,
  coins: 50,
  aiFeedback: null,
  streamingText: "",
  isAiLoading: false,
  notifications: [],
  cameraTarget3D: [0, 0, 0],
  cameraPosition3D: [0, 5, 10],
  isScannerActive: false,
  flashcardDeck: [],
  currentCardIndex: 0,

  // Roadmap initial state
  roadmapLevels: [],
  moduleStatuses: {},
  activeTopikLevel: 1,
  activeTopikModule: null,
  flashcardQueue: [],
  currentMockExam: null,
  roadmapLoading: false,

  updateXP: async (amount) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USER_STATS.replace('/stats', '/xp')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, user_id: 1 })
      });
      
      if (!response.ok) {
        throw new Error(`Backend sync failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      set((state) => {
        // Trigger generic XP notification
        const id = Math.random().toString(36).substring(7);
        const xpNotification: Notification = { 
          id, 
          type: 'xp', 
          message: 'XP Gained', 
          value: `+${amount}` 
        };

        // LevelUpModal will automatically trigger via useEffect when state.level changes
        return { 
          xp: data.xp, 
          level: data.level,
          notifications: [...state.notifications, xpNotification]
        };
      });
    } catch (e) {
      // Fallback local state if backend is down
      set((state) => {
        const newXP = state.xp + amount;
        const newLevel = Math.floor(newXP / 5000) + 1;
        const id = Math.random().toString(36).substring(7);
        const xpNotification: Notification = { id, type: 'xp', message: 'XP Gained', value: `+${amount}` };
        return { xp: newXP, level: newLevel, notifications: [...state.notifications, xpNotification] };
      });
    }
  },

  setStats: (stats) => set({ xp: stats.xp, streak: stats.streak, coins: stats.coins, ...(stats.level !== undefined ? { level: stats.level } : {}) }),

  setLevel: (level) => set({ level }),

  setCamera3D: (position, target) => set({ cameraPosition3D: position, cameraTarget3D: target }),
  
  setScannerActive: (active) => set({ isScannerActive: active }),

  setAiFeedback: (feedback) => set({ aiFeedback: feedback, isAiLoading: false }),
  
  appendStreamingText: (chunk) => set((state) => ({ streamingText: state.streamingText + chunk })),

  clearStreamingText: () => set({ streamingText: "" }),
  
  setAiLoading: (loading) => set({ isAiLoading: loading }),

  addNotification: (n) => set((state) => ({
    notifications: [...state.notifications, { ...n, id: Math.random().toString(36).substring(7) }]
  })),

  removeNotification: (id: string) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  advanceCard: () => set((state) => ({
    currentCardIndex: Math.min(state.currentCardIndex + 1, state.flashcardDeck.length - 1)
  })),

  rateCard: (rating) => {
    // In a real app, this would ping the backend to update SRS intervals.
    // We update local state, add XP, and advance.
    let xpGain = 0;
    if (rating === 'good') xpGain = 10;
    if (rating === 'easy') xpGain = 20;

    if (xpGain > 0) {
      useKMasteryStore.getState().updateXP(xpGain);
    }
    useKMasteryStore.getState().advanceCard();
  },

  loadFlashcards: (cards) => set({ flashcardDeck: cards, currentCardIndex: 0 }),

  // ── Roadmap Actions ───────────────────────────────────────
  setActiveTopikLevel: (n) => set({ activeTopikLevel: n }),

  setActiveTopikModule: (m) => set({ activeTopikModule: m }),

  updateModuleStatus: (id, status) => set((state) => ({
    moduleStatuses: { ...state.moduleStatuses, [id]: status },
  })),

  fetchRoadmap: async () => {
    set({ roadmapLoading: true });
    try {
      const res = await fetch(API_ENDPOINTS.ROADMAP);
      if (!res.ok) throw new Error('Roadmap fetch failed');
      const data = await res.json() as { levels: TopikLevel[] };
      set({ roadmapLevels: data.levels });
    } catch (e) {
      console.error('fetchRoadmap error:', e);
    } finally {
      set({ roadmapLoading: false });
    }
  },

  fetchRoadmapProgress: async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.ROADMAP}/progress/1`);
      if (!res.ok) return;
      const data = await res.json() as RoadmapProgressResponse;
      set({ moduleStatuses: data.moduleStatuses });
    } catch (e) {
      console.error('fetchRoadmapProgress error:', e);
    }
  },
}));
