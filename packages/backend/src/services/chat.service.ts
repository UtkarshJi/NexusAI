import { conversationRepository } from '../repositories/conversation.repo.js';
import { messageRepository } from '../repositories/message.repo.js';
import { generateReply } from './llm.service.js';
import { Message, AppError } from '../types/index.js';

// Configuration
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;

export interface ProcessMessageResult {
    reply: string;
    sessionId: string;
}

/**
 * Process a user message and generate an AI reply
 */
export async function processMessage(
    message: string,
    sessionId?: string
): Promise<ProcessMessageResult> {
    // Validate message
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
        throw new AppError(400, 'Message cannot be empty');
    }

    // Truncate if too long
    let processedMessage = trimmedMessage;
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        processedMessage = trimmedMessage.substring(0, MAX_MESSAGE_LENGTH);
        console.warn(`Message truncated from ${trimmedMessage.length} to ${MAX_MESSAGE_LENGTH} characters`);
    }

    // Get or create conversation
    let conversationId = sessionId;

    if (sessionId) {
        // Verify session exists
        const exists = await conversationRepository.exists(sessionId);
        if (!exists) {
            // Session doesn't exist, create new one
            console.warn(`Session ${sessionId} not found, creating new conversation`);
            conversationId = undefined;
        }
    }

    if (!conversationId) {
        // Create new conversation
        const conversation = await conversationRepository.create();
        conversationId = conversation.id;
    }

    // Get conversation history for context
    const history = await messageRepository.getRecentMessages(
        conversationId,
        MAX_HISTORY_MESSAGES
    );

    // Save user message
    await messageRepository.create(conversationId, 'user', processedMessage);

    // Generate AI reply
    const reply = await generateReply(history, processedMessage);

    // Save AI reply
    await messageRepository.create(conversationId, 'ai', reply);

    return {
        reply,
        sessionId: conversationId,
    };
}

/**
 * Get conversation history for a session
 */
export async function getHistory(sessionId: string): Promise<{ messages: Message[]; sessionId: string }> {
    // Verify session exists
    const exists = await conversationRepository.exists(sessionId);
    if (!exists) {
        throw new AppError(404, 'Conversation not found');
    }

    const messages = await messageRepository.findByConversationId(sessionId);

    return {
        messages,
        sessionId,
    };
}

/**
 * Get message count for a session
 */
export async function getMessageCount(sessionId: string): Promise<number> {
    const exists = await conversationRepository.exists(sessionId);
    if (!exists) {
        return 0;
    }
    return await messageRepository.countByConversationId(sessionId);
}
