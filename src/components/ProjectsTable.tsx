import { useState } from 'react'
import { Pencil, Trash2, FolderKanban, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/services/NotionService'

const PAGE_SIZE = 10

interface ProjectsTableProps {
  projects: Project[]
  loading: boolean
  onDelete: (id: string) => void
  onEdit: (project: Project) => void
  onStateChange: (id: string, state: string) => void
}

const stateStyles: Record<string, { bg: string; text: string; dot: string }> = {
  'Not Start': { bg: 'bg-white/[0.06]', text: 'text-white/50', dot: 'bg-white/40' },
  'In Progress': { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Completed': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
}

const STATES = ['Not Start', 'In Progress', 'Completed']

export function ProjectsTable({ projects, loading, onDelete, onEdit, onStateChange }: ProjectsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(projects.length / PAGE_SIZE)
  const safePage = Math.min(currentPage, Math.max(1, totalPages))
  const paginated = projects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (safePage !== currentPage) setCurrentPage(safePage)

  if (loading) {
    return (
      <div className="glow-card">
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
          <p className="mt-4 text-sm text-white/35">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="glow-card animate-fade-up">
        <div className="relative z-10 p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
            <FolderKanban className="h-6 w-6 text-white/30" />
          </div>
          <p className="mt-4 text-sm font-medium text-white/60">No projects yet</p>
          <p className="mt-1.5 text-xs text-white/30">Create your first project to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glow-card animate-fade-up stagger-5 overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-white/80">Projects</h2>
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
            {projects.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'State', 'Progress', 'Category', 'Person', 'Date', 'Tasks', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((project, i) => {
                const state = stateStyles[project.state] || stateStyles['Not Start']

                return (
                  <tr
                    key={project.id}
                    className={cn(
                      'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                      `stagger-${Math.min(i + 1, 8)}`,
                      project.id.startsWith('temp-') && 'animate-pulse opacity-40'
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-white/90">{project.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => {
                          const idx = STATES.indexOf(project.state)
                          const next = STATES[(idx + 1) % STATES.length]
                          onStateChange(project.id, next)
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:scale-105',
                          state.bg, state.text
                        )}
                      >
                        <div className={cn('h-1.5 w-1.5 rounded-full', state.dot)} />
                        {project.state}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              project.progress >= 1 ? 'bg-emerald-400' : project.progress > 0 ? 'bg-blue-400' : 'bg-white/20'
                            )}
                            style={{ width: `${Math.round(project.progress * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-white/35">
                          {Math.round(project.progress * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {project.category.length > 0 ? project.category.map((cat) => (
                          <span key={cat} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40">
                            {cat}
                          </span>
                        )) : (
                          <span className="text-xs text-white/20">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex -space-x-1.5">
                        {project.person.length > 0 ? project.person.map((p) => (
                          <div key={p.id} title={p.name} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.1] border border-white/[0.15] text-[9px] font-semibold text-white/60 overflow-hidden">
                            {p.avatar ? (
                              <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              p.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        )) : (
                          <span className="text-xs text-white/20">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-white/35">
                        {project.date
                          ? new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-white/35">
                        {project.taskIds.length}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(project)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-white/[0.1] hover:text-white/70"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(project.id)}
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
