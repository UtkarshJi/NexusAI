// Message sender types
export type MessageSender = 'user' | 'ai';

// Database models
export interface Conversation {
    id: string;
    created_at: string;
    metadata: string | null;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender: MessageSender;
    text: string;
    created_at: string;
}

// API request/response types
export interface ChatMessageRequest {
    message: string;
    sessionId?: string;
}

export interface ChatMessageResponse {
    reply: string;
    sessionId: string;
}

export interface ChatHistoryResponse {
    messages: Message[];
    sessionId: string;
}

// LLM types
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Error types
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
