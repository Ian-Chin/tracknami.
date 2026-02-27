export interface Entry {
  id: string
  name: string
  status: string
  priority: string
  date: string | null
  createdAt: string
}

export interface CreateEntryInput {
  name: string
  status?: string
  priority?: string
  date?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  status: string
  email: string
  department: string
}

export interface LeaveRecord {
  id: string
  title: string
  member: string
  type: string
  startDate: string | null
  endDate: string | null
}

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const NotionService = {
  healthCheck: () => request<{ ok: boolean; user: string }>('/health'),

  getEntries: () => request<Entry[]>('/entries'),

  createEntry: (data: CreateEntryInput) =>
    request<Entry>('/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEntry: (id: string, data: Partial<CreateEntryInput>) =>
    request<Entry>(`/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteEntry: (id: string) =>
    request<{ ok: boolean }>(`/entries/${id}`, {
      method: 'DELETE',
    }),

  getTeam: () => request<TeamMember[]>('/team'),

  updateTeamStatus: (id: string, status: string) =>
    request<TeamMember>(`/team/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getLeaveRecords: () => request<LeaveRecord[]>('/leave'),
}
