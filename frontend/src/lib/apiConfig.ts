/**
 * Principal Architect: Centralized API Configuration.
 * Handles environment-specific endpoints and fallbacks.
 */

const isBrowser = typeof window !== 'undefined';
const API_BASE_URL = isBrowser ? '/api/proxy' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api');
const WS_BASE_URL = isBrowser ? `ws://${window.location.host}/api/proxy` : (process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/api');

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH_REGISTER: `${API_BASE_URL}/v1/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/v1/auth/login`,
  AUTH_ME: `${API_BASE_URL}/v1/auth/me`,
  AUTH_GOOGLE: `${API_BASE_URL}/v1/auth/google`,
  AUTH_GITHUB: `${API_BASE_URL}/v1/auth/github`,
  FLYWHEEL_INGEST: `${API_BASE_URL}/v1/ai/data-flywheel/ingest`,
  USER_STATS: `${API_BASE_URL}/v1/user/stats`,
  TOPIK_ROADMAP: `${API_BASE_URL}/v1/topik/roadmap`,
  SPEECH_TO_TEXT: `${API_BASE_URL}/v1/ai/speech-to-text`,
  FLASHCARDS: `${API_BASE_URL}/v1/flashcards`,
  ROADMAP: `${API_BASE_URL}/roadmap`,
};

export const WS_ENDPOINTS = {
  AI_FEEDBACK: `${WS_BASE_URL}/v1/ai/ws/ai-stream`,
  TUTOR_CHAT: `${WS_BASE_URL}/v1/ai/ws/tutor-chat`,
};

const apiConfig = {
  API_ENDPOINTS,
  WS_ENDPOINTS,
};

export default apiConfig;
