import { useMemo } from 'react'
import { X, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entry, TeamMember, TimeLog } from '@/services/NotionService'

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  entry: Entry | null
  teamMembers: TeamMember[]
  timeLogs: TimeLog[]
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  'Not Started': { bg: 'bg-white/[0.06]', text: 'text-white/50', dot: 'bg-white/40' },
  'In Progress': { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  Done: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
}

const priorityStyles: Record<string, { bg: string; text: string }> = {
  Low: { bg: 'bg-white/[0.05]', text: 'text-white/40' },
  Medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  High: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Urgent: { bg: 'bg-red-500/15', text: 'text-red-400' },
}

export function TaskDetailModal({ open, onClose, entry, teamMembers, timeLogs }: TaskDetailModalProps) {
  const entryLogs = useMemo(
    () => entry ? timeLogs.filter((l) => l.entryId === entry.id) : [],
    [timeLogs, entry]
  )

  const totalHours = useMemo(
    () => entryLogs.reduce((sum, l) => sum + l.hours, 0),
    [entryLogs]
  )

  if (!open || !entry) return null

  const status = statusStyles[entry.status] || statusStyles['Not Started']
  const priority = priorityStyles[entry.priority] || priorityStyles['Low']

  const resolveMemberName = (id: string) =>
    teamMembers.find((m) => m.id === id)?.name || 'Unknown'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#111111] p-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] animate-fade-up">
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-linear-to-r from-transparent via-white/[0.25] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{entry.name}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task info badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium', status.bg, status.text)}>
            <div className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            {entry.status}
          </span>
          <span className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium', priority.bg, priority.text)}>
            {entry.priority}
          </span>
          {entry.assignedTo && (
            <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50">
              {entry.assignedTo}
            </span>
          )}
          {entry.date && (
            <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {entry.dueDate && (() => {
            const due = new Date(entry.dueDate + 'T00:00:00')
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isOverdue = due < today && entry.status !== 'Done'
            const isToday = due.getTime() === today.getTime() && entry.status !== 'Done'
            return (
              <span className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium',
                isOverdue ? 'bg-red-500/15 text-red-400' : isToday ? 'bg-yellow-500/15 text-yellow-400' : 'bg-white/[0.06] text-white/40'
              )}>
                Due: {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {isOverdue && ' (overdue)'}
              </span>
            )
          })()}
        </div>

        {/* Description */}
        <div className="mt-5 border-t border-white/[0.08] pt-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-white/40" />
            <h3 className="text-sm font-medium text-white/70">Description</h3>
          </div>
          {entry.description ? (
            <p className="text-sm text-white/50 leading-relaxed">{entry.description}</p>
          ) : (
            <p className="text-xs text-white/25 italic">No description</p>
          )}
        </div>

        {/* Time spent */}
        <div className="mt-5 border-t border-white/[0.08] pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/40" />
              <h3 className="text-sm font-medium text-white/70">Time Spent</h3>
            </div>
            <span className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-[12px] font-mono font-semibold text-blue-400">
              {totalHours}h total
            </span>
          </div>

          {entryLogs.length === 0 ? (
            <p className="text-xs text-white/25 italic">No time logged</p>
          ) : (
            <div className="space-y-1.5">
              {entryLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 border border-white/[0.06]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/70">{resolveMemberName(log.memberId)}</span>
                      <span className="text-[10px] font-mono text-white/30">
                        {log.date
                          ? new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '---'}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="mt-0.5 text-[11px] text-white/30 truncate">{log.notes}</p>
                    )}
                  </div>
                  <span className="ml-3 rounded-lg bg-white/[0.06] px-2 py-0.5 text-[11px] font-mono font-medium text-white/50">
                    {log.hours}h
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
