'use client'
import { useState } from 'react'

declare const puter: any

export default function ChatTool() {
  const [messages, setMessages] = useState<{role:string, text:string}[]>([
    { role: 'ai', text: '¡Hola! Soy el asistente de IA de Mi Universidad. ¿En qué te ayudo?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const resp = await puter.ai.chat(
        `Eres un asistente académico universitario. Responde en español. Usuario: ${userMsg}`,
        { model: 'claude-sonnet-4-6' }
      )
      const aiText = resp?.message?.content?.[0]?.text ?? 'Sin respuesta.'
      setMessages(prev => [...prev, { role: 'ai', text: aiText }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error de conexión. Inténtalo de nuevo.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-96 border rounded-xl overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className={`max-w-xs px-4 py-2 rounded-xl text-sm leading-relaxed
              ${m.role==='user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 px-4 py-3 bg-gray-100 rounded-xl w-fit">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{animationDelay:`${i*0.15}s`}} />
            ))}
          </div>
        )}
      </div>
      <div className="border-t p-3 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&sendMessage()}
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Escribe tu pregunta..." />
        <button onClick={sendMessage} disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium
          hover:bg-blue-700 disabled:opacity-50 transition-colors">
          Enviar
        </button>
      </div>
    </div>
  )
}