import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from './Chatbot'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Script from 'next/script'

export default function Layout({ children }) {
  const router = useRouter()
  const { toast } = useAuth()

  // Determine pages that should suppress the standard document footer
  // (Full-height scroll-locked lessons, interactive quizzes, and clean auth screens)
  const isLessonReader = router.pathname.startsWith('/dsa/') && router.pathname !== '/dsa'
  const isQuiz = router.pathname.startsWith('/quiz/')
  const isAuth = router.pathname.startsWith('/login') || router.pathname.startsWith('/signup')

  const hideFooter = isLessonReader || isQuiz || isAuth

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      {!isAuth && <Navbar />}
      <main className={`flex-grow flex flex-col ${!isAuth ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isAuth && <Chatbot />}
      {!hideFooter && <Footer />}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-gutter right-gutter z-50 animate-fade-in max-w-sm">
          <div className="bg-white/95 backdrop-blur-md border border-outline-variant shadow-lg rounded-xl p-4 flex items-start gap-3">
            {toast.type === 'success' && (
              <span className="material-symbols-outlined text-secondary select-none">check_circle</span>
            )}
            {toast.type === 'error' && (
              <span className="material-symbols-outlined text-error select-none">error</span>
            )}
            {toast.type === 'info' && (
              <span className="material-symbols-outlined text-on-primary-container select-none">info</span>
            )}
            <div className="flex-1">
              <p className="text-body-md text-on-background font-medium leading-tight">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
