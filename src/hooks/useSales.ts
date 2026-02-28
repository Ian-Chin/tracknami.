import { useState, useEffect, useCallback } from 'react'
import { NotionService, type SalesDeal, type CreateSalesDealInput } from '@/services/NotionService'

export function useSales() {
  const [deals, setDeals] = useState<SalesDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getSales()
      setDeals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const addDeal = async (input: CreateSalesDealInput) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: SalesDeal = {
      id: tempId,
      name: input.name,
      client: input.client || '',
      amount: input.amount || 0,
      stage: input.stage || 'Lead',
      salesRep: input.salesRep || '',
      closeDate: input.closeDate || null,
    }
    setDeals((prev) => [optimistic, ...prev])

    try {
      const created = await NotionService.createSale(input)
      setDeals((prev) => prev.map((d) => (d.id === tempId ? created : d)))
      return created
    } catch (err) {
      setDeals((prev) => prev.filter((d) => d.id !== tempId))
      throw err
    }
  }

  const updateDeal = async (id: string, data: Partial<CreateSalesDealInput>) => {
    const original = deals.find((d) => d.id === id)
    if (!original) return

    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)))

    try {
      const updated = await NotionService.updateSale(id, data)
      setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)))
    } catch {
      setDeals((prev) => prev.map((d) => (d.id === id ? original : d)))
    }
  }

  const deleteDeal = async (id: string) => {
    const original = deals.find((d) => d.id === id)
    setDeals((prev) => prev.filter((d) => d.id !== id))

    try {
      await NotionService.deleteSale(id)
    } catch {
      if (original) setDeals((prev) => [original, ...prev])
    }
  }

  return { deals, loading, error, addDeal, updateDeal, deleteDeal, refresh: fetchDeals }
}
