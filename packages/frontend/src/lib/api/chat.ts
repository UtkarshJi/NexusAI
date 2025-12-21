// API types
export interface Message {
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    text: string;
    created_at: string;
}

interface ChatMessageResponse {
    success: boolean;
    reply?: string;
    sessionId?: string;
    error?: string;
}

interface ChatHistoryResponse {
    success: boolean;
    messages?: Message[];
    sessionId?: string;
    error?: string;
}

// Use environment variable for API URL in production, or proxy in development
const getApiBase = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Remove trailing slash if present
        const baseUrl = envUrl.replace(/\/$/, '');
        return `${baseUrl}/api/chat`;
    }
    return '/api/chat';
};

const API_BASE = getApiBase();

/**
 * Send a chat message and get AI reply
 */
export async function sendMessage(
    message: string,
    sessionId?: string
): Promise<{ reply: string; sessionId: string }> {
    const response = await fetch(`${API_BASE}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
    });

    const data: ChatMessageResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
    }

    return {
        reply: data.reply!,
        sessionId: data.sessionId!,
    };
}

/**
 * Get conversation history for a session
 */
export async function getHistory(
    sessionId: string
): Promise<{ messages: Message[]; sessionId: string }> {
    const response = await fetch(`${API_BASE}/history/${sessionId}`);

    const data: ChatHistoryResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load history');
    }

    return {
        messages: data.messages!,
        sessionId: data.sessionId!,
    };
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        return data.success === true;
    } catch {
        return false;
    }
}
