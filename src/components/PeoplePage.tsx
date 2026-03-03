import { useMemo } from 'react'
import { Users, CheckSquare, Square, FolderKanban, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, Task, TimeLog } from '@/services/NotionService'

interface PeoplePageProps {
  projects: Project[]
  tasks: Task[]
  timeLogs: TimeLog[]
  loading: boolean
}

interface PersonData {
  id: string
  name: string
  avatar: string | null
  projectCount: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalHours: number
  taskList: { id: string; name: string; completed: boolean; projectName: string; priority: string | null }[]
}

export function PeoplePage({ projects, tasks, timeLogs, loading }: PeoplePageProps) {
  const people = useMemo(() => {
    // Build task lookup by id
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    // Build a set of taskIds per person (to match time logs)
    const personTaskIds = new Map<string, Set<string>>()
    // Build a set of projectIds per person (to match time logs by project)
    const personProjectIds = new Map<string, Set<string>>()

    // Collect people from projects
    const peopleMap = new Map<string, PersonData>()

    for (const project of projects) {
      for (const person of project.person) {
        let data = peopleMap.get(person.id)
        if (!data) {
          data = {
            id: person.id,
            name: person.name,
            avatar: person.avatar,
            projectCount: 0,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            totalHours: 0,
            taskList: [],
          }
          peopleMap.set(person.id, data)
          personTaskIds.set(person.id, new Set())
          personProjectIds.set(person.id, new Set())
        }

        data.projectCount++
        personProjectIds.get(person.id)!.add(project.id)

        // Get tasks for this project
        for (const taskId of project.taskIds) {
          const task = taskMap.get(taskId)
          if (!task) continue
          data.totalTasks++
          if (task.completed) data.completedTasks++
          else data.pendingTasks++
          personTaskIds.get(person.id)!.add(taskId)
          data.taskList.push({
            id: task.id,
            name: task.name,
            completed: task.completed,
            projectName: project.name,
            priority: task.priority,
          })
        }
      }
    }

    // Sum hours from time logs for each person
    for (const log of timeLogs) {
      // Direct match: time log has a person assigned
      if (log.person) {
        const data = peopleMap.get(log.person.id)
        if (data) {
          data.totalHours += log.hours
          continue
        }
      }
      // Fallback: match by task or project association
      for (const [personId, taskIds] of personTaskIds) {
        const projectIds = personProjectIds.get(personId)!
        if ((log.taskId && taskIds.has(log.taskId)) || (log.projectId && projectIds.has(log.projectId))) {
          const data = peopleMap.get(personId)
          if (data) data.totalHours += log.hours
        }
      }
    }

    // Sort by total tasks descending
    return [...peopleMap.values()].sort((a, b) => b.totalTasks - a.totalTasks)
  }, [projects, tasks, timeLogs])

  if (loading) {
    return (
      <div className="glow-card">
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
          <p className="mt-4 text-sm text-white/35">Loading people...</p>
        </div>
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="glow-card animate-fade-up">
        <div className="relative z-10 p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
            <Users className="h-6 w-6 text-white/30" />
          </div>
          <p className="mt-4 text-sm font-medium text-white/60">No people found</p>
          <p className="mt-1.5 text-xs text-white/30">Assign people to projects in Notion to see them here</p>
        </div>
      </div>
    )
  }

  const priorityLabel: Record<string, string> = { '5': 'Urgent', '4': 'High', '3': 'Medium', '2': 'Low' }
  const priorityColor: Record<string, string> = {
    '5': 'text-red-400 bg-red-500/15',
    '4': 'text-orange-400 bg-orange-500/15',
    '3': 'text-yellow-400 bg-yellow-500/15',
    '2': 'text-white/40 bg-white/[0.06]',
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up">
        {people.map((person, i) => (
          <div
            key={person.id}
            className={cn('glow-card animate-fade-up', `stagger-${Math.min(i + 1, 8)}`)}
          >
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.1] border border-white/[0.15] overflow-hidden shrink-0">
                  {person.avatar ? (
                    <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-white/60">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{person.name}</p>
                  <p className="text-[11px] text-white/35">
                    {person.projectCount} project{person.projectCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-white/[0.04] p-2.5 text-center">
                  <p className="text-lg font-bold text-white/80">{person.totalTasks}</p>
                  <p className="text-[10px] text-white/30">Total</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-400">{person.completedTasks}</p>
                  <p className="text-[10px] text-emerald-400/50">Done</p>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-2.5 text-center">
                  <p className="text-lg font-bold text-yellow-400">{person.pendingTasks}</p>
                  <p className="text-[10px] text-yellow-400/50">Pending</p>
                </div>
                <div className="rounded-lg bg-cyan-500/10 p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    <p className="text-lg font-bold text-cyan-400">{person.totalHours.toFixed(1)}</p>
                  </div>
                  <p className="text-[10px] text-cyan-400/50">Hours</p>
                </div>
              </div>

              {/* Progress bar */}
              {person.totalTasks > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${Math.round((person.completedTasks / person.totalTasks) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-white/25 text-right">
                    {Math.round((person.completedTasks / person.totalTasks) * 100)}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task lists per person */}
      {people.map((person, pi) => (
        <div key={person.id} className={cn('glow-card animate-fade-up overflow-hidden', `stagger-${Math.min(pi + 3, 8)}`)}>
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.1] border border-white/[0.15] overflow-hidden shrink-0">
                  {person.avatar ? (
                    <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-semibold text-white/60">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-white/80">{person.name}'s Tasks</h2>
              </div>
              <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
                {person.taskList.length}
              </span>
            </div>

            {person.taskList.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-white/30">No tasks assigned</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['', 'Task', 'Project', 'Priority'].map((h, idx) => (
                        <th key={`${h}-${idx}`} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                          {h || <span className="sr-only">Status</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {person.taskList.map((task, i) => (
                      <tr
                        key={task.id}
                        className={cn(
                          'border-b border-white/[0.05] last:border-0 transition-all hover:bg-white/[0.03] animate-fade-up',
                          `stagger-${Math.min(i + 1, 8)}`
                        )}
                      >
                        <td className="px-5 py-3 w-10">
                          {task.completed ? (
                            <CheckSquare className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Square className="h-4 w-4 text-white/25" />
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            'text-sm font-medium',
                            task.completed ? 'text-white/30 line-through' : 'text-white/90'
                          )}>
                            {task.name}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <FolderKanban className="h-3 w-3 text-white/20" />
                            <span className="text-xs text-white/35">{task.projectName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {task.priority ? (
                            <span className={cn(
                              'rounded-lg px-2.5 py-1 text-[11px] font-medium',
                              priorityColor[task.priority] || 'text-white/40 bg-white/[0.06]'
                            )}>
                              {priorityLabel[task.priority] || task.priority}
                            </span>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
