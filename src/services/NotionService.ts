export interface Entry {
  id: string
  name: string
  description: string
  status: string
  priority: string
  date: string | null
  assignedTo: string
  dueDate: string | null
  createdAt: string
}

export interface CreateEntryInput {
  name: string
  status?: string
  priority?: string
  date?: string
  assignedTo?: string
  dueDate?: string
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

export interface TimeLog {
  id: string
  name: string
  entryId: string
  memberId: string
  hours: number
  date: string | null
  notes: string
}

export interface CreateTimeLogInput {
  entryId: string
  memberId: string
  hours: number
  date: string
  notes?: string
  name?: string
}

export interface SalesDeal {
  id: string
  name: string
  client: string
  amount: number
  stage: string
  salesRep: string
  closeDate: string | null
}

export interface CreateSalesDealInput {
  name: string
  client?: string
  amount?: number
  stage?: string
  salesRep?: string
  closeDate?: string
}

export interface AIInsight {
  type: 'warning' | 'suggestion' | 'summary' | 'opportunity' | 'risk'
  title: string
  description: string
}

export interface CreateTeamMemberInput {
  name: string
  role?: string
  email?: string
  department?: string
  status?: string
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

  createTeamMember: (data: CreateTeamMemberInput) =>
    request<TeamMember>('/team', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTeamStatus: (id: string, status: string) =>
    request<TeamMember>(`/team/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getLeaveRecords: () => request<LeaveRecord[]>('/leave'),

  getAllTimeLogs: () => request<TimeLog[]>('/time-logs'),

  getTimeLogs: (entryId: string) =>
    request<TimeLog[]>(`/time-logs?entryId=${encodeURIComponent(entryId)}`),

  createTimeLog: (data: CreateTimeLogInput) =>
    request<TimeLog>('/time-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Sales
  getSales: () => request<SalesDeal[]>('/sales'),

  createSale: (data: CreateSalesDealInput) =>
    request<SalesDeal>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSale: (id: string, data: Partial<CreateSalesDealInput>) =>
    request<SalesDeal>(`/sales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteSale: (id: string) =>
    request<{ ok: boolean }>(`/sales/${id}`, {
      method: 'DELETE',
    }),

  // AI Insights
  getTaskInsights: (entries: { name: string; status: string; priority: string; dueDate: string | null; assignedTo: string }[]) =>
    request<AIInsight[]>('/ai/task-insights', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    }),

  getSalesAnalysis: (deals: { name: string; client: string; amount: number; stage: string; salesRep: string; closeDate: string | null }[]) =>
    request<AIInsight[]>('/ai/sales-analysis', {
      method: 'POST',
      body: JSON.stringify({ deals }),
    }),

  getAISummary: (data: { entries: unknown[]; deals: unknown[] }) =>
    request<AIInsight[]>('/ai/summary', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
