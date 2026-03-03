'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', company: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, company: form.company, phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      router.push('/client')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Create account</h1>
        <p className="text-dark-400">Join the Floscent partner network</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field" placeholder="Jane Doe" value={form.name} onChange={f('name')} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" className="input-field" placeholder="+1 555-0000" value={form.phone} onChange={f('phone')} />
          </div>
        </div>
        <div>
          <label className="label">Email address</label>
          <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={f('email')} required />
        </div>
        <div>
          <label className="label">Company (optional)</label>
          <input type="text" className="input-field" placeholder="Your Company" value={form.company} onChange={f('company')} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={f('password')} required minLength={8} />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input type="password" className="input-field" placeholder="Repeat password" value={form.confirm} onChange={f('confirm')} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-dark-400 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
