import { writable, derived, get } from 'svelte/store';
import { sendMessage as apiSendMessage, getHistory, type Message } from '../api/chat';

// Local message type (extends API message for UI state)
export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
    isError?: boolean;
}

// Session ID storage key
const SESSION_KEY = 'spur-chat-session-id';

// Get stored session ID
function getStoredSessionId(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(SESSION_KEY);
    }
    return null;
}

// Store session ID
function storeSessionId(id: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, id);
    }
}

// Create stores
export const messages = writable<ChatMessage[]>([]);
export const isLoading = writable(false);
export const sessionId = writable<string | null>(getStoredSessionId());
export const error = writable<string | null>(null);

// Derived store for message count
export const messageCount = derived(messages, ($messages) => $messages.length);

// Convert API message to ChatMessage
function toLocalMessage(msg: Message): ChatMessage {
    return {
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.created_at),
    };
}

/**
 * Load conversation history from the server
 */
export async function loadHistory(): Promise<void> {
    const currentSessionId = get(sessionId);

    if (!currentSessionId) {
        return;
    }

    try {
        isLoading.set(true);
        error.set(null);

        const result = await getHistory(currentSessionId);
        messages.set(result.messages.map(toLocalMessage));
    } catch (err) {
        console.error('Failed to load history:', err);
        // Session might be invalid, clear it
        sessionId.set(null);
        localStorage.removeItem(SESSION_KEY);
        error.set('Could not load previous conversation. Starting fresh.');
    } finally {
        isLoading.set(false);
    }
}

/**
 * Send a message and get AI reply
 */
export async function sendMessage(text: string): Promise<void> {
    const trimmedText = text.trim();

    if (!trimmedText) {
        return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        text: trimmedText,
        timestamp: new Date(),
    };

    messages.update((msgs) => [...msgs, userMessage]);

    try {
        isLoading.set(true);
        error.set(null);

        const currentSessionId = get(sessionId);
        const result = await apiSendMessage(trimmedText, currentSessionId || undefined);

        // Store session ID
        sessionId.set(result.sessionId);
        storeSessionId(result.sessionId);

        // Add AI reply
        const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: result.reply,
            timestamp: new Date(),
        };

        messages.update((msgs) => [...msgs, aiMessage]);
    } catch (err) {
        console.error('Failed to send message:', err);

        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';

        // Add error message as AI response
        const errorResponse: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: 'ai',
            text: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`,
            timestamp: new Date(),
            isError: true,
        };

        messages.update((msgs) => [...msgs, errorResponse]);
        error.set(errorMessage);
    } finally {
        isLoading.set(false);
    }
}

/**
 * Clear conversation and start fresh
 */
export function clearConversation(): void {
    messages.set([]);
    sessionId.set(null);
    error.set(null);
    localStorage.removeItem(SESSION_KEY);
}
