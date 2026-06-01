import { useState, useRef, useCallback, useEffect } from 'react';
import { DrillWord, DRILL_WORDS } from '@/data/drillWords';

export type DrillPhase =
  | 'setup'
  | 'ready'
  | 'recording'
  | 'processing'
  | 'correct'
  | 'wrong'
  | 'skipped'
  | 'advancing'
  | 'complete';

export interface WordResult {
  word: DrillWord;
  heard: string;
  correct: boolean;
  attemptsUsed: number;
  xpEarned: number;
}

export interface DrillState {
  phase: DrillPhase;
  words: DrillWord[];
  currentIndex: number;
  attempts: number;
  heardText: string;
  results: WordResult[];
  sessionXP: number;
  isLoadingWords: boolean;
  error: string | null;
}

// Levenshtein-based similarity for Korean strings (character level)
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }
  return matrix[b.length][a.length];
}

function koreanSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshtein(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function isCorrectPronunciation(
  heardTranscript: string,
  target: DrillWord
): { correct: boolean; bestMatch: string } {
  const normalize = (s: string): string =>
    s.trim()
      .normalize('NFC')
      .replace(/[^\uAC00-\uD7A3\u3131-\u318E]/g, '') // Keep only Hangul chars (removes spaces/punctuation from Whisper)
      .toLowerCase();

  const normalizedTarget = normalize(target.korean);
  const normalizedVariants = target.sttVariants.map(normalize);
  const normalizedHeard = normalize(heardTranscript);

  if (!normalizedHeard) {
    return { correct: false, bestMatch: '' };
  }

  // Exact match
  if (normalizedHeard === normalizedTarget) {
    return { correct: true, bestMatch: heardTranscript };
  }

  // Variant match
  if (normalizedVariants.includes(normalizedHeard)) {
    return { correct: true, bestMatch: heardTranscript };
  }

  // Partial match for long words (≥4 syllables): allow if 85% of chars match
  if (target.syllableCount >= 4) {
    const similarity = koreanSimilarity(normalizedHeard, normalizedTarget);
    if (similarity >= 0.85) {
      return { correct: true, bestMatch: heardTranscript };
    }
  }

  return { correct: false, bestMatch: heardTranscript };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function usePronunciationDrill(userId?: string) {
  const [state, setState] = useState<DrillState>({
    phase: 'setup',
    words: [],
    currentIndex: 0,
    attempts: 0,
    heardText: '',
    results: [],
    sessionXP: 0,
    isLoadingWords: false,
    error: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(async (difficulty: 1 | 2 | 3 | 'all', customWords?: DrillWord[]) => {
    setState(prev => ({ ...prev, isLoadingWords: true, error: null }));
    
    let selectedWords: DrillWord[] = [];
    
    if (customWords) {
      selectedWords = [...customWords];
    } else {
      let baseWords = DRILL_WORDS;
      if (difficulty !== 'all') {
        const diffNum = typeof difficulty === 'string' ? parseInt(difficulty) : difficulty;
        baseWords = DRILL_WORDS.filter(w => w.difficulty <= diffNum);
      }
      
      // Shuffle Fisher-Yates
      for (let i = baseWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baseWords[i], baseWords[j]] = [baseWords[j], baseWords[i]];
      }
      
      selectedWords = baseWords.slice(0, 15);
    }

    setState(prev => ({
      ...prev,
      phase: 'ready',
      words: selectedWords,
      currentIndex: 0,
      attempts: 0,
      heardText: '',
      results: [],
      sessionXP: 0,
      isLoadingWords: false
    }));
  }, []);



  const handleSTTResult = useCallback((transcript: string) => {
    setState(prev => {
      const currentWord = prev.words[prev.currentIndex];
      if (!currentWord) return prev;

      if (!transcript.trim()) {
        return { ...prev, phase: 'ready', error: '소리가 들리지 않아요 — Couldn\'t hear you, try again' };
      }

      const { correct, bestMatch } = isCorrectPronunciation(transcript, currentWord);
      const newAttempts = prev.attempts + 1;

      if (correct) {
        const xp = currentWord.difficulty === 1 ? 5 : currentWord.difficulty === 2 ? 10 : 20;
        return {
          ...prev,
          phase: 'correct',
          heardText: bestMatch,
          attempts: newAttempts,
          sessionXP: prev.sessionXP + xp,
          results: [...prev.results, { word: currentWord, heard: bestMatch, correct: true, attemptsUsed: newAttempts, xpEarned: xp }]
        };
      } else if (newAttempts >= 3) {
        return {
          ...prev,
          phase: 'skipped',
          heardText: bestMatch,
          attempts: newAttempts,
          results: [...prev.results, { word: currentWord, heard: bestMatch, correct: false, attemptsUsed: newAttempts, xpEarned: 0 }]
        };
      } else {
        return {
          ...prev,
          phase: 'wrong',
          heardText: bestMatch,
          attempts: newAttempts
        };
      }
    });
  }, []);

  const handleMicTap = useCallback(async () => {
    if (state.phase !== 'ready' && state.phase !== 'wrong') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setState(prev => ({ ...prev, phase: 'processing' }));
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await fetch('/api/proxy/v1/ai/speech-to-text', { method: 'POST', body: formData });
          if (!res.ok) throw new Error('Transcription failed');
          const data = await res.json();
          handleSTTResult(data.text || '');
        } catch (err) {
          console.error(err);
          setState(prev => ({ ...prev, phase: 'ready', error: '네트워크 오류 — Speech service unavailable' }));
          setTimeout(() => setState(p => ({ ...p, error: null })), 3000);
        }
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, phase: 'recording', error: null }));

      // 6 second timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 6000);

    } catch (err) {
      console.error('Mic error:', err);
      setState(prev => ({ ...prev, error: '🚫 마이크 접근이 거부되었습니다 — Please allow microphone' }));
      setTimeout(() => setState(p => ({ ...p, error: null })), 3000);
    }
  }, [state.phase, handleSTTResult]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      mediaRecorderRef.current.stop();
    }
  }, []);


  // Handle phase transitions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.phase === 'correct') {
      timer = setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'advancing' }));
      }, 900);
    } else if (state.phase === 'wrong') {
      timer = setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'ready' }));
      }, 600); // Does NOT advance, returns to ready
    } else if (state.phase === 'skipped') {
      timer = setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'advancing' }));
      }, 1200);
    } else if (state.phase === 'advancing') {
      timer = setTimeout(() => {
        setState(prev => {
          if (prev.currentIndex + 1 >= prev.words.length) {
            return { ...prev, phase: 'complete' };
          }
          return {
            ...prev,
            phase: 'ready',
            currentIndex: prev.currentIndex + 1,
            attempts: 0,
            heardText: ''
          };
        });
      }, 500); // 500ms slide animation duration
    }
    return () => clearTimeout(timer);
  }, [state.phase]);

  const restartSession = useCallback(() => {
    startSession('all'); // Basic restart
  }, [startSession]);

  const drillWeakWords = useCallback(() => {
    const weakWords = state.results.filter(r => !r.correct).map(r => r.word);
    if (weakWords.length > 0) {
      startSession('all', weakWords);
    }
  }, [state.results, startSession]);

  return {
    state,
    startSession,
    handleMicTap,
    stopRecording,
    restartSession,
    drillWeakWords,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}
