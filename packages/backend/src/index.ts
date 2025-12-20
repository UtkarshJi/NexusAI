import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory (handles monorepo structure)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Also try to load from 2 levels up in case running from packages/backend
dotenv.config({ path: path.resolve(process.cwd(), '..', '..', '.env') });

import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/error-handler.js';
import { isConfigured } from './services/llm.service.js';

// Create Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// API Routes
app.use('/api/chat', chatRoutes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Spur AI Chat Agent API',
        version: '1.0.0',
        status: 'running',
        llmConfigured: isConfigured(),
    });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Spur AI Chat Agent Backend');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for ${FRONTEND_URL}`);
    console.log(`${isConfigured() ? '✅' : '❌'} Groq API ${isConfigured() ? 'configured' : 'NOT configured'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
});

export default app;
