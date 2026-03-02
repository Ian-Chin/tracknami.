import { useState, useEffect, useCallback } from 'react'
import { NotionService, type Task, type CreateTaskInput } from '@/services/NotionService'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = async (input: CreateTaskInput) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: Task = {
      id: tempId,
      name: input.name,
      projectId: input.projectId || null,
      completed: input.completed || false,
      date: input.date || null,
      endDate: input.endDate || null,
      priority: input.priority || null,
      estimatedTime: input.estimatedTime || '',
      remind: '',
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [optimistic, ...prev])
    try {
      const created = await NotionService.createTask(input)
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)))
      return created
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId))
      throw err
    }
  }

  const updateTask = async (id: string, data: Partial<CreateTaskInput>) => {
    const original = tasks.find((t) => t.id === id)
    if (!original) return
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
    try {
      const updated = await NotionService.updateTask(id, data)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? original : t)))
    }
  }

  const deleteTask = async (id: string) => {
    const original = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await NotionService.deleteTask(id)
    } catch {
      if (original) setTasks((prev) => [original, ...prev])
    }
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask, refresh: fetchTasks }
}
