import { ArrowLeft, Code2 } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="not-found-page container">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Semih Algan ana sayfa">
          <span className="brand-icon"><Code2 size={22} aria-hidden="true" /></span>
          <span>semih<span className="brand-light">algan</span><span className="brand-dot">.</span></span>
        </a>
      </header>
      <main className="not-found-main" aria-labelledby="not-found-title">
        <div className="not-found-art" aria-hidden="true">
          <span className="not-found-code">404</span>
          <span className="not-found-code-mark"><Code2 size={30} /></span>
        </div>
        <div className="not-found-copy">
          <p className="eyebrow">404 / SAYFA BULUNAMADI</p>
          <h1 id="not-found-title">Aradığınız sayfa bulunamadı</h1>
          <p className="not-found-description">Bu sayfa taşınmış veya kaldırılmış olabilir. Ana sayfaya dönerek keşfetmeye devam edebilirsiniz.</p>
          <a className="button button-primary" href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Ana Sayfaya Dön
          </a>
        </div>
      </main>
      <footer className="not-found-footer">Semih Algan / Yazılım & Fikirler</footer>
    </div>
  )
}
