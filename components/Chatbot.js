import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { askAI } from '../utils/aiClient'

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
    { label: "Explain this topic", prompt: "Explain the current topic page in simple terms." },
    { label: "Show C++ example", prompt: "Give me a practical C++ code example for the current concept." },
    { label: "Explain Big-O times", prompt: "What are the time and space complexity characteristics here?" }
  ]

  if (!chatbotOpen) {
    return (
      <button 
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-28 right-gutter z-40 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all select-none group"
        title="Open AI Tutor"
        id="chatbot-toggle-btn"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">smart_toy</span>
      </button>
    )
  }

  return (
    <div 
      className="fixed bottom-28 right-gutter z-45 w-[380px] h-[500px] bg-white/95 backdrop-blur-md border border-outline-variant shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in"
      id="chatbot-panel"
    >
      {/* Header */}
      <div className="bg-primary text-on-primary p-md flex items-center justify-between border-b border-outline-variant select-none">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-sm text-white leading-none">Programo AI Tutor</h3>
            <span className="text-[10px] text-secondary font-medium">Online • Context Aware</span>
          </div>
        </div>
        <button 
          onClick={() => setChatbotOpen(false)}
          className="text-white opacity-70 hover:opacity-100 transition-opacity p-xs hover:bg-white/10 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-md space-y-md bg-background/50">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant'
          return (
            <div key={msg.id} className={`flex items-start gap-xs ${isAI ? 'justify-start' : 'justify-end'}`}>
              {isAI && (
                <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xs shrink-0 select-none">
                  <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-sm px-md text-sm leading-relaxed shadow-sm ${
                isAI 
                  ? 'bg-white border border-outline-variant text-on-background rounded-tl-xs' 
                  : 'bg-primary text-on-primary rounded-tr-xs'
              }`}>
                <p className="whitespace-pre-wrap font-body-md text-xs font-semibold leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-start gap-xs justify-start animate-pulse">
            <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xs shrink-0">
              <span className="material-symbols-outlined text-[14px]">smart_toy</span>
            </div>
            <div className="bg-white border border-outline-variant text-on-surface-variant max-w-[80%] rounded-2xl p-sm px-md text-xs flex items-center gap-xs rounded-tl-xs">
              <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Bar */}
      <div className="px-md py-xs border-t border-outline-variant bg-surface-container-lowest flex gap-xs overflow-x-auto select-none no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.prompt)}
            disabled={loading}
            className="shrink-0 text-[10px] font-medium bg-surface-container border border-outline-variant text-on-surface-variant hover:text-primary hover:border-secondary px-sm py-xs rounded-full transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="p-sm bg-white border-t border-outline-variant flex items-center gap-xs"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-grow border-none focus:ring-0 text-xs px-sm py-xs bg-surface-container-low rounded-lg focus:outline-none text-on-background placeholder:text-on-surface-variant disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 hover:bg-on-secondary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed active-press"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  )
}
