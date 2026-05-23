import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isLoggedIn, isLoaded, user } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      if (!isLoggedIn) {
        router.replace('/login');
      } else if (!user?.emailVerified) {
        router.replace('/verify-email');
      }
    }
  }, [isLoaded, isLoggedIn, user, router]);

  // While checking auth state, or if they are not fully authenticated, show a loader
  if (!isLoaded || !isLoggedIn || !user?.emailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If loaded, logged in, and email is verified, render the protected content
  return children;
}
