import { useState, useMemo } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { StatsCards } from '@/components/StatsCards'
import { DataTable } from '@/components/DataTable'
import { DashboardCharts } from '@/components/DashboardCharts'
import { AddEntryModal } from '@/components/AddEntryModal'
import { TeamTable } from '@/components/TeamTable'
import { CalendarView } from '@/components/CalendarView'
import { LoginPage } from '@/components/LoginPage'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { TimeLogsView } from '@/components/TimeLogsView'
import type { Entry } from '@/services/NotionService'
import { useEntries } from '@/hooks/useEntries'
import { useTeam } from '@/hooks/useTeam'
import { useLeave } from '@/hooks/useLeave'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { RefreshCw, AlertCircle } from 'lucide-react'

type Page = 'dashboard' | 'team' | 'calendar' | 'task' | 'timelogs' | 'login'
type UserRole = 'admin' | 'employee' | null

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePage, setActivePage] = useState<Page>('login')
  const [, setUserRole] = useState<UserRole>(null)
  const [taskFilterMember, setTaskFilterMember] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  const { entries, loading, error, addEntry, updateEntry, deleteEntry, refresh } =
    useEntries()
  const { members: teamMembers } = useTeam()
  const { records: leaveRecords } = useLeave()
  const { timeLogs } = useTimeLogs()

  const taskEntries = useMemo(() => {
    if (!taskFilterMember) return entries
    return entries.filter((e) => e.assignedTo === taskFilterMember)
  }, [entries, taskFilterMember])

  // Login page — full screen, no sidebar/header
  if (activePage === 'login') {
    return (
      <LoginPage
        onLogin={(role) => {
          setUserRole(role)
          setActivePage('dashboard')
        }}
      />
    )
  }

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
          onAddEntry={() => setModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigateLogin={() => setActivePage('login')}
        />

        <div className="p-6">
          {activePage === 'dashboard' && (
            <>
              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 animate-fade-up">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={refresh}
                    className="ml-auto text-xs font-medium text-red-400 underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              <StatsCards entries={entries} />

              <DashboardCharts
                entries={entries}
                teamMembers={teamMembers}
                leaveRecords={leaveRecords}
                timeLogs={timeLogs}
              />
            </>
          )}

          {activePage === 'task' && (
            <>
              <div className="mb-4 flex items-center justify-between animate-fade-up">
                <div>
                  <h2 className="text-sm font-semibold text-white/80">
                    {taskFilterMember ? `Tasks — ${taskFilterMember}` : 'All Tasks'}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/30">
                    {taskFilterMember
                      ? 'Showing tasks for this team member'
                      : 'Manage and assign tasks to team members'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {taskFilterMember && (
                    <button
                      onClick={() => setTaskFilterMember(null)}
                      className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70"
                    >
                      Show All
                    </button>
                  )}
                  <button
                    onClick={refresh}
                    disabled={loading}
                    className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)] disabled:opacity-30"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              <DataTable
                entries={taskEntries}
                loading={loading}
                onDelete={deleteEntry}
                onStatusChange={(id, status) => updateEntry(id, { status })}
                onAssignChange={(id, assignedTo) => updateEntry(id, { assignedTo })}
                onRowClick={setSelectedEntry}
                teamMembers={teamMembers}
              />
            </>
          )}

          {activePage === 'timelogs' && (
            <TimeLogsView entries={entries} teamMembers={teamMembers} />
          )}
          {activePage === 'calendar' && <CalendarView />}
          {activePage === 'team' && (
            <TeamTable
              entries={entries}
              onNavigateToMemberTasks={(memberName) => {
                setTaskFilterMember(memberName)
                setActivePage('task')
              }}
            />
          )}
        </div>
      </main>

      <AddEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addEntry}
        teamMembers={teamMembers}
      />

      <TaskDetailModal
        open={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
        teamMembers={teamMembers}
        timeLogs={timeLogs}
      />
    </div>
  )
}

export default App
