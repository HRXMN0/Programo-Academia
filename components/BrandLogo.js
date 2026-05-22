const mainLogoSrc = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz4YjFh4cM0U2k1t8ZK-QPd_z0YLRn8tvDp56lQ7MR5yvlqtwk-3sSIsuKq-CiMannQLTvv1VyTRyt9tOCIiLi5GcMbJSLJRRf1APKKbXdOjShbgN0mqF9nc375Gn0gncYZ-NY7aEt3zhjm2sQVhmY293OkoaUm5kKwtZjfivm6e7UKlqjdPzGtvb9Yhcn-TUX2rGTHDttDlI-JYRbgQmSnpvtW0NSM_6cysyx4qvSkmqYvxHyNq-Gaf1vKM0GGLvJjYurD-GLl7M'
const authLogoSrc = 'https://lh3.googleusercontent.com/aida-public/AB6AXuASLKmmX4gA5u1SCOnayMh6Xxsv9dbTCkBRhKIJy3PNNwFZWCuUnouk5-PnVpji75P_fWMN7unld277x-dTHbVzmVSXCPRWtH-DR1rKBQiE5L0-tIXRoOUIQFhwOw_2DgeerSqZxiGfFpdiouFOHrK3fTDS9LitBJyXvjeX6WSsFlR1jKKHWdrajCFHx6Um6V1LdLlXXA1G-Nn26bgHbmXErFLU3C1mXPNXIYNS5cvgLSyHr1wlsDo2vEWoeRf4s-Pn6R9ZEgT4T4Q'

const variants = {
  header: {
    root: 'gap-2.5',
    src: mainLogoSrc,
    mark: 'h-8 w-auto',
    programo: 'text-lg',
    academia: 'text-[0.58rem] tracking-[0.32em]',
  },
  footer: {
    root: 'gap-3',
    src: mainLogoSrc,
    mark: 'h-10 w-auto',
    programo: 'text-xl',
    academia: 'text-xs tracking-[0.34em]',
  },
  auth: {
    root: 'gap-3',
    src: authLogoSrc,
    mark: 'h-16 w-auto',
    programo: 'text-2xl',
    academia: 'text-sm tracking-[0.34em]',
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
        <span className={`font-semibold tracking-normal text-primary dark:text-primary-fixed ${styles.programo}`}>
          Programo
        </span>
        <span className={`mt-1 uppercase text-on-surface-variant dark:text-outline ${styles.academia}`}>
          Academia
        </span>
      </div>
    </div>
  )
}
