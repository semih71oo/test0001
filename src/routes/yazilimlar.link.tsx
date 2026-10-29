import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, BarChart3, QrCode, Zap } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'

export const Route = createFileRoute('/yazilimlar/link')({
  component: LinkDetailPage,
  head: () => ({
    meta: [
      { title: 'URL Kısaltıcı & Analitik — Semih Algan' },
      { name: 'description', content: 'Hızlı, gizlilik odaklı URL kısaltma ve gerçek zamanlı tıklama analitiği aracı.' },
    ],
  }),
})

const features = [
  { 
    icon: Zap, 
    title: 'Edge Hızında Yönlendirme', 
    text: 'Cloudflare Kenar Ağı üzerinde çalışır. Yönlendirmeler milisaniyeler içinde gecikmesiz gerçekleşir.' 
  },
  { 
    icon: BarChart3, 
    title: 'Ülke ve Cihaz İstatistikleri', 
    text: 'Özel gizli anahtarınızla linkin toplam tıklanma sayısını, ülke ve cihaz (mobil/masaüstü) dağılımını canlı takip edin.' 
  },
  { 
    icon: QrCode, 
    title: 'Otomatik QR Kod', 
    text: 'Kısaltılan her link için kamerayla anında okutulabilen yüksek kaliteli QR kod otomatik oluşturulur.' 
  },
]

function LinkDetailPage() {
  return (
    <PublicShell>
      <a href="/yazilimlar" style={{ display: 'inline-block', marginBottom: 16, opacity: 0.7, textDecoration: 'none', color: 'inherit' }}>
        ← Tüm yazılımlar
      </a>
      <span className="section-eyebrow" style={{ display: 'block' }}>02 / YAZILIMLAR</span>
      <h1 style={{ margin: '8px 0 12px' }}>URL Kısaltıcı & Analitik<span className="heading-dot">.</span></h1>
      <p style={{ margin: '0 0 28px', opacity: 0.75, lineHeight: 1.6 }}>
        Uzun linklerinizi anında kısaltın, QR kodunu alın ve ziyaretçilerinizin istatistiklerini gizlilikten ödün vermeden inceleyin.
      </p>

      <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
        {features.map(f => (
          <div key={f.title} className="panel-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <f.icon size={22} style={{ flexShrink: 0, marginTop: 2, color: '#059669' }} />
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{f.title}</h2>
              <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.55 }}>{f.text}</p>
            </div>
          </div>
        ))}
      </div>

      <a
        className="button button-primary"
        href="https://link.semihalgan.com.tr"
        target="_blank"
        rel="noopener noreferrer"
      >
        Aracı aç <ArrowUpRight size={19} />
      </a>
    </PublicShell>
  )
}
