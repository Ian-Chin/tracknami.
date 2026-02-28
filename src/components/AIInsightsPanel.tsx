import { useState } from 'react'
import { Sparkles, AlertTriangle, Lightbulb, FileText, TrendingUp, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAIInsights } from '@/hooks/useAIInsights'
import { NotionService, type Entry, type AIInsight } from '@/services/NotionService'

interface AIInsightsDropdownProps {
  entries: Entry[]
  activePage: string
  onClose: () => void
}

const typeConfig: Record<string, { icon: typeof AlertTriangle; bg: string; border: string; text: string; iconColor: string }> = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-red-500/[0.08]',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconColor: 'text-red-400',
  },
  suggestion: {
    icon: Lightbulb,
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconColor: 'text-blue-400',
  },
  summary: {
    icon: FileText,
    bg: 'bg-emerald-500/[0.08]',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconColor: 'text-emerald-400',
  },
  opportunity: {
    icon: TrendingUp,
    bg: 'bg-emerald-500/[0.08]',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconColor: 'text-emerald-400',
  },
  risk: {
    icon: ShieldAlert,
    bg: 'bg-orange-500/[0.08]',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    iconColor: 'text-orange-400',
  },
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const config = typeConfig[insight.type] || typeConfig.summary
  const Icon = config.icon

  return (
    <div className={cn('rounded-xl border p-3 transition-all', config.bg, config.border)}>
      <div className="flex items-start gap-2.5">
        <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', config.bg)}>
          <Icon className={cn('h-3.5 w-3.5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold', config.text)}>{insight.title}</p>
          <p className="mt-0.5 text-[11px] text-white/45 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  )
}

export function AIInsightsDropdown({ entries, activePage, onClose }: AIInsightsDropdownProps) {
  const { insights, loading, error, getTaskInsights, getSalesAnalysis } = useAIInsights()
  const [fetchError, setFetchError] = useState<string | null>(null)

  const isSales = activePage === 'sales'
  const label = isSales ? 'Sales Analysis' : 'Task Insights'

  const handleGenerate = async () => {
    setFetchError(null)
    if (isSales) {
      try {
        const deals = await NotionService.getSales()
        await getSalesAnalysis(deals.map((d) => ({
          name: d.name,
          client: d.client,
          amount: d.amount,
          stage: d.stage,
          salesRep: d.salesRep,
          closeDate: d.closeDate,
        })))
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch sales data')
      }
    } else {
      await getTaskInsights(entries.map((e) => ({
        name: e.name,
        status: e.status,
        priority: e.priority,
        dueDate: e.dueDate,
        assignedTo: e.assignedTo,
      })))
    }
  }

  const displayError = fetchError || error

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-2 z-50 w-96 rounded-xl border border-white/[0.12] bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.03)] animate-fade-up"
      >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <p className="text-xs font-semibold text-white/80">AI {label}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex h-7 items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 text-[10px] font-medium text-purple-400 transition-all hover:bg-purple-500/20 hover:border-purple-500/40 disabled:opacity-40"
        >
          <Sparkles className={cn('h-3 w-3', loading && 'animate-spin')} />
          {loading ? 'Analyzing...' : `Generate`}
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto p-3">
        {displayError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 mb-3">
            <p className="text-[11px] text-red-400">{displayError}</p>
          </div>
        )}

        {insights.length > 0 ? (
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        ) : !loading && (
          <p className="text-center text-[11px] text-white/30 py-6">
            Click "Generate" to analyze your {isSales ? 'sales pipeline' : 'tasks'} with AI
          </p>
        )}
      </div>
    </div>
    </>
  )
}
