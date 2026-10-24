import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Daha önce onay/red verilmiş mi kontrol et
    const consent = localStorage.getItem('sa_cookie_consent')
    if (!consent) {
      // Animasyon hissi için 1 saniye sonra göster
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('sa_cookie_consent', 'accepted')
    setShow(false)
  }

  const handleReject = () => {
    localStorage.setItem('sa_cookie_consent', 'rejected')
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
          <h3 id="cookie-title" style={{ margin: 0, fontSize: '1.15rem', letterSpacing: '-0.5px' }}>Çerez Tercihleri</h3>
        </div>
        <button 
          onClick={handleReject} 
          aria-label="Kapat"
          style={{ background: 'transparent', border: 0, color: '#8a957e', cursor: 'pointer', padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>
      
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#788078', lineHeight: 1.7 }}>
        Sitemizdeki deneyiminizi iyileştirmek için çerezler kullanıyoruz. Sadece zorunlu çerezlerle devam edebilir veya tümünü kabul edebilirsiniz. Detaylar için <a href="/gizlilik" style={{ color: '#255b43', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Gizlilik ve Çerez Politikası</a>'nı inceleyebilirsiniz.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button 
          className="button button-primary" 
          onClick={handleAccept} 
          style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
        >
          Kabul Et
        </button>
        <button 
          className="button" 
          onClick={handleReject} 
          style={{ flex: 1, padding: '12px', justifyContent: 'center', background: '#f0f4e9', border: '1px solid #dce4d4', color: '#4a5d52' }}
        >
          Reddet
        </button>
      </div>
    </div>
  )
}
