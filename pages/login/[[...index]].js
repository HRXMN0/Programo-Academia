import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from "@/components/BrandLogo";
import RibbonBackground from "@/components/RibbonBackground";
import ThemeToggle from "@/components/ThemeToggle";

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
      await loginWithEmail(email, password);
    } catch {
      // Error toast is shown by loginWithEmail
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
    <div className="relative min-h-screen overflow-hidden bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <RibbonBackground />

      <div className="absolute top-gutter right-gutter z-50">
        <ThemeToggle />
      </div>

      <Head>
        <title>Programo Academia - Login</title>
      </Head>

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />

      <main className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface rounded-xl border border-outline-variant dark:border-outline shadow-[0px_4px_12px_rgba(11,31,58,0.05)] dark:shadow-[0px_12px_48px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:shadow-[0px_8px_24px_rgba(11,31,58,0.08)]">
          <div className="p-lg flex flex-col items-center border-b border-outline-variant dark:border-outline bg-surface-bright/90 dark:bg-surface">
            <BrandLogo variant="auth" className="mb-base" />
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary dark:text-primary-fixed text-center">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline text-center mt-xs">Log in to continue your learning journey.</p>
          </div>

          <div className="p-lg bg-surface-container-lowest dark:bg-surface">
            <form onSubmit={handleSubmit} className="space-y-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface dark:text-inverse-on-surface mb-xs" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span aria-hidden="true" className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline select-none">mail</span>
                  <input
                    autoComplete="email"
                    className="block w-full rounded pl-10 pr-sm py-sm border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface bg-surface-container-lowest dark:bg-surface-dim focus:border-secondary focus:ring-2 focus:ring-secondary/20 font-body-md text-body-md transition-all placeholder:text-outline/70 dark:placeholder:text-outline"
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
                  <label className="block font-label-md text-label-md text-on-surface dark:text-inverse-on-surface" htmlFor="password">Password</label>
                  <a className="font-label-md text-label-md text-secondary hover:text-secondary-fixed-dim transition-colors" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <span aria-hidden="true" className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline select-none">lock</span>
                  <input
                    autoComplete="current-password"
                    className="block w-full rounded pl-10 pr-10 py-sm border-outline-variant dark:border-outline text-on-surface dark:text-inverse-on-surface bg-surface-container-lowest dark:bg-surface-dim focus:border-secondary focus:ring-2 focus:ring-secondary/20 font-body-md text-body-md transition-all placeholder:text-outline/70 dark:placeholder:text-outline"
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
                  <div className="w-full border-t border-outline-variant dark:border-outline"></div>
                </div>
                <div className="relative flex justify-center font-label-md text-label-md">
                  <span className="px-2 bg-surface-container-lowest dark:bg-surface text-on-surface-variant dark:text-outline">Or continue with</span>
                </div>
              </div>

              <div className="mt-md">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-outline-variant dark:border-outline rounded-lg shadow-sm bg-surface-container-lowest dark:bg-surface-dim text-sm font-medium text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-low dark:hover:bg-surface-low transition-colors duration-200"
                  type="button"
                >
                  <span className="material-symbols-outlined mr-2 text-on-surface select-none" style={{ fontSize: '20px' }}>travel_explore</span>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>

          <div className="px-lg py-md bg-surface dark:bg-surface border-t border-outline-variant dark:border-outline text-center">
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
              Don&apos;t have an account? <Link href="/signup" className="font-label-md text-label-md text-secondary hover:text-secondary-fixed-dim transition-colors font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full bg-surface/80 backdrop-blur-md dark:bg-surface-dim/80 mt-auto">
        <div className="w-full max-w-container-max mx-auto border-t border-outline-variant dark:border-outline py-xl px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
          <BrandLogo variant="footer" />
          <div className="flex flex-col items-center gap-2 justify-center">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Curriculum</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a>
              <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Terms of Service</a>
            </div>
            <a className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Contact</a>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant dark:text-outline text-center md:text-right">
            © 2026 Programo Academia. Built for the next generation of<br />engineers.
          </div>
        </div>
      </footer>
    </div>
  );
}
