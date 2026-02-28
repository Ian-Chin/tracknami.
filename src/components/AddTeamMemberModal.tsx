import { useState } from 'react'
import { X } from 'lucide-react'
import type { CreateTeamMemberInput } from '@/services/NotionService'

interface AddTeamMemberModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTeamMemberInput) => Promise<unknown>
}

export function AddTeamMemberModal({ open, onClose, onSubmit }: AddTeamMemberModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('Available')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        role: role.trim() || undefined,
        email: email.trim() || undefined,
        department: department || undefined,
        status,
      })
      setName('')
      setRole('')
      setEmail('')
      setDepartment('')
      setStatus('Available')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#111111] p-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] animate-fade-up">
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-linear-to-r from-transparent via-white/[0.25] to-transparent" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Add Team Member</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name..."
              autoFocus
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option value="">Select...</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Operations</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/70 outline-none transition-all focus:border-white/[0.25]"
              >
                <option>Available</option>
                <option>On Leave</option>
                <option>MC</option>
                <option>Remote</option>
              </select>
            </div>
          </div>

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
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
