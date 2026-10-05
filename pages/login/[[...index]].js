import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from "@/components/BrandLogo";
import RibbonBackground from "@/components/RibbonBackground";
import ThemeToggle from "@/components/ThemeToggle";

// Shared field chrome. The `forms` plugin resets inputs hard, so every border,
// radius and focus ring has to be restated here rather than inherited.
const fieldClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low text-on-surface " +
  "placeholder:text-on-surface-variant/60 pl-11 py-3 font-body-md text-body-md " +
  "transition-colors duration-200 " +
  "hover:border-outline focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none";

export default function Page() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, isLoggedIn, isLoaded } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState(null);
  const [loading, setLoading] = useState(false);

  const recaptchaRef = useRef(null);

  // Redirect already-logged-in users immediately
  useEffect(() => {
    if (isLoaded && isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isLoggedIn, router]);

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
    if (!captchaToken) {
      setCaptchaError('Please complete captcha');
      return;
    }
    setCaptchaError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken })
      });

      const data = await res.json();

      if (!data.success) {
        setCaptchaError('Captcha verification failed. Please try again.');
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken(null);
        setLoading(false);
        return;
      }
    } catch (err) {
      setCaptchaError('An error occurred during captcha verification. Please try again.');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
      setLoading(false);
      return;
    }

    try {
      await loginWithEmail(email, password);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    } catch {
      // The message itself is already toasted by loginWithEmail. Google's token
      // is single-use, so the widget has to be reset either way — say so, or the
      // submit button just greys out again and the page looks broken.
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
      setCaptchaError('Please complete the security check again before retrying.');
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

  const canSubmit = Boolean(email && password && captchaToken);

  return (
    <div className="relative min-h-screen bg-background text-on-background flex flex-col font-body-md antialiased">
      <Head>
        <title>Programo Academia - Login</title>
      </Head>

      <RibbonBackground />
      {/* Scrim over the marquee ribbons: enough to keep them as background texture,
          not so much that they disappear and become dead DOM nodes. */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-background/70 backdrop-blur-[2px]" aria-hidden="true"></div>

      {/* Slim page header — replaces the old absolutely-positioned toggle */}
      <header className="relative z-10 w-full max-w-container-max mx-auto px-gutter py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 -ml-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Back to site</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-on-surface hover:border-secondary hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Create free account
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Layout already renders the page's <main> landmark, so this is a plain
          centring wrapper rather than a second <main>. */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10 pt-2 sm:pt-4">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-lifted overflow-hidden">

          {/* ---------------------------------------------------------------
              Form column. DOM-first so the <h1> leads the document, then
              pushed to the right on desktop.
             --------------------------------------------------------------- */}
          <section className="order-1 lg:order-2 min-w-0 p-4 sm:p-10 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              <BrandLogo variant="header" className="mb-6 lg:hidden" />

              <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-primary">
                Log in
              </h1>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Pick up exactly where you left off.
              </p>

              {/* Google first — it is the fastest path, so it gets the top slot */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-label-md text-label-md text-on-surface shadow-card hover:shadow-card-hover hover:border-outline hover:bg-surface-container-low transition-all duration-200 active:scale-[0.99]"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" aria-hidden="true" className="w-5 h-5" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6">
                <span className="h-px flex-1 bg-outline-variant"></span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">or use your email</span>
                <span className="h-px flex-1 bg-outline-variant"></span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="email">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">
                      mail
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`${fieldClass} pr-4`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                      Password
                    </label>
                    <a href="#" className="font-body-sm text-body-sm text-secondary hover:underline underline-offset-4">
                      Can&apos;t log in?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">
                      lock
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`${fieldClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Security check — framed so the reCAPTCHA widget reads as part
                    of the form rather than a stray third-party box. */}
                <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                    <span className="font-label-md text-label-md text-on-surface-variant">Security check</span>
                    {captchaToken && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-0.5 font-body-sm text-[12px] font-semibold text-on-secondary-container">
                        <span className="material-symbols-outlined filled text-[14px]">check_circle</span>
                        Verified
                      </span>
                    )}
                  </div>
                  {/* The widget is a fixed 302px wide. -mx-3 hands it the full width of
                      this box, and overflow-x-auto keeps the narrowest phones from
                      clipping it against the card's overflow-hidden. */}
                  <div className="-mx-3 overflow-x-auto">
                    <div className="w-max mx-auto min-h-[78px]">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        onChange={(token) => {
                          setCaptchaToken(token);
                          setCaptchaError(null);
                        }}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                  {captchaError && (
                    <p
                      role="alert"
                      className="mt-2.5 flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
                    >
                      <span className="material-symbols-outlined filled text-[18px] mt-0.5 flex-shrink-0">error</span>
                      {captchaError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password || !captchaToken}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg py-3.5 font-label-md text-label-md transition-all duration-200 ${
                    canSubmit
                      ? 'bg-secondary text-on-secondary shadow-brand hover:shadow-brand-hover hover:brightness-[1.06] active:scale-[0.99]'
                      : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Log in
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center font-body-sm text-body-sm text-on-surface-variant">
                New to Programo Academia?{' '}
                <Link href="/signup" className="font-semibold text-secondary hover:underline underline-offset-4">
                  Create a free account
                </Link>
              </p>

              <p className="mt-4 text-center font-body-sm text-[12px] leading-relaxed text-on-surface-variant">
                Protected by reCAPTCHA — Google{' '}
                <a href="#" className="underline underline-offset-2 hover:text-on-surface-variant">Terms</a> &amp;{' '}
                <a href="#" className="underline underline-offset-2 hover:text-on-surface-variant">Privacy</a> apply.
              </p>
            </div>
          </section>

          {/* ---------------------------------------------------------------
              Value panel. Says plainly what the account is for, since the whole
              site is browsable signed out.
             --------------------------------------------------------------- */}
          <aside className="order-2 lg:order-1 min-w-0 bg-primary-container text-on-primary-container p-4 sm:p-10 flex flex-col justify-center gap-6 border-t lg:border-t-0 lg:border-r border-on-primary-container/10">
            <div>
              <BrandLogo variant="header" className="hidden lg:flex mb-8" />

              <span className="inline-flex items-center gap-1.5 rounded-full bg-on-primary-container/10 px-3 py-1 font-label-md text-[12px] font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined filled text-[14px]">bolt</span>
                Welcome back
              </span>

              <h2 className="mt-4 font-headline-md text-headline-md text-on-primary-container">
                Your progress is waiting.
              </h2>
              <p className="mt-2 max-w-prose font-body-md text-body-md text-on-primary-container/80">
                Every lesson on Programo Academia is free to read without an account.
                Logging in is what <span className="font-semibold text-on-primary-container">saves your progress</span> —
                your finished lessons, your streak and your place in each track.
              </p>
            </div>

            {/* Illustrative progress preview — decorative, not real data */}
            <div
              aria-hidden="true"
              className="hidden lg:block rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md text-on-surface">Your tracks</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-topic-amber/15 px-2.5 py-1 font-label-md text-[12px] font-semibold text-on-surface">
                  <span className="material-symbols-outlined filled text-[14px] text-topic-amber">local_fire_department</span>
                  7-day streak
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  { name: 'C++ Fundamentals', pct: 80, done: '12 / 15 lessons', bar: 'bg-topic-blue', dot: 'bg-topic-blue' },
                  { name: 'Arrays & Strings', pct: 45, done: '5 / 11 lessons', bar: 'bg-topic-emerald', dot: 'bg-topic-emerald' },
                  { name: 'Linked Lists', pct: 15, done: '2 / 13 lessons', bar: 'bg-topic-violet', dot: 'bg-topic-violet' },
                ].map((track) => (
                  <div key={track.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
                        <span className={`w-2 h-2 rounded-full ${track.dot}`}></span>
                        {track.name}
                      </span>
                      <span className="font-body-sm text-[12px] text-on-surface-variant">{track.done}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                      <div className={`h-full rounded-full ${track.bar}`} style={{ width: `${track.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact benefit list — carries the same message down to mobile */}
            <ul className="space-y-3">
              {[
                { icon: 'bookmark', label: 'Resume any lesson mid-way', tint: 'text-topic-emerald' },
                { icon: 'trending_up', label: 'See completion across every DSA topic', tint: 'text-topic-blue' },
                { icon: 'terminal', label: 'Keep the code you write in the compiler', tint: 'text-topic-violet' },
              ].map((item) => (
                <li key={item.icon} className="flex items-center gap-3">
                  <span className="w-9 h-9 flex-shrink-0 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-card">
                    <span className={`material-symbols-outlined filled text-[18px] ${item.tint}`}>{item.icon}</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-primary-container">{item.label}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      <footer className="relative z-10 w-full border-t border-outline-variant bg-surface-container-low/70 backdrop-blur-md mt-auto">
        <div className="w-full max-w-container-max mx-auto px-gutter py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Curriculum</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">Contact</a>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-right">
            © 2026 Programo Academia. Built for the next generation of engineers.
          </p>
        </div>
      </footer>
    </div>
  );
}
