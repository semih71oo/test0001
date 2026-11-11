import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { motion } from 'motion/react'
import { DeveloperBoard } from '../components/DeveloperBoard'
import { SoftwareCarousel } from '../components/SoftwareCarousel'
import { softwareList } from '../lib/software'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Check, Code2, Copy, Dribbble, Mail, MapPin, Menu, MessageCircle, Puzzle, Sparkles, X, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const heroRef = useRef<HTMLElement>(null)
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

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let loaderObserver: MutationObserver | undefined
    let revealObserver: IntersectionObserver | undefined
    let heroContext: gsap.Context | undefined
    const revealTweens: gsap.core.Tween[] = []
    const revealSelector = '.values-inner, .software-section .section-heading, .carousel-container, .community-section .section-heading, .community-section .board-description, .community-section .developer-grid, .about-card, .about-copy, .contact-intro, .contact-options'

    const startAnimations = () => {
      if (cancelled) return

      heroContext = gsap.context(() => {
        const copyItems = gsap.utils.toArray<HTMLElement>('.hero-copy > *')
        const artwork = hero.querySelector<HTMLElement>('.hero-art')

        gsap.set(copyItems, { autoAlpha: 0, y: 22 })
        if (artwork) gsap.set(artwork, { autoAlpha: 0, y: 18 })

        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
        timeline.to(copyItems, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          clearProps: 'all',
        })

        if (artwork) {
          timeline.to(artwork, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            clearProps: 'all',
          }, '-=0.55')
        }
      }, hero)

      if (!('IntersectionObserver' in window)) return

      const revealTargets = gsap.utils.toArray<HTMLElement>(revealSelector)

      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          revealTweens.push(gsap.fromTo(entry.target,
            { autoAlpha: 0, y: 26 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
              clearProps: 'all',
            },
          ))
          observer.unobserve(entry.target)
        })
      }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' })

      revealTargets.forEach(target => {
        gsap.set(target, { autoAlpha: 0, y: 26 })
        revealObserver?.observe(target)
      })
    }

    const loader = document.querySelector('.sa-loader')
    if (loader && !document.documentElement.classList.contains('sa-skip-loader')) {
      loaderObserver = new MutationObserver(() => {
        if (document.querySelector('.sa-loader')) return
        loaderObserver?.disconnect()
        startAnimations()
      })
      loaderObserver.observe(document.body, { childList: true, subtree: true })
    } else {
      startAnimations()
    }

    return () => {
      cancelled = true
      loaderObserver?.disconnect()
      revealObserver?.disconnect()
      revealTweens.forEach(tween => tween.kill())
      heroContext?.revert()
      gsap.utils.toArray<HTMLElement>(revealSelector).forEach(target => gsap.set(target, { clearProps: 'all' }))
    }
  }, [])

  const panelHref = signedIn ? (signedIn.isAdmin ? '/admin' : '/panel') : '/giris'
  const panelLabel = signedIn ? 'Panele git' : 'Panele giriş'

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('71.semih.algan@gmail.com')
      setCopyStatus('E-posta adresi kopyalandı.')
    } catch {
      setCopyStatus('Kopyalama yapılamadı. E-posta adresini seçerek kopyalandığını doğrulayabilirsin.')
    }
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="site-shell" id="baslangic">
      <a className="skip-link" href="#icerik">İçeriğe geç</a>
      
      {/* HEADER */}
      <header className="site-header container">
        <a className="brand" href="#baslangic" aria-label="Semih Algan ana sayfa">
          <span className="brand-icon"><Code2 size={23} strokeWidth={2.2} /></span>
          <span>semih<span className="brand-light">algan</span><span className="brand-dot">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Ana menü">
          <a className="nav-active" href="#baslangic">Ana Sayfa</a>
          <a href="/yazilimlar">Yazılımlar</a>
          <a href="#hakkimda">Hakkımda</a>
          <a href="#pano">Geliştiriciler</a>
          <a href="/yazilar">Yazılar</a>
          <a href="/guncellemeler">Güncellemeler</a>
        </nav>
        <a className="header-contact" href={panelHref}>{panelLabel} <ArrowUpRight size={16} /></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* MOBİL MENÜ */}
      <nav className="mobile-nav" id="mobile-nav" aria-label="Mobil menü" hidden={!menuOpen}>
        <a href="#baslangic" onClick={closeMenu}>Ana Sayfa</a>
        <a href="/yazilimlar" onClick={closeMenu}>Yazılımlar</a>
        <a href="#hakkimda" onClick={closeMenu}>Hakkımda</a>
        <a href="#pano" onClick={closeMenu}>Geliştiriciler</a>
        <a href="/yazilar" onClick={closeMenu}>Yazılar</a>
        <a href="/guncellemeler" onClick={closeMenu}>Güncellemeler</a>
        <a href={panelHref} onClick={closeMenu}>{panelLabel} <ArrowUpRight size={17} /></a>
        <a href="#iletisim" onClick={closeMenu}>İletişime geç <ArrowUpRight size={17} /></a>
      </nav>

      {/* ANA İÇERİK */}
      <main id="icerik">
        {/* HERO BÖLÜMÜ */}
        <section ref={heroRef} className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> FİKİRDEN KODA, KODDAN HAYATA</div>
            <h1 id="hero-title">İyi fikirler,<br /><span>güçlü yazılımlar.</span></h1>
            <p className="hero-description">Merhaba, ben Semih. Fikirleri kodla buluşturuyor,<br className="desktop-break" /> kullanışlı ve özenle tasarlanmış yazılımlar geliştiriyorum.</p>
            <div className="hero-actions">
              <motion.a className="button button-primary" href="/yazilimlar" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>Yazılımları keşfet <ArrowUpRight size={19} /></motion.a>
              <motion.a className="button button-text" href="#hakkimda" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>Beni tanı <ArrowRight size={18} /></motion.a>
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

        {/* DEĞERLER ŞERİDİ */}
        <div className="values-strip">
          <div className="container values-inner">
            <span><Code2 size={18} /> Temiz kod</span>
            <span className="strip-divider" />
            <span><Puzzle size={18} /> Gerçek çözümler</span>
            <span className="strip-divider" />
            <span><Sparkles size={18} /> Özenli tasarım</span>
            <a href="#yazilimlar">Neler geliyor? <ArrowDown size={16} /></a>
          </div>
        </div>

        {/* YAZILIMLAR CAROUSEL VİTRİNİ */}
        <section className="software-section container section-space" id="yazilimlar" aria-labelledby="software-title">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">01 / YAZILIMLAR</div>
              <h2 id="software-title">Geliştirdiğim Yazılımlar<span className="heading-dot">.</span></h2>
            </div>
            <a href="/yazilimlar" className="pill hover:border-emerald-500 transition" style={{ textDecoration: 'none' }}>
              <span className="status-dot" /> Tümünü Gör ({softwareList.length}) <ArrowUpRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
            </a>
          </div>

          {/* 3D Hareketli Carousel Bileşeni */}
          <SoftwareCarousel />
        </section>

        {/* GELİŞTİRİCİ PANOSU */}
        <DeveloperBoard />

        {/* HAKKIMDA BÖLÜMÜ */}
        <section className="about-section container section-space" id="hakkimda" aria-labelledby="about-title">
          <div className="about-card">
            <span className="small-label">KODUN ARKASINDAKİ İNSAN</span>
            <div className="monogram">sa<span>.</span></div>
            <div className="profile-caption"><span>Semih Algan</span><span>Yazılım Geliştirici <ArrowUpRight size={16} /></span></div>
            <div className="profile-location"><MapPin size={15} /> Kırıkkale, Türkiye</div>
          </div>
          <div className="about-copy">
            <div className="eyebrow section-eyebrow">02 / HAKKIMDA</div>
            <h2 id="about-title">Merakla başladı.<br /><span>Kodla devam ediyor.</span></h2>
            <p>Ben Semih Algan. 26 Mayıs 2011’de Kırıkkale’nin Merkez ilçesinde doğdum. Yazılım geliştirmeyi seven, fikirlerini hayata geçirmekten keyif alan bir geliştiriciyim.</p>
            <p>Basketbol ve satrançla ilgileniyorum. Sahada takım ruhunu, satrançta stratejik düşünmeyi seviyorum. Aynı merakı ve çözüm odaklı bakışı yazılımlarıma da taşıyorum.</p>
            <div className="interest-tags">
              <span><Code2 size={16} /> Yazılım</span>
              <span><Dribbble size={16} /> Basketbol</span>
              <span><Puzzle size={16} /> Satranç</span>
            </div>
            <a className="about-link" href="#iletisim">Tanışalım <ArrowUpRight size={17} /></a>
          </div>
        </section>

        {/* İLETİŞİM BÖLÜMÜ */}
        <section className="contact-section" id="iletisim" aria-labelledby="contact-title">
          <div className="container contact-inner">
            <div className="contact-intro">
              <div className="eyebrow section-eyebrow">03 / İLETİŞİM</div>
              <h2 id="contact-title">Bir fikirle<br />başlayabiliriz<span>.</span></h2>
              <p>Bir sorunun, önerin ya da paylaşmak istediğin<br className="desktop-break" /> bir fikrin varsa, bana ulaşabilirsin.</p>
              <span className="contact-signature">Güzel işler, bir merhabayla başlar. <ArrowDownRight size={22} /></span>
            </div>
            <div className="contact-options">
              <div className="contact-card">
                <div className="contact-icon"><Mail size={22} /></div>
                <div className="contact-detail">
                  <span>E-POSTA GÖNDER</span>
                  <a href="mailto:71.semih.algan@gmail.com">71.semih.algan@gmail.com <ArrowUpRight size={18} /></a>
                </div>
                <button type="button" className="copy-button" aria-label="E-posta adresini kopyala" onClick={copyEmail}>
                  {copyStatus === 'E-posta adresi kopyalandı.' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div className="contact-card">
                <div className="contact-icon"><MessageCircle size={22} /></div>
                <div className="contact-detail">
                  <span>WHATSAPP İLE ULAŞ</span>
                  <a href="https://wa.me/905333557971" target="_blank" rel="noopener noreferrer">
                    0533 355 79 71 <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
              <p className="copy-status" role="status">{copyStatus}</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="container site-footer">
        <a className="brand footer-brand" href="#baslangic">
          <span className="brand-icon"><Code2 size={19} /></span>
          <span>semih<span className="brand-light">algan</span>.</span>
        </a>
        <p>© {new Date().getFullYear()} Semih Algan. Tüm Hakları Saklıdır.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.875rem' }}>
          <a href="/yazilimlar" style={{ color: 'currentColor', opacity: 0.75, textDecoration: 'none' }}>Yazılımlar</a>
          <a href="/guncellemeler" style={{ color: 'currentColor', opacity: 0.75, textDecoration: 'none' }}>Güncellemeler</a>
          <a href="/kvkk" style={{ color: 'currentColor', opacity: 0.75, textDecoration: 'none' }}>KVKK</a>
          <a href="/gizlilik" style={{ color: 'currentColor', opacity: 0.75, textDecoration: 'none' }}>Gizlilik</a>
          <a href="/kullanim-kosullari" style={{ color: 'currentColor', opacity: 0.75, textDecoration: 'none' }}>Koşullar</a>
        </div>
        <a className="back-top" href="#baslangic">Başa dön <ChevronRight size={16} /></a>
      </footer>
    </div>
  )
            }
