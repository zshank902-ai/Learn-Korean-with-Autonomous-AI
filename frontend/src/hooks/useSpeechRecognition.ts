// src/hooks/useSpeechRecognition.ts
import { useState, useCallback, useRef } from 'react';

export function useSpeechRecognition() {
  const [isSupported] = useState(true); // MediaRecorder is widely supported
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(() => {
    (async () => {
      try {
        setTranscript('');
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsListening(false);
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Stop all tracks to turn off the microphone light
          stream.getTracks().forEach(track => track.stop());

          // Send to backend Whisper STT
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');

          try {
            const res = await fetch('/api/v1/ai/speech-to-text', {
              method: 'POST',
              body: formData,
            });
            
            if (!res.ok) throw new Error('Transcription failed');
            const data = await res.json();
            // Backend returns the exact text, we format it as 'text|' to match the legacy hook signature expectations
            setTranscript(data.text + '|');
          } catch (err) {
            console.error(err);
            setError('Failed to process speech. Please try again.');
          }
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (err) {
        console.error('Microphone error:', err);
        setError('Microphone permission denied or not found.');
        setIsListening(false);
      }
    })();
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { isSupported, isListening, transcript, error, startListening, stopListening };
}
