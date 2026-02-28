import { useState } from 'react'
import { Trash2, Calendar, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entry } from '@/services/NotionService'
import type { TeamMember } from '@/services/NotionService'

const PAGE_SIZE = 10

interface DataTableProps {
  entries: Entry[]
  loading: boolean
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  onAssignChange?: (id: string, assignedTo: string) => void
  onRowClick?: (entry: Entry) => void
  teamMembers?: TeamMember[]
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

export function DataTable({ entries, loading, onDelete, onStatusChange, onAssignChange, onRowClick, teamMembers = [] }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(entries.length / PAGE_SIZE)
  const safePage = Math.min(currentPage, Math.max(1, totalPages))
  const paginatedEntries = entries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (safePage !== currentPage) {
    setCurrentPage(safePage)
  }

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
                {['Name', 'Status', 'Priority', 'Assigned To', 'Date', 'Due Date', ''].map((h) => (
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
              {paginatedEntries.map((entry, i) => {
                const status = statusStyles[entry.status] || statusStyles['Not Started']
                const priority = priorityStyles[entry.priority] || priorityStyles['Low']

                return (
                  <tr
                    key={entry.id}
                    onClick={() => onRowClick?.(entry)}
                    className={cn(
                      'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                      `stagger-${Math.min(i + 1, 8)}`,
                      entry.id.startsWith('temp-') && 'animate-pulse opacity-40',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-white/90">{entry.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
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
                      {teamMembers.length > 0 && onAssignChange ? (
                        <select
                          value={entry.assignedTo || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onAssignChange(entry.id, e.target.value)}
                          className="cursor-pointer rounded-lg border-0 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50 outline-none transition-all hover:bg-white/[0.1]"
                        >
                          <option value="">Unassigned</option>
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-white/35">
                          {entry.assignedTo || '—'}
                        </span>
                      )}
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
                      {entry.dueDate ? (() => {
                        const due = new Date(entry.dueDate + 'T00:00:00')
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isOverdue = due < today && entry.status !== 'Done'
                        const isToday = due.getTime() === today.getTime() && entry.status !== 'Done'
                        return (
                          <span className={cn(
                            'text-xs font-mono',
                            isOverdue ? 'text-red-400 font-semibold' : isToday ? 'text-yellow-400' : 'text-white/35'
                          )}>
                            {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {isOverdue && <span className="ml-1 text-[10px]">overdue</span>}
                          </span>
                        )
                      })() : (
                        <span className="text-xs font-mono text-white/35">---</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs font-mono text-white/40">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 disabled:opacity-30 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
