import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login?redirect=/admin')
  if (session.role !== 'ADMIN') redirect('/client')

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
