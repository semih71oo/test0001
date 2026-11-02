import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { MaintenanceGate } from '../components/MaintenanceGate'
import { CookieBanner } from '../components/CookieBanner'
import { PageLoader } from '../components/PageLoader'
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

// TanStack Router sayfa geçişlerinde tetiklenen şık yükleme çubuğu
function RouterLoadingBar() {
  const isLoading = useRouterState({ select: s => s.status === 'pending' })
  if (!isLoading) return null
  return (
    <div className="router-spinner" aria-hidden="true">
      <div className="router-spinner-bar" />
    </div>
  )
