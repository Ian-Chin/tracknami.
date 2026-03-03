import { useState, useEffect, useCallback } from 'react'
import { NotionService, type TimeLog, type CreateTimeLogInput } from '@/services/NotionService'

export function useTimeLogs() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getTimeLogs()
      setTimeLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTimeLogs()
  }, [fetchTimeLogs])

  const addTimeLog = async (input: CreateTimeLogInput) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: TimeLog = {
      id: tempId,
      name: input.name,
      hours: input.hours,
      date: input.date || null,
      notes: input.notes || '',
      taskId: input.taskId || null,
      projectId: input.projectId || null,
      person: null,
      createdAt: new Date().toISOString(),
    }
    setTimeLogs((prev) => [optimistic, ...prev])
    try {
      const created = await NotionService.createTimeLog(input)
      setTimeLogs((prev) => prev.map((t) => (t.id === tempId ? created : t)))
      return created
    } catch (err) {
      setTimeLogs((prev) => prev.filter((t) => t.id !== tempId))
      throw err
    }
  }

  const updateTimeLog = async (id: string, data: Partial<CreateTimeLogInput>) => {
    const original = timeLogs.find((t) => t.id === id)
    if (!original) return
    setTimeLogs((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
    try {
      const updated = await NotionService.updateTimeLog(id, data)
      setTimeLogs((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch {
      setTimeLogs((prev) => prev.map((t) => (t.id === id ? original : t)))
    }
  }

  const deleteTimeLog = async (id: string) => {
    const original = timeLogs.find((t) => t.id === id)
    setTimeLogs((prev) => prev.filter((t) => t.id !== id))
    try {
      await NotionService.deleteTimeLog(id)
    } catch {
      if (original) setTimeLogs((prev) => [original, ...prev])
    }
  }

  return { timeLogs, loading, error, addTimeLog, updateTimeLog, deleteTimeLog, refresh: fetchTimeLogs }
}
