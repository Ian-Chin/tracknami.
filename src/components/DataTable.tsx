import { Trash2, Calendar, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entry } from '@/services/NotionService'

interface DataTableProps {
  entries: Entry[]
  loading: boolean
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  'Not Started': {
    bg: 'bg-white/[0.06]',
    text: 'text-white/50',
    dot: 'bg-white/40',
  },
  'In Progress': {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  Done: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
}

const priorityStyles: Record<string, { bg: string; text: string }> = {
  Low: { bg: 'bg-white/[0.05]', text: 'text-white/40' },
  Medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  High: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Urgent: { bg: 'bg-red-500/15', text: 'text-red-400' },
}

export function DataTable({ entries, loading, onDelete, onStatusChange }: DataTableProps) {
  if (loading) {
    return (
      <div className="glow-card">
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
          <p className="mt-4 text-sm text-white/35">Loading entries from Notion...</p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="glow-card animate-fade-up">
        <div className="relative z-10 p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
            <Calendar className="h-6 w-6 text-white/30" />
          </div>
          <p className="mt-4 text-sm font-medium text-white/60">No entries yet</p>
          <p className="mt-1.5 text-xs text-white/30">
            Create your first entry to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glow-card animate-fade-up stagger-5 overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-white/80">Entries</h2>
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
            {entries.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Status', 'Priority', 'Date', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30"
                  >
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const status = statusStyles[entry.status] || statusStyles['Not Started']
                const priority = priorityStyles[entry.priority] || priorityStyles['Low']

                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                      `stagger-${Math.min(i + 1, 8)}`,
                      entry.id.startsWith('temp-') && 'animate-pulse opacity-40'
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-white/90">{entry.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => {
                          const statuses = ['Not Started', 'In Progress', 'Done']
                          const idx = statuses.indexOf(entry.status)
                          const next = statuses[(idx + 1) % statuses.length]
                          onStatusChange(entry.id, next)
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:scale-105',
                          status.bg, status.text
                        )}
                      >
                        <div className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                        {entry.status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-[11px] font-medium',
                          priority.bg, priority.text
                        )}
                      >
                        {entry.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-white/35">
                        {entry.date
                          ? new Date(entry.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '---'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-red-500/15 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-white/[0.08] hover:text-white/60">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
