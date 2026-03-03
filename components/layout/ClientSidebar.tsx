'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/client', label: 'My Dashboard', icon: '⬡', exact: true },
  { href: '/client/quotes', label: 'My Quotes', icon: '◈' },
  { href: '/client/proposals', label: 'My Proposals', icon: '✦' },
  { href: '/client/invoices', label: 'Invoices', icon: '◎' },
  { href: '/client/assets', label: 'My Assets', icon: '✧' },
  { href: '/client/chat', label: 'AI Assistant', icon: '◐' },
]

interface User { name: string | null; email: string }

export default function ClientSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside className="w-60 bg-dark-900 border-r border-dark-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-dark-800">
        <Link href="/">
          <div className="font-serif text-xl font-bold text-gold-500 tracking-widest">FLOSCENT</div>
          <div className="text-dark-500 text-[10px] tracking-[0.2em] uppercase mt-0.5">Partner Portal</div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 text-sm font-bold">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm text-dark-200 truncate">{user.name || 'Partner'}</div>
            <div className="text-xs text-dark-500 truncate">{user.email}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              active ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
            )}>
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors">
          <span>⊗</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
