import Groq from 'groq-sdk';
import { Message, AppError } from '../types/index.js';
import { getSystemPrompt } from '../prompts/support-agent.js';

// Configuration
const MAX_TOKENS = 500;
const MODEL = 'llama-3.3-70b-versatile';  // Groq's best free model

// Initialize Groq client
let groq: Groq | null = null;

function getGroqClient(): Groq {
    if (!groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new AppError(500, 'Groq API key is not configured. Please set GROQ_API_KEY environment variable.');
        }
        groq = new Groq({ apiKey });
    }
    return groq;
}

/**
 * Format conversation history for the chat API
 */
function formatHistory(history: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    return history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
    }));
}

/**
 * Generate a reply using Groq
 * @param history - Previous messages in the conversation
 * @param userMessage - The new user message
 * @returns The AI's reply
 */
export async function generateReply(
    history: Message[],
    userMessage: string
): Promise<string> {
    try {
        const client = getGroqClient();

        // Build messages array with system prompt, history, and user message
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: getSystemPrompt() },
            ...formatHistory(history),
            { role: 'user', content: userMessage },
        ];

        console.log('Sending request to Groq...');

        // Generate response
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages,
            max_tokens: MAX_TOKENS,
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content;

        console.log('Groq response received successfully');

        if (!reply) {
            throw new AppError(500, 'No response received from AI');
        }

        return reply.trim();
    } catch (error: any) {
        console.error('Groq API Error:', error?.message || error);

        // Handle specific errors
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('api key') || message.includes('authentication') || message.includes('401')) {
                throw new AppError(500, 'AI service authentication failed. Please check the API key.');
            }
            if (message.includes('rate') || message.includes('429') || message.includes('quota')) {
                throw new AppError(503, 'AI service is currently busy. Please try again in a moment.');
            }
        }

        // Re-throw AppErrors
        if (error instanceof AppError) {
            throw error;
        }

        // Generic error
        throw new AppError(500, `AI Error: ${error?.message || 'Unknown error'}. Please try again.`);
    }
}

/**
 * Check if the LLM service is configured correctly
 */
export function isConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}
