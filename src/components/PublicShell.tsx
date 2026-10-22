import { Link } from '@tanstack/react-router'
import { ArrowLeft, Code2 } from 'lucide-react'
import { legalLinks } from '../lib/legal'

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header container">
        <Link className="brand" to="/" aria-label="Semih Algan ana sayfa">
          <span className="brand-icon"><Code2 size={23} strokeWidth={2.2} /></span>
          <span>semih<span className="brand-light">algan</span><span className="brand-dot">.</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Ana menü">
          <Link to="/">Ana Sayfa</Link>
          <Link to="/yazilar" activeProps={{ className: 'nav-active' }}>Yazılar</Link>
          <Link to="/guncellemeler" activeProps={{ className: 'nav-active' }}>Güncellemeler</Link>
        </nav>
      </header>
      <main className="container section-space" style={{ maxWidth: 760 }}>
        <Link className="back-link" to="/" style={{ display: 'flex', width: 'fit-content', gap: 6, alignItems: 'center', marginBottom: 24 }}>
          <ArrowLeft size={15} />Ana sayfa
        </Link>
        {children}
      </main>
      <footer className="container" style={{ maxWidth: 760, display: 'flex', flexWrap: 'wrap', gap: '8px 18px', padding: '24px 0 40px', opacity: .75, fontSize: '.9rem' }}>
        <Link to="/guncellemeler">Güncellemeler</Link>
        {legalLinks.map(link => (
          <Link key={link.path} to={link.path}>
            {link.label}
          </Link>
        ))}
      </footer>
    </div>
  )
}
