import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

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
      <div className="max-w-container-max mx-auto px-gutter h-16 flex justify-between items-center gap-md">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center mr-md md:mr-lg">
          <Link href="/" className="flex items-center transition-transform duration-300 ease-out hover:scale-105 active:scale-[0.98]">
            <img 
              alt="Programo" 
              className="h-9 md:h-12 w-auto rounded-md object-contain cursor-pointer" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz4YjFh4cM0U2k1t8ZK-QPd_z0YLRn8tvDp56lQ7MR5yvlqtwk-3sSIsuKq-CiMannQLTvv1VyTRyt9tOCIiLi5GcMbJSLJRRf1APKKbXdOjShbgN0mqF9nc375Gn0gncYZ-NY7aEt3zhjm2sQVhmY293OkoaUm5kKwtZjfivm6e7UKlqjdPzGtvb9Yhcn-TUX2rGTHDttDlI-JYRbgQmSnpvtW0NSM_6cysyx4qvSkmqYvxHyNq-Gaf1vKM0GGLvJjYurD-GLl7M" 
            />
          </Link>
        </div>

        {/* Centered Navigation */}
        <nav className="hidden md:flex items-center justify-center flex-grow gap-lg xl:gap-xl h-full">
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
        <div className="flex items-center justify-end gap-md flex-shrink-0">
          <div className="hidden md:flex items-center bg-surface-container-low px-sm py-xs rounded-full border border-outline-variant focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2" style={{ fontSize: '18px' }}>search</span>
            <input 
              type="text" 
              placeholder="Search topics..." 
              className="bg-transparent border-none focus:ring-0 font-label-md text-label-md text-on-surface placeholder:text-on-surface-variant w-36 lg:w-44 p-0"
              disabled
            />
          </div>

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
              <Link href="/login" className="border border-outline-variant hover:border-primary/50 hover:bg-surface-container-low text-on-surface-variant hover:text-primary font-label-md text-label-md px-md py-1.5 rounded-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-sm font-semibold">
                Login
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
