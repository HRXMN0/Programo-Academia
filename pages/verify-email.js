import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import RibbonBackground from '../components/RibbonBackground';
import { auth } from '../lib/firebase';

// Mirrors what the user is actually being asked to do, in order.
const steps = [
  { n: 1, icon: 'inbox', text: 'Open the email we just sent.' },
  { n: 2, icon: 'link', text: 'Tap the verification link inside it.' },
  { n: 3, icon: 'auto_awesome', text: 'Come back here — we let you in automatically.' },
];

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
      <div className="flex-1 flex flex-col items-center justify-center gap-md bg-background py-20">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-label-md text-label-md text-on-surface-variant animate-pulse">Checking your account...</p>
      </div>
    );
  }

  return (
    // Unlike /login and /signup, Layout does NOT treat this route as auth chrome:
    // the site Navbar and Footer both render around it. So this page adds no
    // header of its own (that would duplicate the navbar's logo and theme
    // toggle) and grows into the space Layout gives it instead of claiming a
    // second full viewport with min-h-screen.
    <div className="relative flex-1 flex flex-col bg-background text-on-background font-body-md antialiased">
      <Head>
        <title>Programo Academia - Verify Email</title>
      </Head>

      <RibbonBackground />
      {/* Scrim over the marquee ribbons: enough to keep them as background texture,
          not so much that they disappear and become dead DOM nodes. */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-background/70 backdrop-blur-[2px]" aria-hidden="true"></div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-lifted overflow-hidden">

          {/* Progress rail — one lesson away from the dashboard */}
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant">Step 2 of 2</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-1 font-label-md text-[12px] font-semibold text-on-secondary-container">
                <span className="material-symbols-outlined filled text-[14px]">check_circle</span>
                Account created
              </span>
            </div>
            <div className="flex gap-1.5" role="presentation">
              <span className="h-1.5 flex-1 rounded-full bg-secondary"></span>
              <span className="h-1.5 flex-1 rounded-full bg-surface-container-high overflow-hidden">
                <span className="block h-full w-1/3 rounded-full bg-secondary/50 animate-pulse"></span>
              </span>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-7 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <span className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center ring-8 ring-secondary/10">
                <span className="material-symbols-outlined text-[32px]">mark_email_unread</span>
              </span>
            </div>

            <h1 className="font-headline-md text-headline-md text-primary">Check your inbox</h1>
            <p className="mt-2 max-w-prose font-body-md text-body-md text-on-surface-variant">
              We sent a verification link to the address below. Confirming it unlocks
              your dashboard and starts saving your progress.
            </p>

            {/* The address itself — mono, so a typo is easy to spot */}
            <div className="mt-5 w-full flex items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-left">
              <span className="material-symbols-outlined text-[20px] text-secondary flex-shrink-0">alternate_email</span>
              <span className="font-code-block text-code-block text-on-surface truncate" title={user?.email}>
                {user?.email}
              </span>
            </div>

            {/* What to do, numbered */}
            <ol className="mt-5 w-full space-y-2.5 text-left">
              {steps.map((step) => (
                <li key={step.n} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3.5 py-2.5">
                  <span className="w-7 h-7 flex-shrink-0 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center font-label-md text-[12px] font-semibold text-on-surface">
                    {step.n}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">{step.icon}</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{step.text}</span>
                </li>
              ))}
            </ol>

            {/* Reflects the real 3-second polling loop above */}
            <p className="mt-4 inline-flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <span className="relative flex w-2 h-2" aria-hidden="true">
                <span className="absolute inline-flex w-full h-full rounded-full bg-secondary opacity-70 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 rounded-full bg-secondary"></span>
              </span>
              Watching for confirmation — this page moves on by itself.
            </p>

            <div className="mt-6 w-full space-y-3">
              <button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary text-on-secondary py-3.5 font-label-md text-label-md shadow-brand hover:shadow-brand-hover hover:brightness-[1.06] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isChecking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Checking...
                  </>
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
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface py-3.5 font-label-md text-label-md hover:border-outline hover:bg-surface-container-low transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {cooldown > 0 ? 'schedule' : 'forward_to_inbox'}
                </span>
                {isResending
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend Email'}
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-4 bg-surface-container-low border-t border-outline-variant">
            <p className="flex items-center justify-center gap-2 font-body-sm text-body-sm text-on-surface-variant text-center">
              <span className="material-symbols-outlined text-[18px] text-topic-amber">lightbulb</span>
              Can&apos;t find it? Check your spam or junk folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
