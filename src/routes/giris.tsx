import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, CodeXml, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { communityApi } from '../lib/community'

export const Route = createFileRoute('/giris')({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: 'Panele giriş — Semih Algan' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
})

// YENİLİK: '2fa' adımı eklendi
type AuthStep = 'login' | 'code' | 'password' | 'recovery' | 'forgot' | '2fa'

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = 'new-password',
  minLength = 12,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  minLength?: number
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          maxLength={128}
        />
        <button
          type="button"
          aria-label={visible ? `${label} gizle` : `${label} göster`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  )
}

function ArrowUpRightIcon() {
  return <ArrowRight size={14} className="diagonal-arrow" />
}

function LoginPage() {
  const [step, setStep] = useState<AuthStep>('login')
  const [founder, setFounder] = useState(false)
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [callbackBusy, setCallbackBusy] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptKvkk, setAcceptKvkk] = useState(false)
  const callbackStarted = useRef(false)

  useEffect(() => {
    if (callbackStarted.current) return
    callbackStarted.current = true
    const token = new URLSearchParams(window.location.search).get('reset')
    if (token) {
      setResetToken(token)
      setStep('recovery')
    }
    setCallbackBusy(false)
  }, [])

  function changeStep(next: AuthStep) {
    setStep(next)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmation('')
    setTwoFactorCode('')
    if (next !== 'password') setCode('')
    if (next !== 'code' && next !== 'password') {
      setAcceptTerms(false)
      setAcceptKvkk(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (['password', 'recovery'].includes(step) && password !== confirmation) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (['code', 'password'].includes(step) && !(acceptTerms && acceptKvkk)) {
      setError('Devam etmek için Üyelik Sözleşmesi’ni ve KVKK Aydınlatma Metni’ni onaylaman gerekiyor.')
      return
    }
    setBusy(true)
    try {
      if (step === 'login') {
        const res = await communityApi<{ ok?: boolean; requires2FA?: boolean }>('login', { username, password, founder })
        // YENİLİK: Yönetici hesabında 2FA aktifse 6 haneli kod ekranına geç
        if (res.requires2FA) {
          setStep('2fa')
          setNotice('Yönetici hesabınız için Google Authenticator güvenlik kodu gerekiyor.')
          return
        }
        window.location.assign('/panel')
      } else if (step === '2fa') {
        // 2FA KODUNU ŞİFRE VE KULLANICI ADIYLA BİRLİKTE DOĞRULUYORUZ
        await communityApi('login', { username, password, founder, twoFactorCode })
        window.location.assign('/panel')
      } else if (step === 'code') {
        const result = await communityApi<{ username: string }>('check-code', { code })
        setUsername(result.username)
        setStep('password')
      } else if (step === 'password') {
        const result = await communityApi<{ username: string }>('activate', { code, password })
        setUsername(result.username)
        setFounder(false)
        changeStep('login')
        setNotice('Hesabın aktive edildi. Kullanıcı adın ve yeni şifrenle giriş yapabilirsin.')
      } else if (step === 'recovery') {
        await communityApi('reset-password', { token: resetToken, password })
        setResetToken('')
        window.history.replaceState(null, '', '/giris')
        changeStep('login')
        setNotice('Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.')
      } else {
        await communityApi('recover', { username, founder })
        setNotice('Aktif bir hesap varsa kayıtlı e-posta adresine şifre sıfırlama bağlantısı gönderildi.')
      }
    } catch (caught) {
      setError(
        caught instanceof Error && step !== 'recovery'
          ? caught.message
          : 'İşlem tamamlanamadı. Bağlantı süresi dolmuş olabilir; tekrar dene.',
      )
    } finally {
      setBusy(false)
      // 2FA aşamasındayken şifreyi silmiyoruz ki 2FA kodunu gönderirken şifre kaybolmasın
      if (step === 'password' || step === 'recovery') {
        setPassword('')
        setConfirmation('')
      }
    }
  }

  const titles: Record<AuthStep, string> = {
    login: 'Tekrar merhaba.',
    code: 'İlk adım, senin kodun.',
    password: 'Sana özel bir başlangıç.',
    recovery: 'Yeni bir şifre.',
    forgot: 'Kaldığın yerden devam et.',
    '2fa': 'İki Adımlı Doğrulama',
  }

  const descriptions: Record<AuthStep, string> = {
    login: 'Kullanıcı adın ve şifrenle çalışma alanına giriş yap.',
    code: 'Yöneticinin sana verdiği tek kullanımlık aktivasyon kodunu gir.',
    password: `${username} hesabın için en az 12 karakterlik güçlü bir şifre oluştur.`,
    recovery: 'Hesabın için en az 12 karakterlik yeni bir şifre belirle.',
    forgot: 'Kullanıcı adını gir. Şifre sıfırlama bağlantısını kayıtlı e-posta adresine gönderelim.',
    '2fa': 'Google Authenticator uygulamasındaki 6 haneli geçici güvenlik kodunu girin.',
  }

  return (
    <div className="account-page">
      <header className="account-header container">
        <a className="brand" href="/">
          <span className="brand-icon">
            <CodeXml size={22} />
          </span>
          <span>
            semih<span className="brand-light">algan</span>.
          </span>
        </a>
        <a className="back-link" href="/">
          <ArrowLeft size={16} />
          Ana sayfa
        </a>
      </header>

      <main className="auth-layout container">
        <aside className="auth-editorial">
          <span className="section-eyebrow">SEMİH ALGAN / ÇALIŞMA ALANI</span>
          <h1>
            İyi fikirlerin<br />
            <span>buluşma noktası.</span>
          </h1>
          <p>
            Geliştiriciler, roller ve yeni başlangıçlar.<br />
            Her şeyin bir araya geldiği kişisel alan.
          </p>
          <div className="auth-art" aria-hidden="true">
            <div className="auth-art-frame">
              <CodeXml size={84} strokeWidth={1} />
              <span>SA / WORKSPACE</span>
            </div>
            <div className="auth-art-label">
              <span className="status-dot" /> FİKİRDEN KODA
            </div>
          </div>
          <div className="auth-security">
            <ShieldCheck size={22} />
            <span>
              Şifreler yalnızca güvenli hesap hizmetinde tutulur.<br />
              <strong>Yönetici dahil kimse şifreni göremez.</strong>
            </span>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card-top">
            <span className="auth-symbol">
              {step === 'code' ? <KeyRound size={23} /> : step === '2fa' ? <ShieldCheck size={23} /> : <LockKeyhole size={23} />}
            </span>
            <span className="small-label">
              {step === 'login' ? 'HESABINA GİRİŞ YAP' : step === 'forgot' ? 'ŞİFRE YENİLEME' : step === '2fa' ? 'GÜVENLİK DOĞRULAMASI' : 'HESABINI HAZIRLA'}
            </span>
          </div>
          <h2 id="auth-title">{titles[step]}</h2>
          <p className="form-description">{descriptions[step]}</p>

          {['code', 'password'].includes(step) && (
            <div className="activation-steps">
              <span className={step === 'code' ? 'current' : 'complete'}>
                {step === 'password' ? <Check size={13} /> : '01'} Kodunu doğrula
              </span>
              <span className={step === 'password' ? 'current' : ''}>02 Şifreni oluştur</span>
            </div>
          )}

          <form onSubmit={submit} className="account-form">
            <fieldset disabled={busy || callbackBusy}>
              {(step === 'login' || step === 'forgot') && (
                <div className="form-field">
                  <label htmlFor="username">{founder ? 'Yönetici e-posta adresi' : 'Kullanıcı adı'}</label>
                  <input
                    id="username"
                    name="username"
                    type={founder ? 'email' : 'text'}
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={254}
                    placeholder={founder ? 'Yönetici e-posta adresi' : 'Kullanıcı adını yaz'}
                  />
                </div>
              )}

              {step === 'code' && (
                <div className="form-field">
                  <label htmlFor="activation-code">Aktivasyon kodu</label>
                  <input
                    className="code-field"
                    id="activation-code"
                    name="activation-code"
                    value={code}
                    onChange={event => setCode(event.target.value)}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    minLength={16}
                    maxLength={32}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                  />
                </div>
              )}

              {/* YENİLİK: 2FA 6 HANELİ DOĞRULAMA KODU KUTUSU */}
              {step === '2fa' && (
                <div className="form-field">
                  <label htmlFor="twoFactorCode">6 Haneli Güvenlik Kodu</label>
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={twoFactorCode}
                    onChange={event => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="123456"
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 700 }}
                  />
                  <span className="field-hint">Authenticator uygulamasındaki anlık 6 haneli kodu yazın.</span>
                </div>
              )}

              {step !== 'code' && step !== 'forgot' && step !== '2fa' && (
                <PasswordField
                  id="password"
                  label={step === 'login' ? 'Şifre' : 'Yeni şifre'}
                  value={password}
                  onChange={setPassword}
                  autoComplete={step === 'login' ? 'current-password' : 'new-password'}
                  minLength={step === 'login' ? 1 : 12}
                />
              )}

              {['password', 'recovery'].includes(step) && (
                <>
                  <PasswordField
                    id="confirm-password"
                    label="Şifre tekrar"
                    value={confirmation}
                    onChange={setConfirmation}
                  />
                  <p className="field-hint">En az 12 karakter kullan. Kelimeleri, rakamları ve işaretleri birleştir.</p>
                </>
              )}

              {step === 'login' && (
                <button type="button" className="text-action forgot-link" onClick={() => changeStep('forgot')}>
                  Şifremi unuttum
                </button>
              )}

              {['code', 'password'].includes(step) && (
                <div className="consent-box" style={{ display: 'grid', gap: 12, margin: '6px 0 4px' }}>
                  <label
                    htmlFor="accept-terms"
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      lineHeight: 1.5,
                      fontSize: '.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      id="accept-terms"
                      name="accept-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={event => setAcceptTerms(event.target.checked)}
                      required
                      style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }}
                    />
                    <span>
                      <a href="/uyelik-sozlesmesi" target="_blank" rel="noopener noreferrer">
                        Üyelik Sözleşmesi
                      </a>{' '}
                      ve{' '}
                      <a href="/kullanim-kosullari" target="_blank" rel="noopener noreferrer">
                        Kullanım Koşulları
                      </a>
                      ’nı okudum, kabul ediyorum.
                    </span>
                  </label>
                  <label
                    htmlFor="accept-kvkk"
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      lineHeight: 1.5,
                      fontSize: '.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      id="accept-kvkk"
                      name="accept-kvkk"
                      type="checkbox"
                      checked={acceptKvkk}
                      onChange={event => setAcceptKvkk(event.target.checked)}
                      required
                      style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }}
                    />
                    <span>
                      <a href="/kvkk" target="_blank" rel="noopener noreferrer">
                        KVKK Aydınlatma Metni
                      </a>
                      ’ni ve{' '}
                      <a href="/gizlilik" target="_blank" rel="noopener noreferrer">
                        Gizlilik ve Çerez Politikası
                      </a>
                      ’nı okudum, anladım.
                    </span>
                  </label>
                </div>
              )}

              <div className="form-feedback" aria-live="polite" aria-atomic="true">
                {error && <p className="message message-error" role="alert">{error}</p>}
                {notice && <p className="message message-success" role="status">{notice}</p>}
              </div>

              <button className="button button-primary form-submit" type="submit">
                {callbackBusy
                  ? 'Güvenli bağlantı kontrol ediliyor…'
                  : busy
                    ? 'İşlem yapılıyor…'
                    : step === 'login'
                      ? 'Giriş yap'
                      : step === '2fa'
                        ? 'Doğrula ve Giriş Yap'
                        : step === 'code'
                          ? 'Kodu doğrula'
                          : step === 'forgot'
                            ? 'Sıfırlama bağlantısı gönder'
                            : step === 'recovery'
                              ? 'Şifreyi güncelle'
                              : 'Şifremi oluştur'}
                <ArrowRight size={18} />
              </button>
            </fieldset>
          </form>

          <div className="auth-card-bottom">
            {step === 'login' ? (
              <>
                <span>Hesabın yok mu?</span>
                <button
                  className="text-action"
                  type="button"
                  disabled={busy || callbackBusy}
                  onClick={() => changeStep('code')}
                >
                  Kayıt ol <ArrowUpRightIcon />
                </button>
              </>
            ) : (
              <button
                className="text-action"
                type="button"
                disabled={busy || callbackBusy}
                onClick={() => changeStep('login')}
              >
                <ArrowLeft size={15} />
                Girişe dön
              </button>
            )}
          </div>

          {(step === 'login' || step === 'forgot') && (
            <button
              className="founder-toggle"
              type="button"
              disabled={busy || callbackBusy}
              onClick={() => {
                setFounder(!founder)
                setUsername('')
                setError('')
                setNotice('')
              }}
            >
              {founder ? 'Kullanıcı adıyla giriş yap' : 'Kurucu / admin girişi'}
            </button>
          )}

          {founder && (step === 'login' || step === 'forgot') && (
            <p className="setup-note">
              Yönetici hesabı veritabanında tanımlıdır. Pano rolleri yönetim yetkisi vermez.
            </p>
          )}
        </section>
      </main>

      <footer className="account-footer container">
        Kişisel bir alan. Ortak bir merak.
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
          <a href="/kvkk">KVKK</a>
          <a href="/gizlilik">Gizlilik ve Çerezler</a>
          <a href="/kullanim-kosullari">Kullanım Koşulları</a>
          <a href="/uyelik-sozlesmesi">Üyelik Sözleşmesi</a>
          <span>Semih Algan © {new Date().getFullYear()}</span>
        </span>
      </footer>
    </div>
  )
}
