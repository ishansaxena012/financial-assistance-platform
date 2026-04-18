import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Language, Persona, SessionOut, DisplayMessage } from '../types';

interface AppState {
  // Onboarding
  language: Language;
  persona: Persona;
  step: 'login' | 'home' | 'language' | 'persona' | 'chat' | 'voice' | 'fd-calc';

  // Session
  session: SessionOut | null;
  messages: DisplayMessage[];
  isLoading: boolean;

  // Voice
  isVoiceMode: boolean;
  voiceState: 'idle' | 'recording' | 'processing' | 'playing' | 'error' | 'no-speech' | 'permission-denied';

  // Auth
  authToken: string | null;
  user: any | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setPersona: (persona: Persona) => void;
  setStep: (step: AppState['step']) => void;
  setSession: (session: SessionOut) => void;
  setMessages: (msgs: DisplayMessage[]) => void;
  addMessage: (msg: DisplayMessage) => void;
  updateLastMessage: (msg: Partial<DisplayMessage>) => void;
  setLoading: (v: boolean) => void;
  setVoiceState: (state: AppState['voiceState']) => void;
  resetChat: () => void;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      persona: 'maa',
      step: 'login', // Will be overridden by hydration if logged in
      session: null,
      messages: [],
      isLoading: false,
      authToken: null,
      user: null,

      // Voice specifically
      isVoiceMode: false,
      voiceState: 'idle',

      setLanguage: (language) => set({ language }),
      setPersona: (persona) => set({ persona }),
      setStep: (step) => set({ step }),
      setSession: (session) => set({ session }),
      setMessages: (msgs) => set({ messages: msgs }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateLastMessage: (partial) =>
        set((s) => {
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...partial };
          return { messages: msgs };
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setVoiceState: (state) => set({ voiceState: state }),
      resetChat: () => set({ session: null, messages: [], step: 'home', isVoiceMode: false, voiceState: 'idle' }),
      setAuth: (token, user) => {
        localStorage.setItem('auth_token', token);
        set({ authToken: token, user, step: 'home' });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ authToken: null, user: null, step: 'login', session: null, messages: [], isVoiceMode: false, voiceState: 'idle' });
      }
    }),
    {
      name: 'lakshmi-didi-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        authToken: state.authToken,
        user: state.user,
        language: state.language,
        persona: state.persona,
        step: state.step,
        session: state.session,
        messages: state.messages,
      }),
    }
  )
);
