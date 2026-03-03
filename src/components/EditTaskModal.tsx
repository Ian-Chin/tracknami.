import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Task, Project } from '@/services/NotionService'

interface EditTaskModalProps {
  task: Task | null
  onClose: () => void
  onSubmit: (id: string, data: { name?: string; projectId?: string; priority?: string; date?: string; endDate?: string; estimatedTime?: string }) => Promise<unknown>
  projects: Project[]
}

export function EditTaskModal({ task, onClose, onSubmit, projects }: EditTaskModalProps) {
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState('')
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setName(task.name)
      setProjectId(task.projectId || '')
      setPriority(task.priority || '')
      setDate(task.date || '')
      setEndDate(task.endDate || '')
      setEstimatedTime(task.estimatedTime || '')
    }
  }, [task])

  if (!task) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(task.id, {
        name: name.trim(),
        projectId: projectId || undefined,
        priority: priority || undefined,
        date: date || undefined,
        endDate: endDate || undefined,
        estimatedTime: estimatedTime.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#111111] p-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] animate-fade-up">
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-linear-to-r from-transparent via-white/[0.25] to-transparent" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Edit Task</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Task name..."
              autoFocus
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option value="">None</option>
                <option value="2">Low</option>
                <option value="3">Medium</option>
                <option value="4">High</option>
                <option value="5">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Start Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Estimated Time</label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 2 hours"
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 text-sm font-medium text-white/50 transition-all hover:border-white/[0.15] hover:text-white/70">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || submitting} className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97] disabled:opacity-30">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
