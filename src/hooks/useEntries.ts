import { useState, useEffect, useCallback } from 'react'
import { NotionService, type Entry, type CreateEntryInput } from '@/services/NotionService'

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getEntries()
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const addEntry = async (input: CreateEntryInput) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimistic: Entry = {
      id: tempId,
      name: input.name,
      status: input.status || 'Not Started',
      priority: input.priority || 'Medium',
      date: input.date || null,
      createdAt: new Date().toISOString(),
    }
    setEntries((prev) => [optimistic, ...prev])

    try {
      const created = await NotionService.createEntry(input)
      setEntries((prev) => prev.map((e) => (e.id === tempId ? created : e)))
      return created
    } catch (err) {
      setEntries((prev) => prev.filter((e) => e.id !== tempId))
      throw err
    }
  }

  const updateEntry = async (id: string, data: Partial<CreateEntryInput>) => {
    const original = entries.find((e) => e.id === id)
    if (!original) return

    // Optimistic update
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    )

    try {
      const updated = await NotionService.updateEntry(id, data)
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch {
      setEntries((prev) => prev.map((e) => (e.id === id ? original : e)))
    }
  }

  const deleteEntry = async (id: string) => {
    const original = entries.find((e) => e.id === id)
    setEntries((prev) => prev.filter((e) => e.id !== id))

    try {
      await NotionService.deleteEntry(id)
    } catch {
      if (original) setEntries((prev) => [original, ...prev])
    }
  }

  return { entries, loading, error, addEntry, updateEntry, deleteEntry, refresh: fetchEntries }
}
