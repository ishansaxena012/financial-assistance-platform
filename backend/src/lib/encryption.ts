import crypto from 'crypto';
import { settings } from '../config';

const ENCRYPTION_KEY = settings.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        console.warn("  [crypto] ENCRYPTION_KEY is missing. Saving in plain text!");
        return text;
    }
    
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
    if (!ENCRYPTION_KEY) return encryptedData;

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            // Not in our encrypted format, return as-is (handling legacy messages)
            return encryptedData;
        }

        const [ivHex, authTagHex, encryptedText] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (err) {
        console.error("Decryption failed:", err);
        // Fallback for non-encrypted or incorrectly encrypted messages
        return encryptedData;
    }
}
