import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProject, useKnowledgeStats, useUploadKnowledge, useChatStream } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Copy, FileText, Send, Bot, User } from 'lucide-react'

export function ProjectPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const { data: project, isLoading } = useProject(projectId!)
    const { data: knowledgeStats } = useKnowledgeStats(projectId!)
    const uploadKnowledge = useUploadKnowledge()

    const [copied, setCopied] = useState(false)
    const [testMessage, setTestMessage] = useState('')

    // Test chat functionality
    const { messages, sendMessage, isStreaming, clearMessages } = useChatStream({
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
        projectApiKey: project?.api_key || '',
    })

    const handleCopyApiKey = () => {
        if (project?.api_key) {
            navigator.clipboard.writeText(project.api_key)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleTestChat = (e: React.FormEvent) => {
        e.preventDefault()
        if (!testMessage.trim() || isStreaming) return
        sendMessage(testMessage)
        setTestMessage('')
    }

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4" />
                    <div className="h-40 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-destructive">Project not found</h1>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your chatbot configuration and test the integration
                    </p>
                </div>
                <Link to={`/projects/${project.id}/settings`}>
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* API Key Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>API Key</CardTitle>
                        <CardDescription>
                            Use this key to authenticate widget requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={project.api_key}
                                className="font-mono text-sm"
                            />
                            <Button variant="outline" onClick={handleCopyApiKey}>
                                <Copy className="h-4 w-4" />
                                {copied ? 'Copied!' : ''}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Add this to your widget: <code className="bg-muted px-1 rounded">data-project-key="{project.api_key.slice(0, 20)}..."</code>
                        </p>
                    </CardContent>
                </Card>

                {/* Knowledge Base Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Knowledge Base
                        </CardTitle>
                        <CardDescription>
                            Documents used for RAG context
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{knowledgeStats?.total_files ?? 0}</div>
                                <div className="text-sm text-muted-foreground">Files</div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{knowledgeStats?.total_chunks ?? 0}</div>
                                <div className="text-sm text-muted-foreground">Chunks</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Chat */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Test Chat</CardTitle>
                                <CardDescription>
                                    Test your chatbot with your current configuration
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={clearMessages}>
                                Clear
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Messages */}
                        <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 space-y-3">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Send a message to test your chatbot
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[70%] rounded-lg px-3 py-2 ${msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            {msg.content || (isStreaming && idx === messages.length - 1 ? '...' : '')}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleTestChat} className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                disabled={isStreaming}
                            />
                            <Button type="submit" disabled={isStreaming || !testMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
