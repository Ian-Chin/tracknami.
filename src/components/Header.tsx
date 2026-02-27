import { Search, Bell, Plus, Sparkles, User, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onAddEntry: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onNavigateLogin?: () => void
}

export function Header({ onAddEntry, searchQuery, onSearchChange, onNavigateLogin }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0a0a0a]/80 px-6 backdrop-blur-xl">
      {/* Top glow accent */}
      <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold tracking-tight text-white">
          Overview
        </h1>
        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-1">
          <Sparkles className="h-3 w-3 text-white/40" />
          <span className="text-[10px] font-medium text-white/40 font-mono">LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-white/60" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-52 rounded-xl border border-white/[0.1] bg-white/[0.05] pl-9 pr-3 text-xs text-white/90 outline-none transition-all placeholder:text-white/30 focus:w-72 focus:border-white/[0.2] focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/[0.12] bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-mono text-white/30">
            /
          </kbd>
        </div>

        {/* Add Entry button */}
        <button
          onClick={onAddEntry}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/50 transition-all hover:border-white/[0.2] hover:text-white/80 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)]"
          title="New Entry"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/50 transition-all hover:border-white/[0.2] hover:text-white/80 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
        </button>

        {/* User Account */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            onMouseEnter={() => setShowUserMenu(true)}
            className="group flex items-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 transition-all hover:border-white/[0.25] hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.1] border border-white/[0.1] transition-all group-hover:bg-white/[0.15] group-hover:border-white/[0.2] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]">
              <User className="h-3.5 w-3.5 text-white/70" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white/80">Admin</p>
              <p className="text-[10px] text-white/30">admin@nexus.io</p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/[0.12] bg-[#111111] p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.03)] animate-fade-up"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2 border-b border-white/[0.08] mb-1.5">
                <p className="text-xs font-medium text-white/80">Admin User</p>
                <p className="text-[10px] text-white/30 font-mono">admin@nexus.io</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  onNavigateLogin?.()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  onNavigateLogin?.()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
