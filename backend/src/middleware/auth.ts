import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { settings } from '../config';
import { User } from '../types';

export interface AuthRequest extends Request {
    user?: User;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: "Not authenticated" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, settings.JWT_SECRET) as User;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ detail: "Invalid token" });
    }
};
