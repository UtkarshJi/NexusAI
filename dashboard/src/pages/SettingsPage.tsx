import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject, useUpdateProject, useDeleteProject, useRegenerateApiKey, useUploadKnowledge, useKnowledgeStats, useDeleteKnowledgeFile } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2, RefreshCw, Upload, X } from 'lucide-react'

export function SettingsPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()
    const { data: project, isLoading } = useProject(projectId!)
    const { data: knowledgeStats, refetch: refetchStats } = useKnowledgeStats(projectId!)
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()
    const regenerateKey = useRegenerateApiKey()
    const uploadKnowledge = useUploadKnowledge()
    const deleteKnowledgeFile = useDeleteKnowledgeFile()

    const [name, setName] = useState('')
    const [systemPrompt, setSystemPrompt] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [uploadContent, setUploadContent] = useState('')
    const [uploadFilename, setUploadFilename] = useState('')

    // Initialize form when project loads
    useState(() => {
        if (project) {
            setName(project.name)
            setSystemPrompt(project.system_prompt || '')
            setIsActive(project.is_active)
        }
    })

    const handleSave = async () => {
        await updateProject.mutateAsync({
            id: projectId!,
            name,
            system_prompt: systemPrompt,
            is_active: isActive,
        })
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            await deleteProject.mutateAsync(projectId!)
            navigate('/')
        }
    }

    const handleRegenerateKey = async () => {
        if (window.confirm('Are you sure? This will invalidate the current API key.')) {
            await regenerateKey.mutateAsync(projectId!)
        }
    }

    const handleUploadKnowledge = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!uploadContent.trim() || !uploadFilename.trim()) return

        await uploadKnowledge.mutateAsync({
            projectId: projectId!,
            filename: uploadFilename,
            content: uploadContent,
        })
        setUploadContent('')
        setUploadFilename('')
        refetchStats()
    }

    const handleDeleteFile = async (filename: string) => {
        if (window.confirm(`Delete all chunks for "${filename}"?`)) {
            await deleteKnowledgeFile.mutateAsync({ projectId: projectId!, filename })
            refetchStats()
        }
    }

    if (isLoading || !project) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4" />
                    <div className="h-40 bg-muted rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${projectId}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">{project.name}</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Basic project configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={name || project.name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="active">Project is active</Label>
                        </div>
                        <Button onClick={handleSave} disabled={updateProject.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardContent>
                </Card>

                {/* System Prompt */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Prompt</CardTitle>
                        <CardDescription>
                            Instructions that define how your AI assistant behaves
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={systemPrompt || project.system_prompt || ''}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="You are a helpful customer support assistant..."
                            rows={6}
                        />
                        <Button onClick={handleSave} disabled={updateProject.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Prompt
                        </Button>
                    </CardContent>
                </Card>

                {/* Knowledge Base */}
                <Card>
                    <CardHeader>
                        <CardTitle>Knowledge Base</CardTitle>
                        <CardDescription>
                            Upload documents to provide context for your AI
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Current files */}
                        {knowledgeStats && knowledgeStats.filenames.length > 0 && (
                            <div className="space-y-2">
                                <Label>Current Files</Label>
                                <div className="space-y-2">
                                    {knowledgeStats.filenames.map((filename) => (
                                        <div
                                            key={filename}
                                            className="flex items-center justify-between p-2 bg-muted rounded"
                                        >
                                            <span className="text-sm">{filename}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteFile(filename)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload form */}
                        <form onSubmit={handleUploadKnowledge} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="filename">Filename</Label>
                                <Input
                                    id="filename"
                                    value={uploadFilename}
                                    onChange={(e) => setUploadFilename(e.target.value)}
                                    placeholder="faq.txt"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={uploadContent}
                                    onChange={(e) => setUploadContent(e.target.value)}
                                    placeholder="Paste your document content here..."
                                    rows={6}
                                />
                            </div>
                            <Button type="submit" disabled={uploadKnowledge.isPending}>
                                <Upload className="h-4 w-4 mr-2" />
                                {uploadKnowledge.isPending ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>API key management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            onClick={handleRegenerateKey}
                            disabled={regenerateKey.isPending}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate API Key
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteProject.isPending}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
