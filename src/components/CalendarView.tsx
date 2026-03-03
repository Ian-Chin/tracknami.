import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/services/NotionService'

interface CalendarViewProps {
  tasks: Task[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseDate(s: string) {
  const [y, m, d] = s.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

interface SpanItem {
  id: string
  name: string
  startDate: Date
  endDate: Date
  completed: boolean
}

interface SingleItem {
  id: string
  name: string
  completed: boolean
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const { spanItems, singleItems } = useMemo(() => {
    const spans: SpanItem[] = []
    const singles: Record<string, SingleItem[]> = {}

    const addSingle = (key: string, item: SingleItem) => {
      if (!singles[key]) singles[key] = []
      singles[key].push(item)
    }

    for (const t of tasks) {
      if (!t.date) continue
      if (t.endDate && t.endDate !== t.date) {
        spans.push({
          id: t.id,
          name: t.name,
          startDate: parseDate(t.date),
          endDate: parseDate(t.endDate),
          completed: t.completed,
        })
      } else {
        const key = t.date.split('T')[0]
        addSingle(key, { id: t.id, name: t.name, completed: t.completed })
      }
    }

    return { spanItems: spans, singleItems: singles }
  }, [tasks])

  function getWeekSpans(week: (number | null)[]) {
    const weekDates: (Date | null)[] = week.map((day) =>
      day !== null ? new Date(year, month, day) : null
    )
    const realDates = weekDates.filter((d): d is Date => d !== null)
    if (realDates.length === 0) return []

    const weekStart = realDates[0]
    const weekEnd = realDates[realDates.length - 1]

    const result: { id: string; name: string; colStart: number; colEnd: number; completed: boolean }[] = []

    for (const span of spanItems) {
      if (span.endDate < weekStart || span.startDate > weekEnd) continue

      const clampedStart = span.startDate < weekStart ? weekStart : span.startDate
      const clampedEnd = span.endDate > weekEnd ? weekEnd : span.endDate

      let colStart = -1
      let colEnd = -1
      for (let col = 0; col < 7; col++) {
        const d = weekDates[col]
        if (!d) continue
        if (colStart === -1 && d >= clampedStart) colStart = col
        if (d <= clampedEnd) colEnd = col
      }

      if (colStart !== -1 && colEnd !== -1) {
        result.push({ id: span.id, name: span.name, colStart, colEnd, completed: span.completed })
      }
    }

    return result
  }

  return (
    <div className="glow-card animate-fade-up overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white/80">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            {!isCurrentMonth && (
              <button
                onClick={goToday}
                className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/40 transition-all hover:bg-white/[0.1] hover:text-white/60"
              >
                Today
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {DAYS.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        <div>
          {weeks.map((week, weekIdx) => {
            const weekSpans = getWeekSpans(week)

            return (
              <div key={weekIdx} className="relative">
                {/* Span bars layer */}
                {weekSpans.length > 0 && (
                  <div className="absolute top-7 left-0 right-0 z-10 pointer-events-none grid grid-cols-7">
                    {weekSpans.map((span, si) => (
                      <div
                        key={span.id}
                        className="pointer-events-auto"
                        style={{
                          gridColumn: `${span.colStart + 1} / ${span.colEnd + 2}`,
                          gridRow: si + 1,
                        }}
                      >
                        <div
                          className={cn(
                            'mx-0.5 flex items-center gap-1 rounded-md px-2 py-1 truncate',
                            span.completed
                              ? 'bg-emerald-500/20 border border-emerald-500/30'
                              : 'bg-purple-500/20 border border-purple-500/30'
                          )}
                        >
                          <CheckSquare className={cn(
                            'h-3 w-3 shrink-0',
                            span.completed ? 'text-emerald-400' : 'text-purple-400'
                          )} />
                          <span className={cn(
                            'text-[11px] font-medium truncate',
                            span.completed ? 'text-emerald-400 line-through' : 'text-purple-300'
                          )}>
                            {span.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Day cells grid */}
                <div className="grid grid-cols-7">
                  {week.map((day, colIdx) => {
                    if (day === null) {
                      return (
                        <div
                          key={`empty-${weekIdx}-${colIdx}`}
                          className="min-h-[110px] border-b border-r border-white/[0.04] bg-white/[0.01]"
                        />
                      )
                    }

                    const dateKey = toKey(new Date(year, month, day))
                    const items = singleItems[dateKey]
                    const isToday = isCurrentMonth && day === today.getDate()
                    const spanCount = weekSpans.length

                    return (
                      <div
                        key={day}
                        className={cn(
                          'min-h-[110px] border-b border-r border-white/[0.04] p-1.5 transition-colors hover:bg-white/[0.03]',
                          isToday && 'bg-white/[0.04]'
                        )}
                      >
                        <div className={cn(
                          'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                          isToday ? 'bg-white text-black font-semibold' : 'text-white/50'
                        )}>
                          {day}
                        </div>

                        {spanCount > 0 && (
                          <div style={{ height: spanCount * 24 }} />
                        )}

                        {items && (
                          <div className="flex flex-col gap-0.5">
                            {items.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className={cn(
                                  'flex items-center gap-1 rounded px-1.5 py-1 truncate',
                                  item.completed ? 'bg-emerald-500/10' : 'bg-white/[0.06]'
                                )}
                              >
                                <CheckSquare className={cn(
                                  'h-3 w-3 shrink-0',
                                  item.completed ? 'text-emerald-400' : 'text-white/30'
                                )} />
                                <span className={cn(
                                  'text-[11px] font-medium truncate',
                                  item.completed ? 'text-emerald-400/70 line-through' : 'text-white/50'
                                )}>
                                  {item.name}
                                </span>
                              </div>
                            ))}
                            {items.length > 3 && (
                              <span className="text-[10px] text-white/25 px-1">
                                +{items.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
