import { Router, Response } from 'express';
import { getDB } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { processChat } from '../services/chat';

const router = Router();

router.post('/:session_id', authenticate, async (req: AuthRequest, res: Response) => {
    const session_id = req.params.session_id as string;
    const { content } = req.body;
    const db = getDB();

    if (!content || !content.trim()) {
        return res.status(400).json({ detail: "Message cannot be empty" });
    }

    try {
        const session = await db.collection('sessions').findOne({ 
            id: session_id, 
            user_id: req.user!.id 
        });

        if (!session) {
            return res.status(404).json({ detail: "Session not found" });
        }

        const result = await processChat(
            session_id, 
            content.trim(), 
            session.language, 
            session.persona
        );
        
        return res.json(result);

    } catch (err: any) {
        console.error("Chat Route Error:", err);
        return res.status(500).json({ detail: err.message });
    }
});

export default router;
