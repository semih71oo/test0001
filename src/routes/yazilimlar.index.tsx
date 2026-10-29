import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { softwareList } from '../lib/software'

export const Route = createFileRoute('/yazilimlar/')({
  component: SoftwarePage,
  head: () => ({
    meta: [
      { title: 'Yazılımlar — Semih Algan' },
      { name: 'description', content: 'Semih Algan’ın geliştirdiği yazılımlar ve araçlar.' },
    ],
  }),
})

function SoftwarePage() {
  return (
    <PublicShell>
      <span className="section-eyebrow" style={{ display: 'block' }}>YAZILIMLAR</span>
      <h1 style={{ margin: '8px 0 12px' }}>Yazılımlar<span className="heading-dot">.</span></h1>
      <p style={{ margin: '0 0 28px', opacity: 0.75, lineHeight: 1.6 }}>
        Geliştirdiğim araçlar burada toplanıyor. Yeni yazılımlar eklendikçe bu sayfaya gelecek.
      </p>

      <div style={{ display: 'grid', gap: 20 }}>
        {softwareList.map(item => (
          <a
            key={item.slug}
            href={item.href}
            className="panel-card"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <small style={{ opacity: 0.6 }}>{item.status}</small>
              <ArrowUpRight size={20} />
            </div>
            <h2 style={{ margin: '8px 0' }}>{item.title}</h2>
            <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.55 }}>{item.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {item.tags.map(tag => (
                <span key={tag} className="pill">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </PublicShell>
  )
}
