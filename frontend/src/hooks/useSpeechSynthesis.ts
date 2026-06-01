// src/hooks/useSpeechSynthesis.ts
import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop current

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.5; // Even slower for beginners
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Max volume

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop };
}
