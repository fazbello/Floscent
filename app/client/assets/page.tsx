import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'My Assets – Floscent' }

const TYPE_ICONS: Record<string, string> = {
  IMAGE: '🖼', DOCUMENT: '📄', VIDEO: '🎬', LOGO: '◈', BRAND_ASSET: '✦', CONTRACT: '📋', FILE: '📁', OTHER: '◉',
}

export default async function ClientAssetsPage() {
  const session = await getSession()
  if (!session) return null

  const client = await prisma.client.findFirst({ where: { userId: session.userId } })
  const assets = client ? await prisma.asset.findMany({
    where: { clientId: client.id, status: { not: 'DELETED' } },
    orderBy: { createdAt: 'desc' },
  }) : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Assets</h1>
        <p className="section-subtitle">{assets.length} asset(s) in your library</p>
      </div>

      {assets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 text-dark-700">✧</div>
          <h3 className="font-semibold text-white mb-2">No assets yet</h3>
          <p className="text-dark-400 text-sm">Documents, contracts, brand materials, and more will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="card hover:border-gold-500/30 transition-all">
              <div className="text-3xl mb-3">{TYPE_ICONS[asset.type] || '📁'}</div>
              <div className="font-medium text-dark-100">{asset.name}</div>
              <div className="text-xs text-dark-500 mt-0.5">{asset.type}</div>
              {asset.description && <p className="text-xs text-dark-400 mt-2 line-clamp-2">{asset.description}</p>}
              {asset.version && <div className="text-xs text-dark-600 mt-2">Version {asset.version}</div>}
              {asset.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {asset.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="text-xs bg-gold-500/10 text-gold-600 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-dark-600">{formatDate(asset.createdAt)}</div>
                {asset.url && (
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-500 hover:text-gold-400">
                    ↗ Open
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
