import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLeave } from '@/hooks/useLeave'
import type { LeaveRecord } from '@/services/NotionService'

const typeStyles: Record<string, { bg: string; bar: string; text: string; dot: string }> = {
  'Annual Leave': { bg: 'bg-yellow-500/15', bar: 'bg-yellow-500/60', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  MC: { bg: 'bg-red-500/15', bar: 'bg-red-500/60', text: 'text-red-400', dot: 'bg-red-400' },
  Remote: { bg: 'bg-blue-500/15', bar: 'bg-blue-500/60', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Emergency Leave': { bg: 'bg-orange-500/15', bar: 'bg-orange-500/60', text: 'text-orange-400', dot: 'bg-orange-400' },
  'Half Day': { bg: 'bg-purple-500/15', bar: 'bg-purple-500/60', text: 'text-purple-400', dot: 'bg-purple-400' },
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isDateInRange(dateStr: string, start: string | null, end: string | null) {
  if (!start) return false
  const d = new Date(dateStr)
  const s = new Date(start)
  const e = end ? new Date(end) : s
  return d >= s && d <= e
}

function getDayCount(start: string | null, end: string | null): number {
  if (!start) return 0
  const s = new Date(start)
  const e = end ? new Date(end) : s
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface BarSegment {
  record: LeaveRecord
  row: number
  startCol: number  // 0-indexed column in the grid (including empty slots)
  endCol: number
  isStart: boolean  // bar starts in this month
  isEnd: boolean    // bar ends in this month
  label: string
}

export function CalendarView() {
  const { records, loading, error, refresh } = useLeave()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Map each day to its leave records
  const dayRecords = useMemo(() => {
    const map: Record<string, LeaveRecord[]> = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(year, month, d)
      map[dateStr] = records.filter((r) => isDateInRange(dateStr, r.startDate, r.endDate))
    }
    return map
  }, [records, year, month, daysInMonth])

  const selectedRecords = selectedDate ? (dayRecords[selectedDate] || []) : []

  // Compute bar segments for the calendar grid
  const barSegments = useMemo(() => {
    const segments: BarSegment[] = []

    // Filter records that overlap this month
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    const relevantRecords = records.filter((r) => {
      if (!r.startDate) return false
      const s = new Date(r.startDate)
      const e = r.endDate ? new Date(r.endDate) : s
      return s <= monthEnd && e >= monthStart
    })

    // For each record, compute which cells it spans in the grid
    // We need to assign rows so bars don't overlap on the same day
    // Track which rows are occupied per day
    const dayRowMap: Record<number, Set<number>> = {}
    for (let d = 1; d <= daysInMonth; d++) {
      dayRowMap[d] = new Set()
    }

    for (const record of relevantRecords) {
      const rStart = new Date(record.startDate!)
      const rEnd = record.endDate ? new Date(record.endDate) : rStart

      // Clamp to this month
      const clampedStart = rStart < monthStart ? 1 : rStart.getDate()
      const clampedEnd = rEnd > monthEnd ? daysInMonth : rEnd.getDate()
      const isStart = rStart >= monthStart
      const isEnd = rEnd <= monthEnd

      // Find a row that's free for all days in this range
      let row = 0
      while (true) {
        let free = true
        for (let d = clampedStart; d <= clampedEnd; d++) {
          if (dayRowMap[d].has(row)) {
            free = false
            break
          }
        }
        if (free) break
        row++
      }

      // Mark row as occupied
      for (let d = clampedStart; d <= clampedEnd; d++) {
        dayRowMap[d].add(row)
      }

      // Now split by weeks (rows in the calendar grid)
      // Each calendar row = 7 columns, starting from firstDay offset
      let currentDay = clampedStart
      while (currentDay <= clampedEnd) {
        // Which grid column is this day in?
        const gridCol = firstDay + currentDay - 1
        const calendarRow = Math.floor(gridCol / 7)
        const colInRow = gridCol % 7

        // Find end of this segment (end of week row or end of bar)
        const endOfWeekDay = (calendarRow + 1) * 7 - firstDay // day number at end of this calendar row
        const segEnd = Math.min(clampedEnd, endOfWeekDay)
        const segEndCol = firstDay + segEnd - 1

        segments.push({
          record,
          row,
          startCol: gridCol,
          endCol: segEndCol,
          isStart: isStart && currentDay === clampedStart,
          isEnd: isEnd && segEnd === clampedEnd,
          label: currentDay === clampedStart ? `${record.member}` : '',
        })

        currentDay = segEnd + 1
      }
    }

    return segments
  }, [records, year, month, daysInMonth, firstDay])

  // Max rows needed
  const maxBarRows = useMemo(() => {
    let max = 0
    for (const seg of barSegments) {
      max = Math.max(max, seg.row + 1)
    }
    return max
  }, [barSegments])

  // Summary counts
  const monthlySummary = useMemo(() => {
    const counts: Record<string, number> = {}
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    for (const r of records) {
      if (!r.startDate) continue
      const s = new Date(r.startDate)
      const e = r.endDate ? new Date(r.endDate) : s
      if (s <= monthEnd && e >= monthStart) {
        counts[r.type] = (counts[r.type] || 0) + 1
      }
    }
    return counts
  }, [records, year, month])

  // Total grid rows
  const totalGridCells = firstDay + daysInMonth
  const totalCalendarRows = Math.ceil(totalGridCells / 7)

  // Cell height for bars — ensure minimum height even without leave records
  const cellHeight = Math.max(100, 80 + maxBarRows * 18)

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 animate-fade-up">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={refresh} className="ml-auto text-xs font-medium text-red-400 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(typeStyles).map(([type, style], i) => (
          <div key={type} className={cn('glow-card group p-4 animate-fade-up', `stagger-${i + 1}`)}>
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full transition-all group-hover:scale-150', style.dot)} />
                <span className="text-[11px] font-medium text-white/40">{type}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white font-mono">{monthlySummary[type] || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar header */}
      <div className="mb-4 flex items-center justify-between animate-fade-up stagger-6">
        <div>
          <h2 className="text-sm font-semibold text-white/80">Leave Calendar</h2>
          <p className="mt-0.5 text-xs text-white/30">Track team availability</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="flex h-9 items-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70">
            Today
          </button>
          <button onClick={refresh} disabled={loading} className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-medium text-white/40 transition-all hover:border-white/[0.15] hover:text-white/70 disabled:opacity-30">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 animate-fade-up stagger-7">
        {/* Calendar grid */}
        <div className="col-span-2 rounded-xl border border-white/[0.1] bg-white/[0.035] overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold text-white/80">{monthName}</h3>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  'px-1 py-2 text-center text-[10px] font-medium uppercase tracking-[0.15em]',
                  i >= 5 ? 'text-white/15' : 'text-white/30'
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar rows */}
          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
              <p className="mt-4 text-sm text-white/35">Loading calendar...</p>
            </div>
          ) : (
            <div>
              {Array.from({ length: totalCalendarRows }).map((_, rowIdx) => {
                const rowStartCol = rowIdx * 7

                return (
                  <div key={rowIdx} className="relative grid grid-cols-7 border-b border-white/[0.04] last:border-0">
                    {/* Day cells */}
                    {Array.from({ length: 7 }).map((_, colIdx) => {
                      const gridCol = rowStartCol + colIdx
                      const dayNum = gridCol - firstDay + 1
                      const isValidDay = dayNum >= 1 && dayNum <= daysInMonth
                      const isWeekend = colIdx >= 5
                      const dateStr = isValidDay ? toDateStr(year, month, dayNum) : ''
                      const isToday = dateStr === todayStr
                      const isSelected = dateStr === selectedDate

                      return (
                        <button
                          key={colIdx}
                          onClick={() => isValidDay && setSelectedDate(isSelected ? null : dateStr)}
                          disabled={!isValidDay}
                          className={cn(
                            'relative border-r border-white/[0.04] last:border-r-0 text-left transition-colors',
                            isWeekend ? 'bg-white/[0.015]' : '',
                            isSelected && 'bg-white/[0.06]',
                            !isValidDay && 'cursor-default',
                          )}
                          style={{ minHeight: cellHeight }}
                        >
                          {isValidDay && (
                            <div className="p-1.5">
                              <span className={cn(
                                'inline-flex items-center justify-center text-[11px] font-medium',
                                isToday
                                  ? 'h-6 w-6 rounded-full bg-white text-black font-bold'
                                  : isWeekend
                                    ? 'text-white/20'
                                    : 'text-white/50'
                              )}>
                                {dayNum}
                              </span>
                            </div>
                          )}
                        </button>
                      )
                    })}

                    {/* Bar overlays for this row */}
                    {barSegments
                      .filter((seg) => {
                        const segRow = Math.floor(seg.startCol / 7)
                        return segRow === rowIdx
                      })
                      .map((seg, idx) => {
                        const style = typeStyles[seg.record.type] || typeStyles['Annual Leave']
                        const colStart = seg.startCol % 7
                        const colEnd = seg.endCol % 7
                        const span = colEnd - colStart + 1

                        // Position as percentage
                        const left = (colStart / 7) * 100
                        const width = (span / 7) * 100

                        return (
                          <div
                            key={`${seg.record.id}-${idx}`}
                            className={cn(
                              'absolute pointer-events-none',
                            )}
                            style={{
                              left: `calc(${left}% + 4px)`,
                              width: `calc(${width}% - 8px)`,
                              top: 28 + seg.row * 18,
                              height: 16,
                            }}
                          >
                            <div
                              className={cn(
                                'h-full flex items-center px-1.5 text-[9px] font-medium truncate',
                                style.bar,
                                seg.isStart && seg.isEnd && 'rounded-md',
                                seg.isStart && !seg.isEnd && 'rounded-l-md',
                                !seg.isStart && seg.isEnd && 'rounded-r-md',
                                !seg.isStart && !seg.isEnd && '',
                              )}
                              title={`${seg.record.member} - ${seg.record.type}`}
                            >
                              {seg.label && (
                                <span className="text-white/90 truncate">{seg.label}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="rounded-xl border border-white/[0.1] bg-white/[0.035] overflow-hidden">
          <div className="border-b border-white/[0.08] px-5 py-3.5">
            <h3 className="text-sm font-semibold text-white/80">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Upcoming Leave'}
            </h3>
          </div>

          <div className="p-4 space-y-2 max-h-[550px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-6 w-6 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
              </div>
            ) : selectedDate ? (
              selectedRecords.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-white/15 mb-3" />
                  <p className="text-xs text-white/30">No leave records for this day</p>
                </div>
              ) : (
                selectedRecords.map((r) => {
                  const style = typeStyles[r.type] || typeStyles['Annual Leave']
                  const days = getDayCount(r.startDate, r.endDate)
                  return (
                    <div key={r.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn('h-2 w-2 rounded-full', style.dot)} />
                        <span className={cn('text-[11px] font-medium rounded-md px-2 py-0.5', style.bg, style.text)}>
                          {r.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white/85">{r.member}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/30 font-mono">
                        <span>{r.startDate}{r.endDate && r.endDate !== r.startDate ? ` → ${r.endDate}` : ''}</span>
                        <span className="text-white/15">|</span>
                        <span>{days} day{days !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )
                })
              )
            ) : (
              (() => {
                const upcoming = records
                  .filter((r) => {
                    if (!r.endDate && !r.startDate) return false
                    const end = new Date(r.endDate || r.startDate!)
                    return end >= today
                  })
                  .slice(0, 8)

                if (upcoming.length === 0) {
                  return (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto h-8 w-8 text-white/15 mb-3" />
                      <p className="text-xs text-white/30">No upcoming leave</p>
                    </div>
                  )
                }

                return upcoming.map((r) => {
                  const style = typeStyles[r.type] || typeStyles['Annual Leave']
                  const days = getDayCount(r.startDate, r.endDate)
                  return (
                    <div key={r.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn('h-2 w-2 rounded-full', style.dot)} />
                        <span className={cn('text-[11px] font-medium rounded-md px-2 py-0.5', style.bg, style.text)}>
                          {r.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white/85">{r.member}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/30 font-mono">
                        <span>{r.startDate}{r.endDate && r.endDate !== r.startDate ? ` → ${r.endDate}` : ''}</span>
                        <span className="text-white/15">|</span>
                        <span>{days} day{days !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )
                })
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
