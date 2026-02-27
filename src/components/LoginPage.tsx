import { useState } from 'react'
import { Zap, Eye, EyeOff, ArrowRight, Shield, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DottedSurface } from '@/components/ui/dotted-surface'

interface LoginPageProps {
  onLogin: (role: Role) => void
}

const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: 'admin@nexus.io', password: 'awdad123412e412412ascasfasf' },
  employee: { email: 'employee@nexus.io', password: 'asdafsasf123412412dsgfasfa' },
}

type Role = 'admin' | 'employee'

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>('admin')
  const [loginError, setLoginError] = useState('')

  const selectRole = (r: Role) => {
    setRole(r)
    setEmail(CREDENTIALS[r].email)
    setPassword(CREDENTIALS[r].password)
    setLoginError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const valid = CREDENTIALS[role]
    if (email !== valid.email || password !== valid.password) {
      setLoginError('Invalid email or password for the selected role.')
      return
    }
    setLoginError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    onLogin(role)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Three.js dotted surface background — z-0 layer */}
      <DottedSurface />

      {/* Gradient fades over the dots */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-[1]" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-[1]" />

      {/* Radial glow overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full z-[1]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04), transparent 60%)', filter: 'blur(40px)' }}
      />

      {/* Login content — z-10 layer, centered */}
      <div className="relative z-[10] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white animate-glow-pulse mb-5 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-white/40">Sign in to your Nexus dashboard</p>
          </div>

          {/* Form card */}
          <div className="relative rounded-2xl border border-white/[0.12] bg-[#0e0e0e]/90 p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(255,255,255,0.03)]">
            {/* Top glow */}
            <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.25] to-transparent rounded-full" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div className="animate-fade-up stagger-1">
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Sign in as
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => selectRole('admin')}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all duration-300',
                      role === 'admin'
                        ? 'border-white/[0.25] bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                      role === 'admin'
                        ? 'bg-white/[0.15] border border-white/[0.15]'
                        : 'bg-white/[0.06] border border-white/[0.06]'
                    )}>
                      <Shield className={cn('h-4 w-4', role === 'admin' ? 'text-white/90' : 'text-white/40')} />
                    </div>
                    <div className="text-left">
                      <p className={cn('text-xs font-semibold', role === 'admin' ? 'text-white/90' : 'text-white/50')}>
                        Admin
                      </p>
                      <p className="text-[10px] text-white/25">Full access</p>
                    </div>
                    {role === 'admin' && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => selectRole('employee')}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all duration-300',
                      role === 'employee'
                        ? 'border-white/[0.25] bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                      role === 'employee'
                        ? 'bg-white/[0.15] border border-white/[0.15]'
                        : 'bg-white/[0.06] border border-white/[0.06]'
                    )}>
                      <UserCheck className={cn('h-4 w-4', role === 'employee' ? 'text-white/90' : 'text-white/40')} />
                    </div>
                    <div className="text-left">
                      <p className={cn('text-xs font-semibold', role === 'employee' ? 'text-white/90' : 'text-white/50')}>
                        Employee
                      </p>
                      <p className="text-[10px] text-white/25">Limited</p>
                    </div>
                    {role === 'employee' && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="animate-fade-up stagger-2">
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@nexus.io' : 'employee@nexus.io'}
                  autoFocus
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/20 focus:border-white/[0.25] focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(255,255,255,0.04)]"
                />
              </div>

              {/* Password */}
              <div className="animate-fade-up stagger-3">
                <label className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Password
                  <a href="#" className="normal-case tracking-normal text-white/30 hover:text-white/60 transition-colors">
                    Forgot?
                  </a>
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

              {/* Remember me */}
              <div className="flex items-center gap-2 animate-fade-up stagger-4">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-white/[0.15] bg-white/[0.05] accent-white"
                />
                <label htmlFor="remember" className="text-xs text-white/40">
                  Remember me for 30 days
                </label>
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
                  'group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50 animate-fade-up stagger-5',
                  loading && 'pointer-events-none'
                )}
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                ) : (
                  <>
                    Sign In as {role === 'admin' ? 'Admin' : 'Employee'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-white/20 animate-fade-up stagger-6">
            Don't have an account? <a href="#" className="text-white/50 hover:text-white/70 transition-colors">Contact your admin</a>
          </p>
        </div>
      </div>
    </div>
  )
}
