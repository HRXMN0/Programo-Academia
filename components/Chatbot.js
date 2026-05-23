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
    { label: "Explain this topic", prompt: "Explain the current topic page in simple terms." },
    { label: "Show C++ example", prompt: "Give me a practical C++ code example for the current concept." },
    { label: "Explain Big-O times", prompt: "What are the time and space complexity characteristics here?" }
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 flex flex-col items-center justify-end pointer-events-none">
      
      {/* Main Container (Pill expanding into Panel) */}
      <div className={`w-full backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto ${
        chatbotOpen 
          ? 'h-[500px] rounded-2xl bg-[#0D1117] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]' 
          : 'h-[52px] rounded-full bg-white/70 dark:bg-[#161B22]/80 border border-outline-variant dark:border-white/10'
      }`}>
        
        {/* Expanded content area (Header, Messages, Quick Actions) */}
        <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-300 ${chatbotOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          
          {/* Header */}
          <div className="bg-[#161B22] p-md flex items-center justify-between border-b border-white/10 select-none shrink-0">
            <div className="flex items-center gap-xs">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-sm text-white leading-none">Programo AI Tutor</h3>
                <span className="text-[10px] text-secondary font-medium">Online • Context Aware</span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setChatbotOpen(false); }}
              className="text-white opacity-70 hover:opacity-100 transition-opacity p-xs hover:bg-white/10 rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-md space-y-md bg-[#0D1117] no-scrollbar">
            {messages.map((msg) => {
              const isAI = msg.role === 'assistant'
              return (
                <div key={msg.id} className={`flex items-start gap-xs ${isAI ? 'justify-start' : 'justify-end'}`}>
                  {isAI && (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs shrink-0 select-none">
                      <span className="material-symbols-outlined text-white text-[14px]">smart_toy</span>
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-sm px-md text-sm leading-relaxed shadow-sm ${
                    isAI 
                      ? 'bg-[#161B22] border border-white/10 text-[#E6EDF3] rounded-tl-xs' 
                      : 'bg-[#DF6B4A] text-white rounded-tr-xs'
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
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs shrink-0">
                  <span className="material-symbols-outlined text-white text-[14px]">smart_toy</span>
                </div>
                <div className="bg-[#161B22] border border-white/10 text-white/70 max-w-[80%] rounded-2xl p-sm px-md text-xs flex items-center gap-xs rounded-tl-xs">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Bar when OPEN */}
          <div className="px-md py-xs border-t border-white/10 bg-[#0D1117] flex gap-xs overflow-x-auto select-none no-scrollbar shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); handleSendMessage(p.prompt); }}
                disabled={loading}
                className="shrink-0 text-[10px] font-medium bg-[#161B22] border border-white/10 text-white/70 hover:text-white hover:border-white/30 px-sm py-xs rounded-full transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form (Always Visible) */}
        <form 
          onSubmit={(e) => { e.preventDefault(); if (!chatbotOpen) setChatbotOpen(true); else handleSendMessage(); }}
          onClick={() => { if (!chatbotOpen) setChatbotOpen(true) }}
          className={`shrink-0 flex items-center gap-2 transition-all duration-300 ${chatbotOpen ? 'p-3 bg-[#0D1117] border-t border-white/10' : 'p-1.5 cursor-text'}`}
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 ml-1">
            <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setChatbotOpen(true)}
            placeholder="Ask any question..."
            disabled={loading && chatbotOpen}
            className={`flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none px-2 ${
              chatbotOpen 
                ? 'text-white placeholder:text-white/50' 
                : 'text-on-surface dark:text-white placeholder:text-on-surface-variant dark:placeholder:text-white/50'
            }`}
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
            className="w-8 h-8 rounded-full bg-[#DF6B4A] text-white flex items-center justify-center shrink-0 mr-1 disabled:opacity-50 hover:bg-[#c95d3e] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>

      {/* Quick suggestions below the input when CLOSED */}
      {!chatbotOpen && (
        <div className="flex justify-center gap-2 mt-3 animate-fade-in pointer-events-auto">
          {quickPrompts.map((p, idx) => (
            <button 
              key={idx}
              onClick={() => { setChatbotOpen(true); handleSendMessage(p.prompt) }} 
              className="bg-white/80 dark:bg-surface-high/80 backdrop-blur-md border border-outline-variant dark:border-white/10 text-on-surface-variant dark:text-white/80 text-[11px] font-medium px-3 py-1.5 rounded-full hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
