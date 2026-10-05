import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { askAI } from '../utils/aiClient'

/* ---------------------------------------------------------------------------
   Markdown-ish rendering for tutor replies.

   The model answers in plain prose sprinkled with fenced code, bullet lists,
   numbered steps and **emphasis**. Painting all of that into a single <p> made
   every answer a wall of text — which is exactly the thing a tutor should not
   be. Everything below is presentation only: the message objects, the history
   we hand to askAI() and its call signature are untouched.
--------------------------------------------------------------------------- */

const CODE_FENCE = /```([a-zA-Z0-9+#]*)\n?([\s\S]*?)```/g

// Split a reply into prose runs and fenced code blocks.
function splitBlocks(text) {
  const blocks = []
  let cursor = 0
  let match

  CODE_FENCE.lastIndex = 0
  while ((match = CODE_FENCE.exec(text)) !== null) {
    if (match.index > cursor) blocks.push({ kind: 'prose', body: text.slice(cursor, match.index) })
    blocks.push({ kind: 'code', lang: (match[1] || 'cpp').toLowerCase(), body: match[2].replace(/\s+$/, '') })
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) blocks.push({ kind: 'prose', body: text.slice(cursor) })

  return blocks.length ? blocks : [{ kind: 'prose', body: text }]
}

// `**bold**` and `inline code` within one line.
function renderInline(line, keyPrefix) {
  return line
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-i${i}`
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key} className="font-semibold text-on-surface">{part.slice(2, -2)}</strong>
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={key} className="font-code-block text-[12px] rounded border border-secondary/20 bg-secondary/10 px-1 py-0.5 text-secondary">
            {part.slice(1, -1)}
          </code>
        )
      }
      return <span key={key}>{part}</span>
    })
}

// Prose run → headings, bullet lists, numbered steps, paragraphs.
function renderProse(body, keyPrefix) {
  const out = []
  let bullets = []

  const flushBullets = () => {
    if (!bullets.length) return
    const items = bullets
    bullets = []
    out.push(
      <ul key={`${keyPrefix}-ul${out.length}`} className="my-1.5 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
            <span className="min-w-0">{renderInline(item, `${keyPrefix}-ul${out.length}-${i}`)}</span>
          </li>
        ))}
      </ul>
    )
  }

  body.split('\n').forEach((raw, lineIdx) => {
    const line = raw.trim()
    if (!line) { flushBullets(); return }

    const bullet = line.match(/^[-*•]\s+(.*)$/)
    if (bullet) { bullets.push(bullet[1]); return }

    flushBullets()

    const heading = line.match(/^#{1,4}\s+(.*)$/)
    if (heading) {
      out.push(
        <p key={`${keyPrefix}-h${lineIdx}`} className="mt-2 mb-1 font-label-md text-label-md text-xs uppercase tracking-[0.12em] text-on-surface-variant">
          {heading[1].replace(/[*`]/g, '')}
        </p>
      )
      return
    }

    const step = line.match(/^(\d+)[.)]\s+(.*)$/)
    if (step) {
      out.push(
        <div key={`${keyPrefix}-s${lineIdx}`} className="my-1 flex gap-2">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary/10 font-code-block text-[11px] font-bold text-secondary">
            {step[1]}
          </span>
          <span className="min-w-0">{renderInline(step[2], `${keyPrefix}-s${lineIdx}`)}</span>
        </div>
      )
      return
    }

    out.push(
      <p key={`${keyPrefix}-p${lineIdx}`} className="my-1 first:mt-0 last:mb-0">
        {renderInline(line, `${keyPrefix}-p${lineIdx}`)}
      </p>
    )
  })

  flushBullets()
  return out
}

// A reply, fully formatted. Code lands in a dark titled panel — that
// dark-on-light contrast is the point, and the only place raw hex belongs.
function FormattedReply({ content, id }) {
  return (
    <div className="font-body-md text-body-md text-[13px] leading-[22px]">
      {splitBlocks(content).map((block, idx) =>
        block.kind === 'code' ? (
          <div key={`${id}-c${idx}`} className="my-2 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-lifted">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#161b22] px-3 py-1.5">
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              </span>
              <span className="font-code-block text-[10px] uppercase tracking-[0.16em] text-white/50">{block.lang}</span>
            </div>
            <pre className="overflow-x-auto p-3 no-scrollbar">
              <code className="font-code-block text-[12px] leading-[20px] text-[#e6edf3]">{block.body}</code>
            </pre>
          </div>
        ) : (
          <div key={`${id}-t${idx}`}>{renderProse(block.body, `${id}-t${idx}`)}</div>
        )
      )}
    </div>
  )
}

// Quick-action tones. Only token colours that clear 4.5:1 as label ink in both
// themes are used here — the topic accents are too light for text on white.
const TONES = {
  secondary: 'border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20',
  tertiary: 'border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20',
  primary: 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20'
}

export default function Chatbot() {
  const router = useRouter()
  const { chatbotOpen, setChatbotOpen, chatbotQuestion, setChatbotQuestion } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Programo AI Tutor. 🎓 I can explain C++ syntax, Big-O complexity, or dry-run algorithms. What would you like to study today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatbotOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, chatbotOpen])

  // Get route-based context
  const getRouteContext = () => {
    const { pathname, query } = router
    if (pathname.startsWith('/dsa/') && query.slug) {
      return `User is studying the DSA topic: "${query.slug}"`
    }
    if (pathname.startsWith('/cpp')) {
      return `User is studying the C++ programming language track.`
    }
    if (pathname === '/interview-prep') {
      return `User is in the AI Interview Practice workspace.`
    }
    return `User is exploring the Programo Academia learning platform.`
  }

  // Handle external triggers (like clicking "Ask Tutor AI" on a topic page)
  useEffect(() => {
    if (chatbotQuestion) {
      handleSendMessage(chatbotQuestion)
      setChatbotQuestion(null)
      if (!chatbotOpen) setChatbotOpen(true)
    }
  }, [chatbotQuestion])

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    // Prevent multiple requests
    setLoading(true)
    if (!textToSend) setInput('') // Clear input if typed

    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])

    try {
      const context = getRouteContext()
      // Send chat history (excluding welcome message to save space)
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const aiResponse = await askAI(text, context, chatHistory)

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.message || "AI Tutor is currently offline. Please try again later."
      }])
    } finally {
      setLoading(false)
    }
  }

  // Quick Action Prompts
  const quickPrompts = [
    { label: "Explain this topic", prompt: "Explain the current topic page in simple terms.", icon: "menu_book", tone: "secondary" },
    { label: "Show C++ example", prompt: "Give me a practical C++ code example for the current concept.", icon: "code", tone: "tertiary" },
    { label: "Explain Big-O times", prompt: "What are the time and space complexity characteristics here?", icon: "speed", tone: "primary" }
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 flex flex-col items-center justify-end pointer-events-none">

      {/* Main Container (Pill expanding into Panel) */}
      <div className={`w-full backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out-expo pointer-events-auto border border-outline-variant ${
        chatbotOpen
          ? 'h-[min(70vh,540px)] rounded-2xl bg-surface-container-lowest shadow-lifted'
          : 'h-14 rounded-full bg-surface-container-lowest/85 shadow-lifted hover:border-secondary/40'
      }`}>

        {/* Expanded content area (Header, Messages, Quick Actions) */}
        <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-300 ${chatbotOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>

          {/* Header */}
          <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between gap-2 border-b border-outline-variant select-none shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-brand">
                <span className="material-symbols-outlined filled text-[18px]">smart_toy</span>
                {/* Presence dot — the "Online" claim, shown rather than written. */}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-topic-emerald border-2 border-surface-container-low" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline-sm text-headline-sm text-sm text-on-surface leading-tight truncate">Programo AI Tutor</h3>
                <span className="font-body-sm text-body-sm text-[11px] text-on-surface-variant">C++ &amp; DSA · context aware</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setChatbotOpen(false); }}
              aria-label="Close AI tutor"
              className="w-8 h-8 shrink-0 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
            </button>
          </div>

          {/* Messages List */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background no-scrollbar"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg) => {
              const isAI = msg.role === 'assistant'
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}>
                  {isAI && (
                    <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 select-none mb-0.5">
                      <span className="material-symbols-outlined filled text-[14px]" aria-hidden="true">smart_toy</span>
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-2.5 ${
                    isAI
                      ? 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-2xl rounded-bl-sm shadow-card'
                      : 'bg-secondary text-on-secondary rounded-2xl rounded-br-sm shadow-brand'
                  }`}>
                    {isAI ? (
                      <FormattedReply content={msg.content} id={msg.id} />
                    ) : (
                      <p className="whitespace-pre-wrap font-body-md text-body-md text-[13px] leading-[22px] font-medium">
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mb-0.5">
                  <span className="material-symbols-outlined filled text-[14px]" aria-hidden="true">smart_toy</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-bl-sm shadow-card px-4 py-3 flex items-center gap-2">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                  <span className="font-body-sm text-body-sm text-xs text-on-surface-variant">Working it through…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Bar when OPEN */}
          <div className="px-4 py-2.5 border-t border-outline-variant bg-surface-container-low flex gap-2 overflow-x-auto select-none no-scrollbar shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); handleSendMessage(p.prompt); }}
                disabled={loading}
                className={`shrink-0 inline-flex items-center gap-1.5 font-label-md text-label-md text-[11px] border px-3 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:pointer-events-none ${TONES[p.tone]}`}
              >
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form (Always Visible) */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (!chatbotOpen) setChatbotOpen(true); else handleSendMessage(); }}
          onClick={() => { if (!chatbotOpen) setChatbotOpen(true) }}
          className={`shrink-0 flex items-center gap-2 transition-all duration-300 ${chatbotOpen ? 'p-3 bg-surface-container-lowest border-t border-outline-variant' : 'p-2 cursor-text'}`}
        >
          <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-brand">
            <span className="material-symbols-outlined filled text-[18px]" aria-hidden="true">smart_toy</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setChatbotOpen(true)}
            placeholder="Ask any question..."
            aria-label="Ask the AI tutor a question"
            disabled={loading && chatbotOpen}
            className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm font-body-md outline-none px-1 text-on-surface placeholder:text-on-surface-variant"
          />
          <button
            type="submit"
            onClick={(e) => {
              if (!chatbotOpen) {
                e.preventDefault();
                setChatbotOpen(true);
              }
            }}
            disabled={(chatbotOpen && (!input.trim() || loading))}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-brand hover:shadow-brand-hover disabled:opacity-40 disabled:shadow-none transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
          </button>
        </form>
      </div>

      {/* Quick suggestions below the input when CLOSED */}
      {!chatbotOpen && (
        <div className="flex flex-wrap justify-center gap-2 mt-3 animate-fade-in pointer-events-auto">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setChatbotOpen(true); handleSendMessage(p.prompt) }}
              className={`inline-flex items-center gap-1.5 bg-surface-container-lowest/85 backdrop-blur-md border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-secondary/40 font-label-md text-label-md text-[11px] px-3 py-1.5 rounded-full shadow-card hover:shadow-card-hover transition-all ${
                idx === 2 ? 'hidden sm:inline-flex' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[14px] text-secondary" aria-hidden="true">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
