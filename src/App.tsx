import { useState, useMemo } from 'react'
import { Sidebar, type Page } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { ProjectsTable } from '@/components/ProjectsTable'
import { TasksTable } from '@/components/TasksTable'
import { CalendarView } from '@/components/CalendarView'
import { PeoplePage } from '@/components/PeoplePage'
import { AddProjectModal } from '@/components/AddProjectModal'
import { AddTaskModal } from '@/components/AddTaskModal'
import { LoginPage } from '@/components/LoginPage'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { RefreshCw, AlertCircle, Plus } from 'lucide-react'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePage, setActivePage] = useState<Page>('login')

  const {
    projects, loading: projLoading, error: projError,
    addProject, updateProject, deleteProject, refresh: refreshProjects,
  } = useProjects()

  const {
    tasks, loading: taskLoading, error: taskError,
    addTask, updateTask, deleteTask, refresh: refreshTasks,
  } = useTasks()

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase()
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.category.some((c) => c.toLowerCase().includes(q)) ||
        p.person.some((pe) => pe.name.toLowerCase().includes(q))
    )
  }, [projects, searchQuery])

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const q = searchQuery.toLowerCase()
    return tasks.filter(
      (t) => t.name.toLowerCase().includes(q)
    )
  }, [tasks, searchQuery])

  if (activePage === 'login') {
    return (
      <LoginPage
        onLogin={() => setActivePage('projects')}
      />
    )
  }

  const error = projError || taskError
  const loading = activePage === 'projects' ? projLoading : activePage === 'tasks' ? taskLoading : activePage === 'people' ? (projLoading || taskLoading) : false
  const refresh = activePage === 'projects' ? refreshProjects : activePage === 'tasks' ? refreshTasks : () => { refreshProjects(); refreshTasks() }

  const pageTitles: Record<string, string> = { projects: 'Projects', tasks: 'Tasks', calendar: 'Calendar', people: 'People' }
  const pageSubtitles: Record<string, string> = { projects: 'Manage and track your projects', tasks: 'Track your tasks across projects', calendar: 'View your tasks on a calendar', people: 'Team members and their tasks' }
  const pageTitle = pageTitles[activePage] || ''
  const pageSubtitle = pageSubtitles[activePage] || ''

  return (
    <div className="min-h-screen bg-[#0a0a0a] ambient-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main
        className="relative z-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ marginLeft: sidebarCollapsed ? 68 : 240 }}
      >
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigateLogin={() => setActivePage('login')}
        />

        <div className="p-6">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 animate-fade-up">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={refresh} className="ml-auto text-xs font-medium text-red-400 underline hover:no-underline">
                Retry
              </button>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between animate-fade-up">
            <div>
              <h2 className="text-sm font-semibold text-white/80">{pageTitle}</h2>
              <p className="mt-0.5 text-xs text-white/30">{pageSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              {activePage === 'projects' && (
                <button
                  onClick={() => setProjectModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </button>
              )}
              {activePage === 'tasks' && (
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </button>
              )}
              {(activePage === 'projects' || activePage === 'tasks' || activePage === 'people') && (
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)] disabled:opacity-30"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>
          </div>

          {activePage === 'projects' && (
            <ProjectsTable
              projects={filteredProjects}
              loading={projLoading}
              onDelete={deleteProject}
              onStateChange={(id, state) => updateProject(id, { state })}
            />
          )}

          {activePage === 'tasks' && (
            <TasksTable
              tasks={filteredTasks}
              projects={projects}
              loading={taskLoading}
              onDelete={deleteTask}
              onToggleComplete={(id, completed) => updateTask(id, { completed })}
            />
          )}

          {activePage === 'calendar' && (
            <CalendarView tasks={tasks} />
          )}

          {activePage === 'people' && (
            <PeoplePage projects={projects} tasks={tasks} loading={projLoading || taskLoading} />
          )}
        </div>
      </main>

      <AddProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={addProject}
      />

      <AddTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={addTask}
        projects={projects}
      />
    </div>
  )
}

export default App
