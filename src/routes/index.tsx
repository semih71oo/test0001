import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DeveloperBoard } from '../components/DeveloperBoard'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronRight, Code2, Copy, Dribbble, Mail, MapPin, Menu, Phone, Puzzle, Sparkles, X } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [signedIn, setSignedIn] = useState<{ isAdmin: boolean } | null>(null)

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

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('71.semih.algan@gmail.com')
      setCopyStatus('E-posta adresi kopyalandı.')
    } catch {
      setCopyStatus('Kopyalama yapılamadı. E-posta adresini seçerek kopyalayabilirsin.')
    }
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="site-shell" id="baslangic">
      <a className="skip-link" href="#icerik">İçeriğe geç</a>
      <header className="site-header container">
        <a className="brand" href="#baslangic" aria-label="Semih Algan ana sayfa">
          <span className="brand-icon"><Code2 size={23} strokeWidth={2.2} /></span>
          <span>semih<span className="brand-light">algan</span><span className="brand-dot">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Ana menü">
          <a className="nav-active" href="#baslangic">Ana Sayfa</a>
          <a href="#yazilimlar">Yazılımlar <span className="nav-badge">Yakında</span></a>
          <a href="#hakkimda">Hakkımda</a>
          <a href="#pano">Geliştiriciler</a>
        </nav>
        <a className="header-contact" href={panelHref}>{panelLabel} <ArrowUpRight size={16} /></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <nav className="mobile-nav" id="mobile-nav" aria-label="Mobil menü" hidden={!menuOpen}>
        <a href="#baslangic" onClick={closeMenu}>Ana Sayfa</a>
        <a href="#yazilimlar" onClick={closeMenu}>Yazılımlar · Yakında</a>
        <a href="#hakkimda" onClick={closeMenu}>Hakkımda</a>
        <a href="#pano" onClick={closeMenu}>Geliştiriciler</a>
        <a href={panelHref} onClick={closeMenu}>{panelLabel} <ArrowUpRight size={17} /></a>
        <a href="#iletisim" onClick={closeMenu}>İletişime geç <ArrowUpRight size={17} /></a>
      </nav>
      <main id="icerik">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> FİKİRDEN KODA, KODDAN HAYATA</div>
            <h1 id="hero-title">İyi fikirler,<br /><span>güçlü yazılımlar.</span></h1>
            <p className="hero-description">Merhaba, ben Semih. Fikirleri kodla buluşturuyor,<br className="desktop-break" /> kullanışlı ve özenle tasarlanmış yazılımlar geliştiriyorum.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#yazilimlar">Yazılımları keşfet <ArrowUpRight size={19} /></a>
              <a className="button button-text" href="#hakkimda">Beni tanı <ArrowRight size={18} /></a>
            </div>
            <div className="hero-note"><span className="mini-avatar">sa.</span><span>Bir geliştirici. Birçok fikir.<br /><strong>Her zaman daha iyisinin peşinde.</strong></span></div>
          </div>
          <div className="hero-art" role="img" aria-label="Fikirlerin koda dönüşmesini anlatan yeşil katmanlar ve kod sembolleri">
            <span className="art-coordinate">SA / DIGITAL WORKSPACE</span>
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span>
            <div className="code-sculpture">
              <div className="sculpture-layer layer-back"><span /></div>
              <div className="sculpture-layer layer-middle"><span /></div>
              <div className="sculpture-layer layer-front"><Code2 strokeWidth={1.1} /></div>
            </div>
            <div className="art-label"><span className="status-dot" /> BUILT WITH CURIOSITY</div>
            <div className="floating-note"><span className="floating-icon"><Sparkles size={19} /></span><div>Her satırda bir fikir.<small>Her fikirde yeni bir başlangıç.</small></div><ArrowUpRight size={17} /></div>
            <span className="art-bottom">DÜŞÜN. TASARLA. GELİŞTİR.</span>
          </div>
        </section>
        <div className="values-strip"><div className="container values-inner"><span><Code2 size={18} /> Temiz kod</span><span className="strip-divider" /><span><Puzzle size={18} /> Gerçek çözümler</span><span className="strip-divider" /><span><Sparkles size={18} /> Özenli tasarım</span><a href="#yazilimlar">Neler geliyor? <ArrowDown size={16} /></a></div></div>
        <section className="software-section container section-space" id="yazilimlar" aria-labelledby="software-title">
          <div className="section-heading"><div><div className="eyebrow section-eyebrow">01 / YAZILIMLAR</div><h2 id="software-title">Yeni fikirler yolda.</h2></div><span className="pill"><span className="status-dot" /> Çok yakında</span></div>
          <div className="coming-soon">
            <div className="coming-graphic" aria-hidden="true"><div className="small-window"><div className="window-dots"><i /><i /><i /></div><Code2 size={44} strokeWidth={1.4} /><div className="window-line" /><div className="window-line short" /></div><span className="graphic-spark"><Sparkles size={22} /></span></div>
            <div className="coming-copy"><span className="small-label">BİRAZ MERAK, BİRAZ KOD.</span><h3>Bir sonraki yazılımın<br />burada seni bekliyor olacak.</h3><p>Üzerinde çalıştığım yazılımlar yakında bu vitrinde yerini alacak. Şimdilik keşfetme zamanı; satışlar henüz başlamadı.</p><span className="sales-note"><CheckCheck size={16} /> Şu an satın alma ve ödeme işlemi yapılmıyor.</span></div>
            <a className="coming-link" href="#iletisim">Aklında bir fikir mi var? <ArrowUpRight size={18} /></a>
          </div>
        </section>
        <DeveloperBoard />
        <section className="about-section container section-space" id="hakkimda" aria-labelledby="about-title">
          <div className="about-card"><span className="small-label">KODUN ARKASINDAKİ İNSAN</span><div className="monogram">sa<span>.</span></div><div className="profile-caption"><span>Semih Algan</span><span>Yazılım Geliştirici <ArrowUpRight size={16} /></span></div><div className="profile-location"><MapPin size={15} /> Kırıkkale, Türkiye</div></div>
          <div className="about-copy"><div className="eyebrow section-eyebrow">02 / HAKKIMDA</div><h2 id="about-title">Merakla başladı.<br /><span>Kodla devam ediyor.</span></h2><p>Ben Semih Algan. 26 Mayıs 2011’de Kırıkkale’nin Merkez ilçesinde doğdum. Yazılım geliştirmeyi seven, fikirlerini hayata geçirmekten keyif alan bir geliştiriciyim.</p><p>Basketbol ve satrançla ilgileniyorum. Sahada takım ruhunu, satrançta stratejik düşünmeyi seviyorum. Aynı merakı ve çözüm odaklı bakışı yazılımlarıma da taşıyorum.</p><div className="interest-tags"><span><Code2 size={16} /> Yazılım</span><span><Dribbble size={16} /> Basketbol</span><span><Puzzle size={16} /> Satranç</span></div><a className="about-link" href="#iletisim">Tanışalım <ArrowUpRight size={17} /></a></div>
        </section>
        <section className="contact-section" id="iletisim" aria-labelledby="contact-title"><div className="container contact-inner"><div className="contact-intro"><div className="eyebrow section-eyebrow">03 / İLETİŞİM</div><h2 id="contact-title">Bir fikirle<br />başlayabiliriz<span>.</span></h2><p>Bir sorunun, önerin ya da paylaşmak istediğin<br className="desktop-break" /> bir fikrin varsa, bana ulaşabilirsin.</p><span className="contact-signature">Güzel işler, bir merhabayla başlar. <ArrowDownRight size={22} /></span></div><div className="contact-options"><div className="contact-card"><div className="contact-icon"><Mail size={22} /></div><div className="contact-detail"><span>E-POSTA GÖNDER</span><a href="mailto:71.semih.algan@gmail.com">71.semih.algan@gmail.com <ArrowUpRight size={18} /></a></div><button type="button" className="copy-button" aria-label="E-posta adresini kopyala" onClick={copyEmail}>{copyStatus === 'E-posta adresi kopyalandı.' ? <Check size={18} /> : <Copy size={18} />}</button></div><div className="contact-card"><div className="contact-icon"><Phone size={22} /></div><div className="contact-detail"><span>TELEFONLA ULAŞ</span><a href="tel:+905333557971">0533 355 79 71 <ArrowUpRight size={18} /></a></div></div><p className="copy-status" role="status">{copyStatus}</p></div></div></section>
      </main>
      <footer className="container site-footer"><a className="brand footer-brand" href="#baslangic"><span className="brand-icon"><Code2 size={19} /></span><span>semih<span className="brand-light">algan</span>.</span></a><p>© {new Date().getFullYear()} Semih Algan. Özenle geliştirildi.</p><a className="back-top" href="#baslangic">Başa dön <ChevronRight size={16} /></a></footer>
    </div>
  )
  }
