import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from "@/components/BrandLogo";
import RibbonBackground from "@/components/RibbonBackground";
import ThemeToggle from "@/components/ThemeToggle";

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
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
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
    <div className="relative min-h-screen overflow-hidden bg-background dark:bg-inverse-surface text-on-background dark:text-inverse-on-surface flex flex-col font-body-md antialiased">
      <RibbonBackground />

      <div className="absolute top-gutter right-gutter z-50">
        <ThemeToggle />
      </div>

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

      <main className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col font-sans">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </Link>
            <Link href="/login" className="text-gray-800 hover:text-gray-600 text-sm font-semibold">
              Log in to account
            </Link>
          </div>

          <div className="p-8 md:p-12 flex flex-col items-center">
            {/* Avatar & Title */}
            <BrandLogo variant="auth" className="mb-6 scale-125 origin-center" />
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 mt-4">Sign up</h1>

            {/* Two Columns Container */}
            <div className="w-full max-w-3xl flex flex-col md:flex-row gap-12 relative">
              
              {/* Left Column: Form */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">Create account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5" htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5" htmlFor="email">Email address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm text-gray-600" htmlFor="password">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading || !fullName || !email || !password || !captchaToken}
                      className={`w-full font-medium py-3 rounded-full transition-all duration-300 ${
                        fullName && email && password && captchaToken
                          ? 'bg-secondary hover:bg-secondary/90 text-on-secondary shadow-md hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gray-300 text-white opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {loading ? 'Verifying...' : 'Sign up'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Vertical Divider / OR */}
              <div className="hidden md:flex flex-col items-center justify-center relative w-8">
                <div className="w-px h-full bg-gray-200"></div>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white py-2 text-[11px] font-semibold text-gray-500">OR</span>
              </div>
              
              {/* Mobile OR */}
              <div className="md:hidden relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Right Column: Socials */}
              <div className="flex-1 flex flex-col justify-center gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                  Continue with Facebook
                </button>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-gray-800 text-gray-900 hover:bg-gray-100 transition-colors font-medium mt-2"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Log in with email
                </Link>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 flex flex-col items-center">
              <a href="#" className="text-xs font-semibold text-gray-700 underline mb-6">Need help?</a>
              
              {/* reCAPTCHA Container */}
              <div className="flex flex-col items-center mb-4 min-h-[78px]">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={(token) => {
                    setCaptchaToken(token);
                    setCaptchaError(null);
                  }}
                  onExpired={() => setCaptchaToken(null)}
                />
                {captchaError && (
                  <p className="text-red-500 text-center text-xs mt-2">{captchaError}</p>
                )}
              </div>

              <p className="text-[10px] text-gray-400 text-center max-w-xs leading-relaxed">
                Secure Signup with reCAPTCHA subject to<br/>
                Google <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>
              </p>
            </div>
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
