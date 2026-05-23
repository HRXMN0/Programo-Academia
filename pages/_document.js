import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="light">
      <Head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content="Vk7ZO-2b603feypIlRnsnZwy6YbVf4uCdbq1cbE-5eU" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
            }
          } catch (_) {}
        ` }} />
      </Head>
      <body className="bg-background text-on-background font-body-md antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
