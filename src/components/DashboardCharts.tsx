import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { Entry, TeamMember, LeaveRecord, TimeLog } from '@/services/NotionService'

interface DashboardChartsProps {
  entries: Entry[]
  teamMembers: TeamMember[]
  leaveRecords: LeaveRecord[]
  timeLogs: TimeLog[]
}

const COLORS = {
  emerald: '#34d399',
  blue: '#60a5fa',
  white: 'rgba(255,255,255,0.4)',
  yellow: '#facc15',
  orange: '#fb923c',
  red: '#f87171',
  pink: '#f472b6',
  purple: '#a78bfa',
}

const STATUS_COLORS: Record<string, string> = {
  'Not Started': COLORS.white,
  'In Progress': COLORS.blue,
  'Done': COLORS.emerald,
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: COLORS.white,
  Medium: COLORS.yellow,
  High: COLORS.orange,
  Urgent: COLORS.red,
}

const LEAVE_COLORS: Record<string, string> = {
  'Annual Leave': COLORS.yellow,
  MC: COLORS.red,
  Remote: COLORS.blue,
  'Emergency Leave': COLORS.orange,
  'Half Day': COLORS.purple,
}

const LEAVE_STYLES: Record<string, { bg: string; text: string }> = {
  'Annual Leave': { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  MC: { bg: 'bg-red-500/15', text: 'text-red-400' },
  Remote: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  'Emergency Leave': { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  'Half Day': { bg: 'bg-purple-500/15', text: 'text-purple-400' },
}

const axisStyle = { fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }
const gridStyle = { stroke: 'rgba(255,255,255,0.06)' }

interface TooltipPayloadItem {
  name: string
  value: number
  color?: string
  fill?: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/[0.1] bg-[#1a1a1a] px-3 py-2 shadow-xl">
      {label && <p className="mb-1 text-[11px] font-mono text-white/50">{label}</p>}
      {payload.map((p, i: number) => (
        <p key={i} className="text-xs text-white/80">
          <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: p.color || p.fill }} />
          {p.name}: <span className="font-mono font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glow-card p-5 ${className}`}>
      <div className="relative z-10">
        <h3 className="mb-4 text-sm font-semibold text-white/80">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    ;(acc[k] ||= []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function DashboardCharts({ entries, teamMembers, leaveRecords, timeLogs }: DashboardChartsProps) {
  const statusData = useMemo(() => {
    const grouped = groupBy(entries, (e) => e.status)
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      value: items.length,
      fill: STATUS_COLORS[name] || COLORS.white,
    }))
  }, [entries])

  const priorityData = useMemo(() => {
    const order = ['Low', 'Medium', 'High', 'Urgent']
    const grouped = groupBy(entries, (e) => e.priority)
    return order
      .filter((p) => grouped[p])
      .map((name) => ({
        name,
        count: grouped[name].length,
        fill: PRIORITY_COLORS[name],
      }))
  }, [entries])

  const hoursByMember = useMemo(() => {
    const memberMap = new Map(teamMembers.map((m) => [m.id, m.name]))
    const totals: Record<string, number> = {}
    for (const log of timeLogs) {
      const name = memberMap.get(log.memberId) || 'Unknown'
      totals[name] = (totals[name] || 0) + log.hours
    }
    return Object.entries(totals)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
  }, [timeLogs, teamMembers])

  const hoursByTask = useMemo(() => {
    const entryMap = new Map(entries.map((e) => [e.id, e.name]))
    const totals: Record<string, number> = {}
    for (const log of timeLogs) {
      const name = entryMap.get(log.entryId) || 'Unknown'
      totals[name] = (totals[name] || 0) + log.hours
    }
    return Object.entries(totals)
      .map(([name, hours]) => ({ name, hours, fill: COLORS.blue }))
      .sort((a, b) => b.hours - a.hours)
  }, [timeLogs, entries])

  const leaveData = useMemo(() => {
    const grouped = groupBy(leaveRecords, (r) => r.type)
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      value: items.length,
      fill: LEAVE_COLORS[name] || COLORS.white,
    }))
  }, [leaveRecords])

  const todayLeave = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return leaveRecords.filter((r) => {
      if (!r.startDate) return false
      const start = new Date(r.startDate)
      const end = r.endDate ? new Date(r.endDate) : start
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      return today >= start && today <= end
    })
  }, [leaveRecords])

  const renderLegend = (data: { name: string; fill?: string }[]) => (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 justify-center">
      {data.map((d) => (
        <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-white/40">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: d.fill || COLORS.white }} />
          {d.name}
        </span>
      ))}
    </div>
  )

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* 1. Status Breakdown (Donut) */}
      <ChartCard title="Status Breakdown" className="animate-fade-up stagger-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {statusData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {renderLegend(statusData)}
      </ChartCard>

      {/* 2. Priority Distribution (Bar) */}
      <ChartCard title="Priority Distribution" className="animate-fade-up stagger-5">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priorityData} barSize={28}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {priorityData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3. Today's Leave Summary (Table) */}
      <ChartCard title="Today's Leave" className="animate-fade-up stagger-6">
        {todayLeave.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-xs text-white/30">No one on leave today</p>
          </div>
        ) : (
          <div className="max-h-[252px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-2 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">Member</th>
                  <th className="pb-2 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">Type</th>
                </tr>
              </thead>
              <tbody>
                {todayLeave.map((r) => {
                  const style = LEAVE_STYLES[r.type] || { bg: 'bg-white/[0.06]', text: 'text-white/50' }
                  return (
                    <tr key={r.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-2">
                        <span className="text-xs font-medium text-white/80">{r.member}</span>
                      </td>
                      <td className="py-2">
                        <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium', style.bg, style.text)}>
                          {r.type}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 text-center">
          <span className="text-[11px] font-mono text-white/30">
            {todayLeave.length} {todayLeave.length === 1 ? 'person' : 'people'} on leave
          </span>
        </div>
      </ChartCard>

      {/* 4. Hours by Member (Horizontal Bar) */}
      <ChartCard title="Hours by Member" className="animate-fade-up stagger-7">
        {hoursByMember.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-xs text-white/30">No time logs yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, hoursByMember.length * 36)}>
            <BarChart data={hoursByMember} layout="vertical" barSize={18}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} unit="h" />
              <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="hours" fill={COLORS.emerald} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* 5. Hours by Task (Horizontal Bar) */}
      <ChartCard title="Hours by Task" className="animate-fade-up stagger-8">
        {hoursByTask.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-xs text-white/30">No time logs yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, hoursByTask.length * 36)}>
            <BarChart data={hoursByTask} layout="vertical" barSize={18}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} unit="h" />
              <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={130} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="hours" fill={COLORS.purple} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* 6. Leave Type Distribution (Donut) */}
      <ChartCard title="Leave Type Distribution" className="animate-fade-up stagger-8">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={leaveData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {leaveData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {renderLegend(leaveData)}
      </ChartCard>
    </div>
  )
}
