import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { decrypt, encrypt } from '../lib/encryption';
import { getRedis } from '../db/redis';

import { Message } from '../types';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    const { language, persona } = req.body;
    const db = getDB();

    const sessionId = uuidv4();
    const sessionData = {
        id: sessionId,
        user_id: req.user!.id,
        language: language || 'en',
        persona: persona || 'maa',
        created_at: new Date()
    };

    await db.collection('sessions').insertOne(sessionData);
    return res.json(sessionData);
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    const db = getDB();
    const sessions = await db.collection('sessions')
        .find({ user_id: req.user!.id })
        .sort({ created_at: -1 })
        .limit(20)
        .toArray();

    return res.json(sessions);
});

router.get('/:session_id', authenticate, async (req: AuthRequest, res: Response) => {
    const { session_id } = req.params;
    const db = getDB();
    const redis = getRedis();

    const session = await db.collection('sessions').findOne({ 
        id: session_id, 
        user_id: req.user!.id 
    });

    if (!session) {
        return res.status(404).json({ detail: "Session not found or forbidden" });
    }

    // Always fetch Full History from MongoDB for UI consistency
    const messages = await db.collection<Message>('messages')
        .find({ session_id })
        .sort({ created_at: 1 })
        .toArray();

    const mappedMessages = messages.map(m => ({
        ...m,
        id: m._id.toString(),
        content: decrypt(m.content)
    }));

    // Maintenance: If Redis is empty for this session, populate it with the last few messages
    // so that the next chat message has immediate context.
    try {
        const cacheKey = `chat_history:${session_id}`;
        const hasCache = await redis.exists(cacheKey);
        if (!hasCache && mappedMessages.length > 0) {
            const cacheHistory = mappedMessages.map(m => ({ role: m.role, content: m.content }));
            await redis.set(cacheKey, JSON.stringify(cacheHistory.slice(-12)), 'EX', 86400);
        }
    } catch (err) {
        console.error("Redis maintenance error in session route:", err);
    }

    return res.json({
        session,
        messages: mappedMessages,
    });
});

export default router;
