import { useState, useCallback } from 'react'
import { NotionService, type AIInsight } from '@/services/NotionService'

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTaskInsights = useCallback(async (entries: { name: string; status: string; priority: string; dueDate: string | null; assignedTo: string }[]) => {
    setLoading(true)
    setError(null)
    try {
      const data = await NotionService.getTaskInsights(entries)
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI insights')
    } finally {
      setLoading(false)
    }
  }, [])

  const getSalesAnalysis = useCallback(async (deals: { name: string; client: string; amount: number; stage: string; salesRep: string; closeDate: string | null }[]) => {
    setLoading(true)
    setError(null)
    try {
      const data = await NotionService.getSalesAnalysis(deals)
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sales analysis')
    } finally {
      setLoading(false)
    }
  }, [])

  const getSummary = useCallback(async (data: { entries: unknown[]; deals: unknown[] }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await NotionService.getAISummary(data)
      setInsights(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI summary')
    } finally {
      setLoading(false)
    }
  }, [])

  return { insights, loading, error, getTaskInsights, getSalesAnalysis, getSummary }
}
