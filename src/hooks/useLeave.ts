import { useState, useEffect, useCallback } from 'react'
import { NotionService, type LeaveRecord } from '@/services/NotionService'

export function useLeave() {
  const [records, setRecords] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getLeaveRecords()
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { records, loading, error, refresh: fetchRecords }
}
