import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  FileText,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { ApiError, communityApi, developerRoles, accountRoles } from '../lib/community'
import type { Developer, DeveloperRole, Member, Session } from '../lib/community'
import { DeveloperCards, RoleBadge } from './DeveloperBoard'
import { PasswordField } from './PasswordField'
import { MaintenanceManager } from './MaintenanceManager'
import { ModerationManager } from './ModerationManager'
import { PostManager } from './PostManager'
import { formatDate } from '../lib/posts'

type PanelTab = 'overview' | 'developers' | 'members' | 'posts' | 'updates' | 'moderation' | 'maintenance'

type SiteUpdate = {
  id: number
  title: string
  description?: string | null
  createdAt: number
  updatedAt: number
}

export function PanelPage({ adminOnly = false }: { adminOnly?: boolean }) {
  const [session, setSession] = useState<Session | null>(null)
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [tab, setTab] = useState<PanelTab>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)

  async function refresh(currentSession = session) {
    const data = await communityApi<Developer[]>('developers')
    setDevelopers(data)
    if (adminOnly && currentSession?.isAdmin) setMembers(await communityApi<Member[]>('members'))
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const currentSession = await communityApi<Session>('session')
        if (!active) return
        if (adminOnly && !currentSession.isMod) throw new ApiError('Yönetim paneline erişmek için yetki gerekiyor.', 403)
        setSession(currentSession)
        const data = await communityApi<Developer[]>('developers')
        if (active) setDevelopers(data)
        if (adminOnly && currentSession.isAdmin) {
          const accounts = await communityApi<Member[]>('members')
          if (active) setMembers(accounts)
        }
      } catch (caught) {
        if (active) { setError(caught instanceof Error ? caught.message : 'Panel yüklenemedi.'); setStatus(caught instanceof ApiError ? caught.status : 503) }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [adminOnly])

  async function signOut() {
    setLoggingOut(true)
    setError('')
    try {
      await communityApi('logout', {})
      window.location.assign('/giris')
    } catch {
      setError('Çıkış tamamlanamadı. Lütfen tekrar dene.')
      setLoggingOut(false)
    }
  }

  if (loading) return <div className="panel-gate container" aria-busy="true"><span className="brand-icon"><Code2 size={24} /></span><h2>Çalışma alanın hazırlanıyor.</h2><p role="status">Oturum ve erişim yetkileri kontrol ediliyor…</p><div className="panel-loading-bar" /></div>
  if (!session || status === 403) {
    const adminDenied = adminOnly && status === 403
    const signInRequired = status === 401 || status === 403
    return <div className="panel-gate container"><ShieldCheck size={42} /><span className="section-eyebrow">GÜVENLİ ÇALIŞMA ALANI</span><h1>{adminDenied ? 'Bu alan yetkililere özel.' : status === 403 ? 'Hesabın henüz hazır değil.' : status === 401 ? 'Önce bir merhaba.' : 'Panel şu an yüklenemiyor.'}</h1><p role="alert">{error}</p><a className="button button-primary" href={adminDenied ? '/panel' : signInRequired ? '/giris' : getPanelPath(adminOnly)}>{adminDenied ? 'Kullanıcı paneline dön' : signInRequired ? 'Girişe dön' : 'Tekrar dene'}<ArrowUpRight size={18} /></a><a className="back-link" href="/"><ArrowLeft size={15} />Ana sayfa</a></div>
  }

  return (
    <div className="workspace">
      <a className="skip-link" href="#panel-content">İçeriğe geç</a>
      <header className="workspace-header">
        <a className="brand" href="/">
          <span className="brand-icon"><Code2 size={22} /></span>
          <span>semih<span className="brand-light">algan</span>.</span>
        </a>
        <div className="workspace-header-actions">
          <a className="back-link" href="/#pano">Siteyi görüntüle <ArrowUpRight size={15} /></a>
          <button className="logout-button" type="button" disabled={loggingOut} onClick={signOut}>
            <LogOut size={16} />
            <span>{loggingOut ? 'Çıkılıyor…' : 'Çıkış yap'}</span>
          </button>
        </div>
      </header>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <div className="workspace-label"><span className="status-dot" />{adminOnly ? 'YÖNETİM ALANI' : 'KİŞİSEL ALAN'}</div>
          <nav aria-label="Panel menüsü">
            <button
              type="button"
              className={tab === 'overview' ? 'sidebar-link selected' : 'sidebar-link'}
              aria-current={tab === 'overview' ? 'page' : undefined}
              onClick={() => setTab('overview')}
            >
              <LayoutDashboard size={18} />Genel bakış
            </button>
            {adminOnly ? (
              <>
                {session.isAdmin && (
                  <button
                    type="button"
                    className={tab === 'developers' ? 'sidebar-link selected' : 'sidebar-link'}
                    aria-current={tab === 'developers' ? 'page' : undefined}
                    onClick={() => setTab('developers')}
                  >
                    <Code2 size={18} />Geliştiriciler<span>{developers.length}</span>
                  </button>
                )}
                {session.isAdmin && (
                  <button
                    type="button"
                    className={tab === 'members' ? 'sidebar-link selected' : 'sidebar-link'}
                    aria-current={tab === 'members' ? 'page' : undefined}
                    onClick={() => setTab('members')}
                  >
                    <KeyRound size={18} />Kullanıcılar<span>{members.length}</span>
                  </button>
                )}
                {session.isAdmin && (
                  <button
                    type="button"
                    className={tab === 'posts' ? 'sidebar-link selected' : 'sidebar-link'}
                    aria-current={tab === 'posts' ? 'page' : undefined}
                    onClick={() => setTab('posts')}
                  >
                    <FileText size={18} />Yazılar
                  </button>
                )}
                {session.isAdmin && (
                  <button
                    type="button"
                    className={tab === 'updates' ? 'sidebar-link selected' : 'sidebar-link'}
                    aria-current={tab === 'updates' ? 'page' : undefined}
                    onClick={() => setTab('updates')}
                  >
                    <Sparkles size={18} />Güncellemeler
                  </button>
                )}
                <button
                  type="button"
                  className={tab === 'moderation' ? 'sidebar-link selected' : 'sidebar-link'}
                  aria-current={tab === 'moderation' ? 'page' : undefined}
                  onClick={() => setTab('moderation')}
                >
                  <ShieldAlert size={18} />Moderasyon
                </button>
                {session.isAdmin && (
                  <button
                    type="button"
                    className={tab === 'maintenance' ? 'sidebar-link selected' : 'sidebar-link'}
                    aria-current={tab === 'maintenance' ? 'page' : undefined}
                    onClick={() => setTab('maintenance')}
                  >
                    <Wrench size={18} />Bakım modu
                  </button>
                )}
                <a className="sidebar-link" href="/panel"><Users size={18} />Kullanıcı panelim<ArrowUpRight size={14} /></a>
              </>
            ) : (
              session.isMod && <a className="sidebar-link" href="/admin"><ShieldCheck size={18} />Yönetim paneli<ArrowUpRight size={14} /></a>
            )}
          </nav>
          <div className="sidebar-note">
            <LockKeyhole size={19} />
            <p>{adminOnly ? 'Pano rolleri görünüm içindir. Yönetim yetkileri yalnızca sistem yöneticisi tarafından atanır.' : 'Şifren yalnızca sana ait. Bu alanda güvenle güncelleyebilirsin.'}</p>
          </div>
          <div className="sidebar-profile">
            <span className="profile-monogram">{session.profile.username.slice(0, 2).toUpperCase()}</span>
            <div><strong>{session.profile.username}</strong><span>{session.profile.role}</span></div>
          </div>
        </aside>
        <main className="workspace-main" id="panel-content">
          <div className="workspace-heading">
            <div>
              <span className="section-eyebrow">
                {adminOnly ? 'YÖNETİM PANELİ' : 'KULLANICI PANELİ'} / {tab === 'overview' ? 'GENEL BAKIŞ' : tab === 'developers' ? 'GELİŞTİRİCİLER' : tab === 'posts' ? 'YAZILAR' : tab === 'updates' ? 'GÜNCELLEMELER' : tab === 'moderation' ? 'MODERASYON' : tab === 'maintenance' ? 'BAKIM' : 'KULLANICILAR'}
              </span>
              <h1>
                {tab === 'overview' ? 'Çalışma alanına hoş geldin.' : tab === 'developers' ? 'İsimler, roller, bir ekip.' : tab === 'posts' ? 'Fikirlerini yazıya dök.' : tab === 'updates' ? 'Sitedeki yenilikleri duyur.' : tab === 'moderation' ? 'Yorumlar ve yasaklar.' : tab === 'maintenance' ? 'Siteyi tek tuşla bakıma al.' : 'Hesaplar ve yetkiler.'}
              </h1>
            </div>
            <span className="secure-tag"><ShieldCheck size={14} />Güvenli oturum</span>
          </div>

          {error && <p className="message message-error" role="alert">{error}</p>}

          {tab === 'overview' && (
            <>
              <div className="workspace-welcome">
                <div>
                  <span className="small-label">MERHABA, {session.profile.username.toLocaleUpperCase('tr-TR')}</span>
                  <h2>{adminOnly ? (session.isAdmin ? 'Pano senin kontrolünde.' : 'Moderasyon paneline hoş geldin.') : 'Burası senin alanın.'}</h2>
                  <p>{adminOnly ? (session.isAdmin ? 'Geliştirici isimlerini ve rollerini düzenle, yeni hesaplar için tek kullanımlık aktivasyon kodu oluştur.' : 'Topluluğu düzenli tutmak için yorumları ve yasakları yönetebilirsin.') : 'Hesap bilgilerini kontrol et, şifreni güncelle ve geliştirici panosunu keşfet.'}</p>
                  {adminOnly && session.isAdmin && (
                    <button className="button button-primary" type="button" onClick={() => setTab('members')}>
                      Kullanıcı davet et <Plus size={17} />
                    </button>
                  )}
                </div>
                <Code2 className="welcome-code" size={115} strokeWidth={0.8} aria-hidden="true" />
              </div>
              {adminOnly ? (
                session.isAdmin && (
                  <>
                    <div className="stat-grid">
                      <StatCard label="Panodaki geliştiriciler" value={developers.length} icon={<Code2 size={20} />} />
                      <StatCard label="Aktif hesaplar" value={members.filter(member => member.status === 'active').length} icon={<Users size={20} />} />
                      <StatCard label="Aktivasyon bekleyenler" value={members.filter(member => member.status === 'pending').length} icon={<KeyRound size={20} />} />
                    </div>

                    {/* YENİLİK (ADIM 10): ADMİN PANELİ 2FA AYAR KARTI */}
                    <TwoFactorSettings />

                    <div className="panel-section-title">
                      <h2>Geliştirici panosu</h2>
                      <button type="button" className="text-action" onClick={() => setTab('developers')}>Panoyu düzenle <ArrowUpRight size={16} /></button>
                    </div>
                    <DeveloperCards developers={developers} />
                  </>
                )
              ) : (
                <>
                  <div className="profile-grid">
                    <section className="panel-card">
                      <span className="panel-card-icon"><Users size={21} /></span>
                      <h2>Hesap bilgilerim</h2>
                      <p className="card-description">Bu bilgiler yalnızca hesabında ve yönetim panelinde görünür.</p>
                      <dl className="profile-details">
                        <div><dt>Kullanıcı adı</dt><dd>{session.profile.username}</dd></div>
                        <div><dt>E-posta</dt><dd>{session.profile.email}</dd></div>
                        <div><dt>Hesap durumu</dt><dd><span className="account-state active"><Check size={12} />Aktif</span></dd></div>
                        <div><dt>Hesap Rolü</dt><dd>{session.profile.role}</dd></div>
                      </dl>
                    </section>
                    <PasswordSettings />
                  </div>

                  {/* KULLANICI ALANINDA DA ADMİN İSE 2FA GÖRÜNÜR */}
                  {session.isAdmin && <TwoFactorSettings />}
                  
                  <div style={{ marginTop: 22 }}>
                    <DeleteAccountSettings 
                      isFounder={session.profile.role === 'Kurucu'} 
                      onDeleted={() => window.location.assign('/giris')} 
                    />
                  </div>

                  <div className="panel-section-title">
                    <h2>Geliştirici panosu</h2>
                    <a className="text-action" href="/#pano">Sitede görüntüle <ArrowUpRight size={16} /></a>
                  </div>
                  <DeveloperCards developers={developers} />
                </>
              )}
            </>
          )}

          {tab === 'developers' && adminOnly && session.isAdmin && <DeveloperManager developers={developers} refresh={refresh} />}
          {tab === 'members' && adminOnly && session.isAdmin && <MemberManager members={members} refresh={refresh} session={session} />}
          {tab === 'posts' && adminOnly && session.isAdmin && <PostManager />}
          {tab === 'updates' && adminOnly && session.isAdmin && <UpdateManager />}
          {tab === 'moderation' && adminOnly && session.isMod && <ModerationManager members={members} canIpBan={session.isAdmin} />}
          {tab === 'maintenance' && adminOnly && session.isAdmin && <MaintenanceManager />}

          <footer className="workspace-footer">
            Semih Algan / Çalışma alanı
            <span>Özenle geliştirildi.</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function getPanelPath(adminOnly: boolean) {
  return adminOnly ? '/admin' : '/panel'
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <article className="stat-card">
      <div><span>{label}</span>{icon}</div>
      <strong>{String(value).padStart(2, '0')}</strong>
      <span>Güncel kayıtlar</span>
    </article>
  )
}

// YENİLİK (ADIM 10): GOOGLE AUTHENTICATOR (2FA) YÖNETİM BİLEŞENİ
function TwoFactorSettings() {
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

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(''); setNotice('')
    if (password !== confirmation) { setError('Şifreler eşleşmiyor.'); return }
    setBusy(true)
    try {
      await communityApi('change-password', { currentPassword, password })
      setNotice('Şifren güvenle güncellendi.')
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : 'Şifre güncellenemedi. Oturumunu ve bağlantını kontrol et.')
    } finally {
      setBusy(false); setCurrentPassword(''); setPassword(''); setConfirmation('')
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

function DeleteAccountSettings({ isFounder, onDeleted }: { isFounder: boolean; onDeleted: () => void }) {
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

function Feedback({ error, notice }: { error: string; notice?: string }) {
  return (
    <div className="form-feedback" aria-live="polite">
      {error && <p className="message message-error" role="alert">{error}</p>}
      {notice && <p className="message message-success" role="status">{notice}</p>}
    </div>
  )
}

function DeveloperManager({ developers, refresh }: { developers: Developer[]; refresh: () => Promise<void> }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<DeveloperRole>('Developer')
  const [editing, setEditing] = useState<string | undefined>()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function reset() { setName(''); setRole('Developer'); setEditing(undefined) }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      await communityApi('save-developer', { name, role, ...(editing ? { id: editing } : {}) })
      reset()
      setNotice('Geliştirici panosu güncellendi.')
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Kayıt yapılamadı.') }
    finally { setBusy(false) }
  }

  async function remove(id: string) {
    setBusy(true); setError(''); setNotice('')
    try {
      await communityApi('delete-developer', { id })
      if (editing === id) reset()
      setDeleting(null)
      setNotice('Geliştirici panodan kaldırıldı.')
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Silme işlemi yapılamadı.') }
    finally { setBusy(false) }
  }

  return (
    <div className="management-grid">
      <section className="panel-card management-form">
        <span className="panel-card-icon"><Plus size={21} /></span>
        <h2>{editing ? 'Geliştiriciyi düzenle' : 'Panoya bir isim ekle'}</h2>
        <p className="card-description">İsim ve rol herkese açık panoda görünür. Bu seçim hesap yetkisi vermez.</p>
        <form className="account-form" onSubmit={save}>
          <fieldset disabled={busy}>
            <div className="form-field">
              <label htmlFor="developer-name">Ad soyad / görünen isim</label>
              <input id="developer-name" value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={80} placeholder="Geliştiricinin ismi" />
            </div>
            <div className="form-field">
              <label htmlFor="developer-role">Pano rolü</label>
              <select id="developer-role" value={role} onChange={event => setRole(event.target.value as DeveloperRole)}>
                {developerRoles.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
            <Feedback error={error} notice={notice} />
            <button className="button button-primary form-submit" type="submit">
              {busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Geliştirici ekle'}
              <Check size={17} />
            </button>
            {editing && (
              <button className="text-action cancel-edit" type="button" onClick={reset}>
                <X size={15} />Düzenlemeyi iptal et
              </button>
            )}
          </fieldset>
        </form>
      </section>
      <section className="panel-card roster-card">
        <div className="list-heading">
          <h2>Panodaki isimler</h2>
          <span>{developers.length} geliştirici</span>
        </div>
        {!developers.length ? (
          <div className="list-empty">
            <Code2 size={30} />
            <p>Henüz bir isim eklenmedi.</p>
            <span>İlk geliştiriciyi soldaki formdan ekle.</span>
          </div>
        ) : (
          <ul className="developer-list">
            {developers.map(developer => (
              <li key={developer.id}>
                <div>
                  <strong>{developer.name}</strong>
                  <RoleBadge role={developer.role} />
                </div>
                <div className="row-actions">
                  {deleting === developer.id ? (
                    <>
                      <span className="delete-prompt">Kaldırılsın mı?</span>
                      <button className="danger-button" type="button" disabled={busy} onClick={() => remove(developer.id)}>Kaldır</button>
                      <button className="icon-button" type="button" aria-label="Silmeyi iptal et" onClick={() => setDeleting(null)}><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button className="icon-button" type="button" aria-label={`${developer.name} düzenle`} disabled={busy} onClick={() => { setEditing(developer.id); setName(developer.name); setRole(developer.role); setError(''); setNotice('') }}><Pencil size={16} /></button>
                      <button className="icon-button" type="button" aria-label={`${developer.name} panodan kaldır`} disabled={busy} onClick={() => setDeleting(developer.id)}><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

type IssuedCode = { code: string; expiresAt: string; username?: string }

function MemberManager({ members, refresh, session }: { members: Member[]; refresh: () => Promise<void>; session: Session }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [search, setSearch] = useState('')
  const [issued, setIssued] = useState<IssuedCode | null>(null)
  const [reissuing, setReissuing] = useState<string | null>(null)
  const [suspendingMember, setSuspendingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const [page, setPage] = useState(1)
  const pageSize = 10

  const isFounder = session?.profile.role === 'Kurucu'

  useEffect(() => {
    if (!deletingMember) return
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [deletingMember])

  useEffect(() => {
    setPage(1)
  }, [search])

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice(''); setCopyStatus(''); setIssued(null)
    try {
      const result = await communityApi<IssuedCode>('invite', { username, email })
      setIssued(result)
      setUsername(''); setEmail('')
      setNotice('Aktivasyon kodu başarıyla oluşturuldu.')
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Kod oluşturulamadı.') }
    finally { setBusy(false) }
  }

  async function reissue(member: Member) {
    setBusy(true); setError(''); setNotice(''); setCopyStatus(''); setIssued(null)
    try {
      const result = await communityApi<IssuedCode>('reissue', { id: member.id })
      setIssued({ ...result, username: member.username })
      setReissuing(null)
      setNotice(`"${member.username}" için yeni kod oluşturuldu.`)
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Kod yenilenemedi.') }
    finally { setBusy(false) }
  }

  async function changeRole(member: Member, newRole: string) {
    setBusy(true); setError(''); setNotice(''); setCopyStatus('')
    try {
      await communityApi('set-role', { id: member.id, role: newRole })
      setNotice(`"${member.username}" hesabının rolü "${newRole}" olarak güncellendi.`)
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Rol güncellenemedi.') }
    finally { setBusy(false) }
  }

  async function confirmSuspend(member: Member) {
    setBusy(true); setError(''); setNotice(''); setCopyStatus('')
    const nextStatus = member.status === 'suspended' ? 'active' : 'suspended'
    try {
      await communityApi('set-member-status', { id: member.id, status: nextStatus })
      setSuspendingMember(null)
      setNotice(
        nextStatus === 'suspended'
          ? `"${member.username}" hesabı başarıyla askıya alındı. Kullanıcının oturumu kapatıldı ve girişi engellendi.`
          : `"${member.username}" hesabının askısı başarıyla kaldırıldı. Kullanıcı tekrar giriş yapabilir.`
      )
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'İşlem yapılamadı.') }
    finally { setBusy(false) }
  }

  async function deleteAccount(member: Member) {
    setBusy(true); setError(''); setNotice(''); setCopyStatus('')
    try {
      await communityApi('delete-member', { id: member.id })
      setDeletingMember(null)
      setNotice(`"${member.username}" hesabı ve varsa davet kodları başarıyla silindi.`)
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Hesap silinemedi.') }
    finally { setBusy(false) }
  }

  async function copyCode() {
    if (!issued) return
    try { await navigator.clipboard.writeText(issued.code); setCopyStatus('Aktivasyon kodu kopyalandı.') }
    catch { setCopyStatus('Kopyalama yapılamadı. Kodu seçerek kopyalayabilirsin.') }
  }

  const q = search.trim().toLowerCase()
  const filteredMembers = q
    ? members.filter(m => m.username.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    : members

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize))
  const paginatedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <div className="management-grid">
        <section className="panel-card management-form">
          <span className="panel-card-icon"><KeyRound size={21} /></span>
          <h2>Bir hesap davet et</h2>
          <p className="card-description">Kullanıcı adını ve e-postasını sen belirle. Şifresini kullanıcı kendi oluşturur.</p>
          <form className="account-form" onSubmit={invite}>
            <fieldset disabled={busy}>
              <div className="form-field">
                <label htmlFor="invite-username">Kullanıcı adı</label>
                <input id="invite-username" value={username} onChange={event => setUsername(event.target.value.toLowerCase())} autoComplete="off" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9._\-]*" placeholder="ör. geliştirici yerine gelistirici" />
                <span className="field-hint">3–32 karakter. Küçük Latin harfleri, rakam, nokta, tire ve alt çizgi.</span>
              </div>
              <div className="form-field">
                <label htmlFor="invite-email">E-posta adresi</label>
                <input id="invite-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="off" placeholder="Kullanıcının e-posta adresi" />
              </div>
              <Feedback error={error} notice={notice} />
              <button className="button button-primary form-submit" type="submit">
                {busy ? 'İşlem yapılıyor…' : 'Tek kullanımlık kod oluştur'}
                <Plus size={17} />
              </button>
            </fieldset>
          </form>
          <div className="invitation-note">
            <ShieldCheck size={18} />
            <p>Kod 48 saat geçerlidir ve yalnızca bir kez kullanılabilir. Yeni kod oluşturmak eski kodu geçersiz kılar.</p>
          </div>
        </section>

        <section className="panel-card issued-code-card" aria-live="polite">
          {issued ? (
            <>
              <span className="panel-card-icon"><CheckCheck size={23} /></span>
              <span className="small-label">DAVET HAZIR</span>
              <h2>{issued.username}</h2>
              <p className="card-description">Bu kodu kullanıcıya ilet. Kullanıcı giriş sayfasında “Kayıt ol” seçeneğiyle şifresini oluşturur.</p>
              <div className="issued-code">
                <code>{issued.code}</code>
                <button className="icon-button" type="button" aria-label="Aktivasyon kodunu kopyala" onClick={copyCode}>
                  {copyStatus === 'Aktivasyon kodu kopyalandı.' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="field-hint">Son kullanım: {new Date(issued.expiresAt).toLocaleString('tr-TR')}</p>
              <p className="message message-success">Kod yalnızca bu ekranda gösterilir. Daha sonra gerektiğinde yeni kod oluşturabilirsin.</p>
              <p className="copy-feedback" role="status">{copyStatus}</p>
              <button className="text-action" type="button" onClick={() => { setIssued(null); setCopyStatus('') }}>
                <X size={15} />Kodu ekrandan kaldır
              </button>
            </>
          ) : (
            <div className="code-placeholder">
              <KeyRound size={43} strokeWidth={1} />
              <h2>Bir kod, yeni bir başlangıç.</h2>
              <p>Oluşturduğun aktivasyon kodu burada görünür.<br />Şifreyi yalnızca kullanıcı belirler.</p>
              <div className="code-placeholder-lines" aria-hidden="true"><span /><span /><span /><span /></div>
            </div>
          )}
        </section>
      </div>

      <section className="panel-card members-card">
        <div className="list-heading">
          <h2>Kullanıcı hesapları</h2>
          <span>{filteredMembers.length} / {members.length} hesap</span>
        </div>
        <p className="card-description" style={{ marginBottom: 16 }}>E-postalar herkese açık panoda gösterilmez. Aktif hesapların şifrelerine erişilemez.</p>

        {(error || notice) && (
          <div className="form-feedback" aria-live="polite" style={{ marginBottom: 16 }}>
            {error && <p className="message message-error" role="alert">{error}</p>}
            {notice && <p className="message message-success" role="status">{notice}</p>}
          </div>
        )}

        <div className="members-search" style={{ position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kullanıcı adı veya e-posta ile ara…"
            style={{ paddingRight: search ? '36px' : '14px' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="icon-button"
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
              }}
              aria-label="Aramayı temizle"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="members-table-wrap">
          <table className="members-table">
            <caption className="sr-only">Kullanıcı adları, e-posta adresleri, rolleri ve aktivasyon durumları</caption>
            <thead>
              <tr>
                <th scope="col">Kullanıcı adı</th>
                <th scope="col">E-posta</th>
                <th scope="col">Rol</th>
                <th scope="col">Durum</th>
                <th scope="col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {!filteredMembers.length ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', opacity: 0.7 }}>
                    Eşleşen kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map(member => {
                  const isSelf = member.id === session?.profile.id
                  const isTargetAdminOrFounder = member.role === 'Admin' || member.role === 'Kurucu'
                  const cannotChange = busy || isSelf || (!isFounder && isTargetAdminOrFounder)

                  return (
                    <tr key={member.id}>
                      <td><strong>{member.username}</strong></td>
                      <td>{member.email}</td>
                      <td>
                        <select
                          value={member.role}
                          onChange={e => changeRole(member, e.target.value)}
                          disabled={cannotChange}
                          title={isSelf ? 'Kendi rolünüzü değiştiremezsiniz' : cannotChange ? 'Bu rolü değiştirme yetkiniz yok' : undefined}
                          style={{
                            padding: '5px 8px',
                            borderRadius: 6,
                            border: '1px solid var(--line)',
                            background: cannotChange ? '#f0f3e8' : '#fafbf6',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: cannotChange ? 'not-allowed' : 'pointer',
                            color: 'var(--ink)',
                          }}
                        >
                          {accountRoles.map(r => (
                            <option
                              key={r}
                              value={r}
                              disabled={!isFounder && (r === 'Kurucu' || r === 'Admin')}
                            >
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`account-state ${member.status}`}>
                          {member.status === 'active' ? (
                            <><Check size={12} />Aktif</>
                          ) : member.status === 'suspended' ? (
                            <><Ban size={12} />Askıya Alındı</>
                          ) : (
                            <><KeyRound size={12} />Kod bekliyor</>
                          )}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {member.status === 'pending' ? (
                            reissuing === member.id ? (
                              <div className="reissue-confirm">
                                <span>Eski kod geçersiz olacak.</span>
                                <button type="button" className="text-action" disabled={busy} onClick={() => reissue(member)}>Yeni kod oluştur</button>
                                <button type="button" className="icon-button" aria-label="İptal" disabled={busy} onClick={() => setReissuing(null)}><X size={15} /></button>
                              </div>
                            ) : (
                              <>
                                <button type="button" className="text-action" disabled={busy} onClick={() => setReissuing(member.id)}>Kodu yenile <KeyRound size={14} /></button>
                                <button
                                  type="button"
                                  className="icon-button"
                                  title="Bekleyen daveti ve hesabı sil"
                                  aria-label="Bekleyen daveti ve hesabı sil"
                                  disabled={cannotChange}
                                  onClick={() => setDeletingMember(member)}
                                  style={{ color: '#974d34' }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )
                          ) : (
                            <>
                              <button
                                type="button"
                                className="icon-button"
                                title={member.status === 'suspended' ? 'Hesap askısını kaldır' : 'Hesabı askıya al'}
                                aria-label={member.status === 'suspended' ? 'Hesap askısını kaldır' : 'Hesabı askıya al'}
                                disabled={cannotChange}
                                onClick={() => setSuspendingMember(member)}
                                style={{ color: member.status === 'suspended' ? '#5a7d44' : '#974d34' }}
                              >
                                {member.status === 'suspended' ? <UserCheck size={15} /> : <UserX size={15} />}
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                title="Hesabı tamamen sil"
                                aria-label="Hesabı tamamen sil"
                                disabled={cannotChange}
                                onClick={() => setDeletingMember(member)}
                                style={{ color: '#974d34' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: '11px', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: '#7a886b' }}>
              Sayfa <strong>{page}</strong> / <strong>{totalPages}</strong> (Toplam {filteredMembers.length} hesap)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="button button-outline"
                style={{ padding: '6px 14px', fontSize: '11px' }}
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                « Önceki
              </button>
              <button
                type="button"
                className="button button-outline"
                style={{ padding: '6px 14px', fontSize: '11px' }}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Sonraki »
              </button>
            </div>
          </div>
        )}
      </section>

      {suspendingMember && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-suspend-title">
          <div className="modal-content">
            <h3 id="modal-suspend-title">
              {suspendingMember.status === 'suspended' ? 'Hesap Askısı Kaldırılsın mı?' : 'Hesap Askıya Alınsın mı?'}
            </h3>
            <p>
              {suspendingMember.status === 'suspended' ? (
                <>Kullanıcı adı <strong>{suspendingMember.username}</strong> olan hesabın askısını kaldırmak istediğinize emin misiniz? Kullanıcı siteye tekrar sorunsuz giriş yapabilecektir.</>
              ) : (
                <>Kullanıcı adı <strong>{suspendingMember.username}</strong> olan hesabı askıya almak istediğinize emin misiniz? Kullanıcının tüm açık oturumları anında sonlandırılacak ve siteye girişi engellenecektir.</>
              )}
            </p>
            <div className="modal-actions">
              <button type="button" className="modal-btn-cancel" disabled={busy} onClick={() => setSuspendingMember(null)}>Vazgeç</button>
              <button
                type="button"
                className={suspendingMember.status === 'suspended' ? 'button button-primary' : 'modal-btn-danger'}
                style={{ padding: '10px 16px', fontSize: '12px' }}
                disabled={busy}
                onClick={() => confirmSuspend(suspendingMember)}
              >
                {busy ? 'İşleniyor…' : suspendingMember.status === 'suspended' ? 'Evet, askıyı kaldır' : 'Evet, hesabı askıya al'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingMember && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-del-title">
          <div className="modal-content">
            <h3 id="modal-del-title">Hesap Silinsin mi?</h3>
            <p>
              Kullanıcı adı <strong>{deletingMember.username}</strong> olan {deletingMember.status === 'pending' ? 'bekleyen daveti ve hesabı' : 'kullanıcıyı'} silmek istiyor musun? Bu işlem geri alınamaz; kullanıcıya ait tüm oturumlar, varsa yorumlar, beğeniler ve davet kodları kalıcı olarak silinecektir.
            </p>
            <div className="modal-actions">
              <button type="button" className="modal-btn-cancel" disabled={busy} onClick={() => setDeletingMember(null)}>Vazgeç</button>
              <button
                type="button"
                className="modal-btn-danger"
                disabled={countdown > 0 || busy}
                onClick={() => deleteAccount(deletingMember)}
              >
                {busy ? 'Siliniyor…' : countdown > 0 ? `Evet, sil (${countdown})` : 'Evet, sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function UpdateManager() {
  const [updates, setUpdates] = useState<SiteUpdate[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function load() {
    try {
      setUpdates(await communityApi<SiteUpdate[]>('updates'))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Güncellemeler yüklenemedi.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function reset() {
    setEditing(null)
    setTitle('')
    setDescription('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await communityApi('save-update', {
        id: editing ?? undefined,
        title,
        description: description.trim() || null,
      })
      setNotice(editing ? 'Güncelleme kaydı düzenlendi.' : 'Yeni güncelleme yayınlandı.')
      reset()
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Güncelleme kaydedilemedi.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(item: SiteUpdate) {
    setDeleting(null)
    setEditing(item.id)
    setTitle(item.title)
    setDescription(item.description ?? '')
    setError('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id: number) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await communityApi('delete-update', { id })
      if (editing === id) reset()
      setDeleting(null)
      setNotice('Güncelleme kaydı silindi.')
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Silme işlemi yapılamadı.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="management-grid">
      <section className="panel-card management-form">
        <span className="panel-card-icon">
          <Sparkles size={21} />
        </span>
        <h2>{editing ? `Güncelleme #${editing} Düzenle` : 'Yeni Güncelleme Ekle'}</h2>
        <p className="card-description">
          Sitede yapılan yenilikleri, düzeltmeleri veya duyuruları ziyaretçilerle paylaş.
        </p>
        <form className="account-form" onSubmit={save}>
          <fieldset disabled={busy}>
            <div className="form-field">
              <label htmlFor="update-title">Güncelleme Konusu / Başlık *</label>
              <input
                id="update-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                minLength={2}
                maxLength={150}
                placeholder="Örn: Yorum düzenleme özelliği & hata düzeltmeleri"
              />
            </div>
            <div className="form-field">
              <label htmlFor="update-desc">Detaylı Açıklama (İsteğe bağlı)</label>
              <textarea
                id="update-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Güncellemenin detayları, eklenen yeni özellikler veya notlar…"
                style={{ width: '100%', borderRadius: 12, padding: 12, font: 'inherit' }}
              />
              <span className="field-hint">
                Ziyaretçiler güncelleme sayfasına girdiğinde bu açıklamayı tıklandığında açılır-kapanır şekilde görebilir.
              </span>
            </div>
            <div className="form-feedback" aria-live="polite">
              {error && <p className="message message-error" role="alert">{error}</p>}
              {notice && <p className="message message-success" role="status">{notice}</p>}
            </div>
            <button className="button button-primary form-submit" type="submit">
              {busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Güncellemeyi Yayınla'}
              <Check size={17} />
            </button>
            {editing && (
              <button className="text-action cancel-edit" type="button" onClick={reset}>
                <X size={15} />
                Düzenlemeyi iptal et
              </button>
            )}
          </fieldset>
        </form>
      </section>

      <section className="panel-card roster-card">
        <div className="list-heading">
          <h2>Yayınlanan Güncellemeler</h2>
          <span>{updates.length} güncelleme</span>
        </div>
        {!updates.length ? (
          <div className="list-empty">
            <Sparkles size={30} />
            <p>Henüz bir güncelleme eklenmedi.</p>
            <span>İlk yeniliği soldaki formdan yayınlayabilirsin.</span>
          </div>
        ) : (
          <ul className="developer-list">
            {updates.map(item => (
              <li key={item.id} style={{ display: 'block', paddingBlock: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#255b43',
                        color: '#d5ee91',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      ID #{item.id}
                    </span>
                    <strong style={{ margin: 0, fontSize: '0.95rem' }}>{item.title}</strong>
                  </div>
                  <div className="row-actions">
                    {deleting === item.id ? (
                      <>
                        <span className="delete-prompt">Silinsin mi?</span>
                        <button className="danger-button" type="button" disabled={busy} onClick={() => remove(item.id)}>
                          Sil
                        </button>
                        <button className="icon-button" type="button" aria-label="İptal" onClick={() => setDeleting(null)}>
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="icon-button"
                          type="button"
                          title="Düzenle"
                          disabled={busy}
                          onClick={() => startEdit(item)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button"
                          type="button"
                          title="Sil"
                          disabled={busy}
                          onClick={() => setDeleting(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <small style={{ opacity: 0.65 }}>Tarih: {formatDate(item.createdAt)}</small>
                  {item.description && (
                    <button
                      type="button"
                      className="text-action"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      {expandedId === item.id ? (
                        <>Detayı gizle <ChevronUp size={13} /></>
                      ) : (
                        <>Detayı gör <ChevronDown size={13} /></>
                      )}
                    </button>
                  )}
                </div>

                {expandedId === item.id && item.description && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 12,
                      background: '#f4f6ee',
                      borderRadius: 8,
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      border: '1px solid #dbe4cd',
                    }}
                  >
                    {item.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
            }
