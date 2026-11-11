import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import SpecularButton from '../components/animations/SpecularButton'
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
          <article
            key={item.slug}
            className="panel-card"
            style={{ display: 'grid', gap: 14 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <small style={{ opacity: 0.6 }}>{item.status}</small>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 style={{ margin: '8px 0' }}>{item.title}</h2>
              <p style={{ margin: 0, opacity: 0.75, lineHeight: 1.55 }}>{item.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {item.tags.map(tag => (
                  <span key={tag} className="pill">{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <SpecularButton
                size="sm"
                radius={12}
                tint="#ffffff"
                tintOpacity={0.08}
                textColor="#ffffff"
                lineColor="#a7f3d0"
                baseColor="#245c45"
                intensity={1}
                idleIntensity={0.3}
                followMouse
                autoAnimate={false}
                style={{ backgroundColor: '#245c45', minHeight: 44 }}
                onClick={() => window.location.assign(item.href)}
                aria-label={`${item.title} projesini incele`}
              >
                Projeyi incele <ArrowUpRight size={16} />
              </SpecularButton>
            </div>
          </article>
        ))}
      </div>
    </PublicShell>
  )
}
