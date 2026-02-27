import { useState } from 'react'
import { X } from 'lucide-react'
import type { CreateEntryInput } from '@/services/NotionService'

interface AddEntryModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateEntryInput) => Promise<unknown>
}

export function AddEntryModal({ open, onClose, onSubmit }: AddEntryModalProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('Not Started')
  const [priority, setPriority] = useState('Medium')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        status,
        priority,
        date: date || undefined,
      })
      setName('')
      setStatus('Not Started')
      setPriority('Medium')
      setDate('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#111111] p-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] animate-fade-up">
        {/* Top glow line */}
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.25] to-transparent" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">New Entry</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter entry name..."
              autoFocus
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 text-sm font-medium text-white/50 transition-all hover:border-white/[0.15] hover:text-white/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97] disabled:opacity-30"
            >
              {submitting ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
