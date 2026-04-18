import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const settings = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    LLM_PROVIDER: (process.env.LLM_PROVIDER as "mock" | "gemini") || "gemini",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    SARVAM_API_KEY: process.env.SARVAM_API_KEY || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    JWT_SECRET: process.env.JWT_SECRET || "super_secret_temporary_key_change_in_prod",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "",
    PORT: process.env.PORT || 8000,
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};
