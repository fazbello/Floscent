import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { chatWithAI } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, context } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }

    const systemContext = session.role === 'ADMIN'
      ? `You are an intelligent business assistant for Floscent, the world's first luxury perfume vending machine company developed in Europe. Help the admin with business insights, client management, quote generation advice, and operational questions. You have deep knowledge of the luxury fragrance industry and passive income business models.`
      : `You are a helpful assistant for Floscent partners. You help clients understand our luxury perfume vending machine products, investment opportunities, passive income potential, fragrance details, and partnership terms. Be professional, warm, and helpful. The company deploys luxury perfume vending machines that generate high-margin passive income.`

    const reply = await chatWithAI(messages, context || systemContext)
    return NextResponse.json({ message: reply })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Chat service unavailable. Please configure your OpenAI API key.' }, { status: 500 })
  }
}
