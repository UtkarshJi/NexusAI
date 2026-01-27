import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MessageSquare, Clock, Key } from 'lucide-react'

export function DashboardPage() {
    const navigate = useNavigate()
    const { data: projects, isLoading } = useProjects()
    const createProject = useCreateProject()
    const [newProjectName, setNewProjectName] = useState('')
    const [showCreate, setShowCreate] = useState(false)

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProjectName.trim()) return

        try {
            const project = await createProject.mutateAsync({ name: newProjectName })
            setNewProjectName('')
            setShowCreate(false)
            navigate(`/projects/${project.id}`)
        } catch (error) {
            console.error('Failed to create project:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-muted rounded" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your AI customer support projects
                    </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            </div>

            {showCreate && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create New Project</CardTitle>
                        <CardDescription>
                            Set up a new AI-powered chatbot for your website
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateProject} className="flex gap-4">
                            <Input
                                placeholder="Project name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" disabled={createProject.isPending}>
                                {createProject.isPending ? 'Creating...' : 'Create'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreate(false)}
                            >
                                Cancel
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {projects?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create your first project to get started with AI-powered customer support.
                        </p>
                        <Button onClick={() => setShowCreate(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects?.map((project) => (
                        <Card
                            key={project.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 pt-2">
                                    <span className="flex items-center gap-1">
                                        <Key className="h-3 w-3" />
                                        {project.api_key.slice(0, 12)}...
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.is_active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                    >
                                        {project.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
