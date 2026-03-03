import { useState, useEffect, useCallback } from 'react'
import { NotionService, type Project, type CreateProjectInput } from '@/services/NotionService'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getProjects()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const addProject = async (input: CreateProjectInput) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: Project = {
      id: tempId,
      name: input.name,
      state: input.state || 'Not Start',
      stateColor: 'default',
      date: input.date || null,
      category: input.category || [],
      person: [],
      progress: 0,
      taskStats: '',
      taskIds: [],
      createdAt: new Date().toISOString(),
    }
    setProjects((prev) => [optimistic, ...prev])
    try {
      const created = await NotionService.createProject(input)
      setProjects((prev) => prev.map((p) => (p.id === tempId ? created : p)))
      return created
    } catch (err) {
      setProjects((prev) => prev.filter((p) => p.id !== tempId))
      throw err
    }
  }

  const updateProject = async (id: string, data: Partial<CreateProjectInput>) => {
    const original = projects.find((p) => p.id === id)
    if (!original) return
    const { person: _person, ...safeData } = data
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...safeData } : p)))
    try {
      const updated = await NotionService.updateProject(id, data)
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch {
      setProjects((prev) => prev.map((p) => (p.id === id ? original : p)))
    }
  }

  const deleteProject = async (id: string) => {
    const original = projects.find((p) => p.id === id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    try {
      await NotionService.deleteProject(id)
    } catch {
      if (original) setProjects((prev) => [original, ...prev])
    }
  }

  return { projects, loading, error, addProject, updateProject, deleteProject, refresh: fetchProjects }
}
