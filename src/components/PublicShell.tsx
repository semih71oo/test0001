import { ArrowLeft, Code2 } from 'lucide-react'

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header container">
        <a className="brand" href="/" aria-label="Semih Algan ana sayfa">
          <span className="brand-icon"><Code2 size={23} strokeWidth={2.2} /></span>
          <span>semih<span className="brand-light">algan</span><span className="brand-dot">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Ana menü">
          <a href="/">Ana Sayfa</a>
          <a className="nav-active" href="/yazilar">Yazılar</a>
        </nav>
      </header>
      <main className="container section-space" style={{ maxWidth: 760 }}>
        <a className="back-link" href="/" style={{ display: 'flex', width: 'fit-content', gap: 6, alignItems: 'center', marginBottom: 24 }}><ArrowLeft size={15} />Ana sayfa</a>
        {children}
      </main>
    </div>
  )
}
