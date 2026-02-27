import { useState, useMemo } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { StatsCards } from '@/components/StatsCards'
import { DataTable } from '@/components/DataTable'
import { AddEntryModal } from '@/components/AddEntryModal'
import { TeamTable } from '@/components/TeamTable'
import { CalendarView } from '@/components/CalendarView'
import { LoginPage } from '@/components/LoginPage'
import { useEntries } from '@/hooks/useEntries'
import { RefreshCw, AlertCircle } from 'lucide-react'

type Page = 'dashboard' | 'team' | 'calendar' | 'login'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const { entries, loading, error, addEntry, updateEntry, deleteEntry, refresh } =
    useEntries()

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        e.priority.toLowerCase().includes(q)
    )
  }, [entries, searchQuery])

  // Login page — full screen, no sidebar/header
  if (activePage === 'login') {
    return <LoginPage onLogin={() => setActivePage('dashboard')} />
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

              <div className="mt-8 mb-4 flex items-center justify-between animate-fade-up stagger-4">
                <div>
                  <h2 className="text-sm font-semibold text-white/80">Recent Entries</h2>
                  <p className="mt-0.5 text-xs text-white/30">
                    Synced from your Notion workspace
                  </p>
                </div>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)] disabled:opacity-30"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <DataTable
                entries={filteredEntries}
                loading={loading}
                onDelete={deleteEntry}
                onStatusChange={(id, status) => updateEntry(id, { status })}
              />
            </>
          )}

          {activePage === 'calendar' && <CalendarView />}
          {activePage === 'team' && <TeamTable />}
        </div>
      </main>

      <AddEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addEntry}
      />
    </div>
  )
}

export default App
