import { ListTodo, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Entry } from '@/services/NotionService'

interface StatsCardsProps {
  entries: Entry[]
}

export function StatsCards({ entries }: StatsCardsProps) {
  const total = entries.length
  const done = entries.filter((e) => e.status === 'Done').length
  const inProgress = entries.filter((e) => e.status === 'In Progress').length
  const highPriority = entries.filter(
    (e) => e.priority === 'High' || e.priority === 'Urgent'
  ).length

  const stats = [
    {
      label: 'Total Entries',
      value: total,
      change: '+12%',
      icon: ListTodo,
      iconBg: 'bg-white/[0.1]',
      iconColor: 'text-white/80',
    },
    {
      label: 'Completed',
      value: done,
      change: `${total ? Math.round((done / total) * 100) : 0}%`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'In Progress',
      value: inProgress,
      change: 'Active',
      icon: Activity,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      label: 'High Priority',
      value: highPriority,
      change: 'Needs attention',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            'glow-card group p-5 animate-fade-up',
            `stagger-${i + 1}`
          )}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                {stat.label}
              </p>
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] transition-all duration-300 group-hover:scale-110 group-hover:border-white/[0.12]',
                stat.iconBg
              )}>
                <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-white font-mono">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[11px] text-white/35">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
