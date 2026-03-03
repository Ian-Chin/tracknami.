import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, WorkspaceUser } from '@/services/NotionService'

interface EditProjectModalProps {
  project: Project | null
  onClose: () => void
  onSubmit: (id: string, data: { name?: string; state?: string; date?: string; category?: string[] }) => Promise<unknown>
  workspaceUsers: WorkspaceUser[]
}

export function EditProjectModal({ project, onClose, onSubmit, workspaceUsers }: EditProjectModalProps) {
  const [name, setName] = useState('')
  const [state, setState] = useState('Not Start')
  const [date, setDate] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([])
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setState(project.state)
      setDate(project.date || '')
      setCategoryInput(project.category.join(', '))
      setSelectedPersonIds(project.person.map((p) => p.id))
    }
  }, [project])

  if (!project) return null

  const togglePerson = (id: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const category = categoryInput.trim()
        ? categoryInput.split(',').map((c) => c.trim()).filter(Boolean)
        : []
      await onSubmit(project.id, {
        name: name.trim(),
        state,
        date: date || undefined,
        category,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUsers = workspaceUsers.filter((u) => selectedPersonIds.includes(u.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#111111] p-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] animate-fade-up">
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-linear-to-r from-transparent via-white/[0.25] to-transparent" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Edit Project</h2>
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

          {/* Person multi-select */}
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">People</label>
            {selectedUsers.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => togglePerson(u.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] border border-white/[0.12] px-2.5 py-1 text-xs text-white/70 transition-all hover:bg-white/[0.12]"
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.15] text-[9px] font-semibold text-white/60">
                        {u.name.charAt(0)}
                      </span>
                    )}
                    {u.name}
                    <X className="h-3 w-3 text-white/40" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPersonDropdownOpen(!personDropdownOpen)}
                className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-left text-sm text-white/40 outline-none transition-all hover:border-white/[0.15]"
              >
                {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : 'Select people...'}
              </button>
              {personDropdownOpen && workspaceUsers.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/[0.12] bg-[#1a1a1a] py-1 shadow-lg">
                  {workspaceUsers.map((u) => {
                    const selected = selectedPersonIds.includes(u.id)
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => togglePerson(u.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06]',
                          selected ? 'text-white/90' : 'text-white/50'
                        )}
                      >
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.15] text-[10px] font-semibold text-white/60">
                            {u.name.charAt(0)}
                          </span>
                        )}
                        <span className="flex-1">{u.name}</span>
                        {selected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
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
