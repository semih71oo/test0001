import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Daha önce bildirim kapatılmış mı kontrol et
    const consent = localStorage.getItem('sa_cookie_consent')
    if (!consent) {
      // Animasyon hissi için 1 saniye sonra göster
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    // Mevcut anahtarı koruyarak eski kullanıcıların tercihini de tanı
    localStorage.setItem('sa_cookie_consent', 'accepted')
    setShow(false)
  }

  if (!show) return null

  return (
    <div 
      role="dialog" 
      aria-labelledby="cookie-title"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 2147482999, // Bakım modunun (2147483000) arkasında kalması için düşürüldü
        maxWidth: 420,
        width: 'calc(100% - 48px)',
        background: '#fffefa',
        border: '1px solid #e0e5d7',
        borderRadius: 14,
        padding: 24,
        boxShadow: '0 16px 50px rgba(27, 65, 40, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        animation: 'reveal 0.5s ease backwards'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, background: '#edf2e1', borderRadius: 10, color: '#61814e' }}>
            <Cookie size={20} />
          </div>
          <h3 id="cookie-title" style={{ margin: 0, fontSize: '1.15rem', letterSpacing: '-0.5px' }}>Gizlilik Bilgilendirmesi</h3>
        </div>
        <button 
          onClick={handleDismiss} 
          aria-label="Kapat"
          style={{ background: 'transparent', border: 0, color: '#8a957e', cursor: 'pointer', padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>
      
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#788078', lineHeight: 1.7 }}>
        Bu sitede analiz veya reklam amacıyla isteğe bağlı çerez kullanımı tespit edilmedi. Bu bildirimi tekrar göstermemek için tercihiniz tarayıcınızın yerel depolama alanında saklanır. Ayrıntılar için <a href="/gizlilik" style={{ color: '#255b43', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Gizlilik Politikası</a>'nı inceleyebilirsiniz.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button 
          className="button button-primary" 
          onClick={handleDismiss} 
          style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
        >
          Anladım
        </button>
      </div>
    </div>
  )
}
