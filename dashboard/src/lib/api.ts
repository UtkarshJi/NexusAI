import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)
        const { data } = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },
    register: async (email: string, password: string, name: string) => {
        const { data } = await api.post('/auth/register', { email, password, name })
        return data
    },
    getMe: async () => {
        const { data } = await api.get('/auth/me')
        return data
    },
}

// Projects API
export const projectsApi = {
    list: async () => {
        const { data } = await api.get('/projects')
        return data
    },
    get: async (id: string) => {
        const { data } = await api.get(`/projects/${id}`)
        return data
    },
    create: async (project: { name: string; system_prompt?: string }) => {
        const { data } = await api.post('/projects', project)
        return data
    },
    update: async (id: string, project: { name?: string; system_prompt?: string; is_active?: boolean }) => {
        const { data } = await api.patch(`/projects/${id}`, project)
        return data
    },
    delete: async (id: string) => {
        await api.delete(`/projects/${id}`)
    },
    regenerateKey: async (id: string) => {
        const { data } = await api.post(`/projects/${id}/regenerate-key`)
        return data
    },
}

// Knowledge API
export const knowledgeApi = {
    upload: async (projectId: string, filename: string, content: string) => {
        const { data } = await api.post('/knowledge/upload', { filename, content }, {
            params: { project_id: projectId },
        })
        return data
    },
    getStats: async (projectId: string) => {
        const { data } = await api.get(`/knowledge/stats/${projectId}`)
        return data
    },
    listChunks: async (projectId: string, filename?: string) => {
        const { data } = await api.get(`/knowledge/chunks/${projectId}`, {
            params: filename ? { filename } : undefined,
        })
        return data
    },
    deleteFile: async (projectId: string, filename: string) => {
        const { data } = await api.delete(`/knowledge/file/${projectId}/${encodeURIComponent(filename)}`)
        return data
    },
}

// Types
export interface User {
    id: string
    email: string
    name: string
    is_active: boolean
    created_at: string
}

export interface Project {
    id: string
    user_id: string
    name: string
    api_key: string
    system_prompt: string | null
    settings: Record<string, unknown>
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Conversation {
    id: string
    project_id: string
    session_id: string
    visitor_name: string | null
    visitor_email: string | null
    is_resolved: boolean
    created_at: string
    updated_at: string
}

export interface Message {
    id: string
    conversation_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    tokens_used: number | null
    created_at: string
}

export interface KnowledgeStats {
    total_files: number
    total_chunks: number
    filenames: string[]
}
