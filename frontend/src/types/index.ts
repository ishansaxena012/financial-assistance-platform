export type Language = 'en' | 'hi';
export type Persona = 'maa' | 'banker' | 'dost';
export type Role = 'user' | 'assistant';

export interface SessionOut {
  id: string;
  language: Language;
  persona: Persona;
  created_at: string;
}

export interface MessageOut {
  id: string | number;
  session_id: string;
  role: Role;
  content: string;
  created_at: string;
}

export interface ChatResponse {
  message: MessageOut;
  key_points: string[];
}

export interface SessionWithMessages {
  session: SessionOut;
  messages: MessageOut[];
}

export interface DisplayMessage extends MessageOut {
  key_points?: string[];
  isTyping?: boolean;
}

export interface PersonaConfig {
  id: Persona;
  nameEn: string;
  nameHi: string;
  taglineEn: string;
  taglineHi: string;
  emoji: string;
  color: string;
  bgColor: string;
}
