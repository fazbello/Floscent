'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function ClientChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Floscent AI assistant. I can answer questions about our luxury perfume vending machines, your partnership, revenue projections, fragrance details, and anything else about your Floscent journey. How can I help you today?',
    }
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Sorry, I could not generate a response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const SUGGESTIONS = [
    'How much can I earn per month?',
    'What\'s the best location for a Floscent machine?',
    'How does the Prestige package work?',
    'When will my machine be delivered?',
    'What fragrances are available?',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="mb-4 shrink-0">
        <h1 className="page-title">AI Assistant</h1>
        <p className="section-subtitle">Ask me anything about your Floscent partnership</p>
      </div>

      <div className="flex-1 min-h-0 card p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-gold-500/20 text-gold-500' : 'bg-dark-700 text-dark-200'
              }`}>
                {msg.role === 'assistant' ? '✦' : 'Y'}
              </div>
              <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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

        {messages.length === 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-dark-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-300 hover:text-dark-100 px-3 py-1.5 rounded-full transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-dark-800 flex gap-3">
          <input
            type="text"
            placeholder="Type your question…"
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
