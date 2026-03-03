import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { generateQuoteWithAI } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = await req.json()
    const { clientName, clientCompany, serviceType, requirements, budget } = body

    if (!clientName || !serviceType || !requirements) {
      return NextResponse.json({ error: 'Client name, service type, and requirements are required' }, { status: 400 })
    }

    const result = await generateQuoteWithAI({ clientName, clientCompany, serviceType, requirements, budget })
    return NextResponse.json(result)
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden'))
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    console.error('AI quote generation error:', err)
    return NextResponse.json({ error: 'AI generation failed. Please ensure your OpenAI API key is configured.' }, { status: 500 })
  }
}
