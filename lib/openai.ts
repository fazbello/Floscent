import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function generateQuoteWithAI(params: {
  clientName: string
  clientCompany?: string
  serviceType: string
  requirements: string
  budget?: string
}): Promise<{ title: string; items: QuoteItem[]; notes: string }> {
  const ai = getOpenAI()

  const prompt = `You are a business consultant for Floscent, a premium custom fragrance and scent branding company. Generate a professional quote for a client.

Client: ${params.clientName}${params.clientCompany ? ` (${params.clientCompany})` : ''}
Service Type: ${params.serviceType}
Requirements: ${params.requirements}
Budget Range: ${params.budget || 'Not specified'}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Quote title",
  "items": [
    {
      "id": "1",
      "name": "Service/Product name",
      "description": "Brief description",
      "quantity": 1,
      "unitPrice": 0,
      "total": 0
    }
  ],
  "notes": "Professional closing note for the quote"
}`

  const response = await ai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from AI')

  return JSON.parse(content)
}

export async function generateProposalWithAI(params: {
  clientName: string
  clientCompany?: string
  serviceType: string
  requirements: string
  budget?: string
  timeline?: string
}): Promise<{ title: string; executive: string; sections: ProposalSection[] }> {
  const ai = getOpenAI()

  const prompt = `You are a senior proposal writer for Floscent, a premium custom fragrance and scent branding company. Create a professional business proposal.

Client: ${params.clientName}${params.clientCompany ? ` (${params.clientCompany})` : ''}
Service: ${params.serviceType}
Requirements: ${params.requirements}
Budget: ${params.budget || 'To be discussed'}
Timeline: ${params.timeline || 'Flexible'}

Return ONLY valid JSON in this exact format:
{
  "title": "Proposal title",
  "executive": "2-3 sentence executive summary",
  "sections": [
    {
      "id": "1",
      "title": "Section title",
      "content": "Section content in HTML format with <p>, <ul>, <li> tags",
      "order": 1
    }
  ]
}

Include these sections: Understanding Your Needs, Our Approach, Deliverables, Timeline, Investment, Why Floscent, Next Steps`

  const response = await ai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from AI')

  return JSON.parse(content)
}

export async function chatWithAI(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemContext?: string
): Promise<string> {
  const ai = getOpenAI()

  const systemPrompt = systemContext || `You are a helpful assistant for Floscent, a premium custom fragrance and scent branding company. You help clients understand our services, answer questions about fragrances, and provide guidance on scent branding. Be professional, knowledgeable, and friendly. Keep responses concise and helpful.`

  const response = await ai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.8,
    max_tokens: 800,
  })

  return response.choices[0]?.message?.content || 'I apologize, I could not generate a response.'
}

export async function improveContent(content: string, type: 'quote' | 'proposal' | 'email'): Promise<string> {
  const ai = getOpenAI()

  const response = await ai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{
      role: 'user',
      content: `Improve the following ${type} content for Floscent, making it more professional, compelling, and client-focused. Return only the improved content, no explanations:\n\n${content}`,
    }],
    temperature: 0.6,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content || content
}

export interface QuoteItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ProposalSection {
  id: string
  title: string
  content: string
  order: number
}
