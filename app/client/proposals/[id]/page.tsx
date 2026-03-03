import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatDate, parseJsonSafe } from '@/lib/utils'
import ProposalSignature from '@/components/features/ProposalSignature'

interface Section { id: string; title: string; content: string; order: number }

export default async function ClientProposalDetail({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return null

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: { client: true },
  })
  if (!proposal) notFound()

  const client = await prisma.client.findFirst({ where: { userId: session.userId } })
  if (!client || proposal.clientId !== client.id) notFound()

  const sections = parseJsonSafe<Section[]>(proposal.sections, [])

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="font-serif text-2xl font-bold text-gold-500 tracking-widest mb-6">FLOSCENT</div>
        <h1 className="font-serif text-4xl font-bold text-white mb-3">{proposal.title}</h1>
        <p className="text-dark-400">Prepared exclusively for {proposal.client.name}</p>
        <p className="text-dark-500 text-sm mt-1">{formatDate(proposal.createdAt)}</p>
        {proposal.aiGenerated && (
          <span className="inline-flex items-center gap-1 mt-3 text-xs bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full">
            <span>✦</span> AI-Enhanced Proposal
          </span>
        )}
      </div>

      {/* Executive Summary */}
      {proposal.executive && (
        <div className="card mb-8 border-gold-500/20 bg-gold-500/5 text-center">
          <div className="text-xs text-gold-500 uppercase tracking-widest mb-3">Executive Summary</div>
          <p className="text-dark-200 text-lg leading-relaxed font-serif italic">&ldquo;{proposal.executive}&rdquo;</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6 mb-8">
        {sections.length > 0 ? (
          sections.sort((a, b) => a.order - b.order).map(section => (
            <div key={section.id} className="card">
              <h2 className="font-serif text-xl font-semibold text-white mb-4 pb-3 border-b border-dark-800">{section.title}</h2>
              <div
                className="prose-dark text-dark-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content || '<p>Content will be added here.</p>' }}
              />
            </div>
          ))
        ) : proposal.content ? (
          <div className="card">
            <div className="prose-dark text-dark-300 leading-relaxed whitespace-pre-wrap">{proposal.content}</div>
          </div>
        ) : null}
      </div>

      {/* Signature / Actions */}
      <ProposalSignature
        proposalId={proposal.id}
        status={proposal.status}
        signedAt={proposal.signedAt?.toISOString() || null}
        signedBy={proposal.signedBy}
        clientName={proposal.client.name}
      />
    </div>
  )
}
