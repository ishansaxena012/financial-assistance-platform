import axios from 'axios';
import type { SessionOut, SessionWithMessages, ChatResponse, Language, Persona } from '../types';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
    : '/api' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for Auth Resilience
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and state on unauthorized
      localStorage.removeItem('auth_token');
      // Forcing a reload to the login screen is the cleanest way to clear state
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const loginWithGoogle = async (credential: string) => {
  const { data } = await api.post('/auth/google', { credential });
  return data; // returns { token, user }
};

export const createSession = async (language: Language, persona: Persona): Promise<SessionOut> => {
  const { data } = await api.post<SessionOut>('/sessions/', { language, persona });
  return data;
};

export const getSession = async (sessionId: string): Promise<SessionWithMessages> => {
  const { data } = await api.get<SessionWithMessages>(`/sessions/${sessionId}`);
  return data;
};

export const listSessions = async (): Promise<SessionOut[]> => {
  const { data } = await api.get<SessionOut[]>('/sessions/');
  return data;
};

export const sendMessage = async (sessionId: string, content: string): Promise<ChatResponse> => {
  const { data } = await api.post<ChatResponse>(`/chat/${sessionId}`, { content });
  return data;
};

export interface VoiceProcessResponse {
  transcription: string;
  spokenText: string;
  bullets: string[];
  audio: string;
}

export const processVoice = async (sessionId: string, language: Language, persona: Persona, audioBlob: Blob): Promise<VoiceProcessResponse> => {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('language', language);
  formData.append('persona', persona);
  // 'audio' matches the backend upload.single('audio')
  formData.append('audio', audioBlob, 'voice-recording.webm');

  const { data } = await api.post<VoiceProcessResponse>('/voice/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
