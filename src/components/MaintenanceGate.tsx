import { useEffect, useState } from 'react'
import { ROBOT_REPAIR_SVG } from './robotRepairSvg'

type MaintenanceState = { on: boolean; message: string; viewerIsAdmin: boolean }

// Bakım modunda bile açık kalan sayfalar (yönetici giriş yapabilsin diye). Normal kullanıcı girişi sunucuda engellenir.
const OPEN_PREFIXES = ['/admin', '/giris']

export function MaintenanceGate() {
  const [state, setState] = useState<MaintenanceState | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/community/maintenance', { credentials: 'same-origin', cache: 'no-store' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => { if (active && data) setState(data) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  if (!state?.on) return null
  const path = window.location.pathname
  if (OPEN_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))) return null

  if (state.viewerIsAdmin) {
    return <a href="/admin" style={{ position: 'fixed', left: '50%', bottom: 16, transform: 'translateX(-50%)', zIndex: 2147483000, background: '#1f3b30', color: '#fff', padding: '10px 16px', borderRadius: 999, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,0,0,.25)' }}>Bakım modu açık · ziyaretçiler bakım sayfasını görüyor</a>
  }

  return (
    <div role="alert" style={{ position: 'fixed', inset: 0, zIndex: 2147483000, background: '#fafaf6', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div aria-hidden={false} dangerouslySetInnerHTML={{ __html: ROBOT_REPAIR_SVG }} />
        <h1 style={{ margin: '24px 0 10px', fontSize: 'clamp(1.7rem, 6vw, 2.4rem)', color: '#1f3b30' }}>Site şu an bakımda.</h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#4a5d52' }}>{state.message || 'Robotlarımız parçaları tamir ediyor. Çok yakında geri döneceğiz.'}</p>
        <a href="/giris" style={{ display: 'inline-block', marginTop: 28, fontSize: 13, color: '#8a9a8f' }}>Yönetici girişi</a>
      </div>
    </div>
  )
}
