/**
 * NexusAI Embeddable Chat Widget
 * 
 * Usage: Add this script to your HTML with a data-project-key attribute
 * 
 * <script 
 *   src="https://cdn.nexusai.com/widget.js" 
 *   data-project-key="your-api-key-here"
 * ></script>
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

// Types
interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

interface WidgetConfig {
    apiUrl: string
    projectKey: string
    position: 'bottom-right' | 'bottom-left'
    primaryColor: string
    title: string
}

// Default configuration
const defaultConfig: WidgetConfig = {
    apiUrl: 'https://api.nexusai.com',
    projectKey: '',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    title: 'Chat with us',
}

// Styles (inline for single file bundle)
const styles = {
    container: (position: string): React.CSSProperties => ({
        position: 'fixed',
        bottom: '20px',
        [position === 'bottom-right' ? 'right' : 'left']: '20px',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    button: (primaryColor: string): React.CSSProperties => ({
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: primaryColor,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.2s, box-shadow 0.2s',
    }),
    chatWindow: {
        width: '380px',
        height: '520px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        marginBottom: '16px',
    },
    header: (primaryColor: string): React.CSSProperties => ({
        padding: '16px 20px',
        backgroundColor: primaryColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    }),
    messages: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
    },
    message: (isUser: boolean): React.CSSProperties => ({
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: '12px',
        backgroundColor: isUser ? '#3b82f6' : '#f3f4f6',
        color: isUser ? 'white' : '#1f2937',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        fontSize: '14px',
        lineHeight: 1.5,
        wordBreak: 'break-word' as const,
    }),
    inputContainer: {
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
    },
    input: {
        flex: 1,
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontSize: '14px',
        outline: 'none',
    },
    sendButton: (primaryColor: string): React.CSSProperties => ({
        padding: '10px 16px',
        borderRadius: '8px',
        backgroundColor: primaryColor,
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
    }),
}

// Chat Icon SVG
const ChatIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

// Main Widget Component
function NexusAIWidget({ config }: { config: WidgetConfig }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isStreaming) return

        const userMessage = input.trim()
        setInput('')
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
        setIsStreaming(true)

        try {
            const response = await fetch(`${config.apiUrl}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': config.projectKey,
                },
                body: JSON.stringify({
                    message: userMessage,
                    session_id: sessionId,
                    conversation_history: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            })

            if (!response.ok) throw new Error('Chat request failed')

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
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
                                setMessages((prev) => {
                                    const newMessages = [...prev]
                                    newMessages[newMessages.length - 1] = {
                                        role: 'assistant',
                                        content: fullResponse,
                                    }
                                    return newMessages
                                })
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            setMessages((prev) => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                }
                return newMessages
            })
        } finally {
            setIsStreaming(false)
        }
    }, [input, isStreaming, sessionId, messages, config])

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div style={styles.container(config.position)}>
            {isOpen && (
                <div style={styles.chatWindow}>
                    {/* Header */}
                    <div style={styles.header(config.primaryColor)}>
                        <span style={{ fontWeight: 600, fontSize: '16px' }}>{config.title}</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '4px',
                            }}
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={styles.messages}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px' }}>
                                <p>Hi! How can we help you today?</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} style={styles.message(msg.role === 'user')}>
                                {msg.content || (isStreaming && idx === messages.length - 1 ? '...' : '')}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={styles.inputContainer}>
                        <input
                            style={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={isStreaming}
                        />
                        <button
                            style={styles.sendButton(config.primaryColor)}
                            onClick={sendMessage}
                            disabled={isStreaming || !input.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                style={styles.button(config.primaryColor)}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                }}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>
        </div>
    )
}

// Initialize widget
function init() {
    // Find script tag and extract config
    const scripts = document.querySelectorAll('script[data-project-key]')
    const scriptTag = scripts[scripts.length - 1] as HTMLScriptElement | null

    if (!scriptTag) {
        console.error('NexusAI Widget: No script tag with data-project-key found')
        return
    }

    const config: WidgetConfig = {
        ...defaultConfig,
        projectKey: scriptTag.getAttribute('data-project-key') || '',
        apiUrl: scriptTag.getAttribute('data-api-url') || defaultConfig.apiUrl,
        position: (scriptTag.getAttribute('data-position') as WidgetConfig['position']) || defaultConfig.position,
        primaryColor: scriptTag.getAttribute('data-primary-color') || defaultConfig.primaryColor,
        title: scriptTag.getAttribute('data-title') || defaultConfig.title,
    }

    if (!config.projectKey) {
        console.error('NexusAI Widget: data-project-key is required')
        return
    }

    // Create container and mount widget
    const container = document.createElement('div')
    container.id = 'nexusai-widget-container'
    document.body.appendChild(container)

    ReactDOM.createRoot(container).render(
        <React.StrictMode>
            <NexusAIWidget config={config} />
        </React.StrictMode>
    )
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
