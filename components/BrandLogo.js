const mainLogoSrc = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz4YjFh4cM0U2k1t8ZK-QPd_z0YLRn8tvDp56lQ7MR5yvlqtwk-3sSIsuKq-CiMannQLTvv1VyTRyt9tOCIiLi5GcMbJSLJRRf1APKKbXdOjShbgN0mqF9nc375Gn0gncYZ-NY7aEt3zhjm2sQVhmY293OkoaUm5kKwtZjfivm6e7UKlqjdPzGtvb9Yhcn-TUX2rGTHDttDlI-JYRbgQmSnpvtW0NSM_6cysyx4qvSkmqYvxHyNq-Gaf1vKM0GGLvJjYurD-GLl7M'
const authLogoSrc = 'https://lh3.googleusercontent.com/aida-public/AB6AXuASLKmmX4gA5u1SCOnayMh6Xxsv9dbTCkBRhKIJy3PNNwFZWCuUnouk5-PnVpji75P_fWMN7unld277x-dTHbVzmVSXCPRWtH-DR1rKBQiE5L0-tIXRoOUIQFhwOw_2DgeerSqZxiGfFpdiouFOHrK3fTDS9LitBJyXvjeX6WSsFlR1jKKHWdrajCFHx6Um6V1LdLlXXA1G-Nn26bgHbmXErFLU3C1mXPNXIYNS5cvgLSyHr1wlsDo2vEWoeRf4s-Pn6R9ZEgT4T4Q'

// `primary` is already the light/dark-aware heading ink (dark teal on light,
// pale teal on dark), so the header and footer marks need no dark: override.
// The auth variant is the exception: it sits on a permanently white card, so it
// uses the theme-independent "fixed" roles rather than raw hex.
const variants = {
  header: {
    root: 'gap-2.5',
    src: mainLogoSrc,
    mark: 'h-9 w-auto',
    programo: 'text-[1.0625rem] text-primary',
    academia: 'text-[0.6rem] tracking-[0.3em] text-on-surface-variant',
  },
  footer: {
    root: 'gap-3',
    src: mainLogoSrc,
    mark: 'h-10 w-auto',
    programo: 'text-xl text-primary',
    academia: 'text-[0.65rem] tracking-[0.32em] text-on-surface-variant',
  },
  auth: {
    root: 'gap-3',
    src: authLogoSrc,
    mark: 'h-16 w-auto',
    programo: 'text-2xl text-on-primary-fixed',
    academia: 'text-sm tracking-[0.32em] text-on-primary-fixed-variant',
  },
}

export default function BrandLogo({ variant = 'header', className = '' }) {
  const styles = variants[variant] || variants.header

  return (
    <div className={`flex items-center ${styles.root} ${className}`.trim()}>
      <img
        alt=""
        aria-hidden="true"
        className={`${styles.mark} flex-shrink-0 object-contain`}
        src={styles.src}
      />

      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight ${styles.programo}`}>
          Programo
        </span>
        <span className={`mt-1 font-semibold uppercase ${styles.academia}`}>
          Academia
        </span>
      </div>
    </div>
  )
}
