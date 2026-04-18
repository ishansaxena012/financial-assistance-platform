import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { settings } from '../config';

const router = Router();
const client = new OAuth2Client(settings.GOOGLE_CLIENT_ID);

router.post('/google', async (req: Request, res: Response) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ detail: "Token is required" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: settings.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Invalid Google token payload");
        }

        const user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };

        const jwtToken = jwt.sign(user, settings.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            token: jwtToken,
            user,
        });

    } catch (err: any) {
        console.error("Google Auth Error:", err);
        return res.status(401).json({ detail: "Invalid Google token" });
    }
});

export default router;
