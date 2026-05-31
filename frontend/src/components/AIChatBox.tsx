"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Wifi, WifiOff, Loader2, Mic, Square } from 'lucide-react';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { WS_ENDPOINTS, API_ENDPOINTS } from '@/lib/apiConfig';

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  rule_category: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  corrections?: Correction[];
}

/**
 * AIChatBox: Real-time Korean AI assistant via WebSocket.
 * Falls back gracefully when WebSocket is unavailable.
 * Uses useKMasteryStore — no useAIStore dependency.
 */
export default function AIChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'ready' | 'offline'>('connecting');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { addNotification, level } = useKMasteryStore();

  const appendMessage = (role: 'user' | 'ai', content: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(36).slice(2), role, content }]);
  };

  const connect = useCallback(() => {
    try {
      const token = useAuthStore.getState().token;
      const url = token ? `${WS_ENDPOINTS.TUTOR_CHAT}?token=${token}` : WS_ENDPOINTS.TUTOR_CHAT;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setWsStatus('ready');
      ws.onerror = () => setWsStatus('offline');
      ws.onclose = () => setWsStatus('offline');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'stream') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'ai') {
              return [...prev.slice(0, -1), { ...last, content: last.content + data.chunk }];
            }
            return [...prev, { id: Math.random().toString(36).slice(2), role: 'ai', content: data.chunk }];
          });
        } else if (data.type === 'corrections') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'ai') {
              return [...prev.slice(0, -1), { ...last, corrections: data.data }];
            }
            return prev;
          });
        } else if (data.type === 'done') {
          setIsStreaming(false);
        }
      };
    } catch {
      setWsStatus('offline');
    }
  }, []);

  useEffect(() => {
    connect();
    
    // Fetch session history
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_ENDPOINTS.BASE_URL + '/tutor/session', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.session_id) setSessionId(data.session_id);
        if (data.history && Array.isArray(data.history)) {
          setMessages(data.history.map((m: any) => ({
            id: Math.random().toString(36).slice(2),
            role: m.role === 'assistant' ? 'ai' : m.role,
            content: m.content,
            corrections: m.corrections
          })));
        }
      })
      .catch(console.error);
    }

    return () => wsRef.current?.close();
  }, [connect]);

  // Auto scroll to bottom on new message
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        
        // Stop tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setIsRecording(false);
        setIsTranscribing(true);
        
        // Send to Whisper
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice.webm');
          
          const res = await fetch(API_ENDPOINTS.SPEECH_TO_TEXT, {
            method: 'POST',
            body: formData
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              handleSendText(data.text);
            }
          }
        } catch (err) {
          console.error("Transcription failed", err);
          addNotification({ type: 'info', message: 'Voice transcription failed.' });
        } finally {
          setIsTranscribing(false);
        }
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSendText = (text: string) => {
    appendMessage('user', text);

    if (wsStatus === 'ready' && wsRef.current) {
      setIsStreaming(true);
      const newHistory = [...messages, { id: 'temp', role: 'user' as const, content: text }].map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }));
      wsRef.current.send(JSON.stringify({ type: 'chat', history: newHistory, level, session_id: sessionId }));
    } else {
      setIsStreaming(true);
      setTimeout(() => {
        appendMessage('ai', `(Offline mode) You wrote: "${text}" — Connect the backend for live AI feedback!`);
        setIsStreaming(false);
      }, 800);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    handleSendText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] flex flex-col h-full min-h-[400px] overflow-hidden"
      style={{ boxShadow: '6px 6px 0px #1E1B4B' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-4 border-[#1E1B4B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border-3 border-[#1E1B4B]"
            style={{ background: '#818CF8', border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}>
            <Sparkles className="text-white" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[#1E1B4B] text-lg leading-tight" style={{ fontFamily: 'Fredoka, cursive' }}>
              AI Korean Tutor
            </span>
            <span className="text-[10px] font-bold text-[#818CF8] uppercase tracking-wider">🎯 TOPIK Level {level} Active</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => {
              if (confirm('Clear chat history?')) {
                fetch(API_ENDPOINTS.BASE_URL + '/tutor/session', {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(() => setMessages([]));
              }
            }}
            className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors border-2 border-transparent hover:border-red-200"
          >
            Clear Chat
          </button>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 ${
            wsStatus === 'ready' ? 'border-green-400 bg-green-50' : 'border-[#F97316] bg-orange-50'
          }`}>
            {wsStatus === 'ready' ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-[#F97316]" />}
          <span className="text-[10px] font-black uppercase tracking-wider" style={{
            color: wsStatus === 'ready' ? '#16A34A' : '#F97316'
          }}>{wsStatus === 'ready' ? 'Connected' : 'Reconnecting...'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: '#EEF2FF' }}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#1E1B4B]/40">
            <p className="text-sm font-semibold italic text-center">
              Ask me anything in Korean! <br/>
              <span className="text-[#818CF8]">예: "이 문장이 맞나요?"</span>
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex flex-col gap-2`}>
                <div
                  className={`px-4 py-3 rounded-2xl border-3 border-[#1E1B4B] font-semibold text-sm`}
                  style={{
                    background: msg.role === 'user' ? '#4F46E5' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1E1B4B',
                    border: '3px solid #1E1B4B',
                    boxShadow: '3px 3px 0px #1E1B4B',
                  }}
                >
                  {msg.content}
                </div>
                {msg.corrections && msg.corrections.length > 0 && (
                  <div className="bg-[#FEF3C7] rounded-xl border-3 border-[#1E1B4B] p-3 text-xs flex flex-col gap-2" style={{ boxShadow: '3px 3px 0px #1E1B4B' }}>
                    <div className="font-black text-[#B45309] uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Sparkles size={12} /> Corrections
                    </div>
                    {msg.corrections.map((corr, idx) => (
                      <div key={idx} className="bg-white rounded-lg border-2 border-[#1E1B4B] p-2 flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                          <span className="line-through text-red-500 font-bold opacity-70">{corr.original}</span>
                          <span className="text-[#1E1B4B] font-black">→</span>
                          <span className="text-green-600 font-bold">{corr.corrected}</span>
                        </div>
                        <p className="text-[#1E1B4B]/80 font-medium italic mt-1">{corr.explanation}</p>
                        <span className="self-start px-2 py-0.5 bg-[#E0E7FF] text-[#4F46E5] rounded font-bold text-[10px] mt-1 border border-[#1E1B4B]">
                          {corr.rule_category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isStreaming && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl border-3 border-[#1E1B4B] bg-white"
              style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}>
              <Loader2 size={16} className="text-[#818CF8] animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-4 border-[#1E1B4B] flex gap-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="한국어로 입력하세요..."
          className="flex-1 rounded-xl px-4 py-3 font-semibold text-[#1E1B4B] focus:outline-none border-3 border-[#1E1B4B] text-sm"
          style={{ background: '#EEF2FF', border: '3px solid #1E1B4B' }}
        />
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isStreaming || isTranscribing}
          className={`w-12 h-12 rounded-xl flex items-center justify-center border-3 border-[#1E1B4B] disabled:opacity-50 transition-transform ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-100 hover:-translate-y-0.5'}`}
          style={{ border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
        >
          {isRecording ? <Square size={18} className="text-white fill-current" /> : <Mic size={18} className="text-[#1E1B4B]" />}
        </button>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming || isTranscribing}
          className="w-12 h-12 rounded-xl flex items-center justify-center border-3 border-[#1E1B4B] disabled:opacity-50 cursor-pointer transition-transform hover:-translate-y-0.5"
          style={{ background: '#F97316', border: '3px solid #1E1B4B', boxShadow: '3px 3px 0px #1E1B4B' }}
        >
          {isTranscribing ? <Loader2 size={18} className="text-white animate-spin" /> : <Send size={18} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
