import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import RibbonBackground from "@/components/RibbonBackground";

export default function Page() {
  const router = useRouter();
  const { signupWithEmail, loginWithGoogle, showToast, isLoggedIn, isLoaded } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [captchaError, setCaptchaError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect already-logged-in users immediately
  useEffect(() => {
    if (isLoaded && isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isLoggedIn, router]);

  // Turnstile widget init — must be declared before any early return (Rules of Hooks)
  useEffect(() => {
    if (!isLoaded || isLoggedIn) return; // Skip if redirecting

    const initTurnstile = () => {
      if (window.turnstile) {
        try {
          window.turnstile.render('#turnstile-container', {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
            callback: (token) => {
              setTurnstileToken(token);
              setCaptchaError(null);
            },
            'expired-callback': () => setTurnstileToken(null),
            'error-callback': () => setTurnstileToken(null),
          });
        } catch {
          // Turnstile render failed silently
        }
      }
    };

    if (window.turnstile) {
      initTurnstile();
    } else {
      const timer = setInterval(() => {
        if (window.turnstile) {
          initTurnstile();
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isLoaded, isLoggedIn]);

  // Block rendering until auth is confirmed to prevent flicker
  if (!isLoaded || isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-md">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-label-md text-label-md text-on-surface-variant animate-pulse">Redirecting...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setCaptchaError('Please verify you are human');
      return;
    }
    setCaptchaError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken })
      });

      const data = await res.json();

      if (!data.success) {
        setCaptchaError('Captcha verification failed. Please try again.');
        if (window.turnstile) {
          window.turnstile.reset('#turnstile-container');
        }
        setTurnstileToken(null);
        setLoading(false);
        return;
      }
    } catch (err) {
      setCaptchaError('An error occurred during captcha verification. Please try again.');
      if (window.turnstile) {
        window.turnstile.reset('#turnstile-container');
      }
      setTurnstileToken(null);
      setLoading(false);
      return;
    }

    try {
      await signupWithEmail(email, password, fullName);
    } catch {
      // Error toast is shown by signupWithEmail
      if (window.turnstile) {
        window.turnstile.reset('#turnstile-container');
      }
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-background flex flex-col font-body-md antialiased">
      <RibbonBackground />

      <Head>
        <title>Sign Up - Programo Academia</title>
        <style>{`
          .input-glow:focus-within {
            border-color: #007162;
            box-shadow: 0 0 0 2px rgba(0, 113, 98, 0.2);
            outline: none;
          }
        `}</style>
      </Head>

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />

      <main className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
          <div className="flex flex-col items-center mb-lg">
            <img
              alt="Programo Logo"
              className="h-16 w-16 mb-md object-contain rounded-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuASLKmmX4gA5u1SCOnayMh6Xxsv9dbTCkBRhKIJy3PNNwFZWCuUnouk5-PnVpji75P_fWMN7unld277x-dTHbVzmVSXCPRWtH-DR1rKBQiE5L0-tIXRoOUIQFhwOw_2DgeerSqZxiGfFpdiouFOHrK3fTDS9LitBJyXvjeX6WSsFlR1jKKHWdrajCFHx6Um6V1LdLlXXA1G-Nn26bgHbmXErFLU3C1mXPNXIYNS5cvgLSyHr1wlsDo2vEWoeRf4s-Pn6R9ZEgT4T4Q"
            />
            <h1 className="font-headline-lg text-headline-lg text-primary text-center">Create Account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-base">Join the next generation of engineers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Full Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="fullName">Full Name</label>
              <div className="relative rounded-md input-glow transition-shadow duration-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                  <span className="material-symbols-outlined text-outline">person</span>
                </div>
                <input
                  className="block w-full pl-10 sm:text-sm border-outline-variant rounded-md py-3 focus:ring-0 focus:border-secondary transition-colors duration-200 bg-surface-container-lowest text-on-surface"
                  id="fullName"
                  name="fullName"
                  placeholder="Ada Lovelace"
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">Email</label>
              <div className="relative rounded-md input-glow transition-shadow duration-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                  <span className="material-symbols-outlined text-outline">mail</span>
                </div>
                <input
                  className="block w-full pl-10 sm:text-sm border-outline-variant rounded-md py-3 focus:ring-0 focus:border-secondary transition-colors duration-200 bg-surface-container-lowest text-on-surface"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="password">Password</label>
              <div className="relative rounded-md input-glow transition-shadow duration-200">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input
                  className="block w-full pl-10 sm:text-sm border-outline-variant rounded-md py-3 focus:ring-0 focus:border-secondary transition-colors duration-200 bg-surface-container-lowest text-on-surface"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Turnstile Captcha Container */}
            <div className="flex flex-col items-center pt-xs">
              <div id="turnstile-container"></div>
              {captchaError && (
                <p className="text-error text-center text-sm font-medium mt-xs">{captchaError}</p>
              )}
            </div>

            <div className="pt-base">
              <button
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-DEFAULT shadow-sm font-label-md text-label-md font-medium text-on-primary bg-primary-container hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container transition-opacity duration-200 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-lg">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center font-label-md text-label-md">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant">Or continue with</span>
              </div>
            </div>

            <div className="mt-md">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-outline-variant rounded-lg shadow-sm bg-surface-container-lowest text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors duration-200"
                type="button"
              >
                <span className="material-symbols-outlined mr-2 text-on-surface select-none" style={{ fontSize: '20px' }}>travel_explore</span>
                Continue with Google
              </button>
            </div>
          </div>

          <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-secondary hover:text-on-secondary-container transition-colors duration-200">Login</Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 w-full bg-surface/80 backdrop-blur-md dark:bg-surface-dim/80 mt-auto">
        <div className="w-full max-w-container-max mx-auto border-t border-outline-variant dark:border-outline py-xl px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed leading-tight text-left">
            Programo<br />Academia
          </div>
          <div className="flex flex-col items-center gap-2 justify-center">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Curriculum</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Terms of Service</a>
            </div>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Contact</a>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant text-center md:text-right">
            © 2024 Programo Academia. Built for the next generation of<br />engineers.
          </div>
        </div>
      </footer>
    </div>
  );
}
