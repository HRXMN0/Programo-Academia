import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import RibbonBackground from '../components/RibbonBackground';
import ThemeToggle from '../components/ThemeToggle';
import { auth } from '../lib/firebase';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, isLoaded, isLoggedIn, resendVerificationEmail, showToast } = useAuth();
  
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // If user is loaded and not logged in, they shouldn't be here
  useEffect(() => {
    if (isLoaded) {
      if (!isLoggedIn) {
        router.replace('/login');
      } else if (user?.emailVerified) {
        router.replace('/dashboard');
      }
    }
  }, [isLoaded, isLoggedIn, user, router]);

  // Auto-check verification status
  useEffect(() => {
    let intervalId;
    if (isLoaded && isLoggedIn && !user?.emailVerified) {
      intervalId = setInterval(async () => {
        if (auth.currentUser) {
          try {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
              clearInterval(intervalId);
              showToast('Email verified successfully! 🎉', 'success');
              window.location.href = '/dashboard';
            }
          } catch (e) {
            // Ignore reload errors
          }
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, isLoggedIn, user?.emailVerified]);

  // Cooldown timer logic
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setIsResending(true);
    const success = await resendVerificationEmail();
    setIsResending(false);
    
    if (success) {
      setCooldown(60); // 60-second cooldown
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      // Force reload the user object from Firebase to get fresh emailVerified status
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          showToast('Email verified successfully! 🎉', 'success');
          // Reloading the page or replacing route will trigger the AuthContext to re-fetch
          // But to make it instant for the UI, we can just redirect.
          window.location.href = '/dashboard';
        } else {
          showToast('Email not verified yet. Please check your inbox.', 'error');
        }
      }
    } catch (error) {
      showToast('Error checking verification status.', 'error');
    }
    setIsChecking(false);
  };

  if (!isLoaded || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface flex flex-col font-sans antialiased">
      <RibbonBackground />

      <div className="absolute top-gutter right-gutter z-50">
        <ThemeToggle />
      </div>

      <Head>
        <title>Programo Academia - Verify Email</title>
      </Head>

      <main className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <BrandLogo variant="auth" className="mb-6 scale-110 origin-center" />
            
            <div className="w-16 h-16 bg-primary-container/10 text-primary rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Verify your email</h1>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We've sent a verification link to your email address. Please verify to continue.
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 w-full mb-8">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-medium py-3 rounded-full transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    I have verified
                  </>
                )}
              </button>
              
              <button
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending 
                  ? 'Sending...' 
                  : cooldown > 0 
                    ? `Resend in ${cooldown}s` 
                    : 'Resend Email'}
              </button>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Can't find it? Check your spam or junk folder.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
