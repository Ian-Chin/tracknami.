import { useState, useEffect } from 'react'
import { RefreshCw, Users, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTeam } from '@/hooks/useTeam'

const statusStyles: Record<string, { bg: string; text: string; dot: string; glow: string }> = {
  Available: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_10px_rgba(52,211,153,0.4)]',
  },
  'On Leave': {
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
    glow: 'shadow-[0_0_10px_rgba(250,204,21,0.4)]',
  },
  MC: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    dot: 'bg-red-400',
    glow: 'shadow-[0_0_10px_rgba(248,113,113,0.4)]',
  },
  Remote: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
    glow: 'shadow-[0_0_10px_rgba(96,165,250,0.4)]',
  },
}

const allStatuses = ['Available', 'On Leave', 'MC', 'Remote']

const deptStyles: Record<string, string> = {
  Engineering: 'bg-blue-500/15 text-blue-400',
  Design: 'bg-pink-500/15 text-pink-400',
  Marketing: 'bg-orange-500/15 text-orange-400',
  Operations: 'bg-white/[0.06] text-white/50',
  HR: 'bg-emerald-500/15 text-emerald-400',
}

import type { Entry } from '@/services/NotionService'

interface TeamTableProps {
  entries?: Entry[]
  onNavigateToMemberTasks?: (memberName: string) => void
}

const PAGE_SIZE = 10

export function TeamTable({ entries = [], onNavigateToMemberTasks }: TeamTableProps) {
  const { members, loading, error, updateStatus, refresh } = useTeam()
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(members.length / PAGE_SIZE)
  const paginatedMembers = members.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [members])

  const statusCounts = allStatuses.map((s) => ({
    label: s,
    count: members.filter((m) => m.status === s).length,
    style: statusStyles[s],
  }))

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

      {/* Status summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {statusCounts.map((s, i) => (
          <div
            key={s.label}
            className={cn('glow-card group p-4 animate-fade-up', `stagger-${i + 1}`)}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150',
                  s.style.dot, s.style.glow
                )} />
                <span className="text-[11px] font-medium text-white/40">{s.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white font-mono">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between animate-fade-up stagger-6">
        <div>
          <h2 className="text-sm font-semibold text-white/80">Team Members</h2>
          <p className="mt-0.5 text-xs text-white/30">
            Manage team availability and status
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)] disabled:opacity-30"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glow-card">
          <div className="relative z-10 p-10 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
            <p className="mt-4 text-sm text-white/35">Loading team from Notion...</p>
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="glow-card animate-fade-up">
          <div className="relative z-10 p-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.1]">
              <Users className="h-6 w-6 text-white/30" />
            </div>
            <p className="mt-4 text-sm font-medium text-white/60">No team members</p>
          </div>
        </div>
      ) : (
        <div className="glow-card animate-fade-up stagger-7 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-white/80">Directory</h2>
              <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/40">
                {members.length} members
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Name', 'Role', 'Department', 'Status', 'Tasks', 'Email'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member, i) => {
                    const style = statusStyles[member.status] || statusStyles['Available']

                    return (
                      <tr
                        key={member.id}
                        className={cn(
                          'group border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:bg-white/[0.03] animate-fade-up',
                          `stagger-${Math.min(i + 1, 8)}`
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.1] text-[11px] font-bold text-white/60 transition-all group-hover:border-white/[0.15] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <button
                              onClick={() => onNavigateToMemberTasks?.(member.name)}
                              className="text-sm font-medium text-white/90 hover:text-white hover:underline transition-colors text-left"
                            >
                              {member.name}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-white/45">{member.role}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-[11px] font-medium',
                              deptStyles[member.department] || 'bg-white/[0.06] text-white/50'
                            )}
                          >
                            {member.department}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={member.status}
                            onChange={(e) => updateStatus(member.id, e.target.value)}
                            className={cn(
                              'cursor-pointer rounded-lg border-0 px-2.5 py-1 text-[11px] font-medium outline-none transition-all',
                              style.bg, style.text
                            )}
                          >
                            {allStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-mono font-medium text-white/50">
                            {entries.filter((e) => e.assignedTo === member.name).length}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-1.5 text-xs text-white/30 transition-all hover:text-white/60"
                          >
                            <Mail className="h-3 w-3" />
                            <span className="font-mono">{member.email}</span>
                          </a>
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
      )}
    </div>
  )
}
