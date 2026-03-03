import { useState, useEffect, useMemo } from 'react'
import { Sidebar, type Page } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { ProjectsTable } from '@/components/ProjectsTable'
import { TasksTable } from '@/components/TasksTable'
import { CalendarView } from '@/components/CalendarView'
import { PeoplePage } from '@/components/PeoplePage'
import { TimeLogPage } from '@/components/TimeLogPage'
import { AddProjectModal } from '@/components/AddProjectModal'
import { AddTaskModal } from '@/components/AddTaskModal'
import { AddTimeLogModal } from '@/components/AddTimeLogModal'
import { EditProjectModal } from '@/components/EditProjectModal'
import { EditTaskModal } from '@/components/EditTaskModal'
import { LoginPage } from '@/components/LoginPage'
import type { Project, Task } from '@/services/NotionService'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { NotionService, type WorkspaceUser } from '@/services/NotionService'
import { RefreshCw, AlertCircle, Plus } from 'lucide-react'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [timeLogModalOpen, setTimeLogModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePage, setActivePage] = useState<Page>(() =>
    localStorage.getItem('tracknami_logged_in') ? 'projects' : 'login'
  )
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([])

  const {
    projects, loading: projLoading, error: projError,
    addProject, updateProject, deleteProject, refresh: refreshProjects,
  } = useProjects()

  const {
    tasks, loading: taskLoading, error: taskError,
    addTask, updateTask, deleteTask, refresh: refreshTasks,
  } = useTasks()

  const {
    timeLogs, loading: timeLogLoading, error: timeLogError,
    addTimeLog, deleteTimeLog, refresh: refreshTimeLogs,
  } = useTimeLogs()

  useEffect(() => {
    NotionService.getWorkspaceUsers()
      .then(setWorkspaceUsers)
      .catch(() => {})
  }, [])

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

  const handleLogin = () => {
    localStorage.setItem('tracknami_logged_in', '1')
    setActivePage('projects')
  }

  const handleLogout = () => {
    localStorage.removeItem('tracknami_logged_in')
    setActivePage('login')
  }

  if (activePage === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  const error = projError || taskError || timeLogError
  const loading = activePage === 'projects' ? projLoading
    : activePage === 'tasks' ? taskLoading
    : activePage === 'timelogs' ? timeLogLoading
    : activePage === 'people' ? (projLoading || taskLoading)
    : false
  const refresh = activePage === 'projects' ? refreshProjects
    : activePage === 'tasks' ? refreshTasks
    : activePage === 'timelogs' ? refreshTimeLogs
    : () => { refreshProjects(); refreshTasks(); refreshTimeLogs() }

  const pageTitles: Record<string, string> = { projects: 'Projects', tasks: 'Tasks', calendar: 'Calendar', people: 'People', timelogs: 'Log Time' }
  const pageSubtitles: Record<string, string> = { projects: 'Manage and track your projects', tasks: 'Track your tasks across projects', calendar: 'View your tasks on a calendar', people: 'Team members and their tasks', timelogs: 'Track time spent on tasks and projects' }
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
          onNavigateLogin={handleLogout}
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
              {activePage === 'timelogs' && (
                <button
                  onClick={() => setTimeLogModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" />
                  Log Time
                </button>
              )}
              {(activePage === 'projects' || activePage === 'tasks' || activePage === 'people' || activePage === 'timelogs') && (
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
              onEdit={setEditingProject}
              onStateChange={(id, state) => updateProject(id, { state })}
            />
          )}

          {activePage === 'tasks' && (
            <TasksTable
              tasks={filteredTasks}
              projects={projects}
              loading={taskLoading}
              onDelete={deleteTask}
              onEdit={setEditingTask}
              onToggleComplete={(id, completed) => updateTask(id, { completed })}
            />
          )}

          {activePage === 'calendar' && (
            <CalendarView tasks={tasks} projects={projects} />
          )}

          {activePage === 'people' && (
            <PeoplePage projects={projects} tasks={tasks} timeLogs={timeLogs} loading={projLoading || taskLoading} />
          )}

          {activePage === 'timelogs' && (
            <TimeLogPage
              timeLogs={timeLogs}
              tasks={tasks}
              projects={projects}
              loading={timeLogLoading}
              onDelete={deleteTimeLog}
            />
          )}
        </div>
      </main>

      <AddProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={addProject}
        workspaceUsers={workspaceUsers}
      />

      <AddTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={addTask}
        projects={projects}
      />

      <AddTimeLogModal
        open={timeLogModalOpen}
        onClose={() => setTimeLogModalOpen(false)}
        onSubmit={addTimeLog}
        tasks={tasks}
        projects={projects}
        workspaceUsers={workspaceUsers}
      />

      <EditProjectModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={updateProject}
        workspaceUsers={workspaceUsers}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={updateTask}
        projects={projects}
      />
    </div>
  )
}

export default App
