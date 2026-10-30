import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { MaintenanceGate } from '../components/MaintenanceGate'
import { CookieBanner } from '../components/CookieBanner'
import { PageLoader } from '../components/PageLoader'
import { NotFoundPage } from '../components/NotFoundPage'

import '../styles.css'

// Yerel (kendi sunucundan) fontlar — Google Fonts'a istek atılmaz (KVKK)
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-ext-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-ext-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-sans/latin-ext-600.css'
import '@fontsource/dm-sans/latin-700.css'
import '@fontsource/dm-sans/latin-ext-700.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-ext-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-ext-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-ext-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-ext-700.css'
import '@fontsource/manrope/latin-800.css'
import '@fontsource/manrope/latin-ext-800.css'

const siteName = 'Semih Algan — Yazılım & Fikirler'
const siteDescription = 'Semih Algan’ın yazılım vitrini. Yeni yazılımlar yakında; geliştiriciyi tanıyın, fikirlerinizi paylaşın ve iletişime geçin.'
const siteUrl = 'https://semihalgan.com.tr'
const ogImage = `${siteUrl}/og-image.png`
const ogImageAlt = 'semihalgan. — İyi fikirler, güçlü yazılımlar.'
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Semih Algan',
  url: 'https://semihalgan.com.tr',
  birthDate: '2011-05-26',
  jobTitle: 'Yazılım Geliştirici',
  sameAs: ['https://semihalgan.com.tr'],
}

// TanStack Router sayfa geçişlerinde tetiklenen şık yükleme çubuğu
function RouterLoadingBar() {
  const isLoading = useRouterState({ select: s => s.status === 'pending' })
  if (!isLoading) return null
  return (
    <div className="router-spinner" aria-hidden="true">
      <div className="router-spinner-bar" />
    </div>
  )
}

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', type: 'image/x-icon', sizes: '16x16 32x32 48x48', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/favicon.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512x512-kare.png' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap' },
    ],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#255b43',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: siteUrl,
      },
      {
        property: 'og:image',
        content: ogImage,
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        property: 'og:image:alt',
        content: ogImageAlt,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:image',
        content: ogImage,
      },
      {
        name: 'twitter:image:alt',
        content: ogImageAlt,
      },
    ],
    scripts: [
      {
        // Aynı sekmede daha önce yüklendiyse yükleme ekranı bir daha gösterilmez (ilk boyamadan önce çalışır)
        children: `try{if(sessionStorage.getItem('sa-loaded'))document.documentElement.classList.add('sa-skip-loader')}catch(e){}`,
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(personSchema),
      },
      {
        children: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(err) {
                console.log('Service Worker kayıt hatası: ', err);
              });
            });
          }
        `,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PageLoader />
        <RouterLoadingBar />
        <MaintenanceGate />
        <CookieBanner />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
