import { useMemo } from 'react'
import { Clock, Trash2, FolderKanban, ListChecks, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimeLog, Task, Project } from '@/services/NotionService'

interface TimeLogPageProps {
  timeLogs: TimeLog[]
  tasks: Task[]
  projects: Project[]
  loading: boolean
  onDelete: (id: string) => void
}

export function TimeLogPage({ timeLogs, tasks, projects, loading, onDelete }: TimeLogPageProps) {
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t.name])), [tasks])
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects])

  const totalHours = useMemo(() => timeLogs.reduce((sum, l) => sum + l.hours, 0), [timeLogs])

  if (loading) {
    return (
      <div className="glow-card">
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
          <p className="mt-4 text-sm text-white/35">Loading time logs...</p>
        </div>
      </div>
    )
  }

  if (timeLogs.length === 0) {
    return (
      <div className="glow-card animate-fade-up">
        <div className="relative z-10 p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
            <Clock className="h-6 w-6 text-white/30" />
          </div>
          <p className="mt-4 text-sm font-medium text-white/60">No time logs yet</p>
          <p className="mt-1.5 text-xs text-white/30">Click "Log Time" to record your first entry</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up">
        <div className="glow-card">
          <div className="relative z-10 p-5 text-center">
            <p className="text-2xl font-bold text-white/80">{timeLogs.length}</p>
            <p className="text-[11px] text-white/35">Total Entries</p>
          </div>
        </div>
        <div className="glow-card">
          <div className="relative z-10 p-5 text-center">
            <p className="text-2xl font-bold text-cyan-400">{totalHours.toFixed(1)}</p>
            <p className="text-[11px] text-cyan-400/50">Total Hours</p>
          </div>
        </div>
        <div className="glow-card">
          <div className="relative z-10 p-5 text-center">
            <p className="text-2xl font-bold text-purple-400">{timeLogs.length > 0 ? (totalHours / timeLogs.length).toFixed(1) : '0'}</p>
            <p className="text-[11px] text-purple-400/50">Avg Hours/Entry</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glow-card animate-fade-up stagger-2 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-white/80">Time Entries</h2>
            <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
              {timeLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Description', 'Person', 'Task', 'Project', 'Hours', 'Date', 'Notes', ''].map((h, idx) => (
                    <th key={`${h}-${idx}`} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                      {h || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeLogs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={cn(
                      'border-b border-white/[0.05] last:border-0 transition-all hover:bg-white/[0.03] animate-fade-up',
                      `stagger-${Math.min(i + 1, 8)}`
                    )}
                  >
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-white/90">{log.name}</span>
                    </td>
                    <td className="px-5 py-3">
                      {log.person ? (
                        <div className="flex items-center gap-1.5">
                          {log.person.avatar ? (
                            <img src={log.person.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                          ) : (
                            <User className="h-3 w-3 text-white/20" />
                          )}
                          <span className="text-xs text-white/50">{log.person.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {log.taskId ? (
                        <div className="flex items-center gap-1.5">
                          <ListChecks className="h-3 w-3 text-white/20" />
                          <span className="text-xs text-white/35">{taskMap.get(log.taskId) || 'Unknown'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {log.projectId ? (
                        <div className="flex items-center gap-1.5">
                          <FolderKanban className="h-3 w-3 text-white/20" />
                          <span className="text-xs text-white/35">{projectMap.get(log.projectId) || 'Unknown'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-lg bg-cyan-500/15 px-2.5 py-1 text-[11px] font-medium text-cyan-400">
                        {log.hours}h
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-white/40">
                        {log.date || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-white/35 max-w-[200px] truncate block">
                        {log.notes || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 w-10">
                      <button
                        onClick={() => onDelete(log.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 transition-all hover:bg-red-500/15 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
