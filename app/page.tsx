'use client'

import { useState } from 'react'

declare const puter: any

// ─── Types ───────────────────────────────────────────────────────────────────
type Message = { role: 'user' | 'ai'; text: string }
type Tool = 'chat' | 'resumen' | 'tareas'
type ResumenTipo = 'conciso' | 'detallado' | 'puntos' | 'glosario'
type TareaTipo = 'explicar' | 'ensayo' | 'ejercicio' | 'examinar' | 'citar'

// ─── Chat Tool ────────────────────────────────────────────────────────────────
function ChatTool() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: '¡Hola! Soy el asistente de IA de Mi Universidad. Puedo ayudarte con dudas de tus materias, explicar conceptos, resolver ejercicios o conversar sobre temas académicos. ¿En qué te ayudo hoy?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const resp = await puter.ai.chat(
        `Eres un asistente académico universitario amable y claro. Responde siempre en español de forma concisa y educativa.\n\nPregunta del estudiante: ${userMsg}`,
        { model: 'claude-sonnet-4-6' }
      )
      const aiText =
        resp?.message?.content?.[0]?.text ?? resp?.toString() ?? 'Sin respuesta.'
      setMessages((prev) => [...prev, { role: 'ai', text: aiText }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Error al conectar con la IA. Verifica tu conexión e inténtalo de nuevo.' },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[420px] bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium
                ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}
            >
              {m.role === 'user' ? 'Tú' : 'IA'}
            </div>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
              IA
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          rows={1}
          placeholder="Escribe tu pregunta académica... (Enter para enviar)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none bg-gray-50 text-gray-800 placeholder-gray-400"
          style={{ minHeight: '40px', maxHeight: '120px' }}
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = t.scrollHeight + 'px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Resumen Tool ─────────────────────────────────────────────────────────────
function ResumenTool() {
  const [text, setText] = useState('')
  const [tipo, setTipo] = useState<ResumenTipo>('conciso')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const prompts: Record<ResumenTipo, string> = {
    conciso: `Resume el siguiente texto académico en 3-5 oraciones concisas en español:\n\n`,
    detallado: `Haz un resumen detallado del siguiente texto académico, manteniendo los puntos más importantes. Responde en español:\n\n`,
    puntos: `Extrae los puntos clave del siguiente texto académico como lista numerada. Responde en español:\n\n`,
    glosario: `Identifica y define brevemente los términos o conceptos más importantes del siguiente texto académico. Responde en español:\n\n`,
  }

  async function doResumen() {
    if (!text.trim()) return
    setLoading(true)
    setResult('')
    try {
      const resp = await puter.ai.chat(prompts[tipo] + text, {
        model: 'claude-sonnet-4-6',
      })
      setResult(resp?.message?.content?.[0]?.text ?? resp?.toString() ?? 'Sin respuesta.')
    } catch {
      setResult('Error al conectar con la IA. Inténtalo de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <p className="text-sm text-gray-500">
        Pega cualquier texto académico (artículos, apuntes, fragmentos de libros) y obtén un resumen generado por IA.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pega aquí el texto académico que deseas resumir..."
        rows={6}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 resize-y"
      />

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as ResumenTipo)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 outline-none focus:border-blue-500"
        >
          <option value="conciso">Resumen conciso</option>
          <option value="detallado">Resumen detallado</option>
          <option value="puntos">Puntos clave</option>
          <option value="glosario">Términos importantes</option>
        </select>

        <button
          onClick={doResumen}
          disabled={loading || !text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Resumiendo...' : 'Resumir con IA'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
          {result}
        </div>
      )}
    </div>
  )
}

// ─── Tareas Tool ──────────────────────────────────────────────────────────────
function TareasTool() {
  const [taskType, setTaskType] = useState<TareaTipo>('explicar')
  const [materia, setMateria] = useState('')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const chips: { value: TareaTipo; label: string }[] = [
    { value: 'explicar', label: 'Explicar concepto' },
    { value: 'ensayo', label: 'Estructura de ensayo' },
    { value: 'ejercicio', label: 'Resolver ejercicio' },
    { value: 'examinar', label: 'Preparar examen' },
    { value: 'citar', label: 'Formato APA' },
  ]

  const buildPrompt = (type: TareaTipo, q: string, m: string): string => {
    const ctx = m ? `Materia: ${m}. ` : ''
    const templates: Record<TareaTipo, string> = {
      explicar: `${ctx}Explica de forma clara y pedagógica para un estudiante universitario: ${q}`,
      ensayo: `${ctx}Proporciona una estructura detallada con puntos principales para un ensayo académico sobre: ${q}`,
      ejercicio: `${ctx}Resuelve paso a paso el siguiente ejercicio académico, explicando cada paso: ${q}`,
      examinar: `${ctx}Crea 5 preguntas de práctica con sus respuestas para preparar un examen sobre: ${q}`,
      citar: `Proporciona el formato de cita APA correcto para: ${q}. Incluye ejemplos concretos.`,
    }
    return `Eres un asistente académico universitario. Responde siempre en español de forma clara y útil. ${templates[type]}`
  }

  async function doTarea() {
    if (!query.trim()) return
    setLoading(true)
    setResult('')
    try {
      const resp = await puter.ai.chat(buildPrompt(taskType, query, materia), {
        model: 'claude-sonnet-4-6',
      })
      setResult(resp?.message?.content?.[0]?.text ?? resp?.toString() ?? 'Sin respuesta.')
    } catch {
      setResult('Error al conectar con la IA. Inténtalo de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <p className="text-sm text-gray-500">Selecciona el tipo de ayuda que necesitas y describe tu consulta.</p>

      {/* Task type chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.value}
            onClick={() => setTaskType(c.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${taskType === c.value
                ? 'bg-blue-50 text-blue-600 border-blue-500'
                : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Subject */}
      <input
        value={materia}
        onChange={(e) => setMateria(e.target.value)}
        placeholder="Materia (ej: Cálculo, Historia, Biología...)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500"
      />

      {/* Query */}
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={'Describe tu necesidad académica...\n\nEjemplo: "Explícame qué es la fotosíntesis en términos simples"'}
        rows={4}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 resize-y"
      />

      <button
        onClick={doTarea}
        disabled={loading || !query.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? 'Procesando...' : 'Obtener ayuda académica'}
      </button>

      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
          {result}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>('chat')

  const tools: { id: Tool; label: string; emoji: string; desc: string; bg: string }[] = [
    { id: 'chat', label: 'Chat con IA', emoji: '💬', desc: 'Conversa con Claude para resolver dudas académicas en tiempo real.', bg: 'bg-blue-50' },
    { id: 'resumen', label: 'Resumir texto', emoji: '📄', desc: 'Pega cualquier texto y obtén un resumen claro y estructurado.', bg: 'bg-emerald-50' },
    { id: 'tareas', label: 'Asistente académico', emoji: '🎓', desc: 'Ayuda con ensayos, conceptos y preparación de exámenes.', bg: 'bg-amber-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 leading-tight">Mi Universidad</p>
            <p className="text-xs text-gray-400 leading-tight">IA Académica</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors
                ${activeTool === t.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Powered by Claude · Puter.js
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Explora la IA en tu aprendizaje
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Prueba las capacidades de inteligencia artificial generativa directamente desde el portal universitario.
          </p>
        </div>

        {/* Tool selector cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`text-left p-4 bg-white rounded-xl border transition-all
                ${activeTool === t.id
                  ? 'border-blue-500 border-2 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:-translate-y-0.5'
                }`}
            >
              <div className={`w-10 h-10 ${t.bg} rounded-lg flex items-center justify-center text-xl mb-3`}>
                {t.emoji}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{t.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed hidden sm:block">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Active tool */}
        <div>
          {activeTool === 'chat' && <ChatTool />}
          {activeTool === 'resumen' && <ResumenTool />}
          {activeTool === 'tareas' && <TareasTool />}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Impulsado por Claude Sonnet 4.6 vía Puter.js · Sin costo para el desarrollador
        </p>
      </main>
    </div>
  )
}