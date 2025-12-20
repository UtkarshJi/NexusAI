import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('Error:', err);

    // Handle AppError (our custom error class)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
        });
        return;
    }

    // Handle unknown errors
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
    });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    res.status(404).json({
        success: false,
        error: `Cannot ${req.method} ${req.path}`,
    });
}

/**
 * Request logging middleware
 */
export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });

    next();
}
