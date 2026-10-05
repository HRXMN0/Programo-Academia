import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from './Chatbot'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { Analytics } from "@vercel/analytics/react"

// One entry per toast type, so every variant gets a matching icon, accent rail
// and tinted icon tile instead of a bare glyph. Unknown types fall back to info
// rather than rendering no icon at all.
const TOAST_VARIANTS = {
  success: {
    icon: 'check_circle',
    rail: 'bg-secondary',
    tile: 'bg-secondary-container text-on-secondary-container',
  },
  error: {
    icon: 'error',
    rail: 'bg-error',
    tile: 'bg-error-container text-on-error-container',
  },
  info: {
    icon: 'info',
    rail: 'bg-tertiary',
    tile: 'bg-tertiary-container text-on-tertiary-container',
  },
}

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

  const toastVariant = (toast && TOAST_VARIANTS[toast.type]) || TOAST_VARIANTS.info

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Keyboard users get past the whole nav in one tab. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:font-label-md focus:text-label-md focus:text-on-secondary focus:shadow-brand"
      >
        Skip to content
      </a>

      {/* Navbar */}
      {!isAuth && <Navbar />}

      {/* Main Content */}
      <main id="main-content" className={`flex-grow flex flex-col ${!isAuth ? 'pt-16' : ''}`}>
        {children}
      </main>

      {/* Vercel Analytics */}
      <Analytics />

      {/* Chatbot */}
      {!isAuth && <Chatbot />}

      {/* Footer */}
      {!hideFooter && <Footer />}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-gutter right-gutter z-50 animate-fade-in w-[calc(100%-3rem)] max-w-sm"
        >
          <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 pl-5 shadow-lifted">
            {/* Colour rail: the fastest read on whether this went well or not. */}
            <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${toastVariant.rail}`} />

            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toastVariant.tile}`}>
              <span className="material-symbols-outlined text-[20px]">{toastVariant.icon}</span>
            </span>

            <p className="flex-1 self-center text-body-sm font-medium leading-snug text-on-surface">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
