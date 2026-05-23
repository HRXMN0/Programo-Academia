import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

import BrandLogo from './BrandLogo'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
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

  const isActive = (path) => {
    if (path === '/') return router.pathname === '/'
    return router.pathname.startsWith(path)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant transition-all duration-300">
      <div className="w-full px-4 md:px-8 lg:px-12 h-16 flex justify-between items-center gap-md">
        {/* Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center transition-transform duration-300 ease-out hover:scale-105 active:scale-[0.98]">
            <BrandLogo variant="header" />
          </Link>
        </div>

        {/* Centered Navigation */}
        <nav className="hidden md:flex items-center justify-center gap-md xl:gap-lg h-full">
          {/* Programming Languages Dropdown */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className={`flex items-center gap-1 font-label-md text-label-md transition-all duration-300 ease-in-out hover:scale-[1.03] hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary ${
              isActive('/cpp') 
                ? 'text-primary font-bold opacity-100 underline decoration-primary decoration-2' 
                : 'text-on-surface-variant opacity-75 hover:text-primary hover:opacity-100'
            }`}>
              Programming Languages
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg transition-all duration-200 z-50">
                <div className="py-2">
                  <Link href="/cpp" className="block px-4 py-2 font-body-md text-[15px] text-on-surface hover:bg-surface-container-low transition-colors">
                    C++
                  </Link>
                  <span className="block px-4 py-2 font-body-md text-[15px] text-on-surface-variant opacity-50 cursor-not-allowed">
                    Java (Coming Soon)
                  </span>
                  <span className="block px-4 py-2 font-body-md text-[15px] text-on-surface-variant opacity-50 cursor-not-allowed">
                    Python (Coming Soon)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* DSA */}
          <Link href="/dsa" className={`font-body-md text-[16px] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary tracking-wide ${
            isActive('/dsa') 
              ? 'text-primary font-bold underline decoration-primary decoration-2' 
              : 'text-on-surface-variant opacity-75 hover:opacity-100 hover:text-primary'
          }`}>
            DSA
          </Link>

          {/* Interview Prep */}
          <Link href="/interview-prep" className={`font-body-md text-[16px] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary tracking-wide ${
            isActive('/interview-prep') 
              ? 'text-primary font-bold underline decoration-primary decoration-2' 
              : 'text-on-surface-variant opacity-75 hover:opacity-100 hover:text-primary'
          }`}>
            Interview Prep
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-end gap-md">
          <ThemeToggle />

          {isLoggedIn && user ? (
            <div className="flex items-center gap-sm relative" ref={profileDropdownRef}>
              <span className="hidden lg:inline text-label-md text-on-surface-variant font-medium">
                Hi, {user.name ? user.name.split(' ')[0] : 'Learner'}
              </span>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="h-9 w-9 border border-secondary-fixed-dim rounded-full shadow-sm hover:scale-105 duration-200 transition-all focus:outline-none focus:ring-2 focus:ring-secondary/20 flex items-center justify-center overflow-hidden bg-primary-container text-on-primary text-sm font-bold"
                aria-label="User Profile Dropdown"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-[110%] w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg transition-all duration-200 z-50">
                  <div className="p-3 border-b border-outline-variant">
                    <p className="font-body-md text-sm font-semibold text-primary truncate">{user.name || 'Learner'}</p>
                    <p className="font-body-md text-xs text-on-surface-variant truncate">{user.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 font-body-md text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="w-full text-left px-4 py-2 font-body-md text-sm text-error hover:bg-error-container/20 hover:text-error transition-colors flex items-center gap-2 border-t border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <Link 
                href="/login"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2 font-label-md font-bold text-on-secondary bg-secondary hover:bg-secondary/90 transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_12px_rgba(0,107,92,0.3)] hover:shadow-[0_6px_16px_rgba(0,107,92,0.4)] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
                <span className="relative z-10 flex items-center gap-1.5">
                  Login
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">login</span>
                </span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant shadow-lg animate-fade-in py-md px-gutter flex flex-col gap-sm">
          <Link 
            href="/cpp" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-label-md text-label-md py-sm border-b border-outline-variant/30 flex items-center justify-between ${
              isActive('/cpp') ? 'text-primary font-bold' : 'text-on-surface-variant opacity-75'
            }`}
          >
            <span>C++ Course</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
          <Link 
            href="/dsa" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-label-md text-label-md py-sm border-b border-outline-variant/30 flex items-center justify-between ${
              isActive('/dsa') ? 'text-primary font-bold' : 'text-on-surface-variant opacity-75'
            }`}
          >
            <span>DSA Syllabus</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
          <Link 
            href="/interview-prep" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-label-md text-label-md py-sm border-b border-outline-variant/30 flex items-center justify-between ${
              isActive('/interview-prep') ? 'text-primary font-bold' : 'text-on-surface-variant opacity-75'
            }`}
          >
            <span>Interview Prep</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        </div>
      )}
    </header>
  )
}
