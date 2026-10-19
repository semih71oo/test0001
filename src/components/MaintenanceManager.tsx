import { useEffect, useState } from 'react'
import { Power, Wrench } from 'lucide-react'
import { communityApi } from '../lib/community'

export function MaintenanceManager() {
  const [on, setOn] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    communityApi<{ on: boolean; message: string }>('maintenance')
      .then(data => { setOn(data.on); setMessage(data.message) })
      .catch(caught => setError(caught instanceof Error ? caught.message : 'Durum yüklenemedi.'))
      .finally(() => setLoading(false))
  }, [])

  async function apply(next: boolean) {
    setBusy(true); setError(''); setNotice('')
    try {
      await communityApi('set-maintenance', { on: next, message })
      setOn(next)
      setNotice(next ? 'Bakım modu açıldı. Ziyaretçiler bakım sayfasını görüyor.' : 'Bakım modu kapatıldı. Site yeniden herkese açık.')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'İşlem yapılamadı.') }
    finally { setBusy(false) }
  }

  return <section className="panel-card management-form" style={{ maxWidth: 640 }}>
    <span className="panel-card-icon"><Wrench size={21} /></span>
    <h2>Bakım modu</h2>
    <p className="card-description">Açıkken ziyaretçiler “Site şu an bakımda” sayfasını görür. Sen yönetici olarak siteyi normal görmeye devam edersin; /giris, /panel ve /admin sayfaları da açık kalır.</p>
    <p role="status" style={{ margin: '8px 0 14px' }}><strong>Şu an:</strong> {loading ? 'Yükleniyor…' : on ? 'Bakım modu AÇIK' : 'Site herkese açık'}</p>
    <div className="account-form">
      <fieldset disabled={busy || loading}>
        <div className="form-field"><label htmlFor="maintenance-message">Ziyaretçilere gösterilecek mesaj (isteğe bağlı)</label>
          <textarea id="maintenance-message" value={message} onChange={event => setMessage(event.target.value)} maxLength={200} rows={3} placeholder="Robotlarımız parçaları tamir ediyor. Çok yakında geri döneceğiz." style={{ width: '100%', borderRadius: 12, padding: 12, font: 'inherit' }} />
        </div>
        <div className="form-feedback" aria-live="polite">{error && <p className="message message-error" role="alert">{error}</p>}{notice && <p className="message message-success" role="status">{notice}</p>}</div>
        <button className="button button-primary form-submit" type="button" onClick={() => apply(!on)}>{busy ? 'Kaydediliyor…' : on ? 'Bakım modunu kapat' : 'Bakım modunu aç'}<Power size={17} /></button>
        {on && <button className="text-action" type="button" onClick={() => apply(true)}>Sadece mesajı güncelle</button>}
      </fieldset>
    </div>
  </section>
}
