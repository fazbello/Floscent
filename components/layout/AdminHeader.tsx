import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export default async function AdminHeader() {
  const session = await getSession()
  const user = session ? await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  }) : null

  return (
    <header className="h-14 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-dark-400">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm text-dark-200">{user?.name || 'Admin'}</div>
          <div className="text-xs text-dark-500">{user?.email}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 text-sm font-bold">
          {(user?.name || 'A')[0].toUpperCase()}
        </div>
      </div>
    </header>
  )
}
