import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface w-full mt-xl">
      <div className="w-full max-w-container-max mx-auto border-t border-outline-variant py-xl px-gutter flex flex-col md:flex-row justify-between items-center gap-md">
        <div>
          <Link href="/">
            <img 
              alt="Programo" 
              className="h-8 object-contain rounded-md cursor-pointer" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz4YjFh4cM0U2k1t8ZK-QPd_z0YLRn8tvDp56lQ7MR5yvlqtwk-3sSIsuKq-CiMannQLTvv1VyTRyt9tOCIiLi5GcMbJSLJRRf1APKKbXdOjShbgN0mqF9nc375Gn0gncYZ-NY7aEt3zhjm2sQVhmY293OkoaUm5kKwtZjfivm6e7UKlqjdPzGtvb9Yhcn-TUX2rGTHDttDlI-JYRbgQmSnpvtW0NSM_6cysyx4qvSkmqYvxHyNq-Gaf1vKM0GGLvJjYurD-GLl7M" 
            />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-2 justify-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Link href="/dsa" className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors">
              Curriculum
            </Link>
            <span className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
          <span className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">
            Contact
          </span>
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant text-center md:text-right">
          © 2026 Programo Academia. Built for the next generation of<br />engineers.
        </div>
      </div>
    </footer>
  )
}
