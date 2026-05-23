import '../styles/globals.css'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { useRouter } from 'next/router'

const PUBLIC_ROUTES = ['/', '/verify-email']

export default function App({ Component, pageProps }) {
  const router = useRouter()

  const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname) || 
                        router.pathname.startsWith('/login') || 
                        router.pathname.startsWith('/signup')

  return (
    <AuthProvider>
      <Layout>
        {isPublicRoute ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </Layout>
    </AuthProvider>
  )
}
