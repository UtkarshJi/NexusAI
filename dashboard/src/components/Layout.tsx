import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useMe, useProjects } from '@/hooks'
import { Button } from '@/components/ui/button'
import { MessageSquare, Settings, LogOut, Plus, Folder } from 'lucide-react'

export function Layout() {
    const { data: user } = useMe()
    const { data: projects } = useProjects()
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card flex flex-col">
                <div className="p-4 border-b">
                    <Link to="/" className="flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            NexusAI
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Projects
                    </div>
                    {projects?.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors"
                        >
                            <Folder className="h-4 w-4" />
                            <span className="truncate">{project.name}</span>
                        </Link>
                    ))}
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm text-primary transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Project</span>
                    </Link>
                </nav>

                {/* User section */}
                <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="truncate">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}
