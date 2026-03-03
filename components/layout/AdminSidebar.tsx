'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem { href: string; label: string; icon: string; exact?: boolean }
interface NavSection { group: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    group: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '⬡', exact: true },
    ],
  },
  {
    group: 'Business',
    items: [
      { href: '/admin/clients', label: 'Clients', icon: '◉' },
      { href: '/admin/quotes', label: 'Quotes', icon: '◈' },
      { href: '/admin/proposals', label: 'Proposals', icon: '✦' },
      { href: '/admin/invoices', label: 'Invoices', icon: '◎' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { href: '/admin/assets', label: 'Assets', icon: '✧' },
      { href: '/admin/payments', label: 'Payments', icon: '⬢' },
      { href: '/admin/ai', label: 'AI Assistant', icon: '◐' },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: '⊙' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <Link href="/admin">
          <div className="font-serif text-xl font-bold text-gold-500 tracking-widest">FLOSCENT</div>
          <div className="text-dark-500 text-[10px] tracking-[0.2em] uppercase mt-0.5">Admin Portal</div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.group}>
            <div className="text-[10px] font-semibold text-dark-600 uppercase tracking-widest px-3 mb-2">{section.group}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                        : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
                    )}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-800">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-dark-500 hover:text-dark-300 rounded-lg hover:bg-dark-800 transition-colors"
        >
          <span>↗</span> View Public Site
        </a>
        <LogoutButton />
      </div>
    </aside>
  )
}

function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }
  return (
    <button
      onClick={logout}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors"
    >
      <span>⊗</span> Sign Out
    </button>
  )
}
