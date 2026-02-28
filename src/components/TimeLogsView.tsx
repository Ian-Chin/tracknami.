import { useState, useMemo } from 'react'
import { Clock, RefreshCw, Plus, X, Users, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import type { Entry, TeamMember } from '@/services/NotionService'

interface TimeLogsViewProps {
  entries: Entry[]
  teamMembers: TeamMember[]
}

const PAGE_SIZE = 10

export function TimeLogsView({ entries, teamMembers }: TimeLogsViewProps) {
  const { timeLogs, loading, error, addTimeLog, totalHours, refresh } = useTimeLogs()
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Form state
  const [entryId, setEntryId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [hours, setHours] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalPages = Math.ceil(timeLogs.length / PAGE_SIZE)
  const safePage = Math.min(currentPage, Math.max(1, totalPages || 1))
  const paginatedLogs = timeLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (safePage !== currentPage && totalPages > 0) {
    setCurrentPage(safePage)
  }

  const logsThisWeek = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return timeLogs.filter((l) => l.date && new Date(l.date) >= weekStart).length
  }, [timeLogs])

  const contributors = useMemo(() => {
    const ids = new Set(timeLogs.map((l) => l.memberId).filter(Boolean))
    return ids.size
  }, [timeLogs])

  const resolveEntryName = (id: string) =>
    entries.find((e) => e.id === id)?.name || 'Unknown Task'

  const resolveMemberName = (id: string) =>
    teamMembers.find((m) => m.id === id)?.name || 'Unknown Member'

  const resetForm = () => {
    setEntryId('')
    setMemberId('')
    setHours('')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryId || !memberId || !hours) return

    setSubmitting(true)
    try {
      const entryName = resolveEntryName(entryId)
      const memberName = resolveMemberName(memberId)
      await addTimeLog({
        entryId,
        memberId,
        hours: parseFloat(hours),
        date,
        notes: notes || undefined,
        name: `${memberName} — ${entryName}`,
      })
      resetForm()
      setModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const summaryCards = [
    {
      label: 'Total Hours',
      value: `${totalHours}h`,
      icon: Clock,
      dot: 'bg-blue-400',
      glow: 'shadow-[0_0_10px_rgba(96,165,250,0.4)]',
    },
    {
      label: 'Logs This Week',
      value: logsThisWeek,
      icon: CalendarDays,
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(52,211,153,0.4)]',
    },
    {
      label: 'Contributors',
      value: contributors,
      icon: Users,
      dot: 'bg-purple-400',
      glow: 'shadow-[0_0_10px_rgba(192,132,252,0.4)]',
    },
  ]

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 animate-fade-up">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={refresh}
            className="ml-auto text-xs font-medium text-red-400 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {summaryCards.map((card, i) => (
          <div
            key={card.label}
            className={cn('glow-card group p-4 animate-fade-up', `stagger-${i + 1}`)}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150', card.dot, card.glow)} />
                <span className="text-[11px] font-medium text-white/40">{card.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white font-mono">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between animate-fade-up stagger-4">
        <div>
          <h2 className="text-sm font-semibold text-white/80">Time Logs</h2>
          <p className="mt-0.5 text-xs text-white/30">
            Track time across all tasks and team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-9 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Time
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)] disabled:opacity-30"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glow-card">
          <div className="relative z-10 p-10 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
            <p className="mt-4 text-sm text-white/35">Loading time logs from Notion...</p>
          </div>
        </div>
      ) : timeLogs.length === 0 ? (
        <div className="glow-card animate-fade-up">
          <div className="relative z-10 p-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
              <Clock className="h-6 w-6 text-white/30" />
            </div>
            <p className="mt-4 text-sm font-medium text-white/60">No time logs yet</p>
            <p className="mt-1 text-xs text-white/30">Click "Log Time" to add your first entry</p>
          </div>
        </div>
      ) : (
        <div className="glow-card animate-fade-up stagger-5 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-white/80">All Logs</h2>
              <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
                {timeLogs.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Date', 'Task', 'Logged By', 'Notes', 'Hours'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30',
                          h === 'Hours' && 'text-right'
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log, i) => (
                    <tr
                      key={log.id}
                      className={cn(
                        'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                        `stagger-${Math.min(i + 1, 8)}`,
                        log.id.startsWith('temp-') && 'animate-pulse opacity-40'
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-white/50">
                          {log.date
                            ? new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '---'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-white/80">
                          {resolveEntryName(log.entryId)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-white/60">
                          {resolveMemberName(log.memberId)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-white/35 truncate block max-w-[200px]">
                          {log.notes || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/50">
                          {log.hours}h
                        </span>
                      </td>
                    </tr>
                  ))}
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
      )}

      {/* Log Time Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setModalOpen(false)} />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#111111] p-6 shadow-[0_0_80px_rgba(255,255,255,0.04)] animate-fade-up">
            <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-linear-to-r from-transparent via-white/[0.25] to-transparent" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Log Time</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">
                  Task
                </label>
                <select
                  value={entryId}
                  onChange={(e) => setEntryId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 text-sm text-white/70 outline-none focus:border-white/[0.25]"
                >
                  <option value="">Select task</option>
                  {entries.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">
                  Member
                </label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 text-sm text-white/70 outline-none focus:border-white/[0.25]"
                >
                  <option value="">Select member</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">
                    Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 text-sm text-white/90 outline-none placeholder:text-white/20 focus:border-white/[0.25]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 text-sm text-white/70 outline-none focus:border-white/[0.25]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you work on?"
                  rows={2}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/20 focus:border-white/[0.25] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 text-xs font-medium text-white/50 transition-all hover:text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!entryId || !memberId || !hours || submitting}
                  className="h-9 rounded-xl bg-white px-5 text-xs font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.97] disabled:opacity-30"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
