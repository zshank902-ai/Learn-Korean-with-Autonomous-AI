import { create } from 'zustand';

export type HangulTab = 'jamo' | 'builder' | 'words' | 'drill' | 'quiz';

interface PronunciationHistoryItem {
  target: string;
  heard: string;
  correct: boolean;
}

interface HangulStore {
  currentTab: HangulTab;
  setTab: (tab: HangulTab) => void;
  
  selectedJamo: string | null;
  setSelectedJamo: (jamo: string | null) => void;
  
  composedSyllables: string[];
  addComposedSyllable: (s: string) => void;
  removeSyllable: (index: number) => void;
  clearSyllables: () => void;
  reorderSyllables: (from: number, to: number) => void;
  
  sessionXP: number;
  addXP: (amount: number) => void;
  
  masteredJamo: Set<string>;
  addMasteredJamo: (jamo: string) => void;
  
  quizStats: { correct: number; wrong: number; streak: number };
  recordQuizResult: (correct: boolean) => void;
  
  pronunciationHistory: PronunciationHistoryItem[];
  addPronunciationResult: (item: PronunciationHistoryItem) => void;
}

export const useHangulStore = create<HangulStore>((set) => ({
  currentTab: 'jamo',
  setTab: (tab) => set({ currentTab: tab }),
  
  selectedJamo: null,
  setSelectedJamo: (jamo) => set({ selectedJamo: jamo }),
  
  composedSyllables: [],
  addComposedSyllable: (s) => set((state) => ({ composedSyllables: [...state.composedSyllables, s] })),
  removeSyllable: (index) => set((state) => ({
    composedSyllables: state.composedSyllables.filter((_, i) => i !== index)
  })),
  clearSyllables: () => set({ composedSyllables: [] }),
  reorderSyllables: (from, to) => set((state) => {
    const arr = [...state.composedSyllables];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    return { composedSyllables: arr };
  }),
  
  sessionXP: 0,
  addXP: (amount) => set((state) => ({ sessionXP: state.sessionXP + amount })),
  
  masteredJamo: new Set(),
  addMasteredJamo: (jamo) => set((state) => {
    const newSet = new Set(state.masteredJamo);
    newSet.add(jamo);
    return { masteredJamo: newSet };
  }),
  
  quizStats: { correct: 0, wrong: 0, streak: 0 },
  recordQuizResult: (correct) => set((state) => {
    const st = state.quizStats;
    return {
      quizStats: {
        correct: st.correct + (correct ? 1 : 0),
        wrong: st.wrong + (correct ? 0 : 1),
        streak: correct ? st.streak + 1 : 0
      }
    };
  }),
  
  pronunciationHistory: [],
  addPronunciationResult: (item) => set((state) => ({
    pronunciationHistory: [item, ...state.pronunciationHistory].slice(0, 10) // Keep last 10
  }))
}));
