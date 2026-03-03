import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import ClientSidebar from '@/components/layout/ClientSidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login?redirect=/client')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) redirect('/login')
  if (user.role === 'ADMIN') redirect('/admin')

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      <ClientSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
