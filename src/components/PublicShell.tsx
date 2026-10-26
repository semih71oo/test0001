import { Link } from '@tanstack/react-router'
import { ArrowLeft, Code2, Menu, X, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { legalLinks } from '../lib/legal'

export function PublicShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signedIn, setSignedIn] = useState<{ isAdmin: boolean } | null>(null)

  // Kullanıcının giriş yapıp yapmadığını kontrol ediyoruz ki butonda "Panele git" veya "Panele giriş" yazsın
  useEffect(() => {
    let active = true
    fetch('/api/community/session', { credentials: 'same-origin', cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (active && data) setSignedIn({ isAdmin: !!data.isAdmin }) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const panelHref = signedIn ? (signedIn.isAdmin ? '/admin' : '/panel') : '/giris'
  const panelLabel = signedIn ? 'Panele git' : 'Panele giriş'

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="site-shell">
      {/* ÜST BİLGİ VE DESKTOP NAVİGASYON */}
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

        {/* Masaüstü giriş butonu ve Mobil Hamburger Menü ikonu */}
        <a className="header-contact" href={panelHref}>{panelLabel} <ArrowUpRight size={16} /></a>
        <button 
          className="menu-toggle" 
          type="button" 
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} 
          aria-expanded={menuOpen} 
          aria-controls="mobile-nav" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* MOBİL AÇILIR MENÜ */}
      <nav className="mobile-nav" id="mobile-nav" aria-label="Mobil menü" hidden={!menuOpen}>
        <Link to="/" onClick={closeMenu}>Ana Sayfa</Link>
        <Link to="/yazilar" onClick={closeMenu}>Yazılar</Link>
        <Link to="/guncellemeler" onClick={closeMenu}>Güncellemeler</Link>
        <a href={panelHref} onClick={closeMenu}>{panelLabel} <ArrowUpRight size={17} /></a>
      </nav>

      {/* ANA İÇERİK */}
      <main className="container section-space" style={{ maxWidth: 760 }}>
        <Link className="back-link" to="/" style={{ display: 'flex', width: 'fit-content', gap: 6, alignItems: 'center', marginBottom: 24 }}>
          <ArrowLeft size={15} />Ana sayfa
        </Link>
        {children}
      </main>

      {/* FOOTER */}
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
