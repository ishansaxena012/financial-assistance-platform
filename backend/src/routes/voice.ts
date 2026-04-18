import { Router, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getDB } from '../db';
import { getRedis } from '../db/redis';
import { encrypt, decrypt } from '../lib/encryption';
import { GeminiProvider, LLMMessage } from '../providers/gemini';
import { SarvamProvider } from '../providers/sarvam';
import { Language, Persona, Role, Message } from '../types';

ffmpeg.setFfmpegPath(ffmpegPath);

const upload = multer({ dest: 'temp-audio/' });
const router = Router();

if (!fs.existsSync('temp-audio/')) {
    fs.mkdirSync('temp-audio/');
}

function buildVoicePrompt(language: Language, persona: Persona): string {
    return `
You are returning a strictly structured response for a voice assistant.
Respond in ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}.
Role: Personal Finance Advisor (${persona}).
Your response MUST be ONLY valid JSON corresponding to this schema:
{
  "spokenText": "The conversational reply to be synthesized to voice. Do not include markdown or bullet points here.",
  "bullets": ["Key point 1", "Key point 2 (no markdown)"]
}
Keep the spokenText brief, friendly, and practical (under 3 or 4 sentences).
Make sure to escape double quotes correctly inside JSON. NO markdown blocks like \`\`\`json.
`.trim();
}

async function convertAudioToWav(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('wav')
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

function buildHistory(rawHistory: any[], maxMessages: number = 30): LLMMessage[] {
    const history: LLMMessage[] = [];
    for (const msg of rawHistory) {
      const content = (msg.content || "").replace(/\s+/g, " ").trim();
      if (!content) continue;
      const role = msg.role === "user" ? "user" : (msg.role === "assistant" ? "assistant" : null);
      if (!role) continue;
      if (history.length > 0 && history[history.length - 1].role === role) {
        history[history.length - 1].content += `\n\n${content}`;
      } else {
        history.push({ role, content });
      }
    }
    return history.slice(-maxMessages);
}

router.post('/process', authenticate, upload.single('audio'), async (req: AuthRequest, res: Response) => {
    const session_id = req.body.sessionId;
    const language = (req.body.language || 'en') as Language;
    const persona = (req.body.persona || 'maa') as Persona;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ detail: "No audio file uploaded" });
    }

    if (!session_id) {
        return res.status(400).json({ detail: "Missing sessionId" });
    }

    const tempWav = path.join('temp-audio', `${file.filename}.wav`);
    const db = getDB();
    const redis = getRedis();

    try {
        // 1. Convert to WAV (Sarvam typically prefers WAV for optimal processing)
        await convertAudioToWav(file.path, tempWav);

        // 2. Call Sarvam STT
        const sarvam = new SarvamProvider();
        const transcription = await sarvam.transcribeAudio(tempWav);

        if (!transcription || transcription.trim() === '') {
            return res.status(400).json({ detail: "No speech recognized." });
        }

        // 3. Save User message to DB
        const userMsg = {
            session_id,
            role: "user" as Role,
            content: encrypt(transcription),
            created_at: new Date()
        };
        await db.collection("messages").insertOne(userMsg);

        // 4. Retrieve History for context
        let history: LLMMessage[] = [];
        const rawHistory = await db
            .collection<Message>("messages")
            .find({ session_id })
            .sort({ created_at: 1 })
            .toArray();

        const decryptedHistory = rawHistory.map(m => ({
            ...m,
            content: decrypt(m.content)
        }));
        history = buildHistory(decryptedHistory);
        
        // Add current query (redundant safeguard since we just inserted, but history rebuild works fine)

        // 5. Query Gemini
        const systemPrompt = buildVoicePrompt(language, persona);

        const geminiProvider = new GeminiProvider();
        const geminiRes = await geminiProvider.chat(history, systemPrompt, 0.2);

        const spokenText = geminiRes.content || "I couldn't process that properly.";
        const bullets = geminiRes.key_points || [];

        // 6. Speak the response via Sarvam TTS
        const audioBase64 = await sarvam.textToSpeech(spokenText, language, persona);

        // 7. Save Assistant message to Database
        // We save the combined knowledge (spoken text + bullets) as the content for history context.
        const combinedContent = `${spokenText}\n\nKey Points:\n- ${bullets.join('\n- ')}`;
        const assistantMsg = {
            session_id,
            role: "assistant" as Role,
            content: encrypt(combinedContent),
            created_at: new Date()
        };
        await db.collection("messages").insertOne(assistantMsg);

        // Cleanup temp files
        fs.unlinkSync(file.path);
        fs.unlinkSync(tempWav);

        // 8. Return comprehensive payload
        res.json({
            transcription,
            spokenText,
            bullets,
            audio: audioBase64
        });

    } catch (err: any) {
        console.error("Voice pipeline error:", err);
        // Attempt cleanup
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
        
        res.status(500).json({ detail: err.message || "Voice processing failed." });
    }
});

export default router;
