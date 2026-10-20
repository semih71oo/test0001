import { Link } from '@tanstack/react-router'
import { PublicShell } from './PublicShell'
import { legalDocs, legalLinks } from '../lib/legal'

export function LegalPage({ slug }: { slug: string }) {
  const doc = legalDocs[slug]
  
  if (!doc) {
    return (
      <PublicShell>
        <h1>Sayfa Bulunamadı</h1>
        <p>Aradığınız yasal metin bulunamadı.</p>
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      <span className="section-eyebrow" style={{ display: 'block' }}>{doc.eyebrow}</span>
      <h1 style={{ margin: '8px 0 6px' }}>{doc.title}<span className="heading-dot">.</span></h1>
      <p style={{ opacity: .6, margin: '0 0 28px' }}>Son güncelleme: {doc.updated}</p>
      
      <div style={{ display: 'grid', gap: 18 }}>
        {doc.sections.map(section => (
          <section key={section.title} className="panel-card">
            <h2 style={{ margin: '0 0 10px', fontSize: '1.15rem' }}>{section.title}</h2>
            {section.blocks.map((block, index) =>
              typeof block === 'string' ? (
                <p key={index} style={{ margin: '0 0 10px', lineHeight: 1.65 }}>{block}</p>
              ) : (
                <ul key={index} style={{ margin: '0 0 10px', paddingLeft: 20, lineHeight: 1.65 }}>
                  {block.list.map(item => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
                </ul>
              ),
            )}
          </section>
        ))}
      </div>

      <nav aria-label="Yasal metinler" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 32, opacity: .8 }}>
        {legalLinks.filter(link => link.path !== doc.path).map(link => (
          <Link key={link.path} to={link.path}>
            {link.label}
          </Link>
        ))}
      </nav>
    </PublicShell>
  )
}
