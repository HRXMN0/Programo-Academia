import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

import BrandLogo from './BrandLogo'
import ThemeToggle from './ThemeToggle'

// Desktop nav destinations. Kept as data so the pill markup is written once and
// every item is guaranteed to get the same active treatment.
const DESKTOP_LINKS = [
  { href: '/dsa', label: 'DSA', icon: 'account_tree' },
  { href: '/interview-prep', label: 'Interview Prep', icon: 'work' },
  { href: '/compiler', label: 'Compiler', icon: 'terminal' },
]

// The mobile panel gets the fuller picture: a colour-coded tile per track plus a
// one-line blurb, so it reads as a menu of courses instead of a stack of links.
// Tile classes are written out in full — Tailwind cannot see composed strings.
const MOBILE_LINKS = [
  {
    href: '/cpp',
    label: 'C++ Course',
    blurb: 'Data types to pointers and STL',
    icon: 'code',
    tile: 'bg-topic-blue/10 text-topic-blue ring-1 ring-inset ring-topic-blue/20',
  },
  {
    href: '/dsa',
    label: 'DSA Syllabus',
    blurb: 'Arrays, trees, graphs and more',
    icon: 'account_tree',
    tile: 'bg-topic-violet/10 text-topic-violet ring-1 ring-inset ring-topic-violet/20',
  },
  {
    href: '/interview-prep',
    label: 'Interview Prep',
    blurb: 'Common questions, explained',
    icon: 'work',
    tile: 'bg-topic-amber/10 text-topic-amber ring-1 ring-inset ring-topic-amber/20',
  },
  {
    href: '/compiler',
    label: 'Online Compiler',
    blurb: 'Run C++ right in your browser',
    icon: 'terminal',
    tile: 'bg-topic-emerald/10 text-topic-emerald ring-1 ring-inset ring-topic-emerald/20',
  },
]

// One confident indicator: a filled brand pill for the current section, a quiet
// surface wash on hover. No underline + bold + scale stack.
const navPill = (active) =>
  `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-label-md text-label-md transition-colors duration-200 ${
    active
      ? 'bg-secondary-container text-on-secondary-container'
      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
  }`

export default function Navbar() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileDropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Purely cosmetic: the header only earns its shadow once content has scrolled
  // under it, which is what gives a translucent bar a sense of depth.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => {
    if (path === '/') return router.pathname === '/'
    return router.pathname.startsWith(path)
  }

  const languagesActive = isActive('/cpp')

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'bg-surface-container-lowest/95 border-outline-variant shadow-card'
          : 'bg-surface-container-lowest/85 border-outline-variant/70'
      }`}
    >
      {/* A hairline of brand colour along the bottom edge. Absolutely positioned
          so the header stays exactly 64px — /dsa/[slug] and /compiler both size
          themselves with calc(100vh - 64px). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"
      />

      <div className="w-full px-4 md:px-8 lg:px-10 h-16 flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex-1 flex items-center min-w-0">
          <Link
            href="/"
            className="flex items-center rounded-lg transition-opacity duration-200 hover:opacity-80"
            aria-label="Programo Academia — home"
          >
            <BrandLogo variant="header" />
          </Link>
        </div>

        {/* Centered Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-1 compiler-nav-default">
          {/* Programming Languages Dropdown */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className={navPill(languagesActive)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              {/* The full label only fits comfortably at xl; below that the icon
                  plus "Languages" carries the same meaning. */}
              <span className="whitespace-nowrap">
                <span className="hidden xl:inline">Programming </span>Languages
              </span>
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {dropdownOpen && (
              // The pt-2 gap lives inside the hoverable wrapper, so the pointer
              // never crosses dead space on its way down to the panel.
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 pt-3 z-50">
                <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lifted overflow-hidden animate-fade-in">
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    Choose a language
                  </p>
                  <div className="p-2 flex flex-col gap-1">
                    <Link
                      href="/cpp"
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                        languagesActive
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-topic-blue/10 text-topic-blue ring-1 ring-inset ring-topic-blue/20">
                        <span className="material-symbols-outlined text-[20px]">code</span>
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="font-label-md text-label-md">C++</span>
                        <span className={`text-xs ${languagesActive ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>
                          Data types to pointers and STL
                        </span>
                      </span>
                    </Link>

                    <span className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-not-allowed">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">coffee</span>
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant">Java</span>
                      <span className="ml-auto rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                        Soon
                      </span>
                    </span>

                    <span className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-not-allowed">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">data_object</span>
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant">Python</span>
                      <span className="ml-auto rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                        Soon
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {DESKTOP_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={navPill(isActive(item.href))}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Fullscreen Compiler Navigation */}
        <nav className="hidden items-center justify-center gap-md h-full compiler-nav-fullscreen w-full lg:w-auto absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1.5 font-label-md text-label-md text-on-secondary-container">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Online Compiler
          </span>
        </nav>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <ThemeToggle />

          {isLoggedIn && user ? (
            <div className="flex items-center gap-3 relative" ref={profileDropdownRef}>
              <span className="hidden xl:inline text-label-md text-on-surface-variant">
                Hi, {user.name ? user.name.split(' ')[0] : 'Learner'}
              </span>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="h-9 w-9 rounded-full ring-2 ring-secondary/30 hover:ring-secondary/60 transition-all duration-200 flex items-center justify-center overflow-hidden bg-primary-container text-on-primary-container text-sm font-bold"
                aria-label="User Profile Dropdown"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lifted overflow-hidden z-50 animate-fade-in">
                  <div className="flex items-center gap-3 p-3 border-b border-outline-variant">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-primary-container text-on-primary-container text-sm font-bold">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (user.name || user.email || 'U').charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="min-w-0 flex flex-col leading-tight">
                      <span className="font-label-md text-label-md text-on-surface truncate">{user.name || 'Learner'}</span>
                      <span className="text-xs text-on-surface-variant truncate">{user.email || ''}</span>
                    </span>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      </span>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="w-full text-left flex items-center gap-3 rounded-lg px-2 py-2 font-label-md text-label-md text-error hover:bg-error/10 transition-colors"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                      </span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Browsing works signed out, so say what an account is actually for. */}
              <span className="hidden xl:inline text-xs text-on-surface-variant">
                Sign in to save your progress
              </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-label-md text-label-md font-bold text-on-secondary bg-secondary hover:bg-secondary/90 shadow-brand hover:shadow-brand-hover transition-all duration-200"
              >
                Login
                <span className="material-symbols-outlined text-[16px]">login</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-10 w-10 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-lowest shadow-lifted animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Learn
            </p>

            {MOBILE_LINKS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    active
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.tile}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </span>
                  <span className="min-w-0 flex flex-col leading-tight">
                    <span className="font-label-md text-label-md">{item.label}</span>
                    <span className={`text-xs truncate ${active ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>
                      {item.blurb}
                    </span>
                  </span>
                  <span className={`material-symbols-outlined ml-auto text-[20px] ${active ? 'text-on-secondary-container/70' : 'text-outline'}`}>
                    chevron_right
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-outline-variant px-4 py-4">
            {isLoggedIn && user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive('/dashboard') ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/20">
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                </span>
                <span className="min-w-0 flex flex-col leading-tight">
                  <span className="font-label-md text-label-md">Dashboard</span>
                  <span className={`text-xs ${isActive('/dashboard') ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>
                    Your saved progress
                  </span>
                </span>
                <span className={`material-symbols-outlined ml-auto text-[20px] ${isActive('/dashboard') ? 'text-on-secondary-container/70' : 'text-outline'}`}>
                  chevron_right
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-secondary-container/60 px-3 py-3 text-on-secondary-container transition-colors hover:bg-secondary-container"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined text-[20px]">login</span>
                </span>
                <span className="min-w-0 flex flex-col leading-tight">
                  <span className="font-label-md text-label-md">Log in</span>
                  <span className="text-xs text-on-secondary-container/80">
                    Everything is free — sign in to save progress
                  </span>
                </span>
                <span className="material-symbols-outlined ml-auto text-[20px] text-on-secondary-container/70">
                  chevron_right
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
