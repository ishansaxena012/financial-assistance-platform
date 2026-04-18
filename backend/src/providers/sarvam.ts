import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { settings } from '../config';
import { Language, Persona } from '../types';

export class SarvamProvider {
    // Return transcribed text from audio file
    async transcribeAudio(audioFilePath: string): Promise<string> {
        if (!settings.SARVAM_API_KEY) {
            throw new Error("SARVAM_API_KEY is not configured.");
        }

        const form = new FormData();
        form.append('file', fs.createReadStream(audioFilePath));
        // STT translate model
        form.append('model', 'saaras:v2.5');

        try {
            const res = await axios.post('https://api.sarvam.ai/speech-to-text-translate', form, {
                headers: {
                    ...form.getHeaders(),
                    'api-subscription-key': settings.SARVAM_API_KEY
                },
                timeout: 15000 // 15 seconds
            });
            return res.data.transcript || '';
        } catch (error: any) {
            console.error("[SarvamProvider] STT Error:", error.response?.data || error.message);
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
    }

    // Convert text to Audio base64 string using bulbul:v3 stream endpoint
    async textToSpeech(text: string, language: Language, persona: Persona): Promise<string> {
        if (!settings.SARVAM_API_KEY) {
            throw new Error("SARVAM_API_KEY is not configured.");
        }

        let speaker = "kavya";
        if (persona === "banker") speaker = "rahul";
        if (persona === "dost") speaker = "manan";

        const payload = {
            text: text,
            target_language_code: language === 'hi' ? 'hi-IN' : 'en-IN',
            speaker: speaker,
            model: "bulbul:v3",
            pace: 1.1,
            speech_sample_rate: 22050,
            output_audio_codec: "mp3",
            enable_preprocessing: true
        };

        try {
            const res = await axios.post('https://api.sarvam.ai/text-to-speech/stream', payload, {
                headers: {
                    'api-subscription-key': settings.SARVAM_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 15000 // 15 seconds
            });

            // Convert raw binary audio stream to base64 for frontend consumption
            if (res.data) {
                const buffer = Buffer.from(res.data, 'binary');
                return buffer.toString('base64');
            }
            throw new Error("No audio returned from Sarvam");
        } catch (error: any) {
            console.error("[SarvamProvider] TTS Error:", error.response?.data?.toString() || error.message);
            throw new Error(`Failed to synthesize speech: ${error.message}`);
        }
    }
}
