import { PublicShell } from './PublicShell'
import { legalDocs } from '../lib/legal'

// Site zaten DM Sans (başlık) ve Manrope (metin) fontlarını yüklüyor (__root.tsx); ek font indirmesi yok.
const css = `
.legal{--legal-head:'DM Sans','Manrope',system-ui,sans-serif;--legal-body:'Manrope','DM Sans',system-ui,sans-serif;font-family:var(--legal-body)}
.legal-eyebrow{display:block;font:700 .75rem/1 var(--legal-body);letter-spacing:.18em;text-transform:uppercase;opacity:.6}
.legal-title{font-family:var(--legal-head);font-weight:700;font-size:clamp(2rem,7vw,3rem);line-height:1.08;letter-spacing:-.03em;margin:12px 0 14px}
.legal-meta{display:inline-block;font-size:.82rem;font-weight:600;padding:6px 12px;border-radius:999px;background:rgba(36,92,69,.08);color:#245c45;margin:0 0 26px}
.legal-toc{border:1px solid rgba(36,92,69,.14);border-radius:18px;padding:16px 18px;margin:0 0 22px}
.legal-toc strong{display:block;font:700 .75rem/1 var(--legal-body);letter-spacing:.14em;text-transform:uppercase;opacity:.6;margin-bottom:8px}
.legal-toc ol{list-style:none;margin:0;padding:0;display:grid}
.legal-toc a{display:block;padding:7px 0;font-size:.95rem;line-height:1.4;text-decoration:none;color:inherit;opacity:.85}
.legal-toc a:hover{opacity:1;text-decoration:underline}
.legal-grid{display:grid;gap:14px}
.legal-card{padding:22px 22px 12px;scroll-margin-top:16px}
.legal-card h2{font-family:var(--legal-head);font-weight:700;font-size:1.2rem;line-height:1.3;letter-spacing:-.01em;margin:0 0 12px}
.legal-card p,.legal-card li{font-size:.97rem;line-height:1.72;margin:0 0 12px;max-width:68ch}
.legal-card ul{margin:0 0 12px;padding-left:20px}
.legal-card li{margin-bottom:6px}
.legal-card a{color:#245c45;font-weight:600;text-underline-offset:3px;word-break:break-all}
@media (min-width:640px){.legal-card{padding:28px 30px 16px}.legal-card p,.legal-card li{font-size:1rem}}
`

const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/

// Metindeki e-posta adreslerini tıklanabilir yapar
function renderText(text: string) {
  return text.split(EMAIL_RE).map((part, index) =>
    index % 2 === 1 ? <a key={index} href={`mailto:${part}`}>{part}</a> : part,
  )
}

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
      <style>{css}</style>
      <div className="legal">
        <span className="legal-eyebrow">{doc.eyebrow}</span>
        <h1 className="legal-title">{doc.title}<span className="heading-dot">.</span></h1>
        <span className="legal-meta">Son güncelleme: {doc.updated}</span>

        {doc.sections.length > 3 && (
          <nav className="legal-toc" aria-label="İçindekiler">
            <strong>İçindekiler</strong>
            <ol>
              {doc.sections.map((section, index) => (
                <li key={section.title}><a href={`#bolum-${index + 1}`}>{section.title}</a></li>
              ))}
            </ol>
          </nav>
        )}

        <div className="legal-grid">
          {doc.sections.map((section, sectionIndex) => (
            <section key={section.title} id={`bolum-${sectionIndex + 1}`} className="panel-card legal-card">
              <h2>{section.title}</h2>
              {section.blocks.map((block, index) =>
                typeof block === 'string' ? (
                  <p key={index}>{renderText(block)}</p>
                ) : (
                  <ul key={index}>
                    {block.list.map(item => <li key={item}>{renderText(item)}</li>)}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>
      </div>
    </PublicShell>
  )
}
