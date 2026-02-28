/* eslint-disable react-refresh/only-export-components */
import { AlertTriangle, Clock, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entry } from '@/services/NotionService'

interface NotificationDropdownProps {
  entries: Entry[]
  onNavigateToTask?: (entry: Entry) => void
}

const priorityStyles: Record<string, { bg: string; text: string }> = {
  Low: { bg: 'bg-white/[0.05]', text: 'text-white/40' },
  Medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  High: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Urgent: { bg: 'bg-red-500/15', text: 'text-red-400' },
}

export function groupNotifications(entries: Entry[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

  const overdue: Entry[] = []
  const dueToday: Entry[] = []
  const dueThisWeek: Entry[] = []

  for (const entry of entries) {
    if (!entry.dueDate || entry.status === 'Done') continue
    const due = new Date(entry.dueDate + 'T00:00:00')
    if (due < today) {
      overdue.push(entry)
    } else if (due.getTime() === today.getTime()) {
      dueToday.push(entry)
    } else if (due <= endOfWeek) {
      dueThisWeek.push(entry)
    }
  }

  return { overdue, dueToday, dueThisWeek }
}

function NotificationItem({ entry, onNavigateToTask }: { entry: Entry; onNavigateToTask?: (entry: Entry) => void }) {
  const priority = priorityStyles[entry.priority] || priorityStyles['Low']
  const due = entry.dueDate ? new Date(entry.dueDate + 'T00:00:00') : null

  return (
    <button
      onClick={() => onNavigateToTask?.(entry)}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-white/[0.06]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/80 truncate">{entry.name}</p>
        <div className="mt-1 flex items-center gap-2">
          {due && (
            <span className="text-[10px] font-mono text-white/30">
              {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {entry.assignedTo && (
            <span className="text-[10px] text-white/30">{entry.assignedTo}</span>
          )}
          <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-medium', priority.bg, priority.text)}>
            {entry.priority}
          </span>
        </div>
      </div>
    </button>
  )
}

function NotificationGroup({ title, icon: Icon, entries, color, onNavigateToTask }: {
  title: string
  icon: typeof AlertTriangle
  entries: Entry[]
  color: string
  onNavigateToTask?: (entry: Entry) => void
}) {
  if (entries.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className={cn('h-3.5 w-3.5', color)} />
        <span className={cn('text-[10px] font-medium uppercase tracking-[0.1em]', color)}>{title}</span>
        <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-mono text-white/40">
          {entries.length}
        </span>
      </div>
      {entries.map((entry) => (
        <NotificationItem key={entry.id} entry={entry} onNavigateToTask={onNavigateToTask} />
      ))}
    </div>
  )
}

export function NotificationDropdown({ entries, onNavigateToTask }: NotificationDropdownProps) {
  const { overdue, dueToday, dueThisWeek } = groupNotifications(entries)
  const total = overdue.length + dueToday.length + dueThisWeek.length

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/[0.12] bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.03)] animate-fade-up">
      <div className="border-b border-white/[0.08] px-4 py-3">
        <p className="text-xs font-semibold text-white/80">Notifications</p>
        <p className="text-[10px] text-white/30 mt-0.5">{total} items need attention</p>
      </div>

      <div className="max-h-80 overflow-y-auto py-1.5">
        {total === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-white/30">No upcoming deadlines</p>
        ) : (
          <div className="space-y-1">
            <NotificationGroup title="Overdue" icon={AlertTriangle} entries={overdue} color="text-red-400" onNavigateToTask={onNavigateToTask} />
            <NotificationGroup title="Due Today" icon={Clock} entries={dueToday} color="text-yellow-400" onNavigateToTask={onNavigateToTask} />
            <NotificationGroup title="Due This Week" icon={CalendarDays} entries={dueThisWeek} color="text-blue-400" onNavigateToTask={onNavigateToTask} />
          </div>
        )}
      </div>
    </div>
  )
}
