import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, Code2, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { PasswordField } from '../components/PasswordField'
import { acceptInvite, handleAuthCallback, updateUser } from '../lib/cloudflareAuth'
import { communityApi } from '../lib/community'

export const Route = createFileRoute('/giris')({ component: LoginPage, head: () => ({ meta: [{ title: 'Panele giriş — Semih Algan' }, { name: 'robots', content: 'noindex' }] }) })

type Step = 'login' | 'code' | 'password' | 'invite' | 'recovery' | 'forgot'

function LoginPage() {
  const [step, setStep] = useState<Step>('login')
  const [founder, setFounder] = useState(false)
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [callbackBusy, setCallbackBusy] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const callbackStarted = useRef(false)

  useEffect(() => {
    if (callbackStarted.current) return
    callbackStarted.current = true
    handleAuthCallback().then(result => {
      if (!result) return
      if (result.type === 'invite' && result.token) { setInviteToken(result.token); setStep('invite') }
      else if (result.type === 'recovery') setStep('recovery')
      else window.location.assign('/panel')
    }).catch(() => setError('Bağlantı geçersiz veya süresi dolmuş. Yeni bir davet ya da şifre sıfırlama bağlantısı iste.')).finally(() => setCallbackBusy(false))
  }, [])

  function changeStep(next: Step) {
    setStep(next)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmation('')
    if (next !== 'password') setCode('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (['password', 'invite', 'recovery'].includes(step) && password !== confirmation) { setError('Şifreler eşleşmiyor.'); return }
    setBusy(true)
    try {
      if (step === 'login') {
        await communityApi('login', { username, password, founder })
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
      } else if (step === 'invite') {
        await acceptInvite(inviteToken, password)
        setInviteToken('')
        window.location.assign('/panel')
      } else if (step === 'recovery') {
        await updateUser({ password })
        window.location.assign('/panel')
      } else {
        await communityApi('recover', { username, founder })
        setNotice('Aktif bir hesap varsa kayıtlı e-posta adresine şifre sıfırlama bağlantısı gönderildi.')
      }
    } catch (caught) {
      setError(caught instanceof Error && !['invite', 'recovery'].includes(step) ? caught.message : 'İşlem tamamlanamadı. Bağlantı süresi dolmuş olabilir; tekrar dene.')
    } finally {
      setBusy(false)
      if (step !== 'code' && step !== 'forgot') { setPassword(''); setConfirmation('') }
    }
  }

  const titles: Record<Step, string> = { login: 'Tekrar merhaba.', code: 'İlk adım, senin kodun.', password: 'Sana özel bir başlangıç.', invite: 'Hoş geldin, kurucu.', recovery: 'Yeni bir şifre.', forgot: 'Kaldığın yerden devam et.' }
  const descriptions: Record<Step, string> = { login: 'Kullanıcı adın ve şifrenle çalışma alanına giriş yap.', code: 'Yöneticinin sana verdiği tek kullanımlık aktivasyon kodunu gir.', password: `${username} hesabın için en az 12 karakterlik güçlü bir şifre oluştur.`, invite: 'Netlify davetini kabul etmek için en az 12 karakterlik bir şifre oluştur.', recovery: 'Hesabın için en az 12 karakterlik yeni bir şifre belirle.', forgot: 'Kullanıcı adını gir. Şifre sıfırlama bağlantısını kayıtlı e-posta adresine gönderelim.' }

  return <div className="account-page"><header className="account-header container"><a className="brand" href="/"><span className="brand-icon"><Code2 size={22} /></span><span>semih<span className="brand-light">algan</span>.</span></a><a className="back-link" href="/"><ArrowLeft size={16} />Ana sayfa</a></header><main className="auth-layout container"><aside className="auth-editorial"><span className="section-eyebrow">SEMİH ALGAN / ÇALIŞMA ALANI</span><h1>İyi fikirlerin<br /><span>buluşma noktası.</span></h1><p>Geliştiriciler, roller ve yeni başlangıçlar.<br />Her şeyin bir araya geldiği kişisel alan.</p><div className="auth-art" aria-hidden="true"><div className="auth-art-frame"><Code2 size={84} strokeWidth={1} /><span>SA / WORKSPACE</span></div><div className="auth-art-label"><span className="status-dot" /> FİKİRDEN KODA</div></div><div className="auth-security"><ShieldCheck size={22} /><span>Şifreler yalnızca güvenli hesap hizmetinde tutulur.<br /><strong>Yönetici dahil kimse şifreni göremez.</strong></span></div></aside><section className="auth-card" aria-labelledby="auth-title"><div className="auth-card-top"><span className="auth-symbol">{step === 'code' ? <KeyRound size={23} /> : <LockKeyhole size={23} />}</span><span className="small-label">{step === 'login' ? 'HESABINA GİRİŞ YAP' : step === 'forgot' ? 'ŞİFRE YENİLEME' : 'HESABINI HAZIRLA'}</span></div><h2 id="auth-title">{titles[step]}</h2><p className="form-description">{descriptions[step]}</p>{['code', 'password'].includes(step) && <div className="activation-steps"><span className={step === 'code' ? 'current' : 'complete'}>{step === 'password' ? <Check size={13} /> : '01'} Kodunu doğrula</span><span className={step === 'password' ? 'current' : ''}>02 Şifreni oluştur</span></div>}<form onSubmit={submit} className="account-form"><fieldset disabled={busy || callbackBusy}>{(step === 'login' || step === 'forgot') && <div className="form-field"><label htmlFor="username">{founder ? 'Yönetici e-posta adresi' : 'Kullanıcı adı'}</label><input id="username" name="username" type={founder ? 'email' : 'text'} value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder={founder ? 'Netlify davetindeki e-posta' : 'Kullanıcı adını yaz'} /></div>}{step === 'code' && <div className="form-field"><label htmlFor="activation-code">Aktivasyon kodu</label><input className="code-field" id="activation-code" name="activation-code" value={code} onChange={event => setCode(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} required minLength={20} maxLength={100} placeholder="Yöneticinin verdiği kod" /></div>}{step !== 'code' && step !== 'forgot' && <PasswordField id="password" label={step === 'login' ? 'Şifre' : 'Yeni şifre'} value={password} onChange={setPassword} autoComplete={step === 'login' ? 'current-password' : 'new-password'} minLength={step === 'login' ? 1 : 12} />}{['password', 'invite', 'recovery'].includes(step) && <><PasswordField id="confirm-password" label="Şifre tekrar" value={confirmation} onChange={setConfirmation} /><p className="field-hint">En az 12 karakter kullan. Kelimeleri, rakamları ve işaretleri birleştir.</p></>}{step === 'login' && <button type="button" className="text-action forgot-link" onClick={() => changeStep('forgot')}>Şifremi unuttum</button>}<div className="form-feedback" aria-live="polite" aria-atomic="true">{error && <p className="message message-error" role="alert">{error}</p>}{notice && <p className="message message-success" role="status">{notice}</p>}</div><button className="button button-primary form-submit" type="submit">{callbackBusy ? 'Güvenli bağlantı kontrol ediliyor…' : busy ? 'İşlem yapılıyor…' : step === 'login' ? 'Giriş yap' : step === 'code' ? 'Kodu doğrula' : step === 'forgot' ? 'Sıfırlama bağlantısı gönder' : step === 'recovery' ? 'Şifreyi güncelle' : 'Şifremi oluştur'}<ArrowRight size={18} /></button></fieldset></form><div className="auth-card-bottom">{step === 'login' ? <><span>Hesabın yok mu?</span><button className="text-action" type="button" disabled={busy || callbackBusy} onClick={() => changeStep('code')}>Kayıt ol <ArrowUpRightIcon /></button></> : <button className="text-action" type="button" disabled={busy || callbackBusy} onClick={() => changeStep('login')}><ArrowLeft size={15} />Girişe dön</button>}</div>{(step === 'login' || step === 'forgot') && <button className="founder-toggle" type="button" disabled={busy || callbackBusy} onClick={() => { setFounder(!founder); setUsername(''); setError(''); setNotice('') }}>{founder ? 'Kullanıcı adıyla giriş yap' : 'Kurucu / admin girişi'}</button>}{founder && (step === 'login' || step === 'forgot') && <p className="setup-note">İlk hesap Netlify üzerinden davet edilir; <strong>admin</strong> veya <strong>founder</strong> yetkisi Netlify yöneticisi tarafından atanır. Pano rolleri yönetim yetkisi vermez.</p>}</section></main><footer className="account-footer container">Kişisel bir alan. Ortak bir merak.<span>Semih Algan © {new Date().getFullYear()}</span></footer></div>
}

function ArrowUpRightIcon() {
  return <ArrowRight size={14} className="diagonal-arrow" />
}
