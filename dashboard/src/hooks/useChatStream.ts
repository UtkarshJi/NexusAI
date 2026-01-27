import { useState, useCallback, useRef } from 'react'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

interface UseChatStreamOptions {
    apiUrl?: string
    projectApiKey: string
    onToken?: (token: string) => void
    onComplete?: (message: string) => void
    onError?: (error: Error) => void
}

interface UseChatStreamReturn {
    messages: ChatMessage[]
    sendMessage: (message: string) => Promise<void>
    isStreaming: boolean
    error: Error | null
    sessionId: string | null
    clearMessages: () => void
}

export function useChatStream(options: UseChatStreamOptions): UseChatStreamReturn {
    const { apiUrl = 'http://localhost:8000', projectApiKey, onToken, onComplete, onError } = options

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const sendMessage = useCallback(async (message: string) => {
        if (isStreaming) return

        setIsStreaming(true)
        setError(null)

        // Add user message
        const userMessage: ChatMessage = { role: 'user', content: message }
        setMessages((prev) => [...prev, userMessage])

        // Add placeholder for assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        try {
            abortControllerRef.current = new AbortController()

            const response = await fetch(`${apiUrl}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': projectApiKey,
                },
                body: JSON.stringify({
                    message,
                    session_id: sessionId,
                    conversation_history: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
                signal: abortControllerRef.current.signal,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error('No response body')
            }

            let fullResponse = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))

                            if (data.type === 'session') {
                                setSessionId(data.session_id)
                            } else if (data.type === 'token') {
                                fullResponse += data.content
                                onToken?.(data.content)

                                // Update the last message with streamed content
                                setMessages((prev) => {
                                    const newMessages = [...prev]
                                    newMessages[newMessages.length - 1] = {
                                        role: 'assistant',
                                        content: fullResponse,
                                    }
                                    return newMessages
                                })
                            } else if (data.type === 'done') {
                                onComplete?.(fullResponse)
                            } else if (data.type === 'error') {
                                throw new Error(data.content)
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error')
            if (error.name !== 'AbortError') {
                setError(error)
                onError?.(error)
                // Remove the empty assistant message on error
                setMessages((prev) => prev.slice(0, -1))
            }
        } finally {
            setIsStreaming(false)
            abortControllerRef.current = null
        }
    }, [apiUrl, projectApiKey, sessionId, messages, isStreaming, onToken, onComplete, onError])

    const clearMessages = useCallback(() => {
        setMessages([])
        setSessionId(null)
        setError(null)
    }, [])

    return {
        messages,
        sendMessage,
        isStreaming,
        error,
        sessionId,
        clearMessages,
    }
}
