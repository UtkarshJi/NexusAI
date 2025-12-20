import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { processMessage, getHistory } from '../services/chat.service.js';
import { AppError } from '../types/index.js';

const router = Router();

// Request validation schema
const chatMessageSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty'),
    sessionId: z.string().uuid().optional(),
});

/**
 * POST /api/chat/message
 * Send a message and get an AI reply
 */
router.post(
    '/message',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate request body
            const validationResult = chatMessageSchema.safeParse(req.body);

            if (!validationResult.success) {
                const errorMessage = validationResult.error.errors[0]?.message || 'Invalid request';
                throw new AppError(400, errorMessage);
            }

            const { message, sessionId } = validationResult.data;

            // Process the message
            const result = await processMessage(message, sessionId);

            res.json({
                success: true,
                reply: result.reply,
                sessionId: result.sessionId,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history for a session
 */
router.get(
    '/history/:sessionId',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { sessionId } = req.params;

            // Validate sessionId format
            const uuidSchema = z.string().uuid();
            const validationResult = uuidSchema.safeParse(sessionId);

            if (!validationResult.success) {
                throw new AppError(400, 'Invalid session ID format');
            }

            const result = await getHistory(sessionId);

            res.json({
                success: true,
                messages: result.messages,
                sessionId: result.sessionId,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/chat/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
