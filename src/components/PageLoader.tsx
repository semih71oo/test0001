import { useEffect, useState } from 'react'

const MIN_VISIBLE_MS = 700 // çok hızlı açılsa bile ekran "çakmasın"
const MAX_WAIT_MS = 8000 // takılırsa kendini kapatır
const FADE_MS = 600

// Çam yeşili nefes alan yükleme ekranı (siteyle aynı palet: #245c45 / krem #fafaf6)
const css = `
.sa-loader{position:fixed;inset:0;z-index:2147482999;display:grid;place-items:center;background:rgba(250,250,246,.92);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:1;transition:opacity ${FADE_MS}ms ease}
.sa-loader[data-leaving="true"]{opacity:0;pointer-events:none}
.sa-loader-orb{position:relative;width:64px;height:64px;transition:transform ${FADE_MS}ms ease}
.sa-loader[data-leaving="true"] .sa-loader-orb{transform:scale(1.25)}
.sa-loader-orb::before,.sa-loader-orb::after{content:"";position:absolute;inset:0;border-radius:50%}
.sa-loader-orb::before{background:radial-gradient(circle at 35% 30%,#3f8a6b,#245c45 62%,#1f4d3a);box-shadow:0 10px 30px rgba(36,92,69,.28);animation:sa-breathe 2s ease-in-out infinite}
.sa-loader-orb::after{border:2px solid rgba(36,92,69,.35);animation:sa-halo 2s ease-out infinite}
@keyframes sa-breathe{0%,100%{transform:scale(.82);opacity:.85}50%{transform:scale(1);opacity:1}}
@keyframes sa-halo{0%{transform:scale(.9);opacity:.6}70%,100%{transform:scale(1.9);opacity:0}}
@media (prefers-reduced-motion:reduce){.sa-loader-orb::before,.sa-loader-orb::after{animation:none}.sa-loader-orb::after{display:none}}
html.sa-skip-loader .sa-loader{display:none}
`

export function PageLoader() {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let finished = false
    const timers: number[] = []

    const finish = () => {
      if (finished) return
      finished = true
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start))
      timers.push(window.setTimeout(() => {
        try { sessionStorage.setItem('sa-loaded', '1') } catch { /* gizli mod vb. */ }
        setLeaving(true)
        timers.push(window.setTimeout(() => setGone(true), FADE_MS + 50))
      }, wait))
    }

    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
    timers.push(window.setTimeout(finish, MAX_WAIT_MS))

    return () => {
      window.removeEventListener('load', finish)
      timers.forEach(window.clearTimeout)
    }
  }, [])

  if (gone) return null

  return (
    <>
      <style>{css}</style>
      <noscript><style>{'.sa-loader{display:none}'}</style></noscript>
      <div className="sa-loader" data-leaving={leaving} role="status" aria-live="polite">
        <div className="sa-loader-orb" aria-hidden="true" />
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Yükleniyor…</span>
      </div>
    </>
  )
}
