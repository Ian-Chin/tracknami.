import { useState } from 'react'
import { X } from 'lucide-react'
import type { CreateProjectInput } from '@/services/NotionService'

interface AddProjectModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateProjectInput) => Promise<unknown>
}

export function AddProjectModal({ open, onClose, onSubmit }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [state, setState] = useState('Not Start')
  const [date, setDate] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const category = categoryInput.trim()
        ? categoryInput.split(',').map((c) => c.trim()).filter(Boolean)
        : undefined
      await onSubmit({
        name: name.trim(),
        state,
        date: date || undefined,
        category,
      })
      setName('')
      setState('Not Start')
      setDate('')
      setCategoryInput('')
      onClose()
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
          <h2 className="text-base font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name..."
              autoFocus
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option>Not Start</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">Category</label>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="e.g. iunami extension, Bajetto Web"
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25]"
            />
            <p className="mt-1 text-[10px] text-white/25">Comma-separated</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 text-sm font-medium text-white/50 transition-all hover:border-white/[0.15] hover:text-white/70">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || submitting} className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97] disabled:opacity-30">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
