export type Role = 'user' | 'assistant';
export type Language = 'en' | 'hi';
export type Persona = 'maa' | 'banker' | 'dost';

export interface Message {
    id?: string;
    session_id: string;
    role: Role;
    content: string;
    created_at: Date;
}

export interface Session {
    id: string;
    user_id: string;
    language: Language;
    persona: Persona;
    created_at: Date;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    picture?: string;
}
