import { useState, useEffect, useCallback } from 'react'
import { NotionService, type TeamMember, type CreateTeamMemberInput } from '@/services/NotionService'

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotionService.getTeam()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const addMember = async (input: CreateTeamMemberInput) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: TeamMember = {
      id: tempId,
      name: input.name,
      role: input.role || '',
      status: input.status || 'Available',
      email: input.email || '',
      department: input.department || '',
    }
    setMembers((prev) => [optimistic, ...prev])

    try {
      const created = await NotionService.createTeamMember(input)
      setMembers((prev) => prev.map((m) => (m.id === tempId ? created : m)))
      return created
    } catch (err) {
      setMembers((prev) => prev.filter((m) => m.id !== tempId))
      throw err
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const original = members.find((m) => m.id === id)
    if (!original) return

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    )

    try {
      const updated = await NotionService.updateTeamStatus(id, status)
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)))
    } catch {
      setMembers((prev) => prev.map((m) => (m.id === id ? original : m)))
    }
  }

  return { members, loading, error, addMember, updateStatus, refresh: fetchTeam }
}
