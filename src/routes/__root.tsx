import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { MaintenanceGate } from '../components/MaintenanceGate'
import { CookieBanner } from '../components/CookieBanner'
import { NotFoundPage } from '../components/NotFoundPage'

import '../styles.css'

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

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'icon', type: 'image/x-icon', sizes: '16x16 32x32 48x48', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/favicon.png' },
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
        type: 'application/ld+json',
        children: JSON.stringify(personSchema),
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <HeadContent />
      </head>
      <body>
        <MaintenanceGate />
        <CookieBanner />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
