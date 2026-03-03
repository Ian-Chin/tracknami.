export interface Project {
  id: string
  name: string
  state: string
  stateColor: string
  date: string | null
  category: string[]
  person: { id: string; name: string; avatar: string | null }[]
  progress: number
  taskStats: string
  taskIds: string[]
  createdAt: string
}

export interface Task {
  id: string
  name: string
  projectId: string | null
  completed: boolean
  date: string | null
  endDate: string | null
  priority: string | null
  estimatedTime: string
  remind: string
  createdAt: string
}

export interface WorkspaceUser {
  id: string
  name: string
  avatar_url: string | null
}

export interface CreateProjectInput {
  name: string
  state?: string
  date?: string
  category?: string[]
  person?: string[]
}

export interface CreateTaskInput {
  name: string
  projectId?: string
  completed?: boolean
  date?: string
  endDate?: string
  priority?: string
  estimatedTime?: string
}

export interface TimeLog {
  id: string
  name: string
  hours: number
  date: string | null
  notes: string
  taskId: string | null
  projectId: string | null
  person: { id: string; name: string; avatar: string | null } | null
  createdAt: string
}

export interface CreateTimeLogInput {
  name: string
  hours: number
  date?: string
  notes?: string
  taskId?: string
  projectId?: string
  personId?: string
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

export interface LoginResponse {
  ok: boolean
  user: { id: string; name: string; email: string; role: string }
}

export const NotionService = {
  healthCheck: () => request<{ ok: boolean; user: string }>('/health'),
  getWorkspaceUsers: () => request<WorkspaceUser[]>('/workspace-users'),
  login: (email: string, password: string) =>
    request<LoginResponse>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: CreateProjectInput) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<CreateProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (data: CreateTaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<CreateTaskInput>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    request<{ ok: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  // Time Logs
  getTimeLogs: () => request<TimeLog[]>('/timelogs'),
  createTimeLog: (data: CreateTimeLogInput) =>
    request<TimeLog>('/timelogs', { method: 'POST', body: JSON.stringify(data) }),
  updateTimeLog: (id: string, data: Partial<CreateTimeLogInput>) =>
    request<TimeLog>(`/timelogs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTimeLog: (id: string) =>
    request<{ ok: boolean }>(`/timelogs/${id}`, { method: 'DELETE' }),
}
