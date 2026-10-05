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

// The three things an account actually does, numbered so the page reads like a
// syllabus rather than a form.
const steps = [
  { n: 1, icon: 'person_add', title: 'Create your free account', copy: 'Email or Google — takes about twenty seconds.' },
  { n: 2, icon: 'menu_book', title: 'Work through C++ and DSA', copy: 'Guided lessons with runnable code, in order.' },
  { n: 3, icon: 'insights', title: 'Your progress is saved', copy: 'Finished lessons, streaks and your place in each track.' },
];

// Colour-coded so the syllabus is scannable instead of six identical chips.
const topics = [
  { name: 'Arrays', dot: 'bg-topic-blue' },
  { name: 'Linked Lists', dot: 'bg-topic-violet' },
  { name: 'Stacks & Queues', dot: 'bg-topic-amber' },
  { name: 'Trees', dot: 'bg-topic-emerald' },
  { name: 'Graphs', dot: 'bg-topic-rose' },
  { name: 'Sorting', dot: 'bg-topic-cyan' },
];

export default function Page() {
  const router = useRouter();
  const { signupWithEmail, loginWithGoogle, showToast, isLoggedIn, isLoaded } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      await signupWithEmail(email, password, fullName);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    } catch {
      // signupWithEmail already toasted the reason. Google's token is
      // single-use, so the widget has to be reset either way — say so, or the
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

  const canSubmit = Boolean(fullName && email && password && captchaToken);

  return (
    <div className="relative min-h-screen bg-background text-on-background flex flex-col font-body-md antialiased">
      <Head>
        <title>Sign Up - Programo Academia</title>
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
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-on-surface hover:border-secondary hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Log in to account
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
                Create account
              </h1>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Free forever. It exists to save your progress.
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
                <span className="font-body-sm text-body-sm text-on-surface-variant">or sign up with email</span>
                <span className="h-px flex-1 bg-outline-variant"></span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="fullName">
                    Full name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">
                      person
                    </span>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      className={`${fieldClass} pr-4`}
                    />
                  </div>
                </div>

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
                  <p className="mt-1.5 font-body-sm text-[12px] text-on-surface-variant">
                    We send one verification link here. Nothing else.
                  </p>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="password">
                    Password
                  </label>
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
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
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
                  disabled={loading || !fullName || !email || !password || !captchaToken}
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
                      Create free account
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center font-body-sm text-body-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-secondary hover:underline underline-offset-4">
                  Log in
                </Link>
              </p>

              <p className="mt-4 text-center font-body-sm text-[12px] leading-relaxed text-on-surface-variant">
                Protected by reCAPTCHA — Google{' '}
                <a href="#" className="underline underline-offset-2 hover:text-on-surface-variant">Terms</a> &amp;{' '}
                <a href="#" className="underline underline-offset-2 hover:text-on-surface-variant">Privacy</a> apply.{' '}
                <a href="#" className="underline underline-offset-2 hover:text-on-surface-variant">Need help?</a>
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
                <span className="material-symbols-outlined filled text-[14px]">school</span>
                Free forever
              </span>

              <h2 className="mt-4 font-headline-md text-headline-md text-on-primary-container">
                Learn C++ and DSA, and keep every lesson you finish.
              </h2>
              <p className="mt-2 max-w-prose font-body-md text-body-md text-on-primary-container/80">
                You can read the whole curriculum without signing up. An account exists
                for one reason: it <span className="font-semibold text-on-primary-container">saves your progress</span> so
                you never have to remember which lesson you stopped on.
              </p>
            </div>

            {/* Numbered steps — the ordering is the point */}
            <ol className="space-y-3">
              {steps.map((step) => (
                <li
                  key={step.n}
                  className="flex items-start gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-card"
                >
                  <span className="w-8 h-8 flex-shrink-0 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md">
                    {step.n}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[18px] text-secondary">{step.icon}</span>
                      {step.title}
                    </p>
                    <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="hidden sm:block">
              <p className="font-label-md text-label-md text-on-primary-container/80 mb-2.5">
                Tracks included
              </p>
              <ul className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <li
                    key={topic.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1.5 font-body-sm text-body-sm text-on-surface shadow-card"
                  >
                    <span className={`w-2 h-2 rounded-full ${topic.dot}`}></span>
                    {topic.name}
                  </li>
                ))}
              </ul>
            </div>
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
