import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'

// Lessons, quizzes, the compiler and interview prep are all browsable without an
// account. Only these routes need one, because only these hold private data.
//
// /verify-email is deliberately NOT here: ProtectedRoute bounces unverified users
// to it *and* refuses to render for them, so gating it would strand signups on a
// permanent spinner. That page guards itself instead.
const PROTECTED_ROUTES = ['/dashboard', '/profile']

const isProtectedRoute = (pathname) =>
  PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))

export default function App({ Component, pageProps }) {
  const router = useRouter()

  return (
    <AuthProvider>
      {/* Site-wide defaults. Any page that renders its own <Head><title> wins,
          because next/head dedupes title and same-name meta tags. */}
      <Head>
        <title>Programo Academia — Learn Coding, DSA & All Tech in One Place</title>
        <meta
          name="description"
          content="Learn programming, DSA, and all major technologies. Practice coding with our built-in compiler and boost your skills with AI assistance."
        />
      </Head>
      <Layout>
        {isProtectedRoute(router.pathname) ? (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        ) : (
          <Component {...pageProps} />
        )}
      </Layout>
    </AuthProvider>
  )
}
