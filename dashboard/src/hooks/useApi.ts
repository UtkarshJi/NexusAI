import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, projectsApi, knowledgeApi, type Project, type User, type KnowledgeStats } from '@/lib/api'

// Auth hooks
export function useMe() {
    return useQuery<User>({
        queryKey: ['me'],
        queryFn: authApi.getMe,
        retry: false,
    })
}

// Projects hooks
export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: projectsApi.list,
    })
}

export function useProject(id: string) {
    return useQuery<Project>({
        queryKey: ['projects', id],
        queryFn: () => projectsApi.get(id),
        enabled: !!id,
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: projectsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string; name?: string; system_prompt?: string; is_active?: boolean }) =>
            projectsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: projectsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
    })
}

export function useRegenerateApiKey() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: projectsApi.regenerateKey,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['projects', id] })
        },
    })
}

// Knowledge hooks
export function useKnowledgeStats(projectId: string) {
    return useQuery<KnowledgeStats>({
        queryKey: ['knowledge', projectId, 'stats'],
        queryFn: () => knowledgeApi.getStats(projectId),
        enabled: !!projectId,
    })
}

export function useUploadKnowledge() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, filename, content }: { projectId: string; filename: string; content: string }) =>
            knowledgeApi.upload(projectId, filename, content),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['knowledge', projectId] })
        },
    })
}

export function useDeleteKnowledgeFile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ projectId, filename }: { projectId: string; filename: string }) =>
            knowledgeApi.deleteFile(projectId, filename),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['knowledge', projectId] })
        },
    })
}
