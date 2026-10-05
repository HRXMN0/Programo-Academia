import Link from 'next/link'
import BrandLogo from './BrandLogo'

// Only routes that actually exist go in here — a footer full of dead links is
// worse than a short one. Privacy / Terms / Contact stay as plain text in the
// bottom bar until there are real pages behind them.
const LINK_COLUMNS = [
  {
    heading: 'Learn',
    links: [
      { href: '/cpp', label: 'C++ Course' },
      { href: '/dsa', label: 'DSA Syllabus' },
      { href: '/interview-prep', label: 'Interview Prep' },
    ],
  },
  {
    heading: 'Practise',
    links: [
      { href: '/compiler', label: 'Online Compiler' },
      { href: '/dashboard', label: 'Your Dashboard' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/signup', label: 'Create free account' },
    ],
  },
]

const PROMISES = [
  { icon: 'money_off', label: '100% free' },
  { icon: 'block', label: 'No ads' },
  { icon: 'school', label: 'Beginner friendly' },
]

export default function Footer() {
  return (
    // A card-surface band under a slate page reads as a distinct footer in light
    // mode, and as a lifted panel over the near-black background in dark mode.
    <footer className="w-full mt-16 border-t border-outline-variant bg-surface-container-lowest">
      <div className="w-full max-w-container-max mx-auto px-gutter pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="inline-flex rounded-lg" aria-label="Programo Academia — home">
              <BrandLogo variant="footer" />
            </Link>

            <p className="mt-4 max-w-prose text-body-sm text-on-surface-variant">
              Free, structured lessons in C++ and Data Structures &amp; Algorithms, with an
              in-browser compiler so you can run every example while you read it.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {PROMISES.map((promise) => (
                <li
                  key={promise.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container"
                >
                  <span className="material-symbols-outlined text-[14px]">{promise.icon}</span>
                  {promise.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {LINK_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  {column.heading}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex rounded-sm text-body-sm text-on-surface hover:text-secondary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-outline-variant flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-body-sm text-on-surface-variant">
            © 2026 Programo Academia. Built for the next generation of engineers.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-on-surface-variant">
            {/* Not links yet — deliberately not styled as though they were. */}
            <span className="cursor-default hover:text-on-surface transition-colors">Privacy Policy</span>
            <span className="cursor-default hover:text-on-surface transition-colors">Terms of Service</span>
            <span className="cursor-default hover:text-on-surface transition-colors">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
