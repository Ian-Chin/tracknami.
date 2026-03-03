import { useState } from 'react'
import { Pencil, Trash2, CheckSquare, Square, ListChecks, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, Project } from '@/services/NotionService'

const PAGE_SIZE = 10

interface TasksTableProps {
  tasks: Task[]
  projects: Project[]
  loading: boolean
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onToggleComplete: (id: string, completed: boolean) => void
}

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  '5': { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Urgent' },
  '4': { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'High' },
  '3': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Medium' },
  '2': { bg: 'bg-white/[0.06]', text: 'text-white/40', label: 'Low' },
}

export function TasksTable({ tasks, projects, loading, onDelete, onEdit, onToggleComplete }: TasksTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE)
  const safePage = Math.min(currentPage, Math.max(1, totalPages))
  const paginated = tasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (safePage !== currentPage) setCurrentPage(safePage)

  const projectMap = new Map(projects.map((p) => [p.id, p.name]))

  if (loading) {
    return (
      <div className="glow-card">
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
          <p className="mt-4 text-sm text-white/35">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="glow-card animate-fade-up">
        <div className="relative z-10 p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
            <ListChecks className="h-6 w-6 text-white/30" />
          </div>
          <p className="mt-4 text-sm font-medium text-white/60">No tasks yet</p>
          <p className="mt-1.5 text-xs text-white/30">Create your first task to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glow-card animate-fade-up stagger-5 overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-white/80">Tasks</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              {tasks.filter((t) => t.completed).length} done
            </span>
            <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
              {tasks.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['', 'Name', 'Project', 'Priority', 'Date', 'Est. Time', ''].map((h, idx) => (
                  <th key={`${h}-${idx}`} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                    {h || <span className="sr-only">{idx === 0 ? 'Status' : 'Actions'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((task, i) => {
                const pri = task.priority ? priorityStyles[task.priority] || null : null

                return (
                  <tr
                    key={task.id}
                    className={cn(
                      'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                      `stagger-${Math.min(i + 1, 8)}`,
                      task.id.startsWith('temp-') && 'animate-pulse opacity-40'
                    )}
                  >
                    <td className="px-5 py-3.5 w-10">
                      <button
                        onClick={() => onToggleComplete(task.id, !task.completed)}
                        className="text-white/40 transition-all hover:text-white/70"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'text-sm font-medium',
                        task.completed ? 'text-white/30 line-through' : 'text-white/90'
                      )}>
                        {task.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-white/35">
                        {task.projectId ? projectMap.get(task.projectId) || '—' : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {pri ? (
                        <span className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium', pri.bg, pri.text)}>
                          {pri.label}
                        </span>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-white/35">
                        {task.date
                          ? (() => {
                              const start = new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              if (task.endDate) {
                                const end = new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                return `${start} → ${end}`
                              }
                              return start
                            })()
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-white/35">
                        {task.estimatedTime || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(task)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-white/[0.1] hover:text-white/70"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
