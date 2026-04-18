import express from 'express';
import cors from 'cors';
import { settings } from './config';
import { connectDB } from './db';

import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import chatRoutes from './routes/chat';
import voiceRoutes from './routes/voice';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json({ limit: '5mb' })); // Increase slightly for base64 audio potentially

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`  [server] Error: ${err.message}`);
    const status = err.status || 500;
    res.status(status).json({
        detail: status === 500 ? "Internal Server Error" : err.message,
        error: true
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

async function startServer() {
    try {
        await connectDB();
        app.listen(settings.PORT, () => {
            console.log(`Server running at http://localhost:${settings.PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
