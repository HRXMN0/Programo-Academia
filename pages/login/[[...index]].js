import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function Page() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, isLoggedIn, isLoaded } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            sitekey: '1x00000000000000000000AA', // Testing sitekey — replace with real key for production
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
      await loginWithEmail(email, password);
    } catch {
      // Error toast is shown by loginWithEmail
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <Head>
        <title>Programo Academia - Login</title>
      </Head>

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />

      <main className="flex-grow flex items-center justify-center py-xl px-gutter md:px-0">
        <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(11,31,58,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0px_8px_24px_rgba(11,31,58,0.08)]">
          <div className="p-lg flex flex-col items-center border-b border-outline-variant bg-surface-bright">
            <img
              alt="Programo Academia Logo"
              className="w-20 h-20 mb-base object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuASLKmmX4gA5u1SCOnayMh6Xxsv9dbTCkBRhKIJy3PNNwFZWCuUnouk5-PnVpji75P_fWMN7unld277x-dTHbVzmVSXCPRWtH-DR1rKBQiE5L0-tIXRoOUIQFhwOw_2DgeerSqZxiGfFpdiouFOHrK3fTDS9LitBJyXvjeX6WSsFlR1jKKHWdrajCFHx6Um6V1LdLlXXA1G-Nn26bgHbmXErFLU3C1mXPNXIYNS5cvgLSyHr1wlsDo2vEWoeRf4s-Pn6R9ZEgT4T4Q"
            />
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary text-center">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-xs">Log in to continue your learning journey.</p>
          </div>

          <div className="p-lg bg-surface-container-lowest">
            <form onSubmit={handleSubmit} className="space-y-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span aria-hidden="true" className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline select-none">mail</span>
                  <input
                    autoComplete="email"
                    className="block w-full rounded pl-10 pr-sm py-sm border-outline-variant text-on-surface bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 font-body-md text-body-md transition-all placeholder:text-outline/70"
                    id="email"
                    name="email"
                    placeholder="engineer@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-xs">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                  <a className="font-label-md text-label-md text-secondary hover:text-secondary-fixed-dim transition-colors" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <span aria-hidden="true" className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline select-none">lock</span>
                  <input
                    autoComplete="current-password"
                    className="block w-full rounded pl-10 pr-10 py-sm border-outline-variant text-on-surface bg-surface-container-lowest focus:border-secondary focus:ring-2 focus:ring-secondary/20 font-body-md text-body-md transition-all placeholder:text-outline/70"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    aria-label="Toggle password visibility"
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined select-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Turnstile Captcha Container */}
              <div className="flex flex-col items-center pt-base">
                <div id="turnstile-container"></div>
                {captchaError && (
                  <p className="text-error text-center text-sm font-medium mt-xs">{captchaError}</p>
                )}
              </div>

              <div className="pt-sm">
                <button
                  className="w-full flex justify-center py-sm px-md border border-transparent rounded-DEFAULT shadow-sm font-label-md text-label-md text-on-primary bg-primary-container hover:bg-primary-container/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container transition-colors items-center gap-base group disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Logging in...' : 'Login'}</span>
                  {!loading && (
                     <span aria-hidden="true" className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  )}
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
          </div>

          <div className="px-lg py-md bg-surface border-t border-outline-variant text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don&apos;t have an account? <Link href="/signup" className="font-label-md text-label-md text-secondary hover:text-secondary-fixed-dim transition-colors font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-surface dark:bg-surface-dim border-t border-outline-variant dark:border-outline w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-center gap-md max-w-container-max mx-auto mt-auto">
        <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Programo Academia</div>
        <div className="flex flex-wrap justify-center gap-md">
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Curriculum</a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Terms of Service</a>
          <a className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Contact</a>
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant text-center md:text-right">
          © 2024 Programo Academia. Built for the next generation of engineers.
        </div>
      </footer>
    </div>
  );
}
