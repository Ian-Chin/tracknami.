import {
  FolderKanban,
  ListChecks,
  CalendarDays,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type Page = 'projects' | 'tasks' | 'calendar' | 'people' | 'timelogs' | 'login'

const navItems: { icon: typeof FolderKanban; label: string; page?: Page }[] = [
  { icon: Users, label: 'People', page: 'people' },
  { icon: FolderKanban, label: 'Projects', page: 'projects' },
  { icon: ListChecks, label: 'Tasks', page: 'tasks' },
  { icon: CalendarDays, label: 'Calendar', page: 'calendar' },
  { icon: Clock, label: 'Log Time', page: 'timelogs' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activePage: string
  onNavigate: (page: Page) => void
}

export function Sidebar({ collapsed, onToggle, activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-white/[0.08] bg-[#0d0d0d] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-white/[0.03] to-transparent pointer-events-none" />

      <div className="relative flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-30 shrink-0 object-contain" />
        </div>
        <button
          onClick={onToggle}
          className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 transition-all hover:text-white/80 hover:bg-white/[0.08]"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      <nav className="mt-6 flex flex-col gap-1.5 px-3">
        {!collapsed && (
          <span className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.15em] text-white/25">
            Navigation
          </span>
        )}
        {navItems.map((item, i) => {
          const isActive = item.page === activePage
          return (
            <button
              key={item.label}
              onClick={() => item.page && onNavigate(item.page)}
              className={cn(
                'group relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 animate-slide-in-left',
                `stagger-${i + 1}`,
                isActive ? 'text-white' : 'text-white/40 hover:text-white/80',
                !item.page && 'opacity-30 cursor-not-allowed'
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.12] shadow-[0_0_20px_rgba(255,255,255,0.04)]" />
              )}
              {!isActive && item.page && (
                <div className="absolute inset-0 rounded-xl bg-white/[0.04] opacity-0 transition-opacity group-hover:opacity-100" />
              )}
              <item.icon className="relative z-10 h-5 w-5 shrink-0" />
              {!collapsed && <span className="relative z-10">{item.label}</span>}
              {isActive && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
              )}
            </button>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-3 right-3 animate-fade-up stagger-6">
          <div className="rounded-xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              <p className="text-xs font-medium text-white/70">Notion Synced</p>
            </div>
            <p className="mt-1.5 text-[11px] text-white/30">
              Live data from your workspace
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
