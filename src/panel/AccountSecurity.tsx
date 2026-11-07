import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, Copy, LockKeyhole, ShieldCheck, Trash2, X } from 'lucide-react'
import { communityApi } from '../../lib/community'
import { PasswordField } from '../PasswordField'

function Feedback({ error, notice }: { error: string; notice?: string }) {
  return (
    <div className="form-feedback" aria-live="polite">
      {error && <p className="message message-error" role="alert">{error}</p>}
      {notice && <p className="message message-success" role="status">{notice}</p>}
    </div>
  )
}

export function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [setupMode, setSetupMode] = useState(false)
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [disabling, setDisabling] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [username, setUsername] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    communityApi<{ enabled: boolean; username: string }>('2fa-status')
      .then(res => {
        setEnabled(res.enabled)
        setUsername(res.username)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startSetup() {
    setError('')
    setNotice('')
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(20)), b => alphabet[b % 32]).join('')
    setSecret(newSecret)
    setCode('')
    setSetupMode(true)
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await communityApi('setup-2fa', { secret, code })
      setEnabled(true)
      setSetupMode(false)
      setNotice('İki Adımlı Doğrulama başarıyla aktifleştirildi!')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Kod doğrulanamadı.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDisable(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await communityApi('disable-2fa', { password })
      setEnabled(false)
      setDisabling(false)
      setPassword('')
      setNotice('2FA başarıyla devre dışı bırakıldı.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Şifre hatalı.')
    } finally {
      setBusy(false)
    }
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopyStatus('Anahtar kopyalandı!')
      setTimeout(() => setCopyStatus(''), 2500)
    } catch {
      setCopyStatus('Kopyalanamadı.')
    }
  }

  if (loading) return null

  const otpUrl = `otpauth://totp/SemihAlgan:${username || 'admin'}?secret=${secret}&issuer=SemihAlgan`

  return (
    <section className="panel-card" style={{ marginTop: 22 }}>
      <span className="panel-card-icon" style={{ background: enabled ? '#edf4e4' : '#edf2e1', color: enabled ? '#4c7040' : '#61814e' }}>
        <ShieldCheck size={21} />
      </span>
      <h2>İki Adımlı Doğrulama (2FA)</h2>
      <p className="card-description">
        {enabled
          ? 'Hesabınız Google Authenticator ile korunuyor. Giriş yaparken şifrenize ek olarak 6 haneli kod istenir.'
          : 'Google Authenticator ile hesabınıza 30 saniyede bir değişen ekstra güvenlik kodu koruması ekleyin.'}
      </p>

      {error && <p className="message message-error" style={{ marginTop: 14 }}>{error}</p>}
      {notice && <p className="message message-success" style={{ marginTop: 14 }}>{notice}</p>}

      {enabled ? (
        <div style={{ marginTop: 18 }}>
          <span className="account-state active" style={{ display: 'inline-flex', marginBottom: 14 }}>
            <Check size={12} /> 2FA Aktif ve Korunuyor
          </span>
          <br />
          {!disabling ? (
            <button
              type="button"
              className="danger-button"
              style={{ padding: '8px 14px' }}
              onClick={() => { setDisabling(true); setError(''); setNotice(''); }}
            >
              2FA'yı Devre Dışı Bırak
            </button>
          ) : (
            <form onSubmit={handleDisable} style={{ marginTop: 12, maxWidth: 360 }}>
              <p style={{ fontSize: '11px', color: '#974d34', marginBottom: 8 }}>
                Devre dışı bırakmak için mevcut hesap şifrenizi girin:
              </p>
              <input
                type="password"
                required
                placeholder="Hesap şifreniz"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', marginBottom: 10, height: 40, padding: '0 10px', borderRadius: 6, border: '1px solid var(--line)', font: 'inherit', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={busy} className="danger-button">
                  {busy ? 'Kaldırılıyor…' : 'Kaldır'}
                </button>
                <button type="button" disabled={busy} className="button button-outline" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setDisabling(false)}>
                  Vazgeç
                </button>
              </div>
            </form>
          )}
        </div>
      ) : !setupMode ? (
        <button
          type="button"
          className="button button-primary"
          style={{ marginTop: 16 }}
          onClick={startSetup}
        >
          2FA Kurulumunu Başlat <ArrowUpRight size={16} />
        </button>
      ) : (
        <div style={{ marginTop: 16, background: '#fafbf6', border: '1px solid var(--line)', borderRadius: 10, padding: 18 }}>
          <h3 style={{ fontSize: '14px', marginBottom: 8, fontWeight: 700 }}>Google Authenticator Kurulumu</h3>
          <p style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--muted)', marginBottom: 12 }}>
            Aşağıdaki butona tıklayarak doğrudan Authenticator uygulamanıza ekleyebilir veya gizli anahtarı elle girebilirsiniz:
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <a
              href={otpUrl}
              className="button button-primary"
              style={{ padding: '8px 16px', fontSize: '11px' }}
            >
              Authenticator Uygulamasında Aç
            </a>
            <button
              type="button"
              className="button button-outline"
              style={{ padding: '8px 14px', fontSize: '11px' }}
              onClick={copySecret}
            >
              {copyStatus || 'Anahtarı Kopyala'} <Copy size={13} />
            </button>
          </div>

          <div style={{ padding: 10, background: '#f0f3e7', borderRadius: 6, marginBottom: 16 }}>
            <span style={{ fontSize: '10px', color: '#68785e', display: 'block', marginBottom: 4 }}>Kurulum Anahtarı (Elle Giriş İçin):</span>
            <code style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', wordBreak: 'break-all' }}>{secret}</code>
          </div>

          <form onSubmit={handleVerify}>
            <label htmlFor="totp-test" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Uygulamada Görünen 6 Haneli Kodu Girin:
            </label>
            <div style={{ display: 'flex', gap: 10, maxWidth: 300 }}>
              <input
                id="totp-test"
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                style={{ flex: 1, height: 42, textAlign: 'center', fontSize: '16px', fontWeight: 700, letterSpacing: '3px', borderRadius: 6, border: '1px solid var(--line)' }}
              />
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="button button-primary"
                style={{ padding: '0 16px' }}
              >
                {busy ? 'Doğrulanıyor…' : 'Aktif Et'}
              </button>
            </div>
            <button
              type="button"
              className="text-action"
              style={{ marginTop: 12, fontSize: '11px' }}
              onClick={() => setSetupMode(false)}
            >
              <X size={13} /> Kurulumu İptal Et
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (password !== confirmation) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    setBusy(true)
    try {
      await communityApi('change-password', { currentPassword, password })
      setNotice('Şifren güvenle güncellendi.')
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : 'Şifre güncellenemedi. Oturumunu ve bağlantını kontrol et.')
    } finally {
      setBusy(false)
      setCurrentPassword('')
      setPassword('')
      setConfirmation('')
    }
  }

  return (
    <section className="panel-card">
      <span className="panel-card-icon"><LockKeyhole size={21} /></span>
      <h2>Şifremi güncelle</h2>
      <p className="card-description">En az 12 karakterlik güçlü bir şifre kullan.</p>
      <form className="account-form compact-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <PasswordField id="panel-current-password" label="Mevcut şifre" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" minLength={1} />
          <PasswordField id="panel-password" label="Yeni şifre" value={password} onChange={setPassword} />
          <PasswordField id="panel-password-confirm" label="Şifre tekrar" value={confirmation} onChange={setConfirmation} />
          <Feedback error={error} notice={notice} />
          <button className="button button-primary" type="submit">{busy ? 'Güncelleniyor…' : 'Şifreyi güncelle'}<ArrowUpRight size={16} /></button>
        </fieldset>
      </form>
    </section>
  )
}

export function DeleteAccountSettings({ isFounder, onDeleted }: { isFounder: boolean; onDeleted: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await communityApi('delete-my-account', { password })
      onDeleted()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Hesap silinemedi. Lütfen şifrenizi kontrol edin.')
      setBusy(false)
    }
  }

  if (isFounder) {
    return (
      <section className="panel-card" style={{ borderColor: '#f2d5c9', background: '#fffcfb' }}>
        <span className="panel-card-icon" style={{ background: '#fff2eb', color: '#974d34' }}><Trash2 size={21} /></span>
        <h2 style={{ color: '#974d34' }}>Hesabımı Sil</h2>
        <p className="card-description">Kurucu hesapları güvenlik nedeniyle bu alandan doğrudan silinemez. Hesabı silmek için önce yönetim yetkisi devredilmelidir.</p>
      </section>
    )
  }

  return (
    <section className="panel-card" style={{ borderColor: '#f2d5c9', background: '#fffcfb' }}>
      <span className="panel-card-icon" style={{ background: '#fff2eb', color: '#974d34' }}><Trash2 size={21} /></span>
      <h2 style={{ color: '#974d34' }}>Hesabımı Sil</h2>
      <p className="card-description">Bu işlem kalıcıdır ve geri alınamaz. Hesabınız, tüm yorumlarınız ve beğenileriniz kalıcı olarak silinecektir.</p>
      <button className="danger-button" type="button" onClick={() => setIsOpen(true)} style={{ marginTop: 16, padding: '10px 16px', fontSize: '11px' }}>
        Hesabımı kalıcı olarak sil
      </button>

      {isOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-del-acc-title">
          <div className="modal-content">
            <h3 id="modal-del-acc-title" style={{ color: '#974d34' }}>Hesabınızı silmek istediğinize emin misiniz?</h3>
            <p style={{ marginBottom: 16 }}>İşlemi onaylamak için mevcut hesap şifrenizi girmelisiniz. Bu işlem <strong>geri alınamaz</strong>.</p>
            <form onSubmit={handleDelete} className="account-form compact-form" style={{ marginTop: 0, textAlign: 'left' }}>
              <PasswordField id="del-acc-pass" label="Mevcut Şifreniz" value={password} onChange={setPassword} minLength={1} />
              {error && <p className="message message-error" role="alert" style={{ marginTop: 12 }}>{error}</p>}
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="modal-btn-cancel" disabled={busy} onClick={() => { setIsOpen(false); setPassword(''); setError(''); }}>Vazgeç</button>
                <button type="submit" className="modal-btn-danger" disabled={busy || !password}>{busy ? 'Siliniyor…' : 'Evet, hesabımı sil'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
