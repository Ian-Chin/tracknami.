import { useMemo } from 'react'
import { ArrowLeft, Plus, CheckSquare, Square, Pencil, Trash2, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, Task } from '@/services/NotionService'

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  '5': { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Urgent' },
  '4': { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'High' },
  '3': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Medium' },
  '2': { bg: 'bg-white/[0.06]', text: 'text-white/40', label: 'Low' },
}

const stateStyles: Record<string, { bg: string; text: string; dot: string }> = {
  'Not Start': { bg: 'bg-white/[0.06]', text: 'text-white/50', dot: 'bg-white/40' },
  'In Progress': { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Completed': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
}

interface ProjectDetailViewProps {
  project: Project
  tasks: Task[]
  onBack: () => void
  onAddTask: () => void
  onToggleComplete: (id: string, completed: boolean) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function ProjectDetailView({ project, tasks, onBack, onAddTask, onToggleComplete, onEditTask, onDeleteTask }: ProjectDetailViewProps) {
  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === project.id), [tasks, project.id])
  const doneCount = projectTasks.filter((t) => t.completed).length
  const state = stateStyles[project.state] || stateStyles['Not Start']

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="glow-card overflow-hidden">
        <div className="relative z-10 p-6">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-xs font-medium text-white/40 transition-all hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.1]">
                <FolderKanban className="h-5 w-5 text-white/50" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white/90">{project.name}</h1>
                <div className="mt-1 flex items-center gap-3">
                  <span className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium', state.bg, state.text)}>
                    <div className={cn('h-1.5 w-1.5 rounded-full', state.dot)} />
                    {project.state}
                  </span>
                  {project.date && (
                    <span className="text-xs text-white/35">
                      {new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onAddTask}
              className="flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-5 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Progress</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      project.progress >= 1 ? 'bg-emerald-400' : project.progress > 0 ? 'bg-blue-400' : 'bg-white/20'
                    )}
                    style={{ width: `${Math.round(project.progress * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white/40">{Math.round(project.progress * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Tasks</span>
              <span className="text-xs font-mono text-white/60">{projectTasks.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Done</span>
              <span className="text-xs font-mono text-emerald-400">{doneCount}</span>
            </div>
            {project.category.length > 0 && (
              <div className="flex items-center gap-1.5">
                {project.category.map((cat) => (
                  <span key={cat} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40">{cat}</span>
                ))}
              </div>
            )}
          </div>

          {/* Person avatars */}
          {project.person.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-white/30">Team</span>
              <div className="flex -space-x-1.5">
                {project.person.map((p) => (
                  <div key={p.id} title={p.name} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.1] border border-white/[0.15] text-[10px] font-semibold text-white/60 overflow-hidden">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks list */}
      <div className="glow-card overflow-hidden animate-fade-up stagger-2">
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-white/80">Project Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                {doneCount} done
              </span>
              <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
                {projectTasks.length}
              </span>
            </div>
          </div>

          {projectTasks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-white/40">No tasks in this project yet</p>
              <button
                onClick={onAddTask}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition-all hover:text-white/80"
              >
                <Plus className="h-3.5 w-3.5" />
                Add the first task
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['', 'Name', 'Priority', 'Date', 'Est. Time', ''].map((h, idx) => (
                      <th key={`${h}-${idx}`} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                        {h || <span className="sr-only">{idx === 0 ? 'Status' : 'Actions'}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectTasks.map((task, i) => {
                    const pri = task.priority ? priorityStyles[task.priority] || null : null
                    return (
                      <tr
                        key={task.id}
                        className={cn(
                          'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                          `stagger-${Math.min(i + 1, 8)}`
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
                          <span className="text-xs text-white/35">{task.estimatedTime || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => onEditTask(task)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-white/[0.1] hover:text-white/70"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
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
          )}
        </div>
      </div>
    </div>
  )
}
