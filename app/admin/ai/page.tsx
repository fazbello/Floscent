'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Floscent AI assistant. I can help you with business insights, draft quotes and proposals, analyze client data, and answer questions about the luxury fragrance vending machine industry. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-20) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || data.error || 'No response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your OpenAI API key.' }])
    } finally {
      setLoading(false)
    }
  }

  const SUGGESTIONS = [
    'Generate a quote for a hotel partner with 2 machines',
    'What are the best locations for Floscent machines?',
    'How should I follow up with a prospect after 2 weeks?',
    'Summarize the ROI calculation for the Prestige package',
    'What questions should I ask during client onboarding?',
  ]

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="section-subtitle">Powered by GPT-4 · Business intelligence for Floscent</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-dark-400">Online</span>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-h-0 flex flex-col card p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-gold-500/20 text-gold-500' : 'bg-dark-700 text-dark-200'
              }`}>
                {msg.role === 'assistant' ? '✦' : 'A'}
              </div>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-dark-800 text-dark-200 rounded-tl-sm'
                  : 'bg-gold-500/10 text-dark-100 border border-gold-500/20 rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center text-sm">✦</div>
              <div className="bg-dark-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-dark-500 mb-2">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-300 hover:text-dark-100 px-3 py-1.5 rounded-full transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-dark-800 flex gap-3">
          <input
            type="text"
            placeholder="Ask anything about your business…"
            className="input-field flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-4 py-2.5">
            {loading ? '…' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
