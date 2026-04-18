import axios from 'axios';
import { settings } from '../config';

export interface LLMMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    key_points: string[];
}

export class GeminiProvider {
    private readonly BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    async chat(messages: LLMMessage[], systemPrompt: string, temperature: number = 0.7): Promise<LLMResponse> {
        if (!settings.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const geminiContents = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const payload = {
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: geminiContents,
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        content: { type: "STRING", description: "The conversational response in character" },
                        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "3-6 brief actionable bullet points summarizing the advice" }
                    },
                    required: ["content", "key_points"]
                }
            }
        };

        const url = `${this.BASE_URL}?key=${settings.GEMINI_API_KEY}`;
        
        try {
            const response = await axios.post(url, payload, { timeout: 30000 });
            const data = response.data;

            const candidates = data.candidates || [];
            if (candidates.length === 0) {
                throw new Error("No candidates returned from Gemini");
            }

            const text = candidates[0].content.parts[0].text;
            
            try {
                const parsed = JSON.parse(text);
                return {
                    content: parsed.content || text,
                    key_points: parsed.key_points || []
                };
            } catch (jsonErr) {
                console.warn("Gemini returned malformed JSON, falling back to raw text:", text);
                return {
                    content: text,
                    key_points: []
                };
            }

        } catch (err: any) {
            console.error("Gemini API Error:", err.response?.data || err.message);
            throw new Error(`Gemini API failed: ${err.message}`);
        }
    }
}
