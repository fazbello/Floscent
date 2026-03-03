'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || ''
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      const dest = redirect || (data.user.role === 'ADMIN' ? '/admin' : '/client')
      router.push(dest)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-dark-400">Sign in to your Floscent partner portal</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link href="/forgot-password" className="text-xs text-gold-500 hover:text-gold-400">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-dark-400 text-sm">
          New partner?{' '}
          <Link href="/onboard" className="text-gold-500 hover:text-gold-400 font-medium">
            Start onboarding
          </Link>
        </p>
      </div>

      <div className="mt-8 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-dark-500 text-xs mb-2 font-medium uppercase tracking-wider">Demo Credentials</p>
        <p className="text-dark-400 text-xs">Admin: admin@floscent.com / Admin@123456</p>
        <p className="text-dark-400 text-xs">Client: demo@client.com / Client@123456</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-dark-400 text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
