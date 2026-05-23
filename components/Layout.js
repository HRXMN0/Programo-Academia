import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from './Chatbot'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Programo Academia - Learn Coding, DSA & All Tech in One Place",
  description:
    "Learn programming, DSA, and all major technologies. Practice coding with our built-in compiler and boost your skills with AI assistance.",
};

export default function Layout({ children }) {
  const router = useRouter()
  const { toast } = useAuth()

  const isLessonReader =
    router.pathname.startsWith('/dsa/') && router.pathname !== '/dsa'
  const isQuiz = router.pathname.startsWith('/quiz/')
  const isAuth =
    router.pathname.startsWith('/login') ||
    router.pathname.startsWith('/signup')

  const hideFooter = isLessonReader || isQuiz || isAuth

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      {/* Cloudflare script (if still needed) */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />

      {/* Navbar */}
      {!isAuth && <Navbar />}

      {/* Main Content */}
      <main className={`flex-grow flex flex-col ${!isAuth ? 'pt-16' : ''}`}>
        {children}
      </main>

      {/* ✅ Vercel Analytics (CORRECT PLACE) */}
      <Analytics />

      {/* Chatbot */}
      {!isAuth && <Chatbot />}

      {/* Footer */}
      {!hideFooter && <Footer />}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-gutter right-gutter z-50 animate-fade-in max-w-sm">
          <div className="bg-surface-container-lowest dark:bg-surface-high backdrop-blur-md border border-outline-variant dark:border-outline shadow-[0px_4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0px_8px_32px_rgba(0,0,0,0.3)] rounded-xl p-4 flex items-start gap-3">
            
            {toast.type === 'success' && (
              <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed">
                check_circle
              </span>
            )}

            {toast.type === 'error' && (
              <span className="material-symbols-outlined text-error">
                error
              </span>
            )}

            {toast.type === 'info' && (
              <span className="material-symbols-outlined text-primary">
                info
              </span>
            )}

            <div className="flex-1">
              <p className="text-body-md text-on-surface dark:text-inverse-on-surface font-medium leading-tight">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}