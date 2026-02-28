import { useState, useEffect, useCallback, useMemo } from 'react'
import { NotionService, type TimeLog, type CreateTimeLogInput } from '@/services/NotionService'

export function useTimeLogs(entryId?: string | null) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeLogs = useCallback(async () => {
    if (entryId === null) {
      setTimeLogs([])
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = entryId === undefined
        ? await NotionService.getAllTimeLogs()
        : await NotionService.getTimeLogs(entryId)
      setTimeLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time logs')
    } finally {
      setLoading(false)
    }
  }, [entryId])

  useEffect(() => {
    fetchTimeLogs()
  }, [fetchTimeLogs])

  const addTimeLog = async (input: CreateTimeLogInput) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: TimeLog = {
      id: tempId,
      name: input.name || `${input.hours}h`,
      entryId: input.entryId,
      memberId: input.memberId,
      hours: input.hours,
      date: input.date,
      notes: input.notes || '',
    }
    setTimeLogs((prev) => [optimistic, ...prev])

    try {
      const created = await NotionService.createTimeLog(input)
      setTimeLogs((prev) => prev.map((l) => (l.id === tempId ? created : l)))
      return created
    } catch (err) {
      setTimeLogs((prev) => prev.filter((l) => l.id !== tempId))
      throw err
    }
  }

  const totalHours = useMemo(
    () => timeLogs.reduce((sum, l) => sum + l.hours, 0),
    [timeLogs]
  )

  return { timeLogs, loading, error, addTimeLog, totalHours, refresh: fetchTimeLogs }
}
