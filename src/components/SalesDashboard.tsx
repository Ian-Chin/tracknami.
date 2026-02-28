import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { DollarSign, TrendingUp, Target, Award, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSales } from '@/hooks/useSales'
import type { SalesDeal } from '@/services/NotionService'

const COLORS = {
  emerald: '#34d399',
  blue: '#60a5fa',
  yellow: '#facc15',
  orange: '#fb923c',
  red: '#f87171',
  purple: '#a78bfa',
  white: 'rgba(255,255,255,0.4)',
}

const STAGE_COLORS: Record<string, string> = {
  Lead: COLORS.white,
  Proposal: COLORS.blue,
  Negotiation: COLORS.yellow,
  'Closed Won': COLORS.emerald,
  'Closed Lost': COLORS.red,
}

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

function KPICard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string; subtitle: string; icon: typeof DollarSign; color: string
}) {
  return (
    <div className="glow-card animate-fade-up">
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">{title}</p>
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-[11px] text-white/35">{subtitle}</p>
      </div>
    </div>
  )
}

function computeKPIs(deals: SalesDeal[]) {
  const won = deals.filter((d) => d.stage === 'Closed Won')
  const lost = deals.filter((d) => d.stage === 'Closed Lost')
  const totalRevenue = won.reduce((s, d) => s + d.amount, 0)
  const dealsWon = won.length
  const totalClosed = won.length + lost.length
  const conversionRate = totalClosed > 0 ? Math.round((won.length / totalClosed) * 100) : 0
  const avgDealSize = won.length > 0 ? Math.round(totalRevenue / won.length) : 0
  return { totalRevenue, dealsWon, conversionRate, avgDealSize }
}

function computeRevenueTrend(deals: SalesDeal[]) {
  const months: Record<string, number> = {}
  for (const d of deals) {
    if (d.stage !== 'Closed Won' || !d.closeDate) continue
    const date = new Date(d.closeDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months[key] = (months[key] || 0) + d.amount
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => {
      const [y, m] = month.split('-')
      const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      return { month: label, revenue }
    })
}

function computePipelineByStage(deals: SalesDeal[]) {
  const stages = ['Lead', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  return stages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage)
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + d.amount, 0),
      fill: STAGE_COLORS[stage] || COLORS.white,
    }
  })
}

function computeTopPerformers(deals: SalesDeal[]) {
  const reps: Record<string, number> = {}
  for (const d of deals) {
    if (d.stage !== 'Closed Won') continue
    reps[d.salesRep] = (reps[d.salesRep] || 0) + d.amount
  }
  return Object.entries(reps)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue }))
}

function computeTopClients(deals: SalesDeal[]) {
  const clients: Record<string, number> = {}
  for (const d of deals) {
    if (d.stage !== 'Closed Won') continue
    clients[d.client] = (clients[d.client] || 0) + d.amount
  }
  return Object.entries(clients)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue }))
}

function computeMonthlyComparison(deals: SalesDeal[]) {
  const months: Record<string, { won: number; pipeline: number }> = {}
  for (const d of deals) {
    if (!d.closeDate) continue
    const date = new Date(d.closeDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!months[key]) months[key] = { won: 0, pipeline: 0 }
    if (d.stage === 'Closed Won') months[key].won += d.amount
    else if (d.stage !== 'Closed Lost') months[key].pipeline += d.amount
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const [y, m] = month.split('-')
      const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short' })
      return { month: label, ...data }
    })
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/[0.12] bg-[#1a1a1a] px-3 py-2 shadow-lg">
      <p className="text-[10px] font-medium text-white/50 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function SalesDashboard() {
  const { deals, loading, error, refresh } = useSales()

  const kpis = useMemo(() => computeKPIs(deals), [deals])
  const revenueTrend = useMemo(() => computeRevenueTrend(deals), [deals])
  const pipeline = useMemo(() => computePipelineByStage(deals), [deals])
  const topPerformers = useMemo(() => computeTopPerformers(deals), [deals])
  const topClients = useMemo(() => computeTopClients(deals), [deals])
  const monthlyComparison = useMemo(() => computeMonthlyComparison(deals), [deals])

  return (
    <div>
      <div className="mb-5 flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-sm font-semibold text-white/80">Sales Dashboard</h2>
          <p className="mt-0.5 text-xs text-white/30">Track revenue, pipeline, and team performance</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 disabled:opacity-30"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 animate-fade-up">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="glow-card">
          <div className="relative z-10 p-10 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
            <p className="mt-4 text-sm text-white/35">Loading sales data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-6 grid grid-cols-4 gap-4 animate-fade-up stagger-1">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(kpis.totalRevenue)}
              subtitle="From closed deals"
              icon={DollarSign}
              color="bg-emerald-500/15 text-emerald-400"
            />
            <KPICard
              title="Deals Won"
              value={String(kpis.dealsWon)}
              subtitle="Closed successfully"
              icon={TrendingUp}
              color="bg-blue-500/15 text-blue-400"
            />
            <KPICard
              title="Conversion Rate"
              value={`${kpis.conversionRate}%`}
              subtitle="Win rate"
              icon={Target}
              color="bg-yellow-500/15 text-yellow-400"
            />
            <KPICard
              title="Avg Deal Size"
              value={formatCurrency(kpis.avgDealSize)}
              subtitle="Per closed deal"
              icon={Award}
              color="bg-purple-500/15 text-purple-400"
            />
          </div>

          {/* Revenue Trend + Pipeline */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="glow-card animate-fade-up stagger-2">
              <div className="relative z-10">
                <div className="border-b border-white/[0.08] px-5 py-3.5">
                  <h3 className="text-sm font-semibold text-white/80">Revenue Trend</h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.emerald} fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glow-card animate-fade-up stagger-3">
              <div className="relative z-10">
                <div className="border-b border-white/[0.08] px-5 py-3.5">
                  <h3 className="text-sm font-semibold text-white/80">Pipeline by Stage</h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={pipeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="stage" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                        {pipeline.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers + Top Clients */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="glow-card animate-fade-up stagger-4">
              <div className="relative z-10">
                <div className="border-b border-white/[0.08] px-5 py-3.5">
                  <h3 className="text-sm font-semibold text-white/80">Top Performers</h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topPerformers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="Revenue" fill={COLORS.blue} radius={[0, 4, 4, 0]} fillOpacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glow-card animate-fade-up stagger-5">
              <div className="relative z-10">
                <div className="border-b border-white/[0.08] px-5 py-3.5">
                  <h3 className="text-sm font-semibold text-white/80">Top Clients</h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topClients} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="Revenue" fill={COLORS.purple} radius={[0, 4, 4, 0]} fillOpacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="glow-card animate-fade-up stagger-6">
            <div className="relative z-10">
              <div className="border-b border-white/[0.08] px-5 py-3.5">
                <h3 className="text-sm font-semibold text-white/80">Monthly Comparison</h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="won" name="Won" fill={COLORS.emerald} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                    <Bar dataKey="pipeline" name="Pipeline" fill={COLORS.blue} radius={[4, 4, 0, 0]} fillOpacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
