import { useState } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DottedSurface } from '@/components/ui/dotted-surface'
import { NotionService } from '@/services/NotionService'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setLoginError('Please enter your email and password.')
      return
    }
    setLoginError('')
    setLoading(true)
    try {
      await NotionService.login(email, password)
      onLogin()
    } catch {
      setLoginError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      <DottedSurface />

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-background to-transparent pointer-events-none z-1" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-background to-transparent pointer-events-none z-1" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 w-200 h-200 -translate-x-1/2 -translate-y-1/2 rounded-full z-1"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04), transparent 60%)', filter: 'blur(40px)' }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <img src="/logo-small.png" alt="Logo" className="h-14 mb-5 object-contain" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-white/40">Sign in to your dashboard</p>
          </div>

          {/* Form card */}
          <div className="relative rounded-2xl border border-white/[0.12] bg-[#0e0e0e]/90 p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(255,255,255,0.03)]">
            <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-linear-to-r from-transparent via-white/[0.25] to-transparent rounded-full" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="animate-fade-up stagger-1">
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoFocus
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(255,255,255,0.04)]"
                />
              </div>

              {/* Password */}
              <div className="animate-fade-up stagger-2">
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 pr-11 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(255,255,255,0.04)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {loginError && (
                <p className="text-sm text-red-400 animate-fade-up">{loginError}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50 animate-fade-up stagger-3',
                  loading && 'pointer-events-none'
                )}
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
