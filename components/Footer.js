import Link from 'next/link'
import BrandLogo from './BrandLogo'

export default function Footer() {
  return (
    <footer className="bg-surface dark:bg-surface-dim w-full mt-xl">
      <div className="w-full max-w-container-max mx-auto border-t border-outline-variant dark:border-outline py-xl px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
        <div>
          <Link href="/">
            <BrandLogo variant="footer" />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-2 justify-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Link href="/dsa" className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary transition-colors">
              Curriculum
            </Link>
            <span className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
          <span className="font-body-md text-body-md text-on-surface-variant dark:text-outline hover:text-secondary transition-colors cursor-pointer">
            Contact
          </span>
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant dark:text-outline text-center md:text-right">
          © 2026 Programo Academia. Built for the next generation of<br />engineers.
        </div>
      </div>
    </footer>
  )
}
