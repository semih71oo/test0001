import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowUpRight, Check, CheckCheck, Code2, Copy, KeyRound, LayoutDashboard, LockKeyhole, LogOut, Pencil, Plus, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import { hydrateSession, logout, updateUser } from '../lib/cloudflareAuth'
import { ApiError, communityApi, developerRoles } from '../lib/community'
import type { Developer, DeveloperRole, Member, Session } from '../lib/community'
import { DeveloperCards, RoleBadge } from './DeveloperBoard'
import { PasswordField } from './PasswordField'

type PanelTab = 'overview' | 'developers' | 'members'

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
        await hydrateSession()
        const currentSession = await communityApi<Session>('session')
        if (!active) return
        if (adminOnly && !currentSession.isAdmin) throw new ApiError('Admin paneline erişmek için yönetici yetkisi gerekiyor.', 403)
        setSession(currentSession)
        const data = await communityApi<Developer[]>('developers')
        if (active) setDevelopers(data)
        if (adminOnly) {
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
      await logout().catch(() => undefined)
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
    return <div className="panel-gate container"><ShieldCheck size={42} /><span className="section-eyebrow">GÜVENLİ ÇALIŞMA ALANI</span><h1>{adminDenied ? 'Bu alan yöneticilere özel.' : status === 403 ? 'Hesabın henüz hazır değil.' : status === 401 ? 'Önce bir merhaba.' : 'Panel şu an yüklenemiyor.'}</h1><p role="alert">{error}</p><a className="button button-primary" href={adminDenied ? '/panel' : signInRequired ? '/giris' : getPanelPath(adminOnly)}>{adminDenied ? 'Kullanıcı paneline dön' : signInRequired ? 'Girişe dön' : 'Tekrar dene'}<ArrowUpRight size={18} /></a><a className="back-link" href="/"><ArrowLeft size={15} />Ana sayfa</a></div>
  }

  return <div className="workspace"><a className="skip-link" href="#panel-content">İçeriğe geç</a><header className="workspace-header"><a className="brand" href="/"><span className="brand-icon"><Code2 size={22} /></span><span>semih<span className="brand-light">algan</span>.</span></a><div className="workspace-header-actions"><a className="back-link" href="/#pano">Siteyi görüntüle <ArrowUpRight size={15} /></a><button className="logout-button" type="button" disabled={loggingOut} onClick={signOut}><LogOut size={16} /><span>{loggingOut ? 'Çıkılıyor…' : 'Çıkış yap'}</span></button></div></header><div className="workspace-layout"><aside className="workspace-sidebar"><div className="workspace-label"><span className="status-dot" />{adminOnly ? 'YÖNETİM ALANI' : 'KİŞİSEL ALAN'}</div><nav aria-label="Panel menüsü"><button type="button" className={tab === 'overview' ? 'sidebar-link selected' : 'sidebar-link'} aria-current={tab === 'overview' ? 'page' : undefined} onClick={() => setTab('overview')}><LayoutDashboard size={18} />Genel bakış</button>{adminOnly ? <><button type="button" className={tab === 'developers' ? 'sidebar-link selected' : 'sidebar-link'} aria-current={tab === 'developers' ? 'page' : undefined} onClick={() => setTab('developers')}><Code2 size={18} />Geliştiriciler<span>{developers.length}</span></button><button type="button" className={tab === 'members' ? 'sidebar-link selected' : 'sidebar-link'} aria-current={tab === 'members' ? 'page' : undefined} onClick={() => setTab('members')}><KeyRound size={18} />Kullanıcılar<span>{members.length}</span></button><a className="sidebar-link" href="/panel"><Users size={18} />Kullanıcı panelim<ArrowUpRight size={14} /></a></> : session.isAdmin && <a className="sidebar-link" href="/admin"><ShieldCheck size={18} />Admin paneli<ArrowUpRight size={14} /></a>}</nav><div className="sidebar-note"><LockKeyhole size={19} /><p>{adminOnly ? 'Pano rolleri görünüm içindir. Yönetim yetkileri yalnızca Netlify üzerinden atanır.' : 'Şifren yalnızca sana ait. Bu alanda güvenle güncelleyebilirsin.'}</p></div><div className="sidebar-profile"><span className="profile-monogram">{session.profile.username.slice(0, 2).toUpperCase()}</span><div><strong>{session.profile.username}</strong><span>{session.isAdmin ? 'Yönetici hesabı' : 'Kullanıcı hesabı'}</span></div></div></aside><main className="workspace-main" id="panel-content"><div className="workspace-heading"><div><span className="section-eyebrow">{adminOnly ? 'YÖNETİCİ PANELİ' : 'KULLANICI PANELİ'} / {tab === 'overview' ? 'GENEL BAKIŞ' : tab === 'developers' ? 'GELİŞTİRİCİLER' : 'KULLANICILAR'}</span><h1>{tab === 'overview' ? 'Çalışma alanına hoş geldin.' : tab === 'developers' ? 'İsimler, roller, bir ekip.' : 'Her başlangıca özel bir kod.'}</h1></div><span className="secure-tag"><ShieldCheck size={14} />Güvenli oturum</span></div>{error && <p className="message message-error" role="alert">{error}</p>}{tab === 'overview' && <><div className="workspace-welcome"><div><span className="small-label">MERHABA, {session.profile.username.toLocaleUpperCase('tr-TR')}</span><h2>{adminOnly ? 'Pano senin kontrolünde.' : 'Burası senin alanın.'}</h2><p>{adminOnly ? 'Geliştirici isimlerini ve rollerini düzenle, yeni hesaplar için tek kullanımlık aktivasyon kodu oluştur.' : 'Hesap bilgilerini kontrol et, şifreni güncelle ve geliştirici panosunu keşfet.'}</p>{adminOnly && <button className="button button-primary" type="button" onClick={() => setTab('members')}>Kullanıcı davet et <Plus size={17} /></button>}</div><Code2 className="welcome-code" size={115} strokeWidth={.8} aria-hidden="true" /></div>{adminOnly ? <><div className="stat-grid"><StatCard label="Panodaki geliştiriciler" value={developers.length} icon={<Code2 size={20} />} /><StatCard label="Aktif hesaplar" value={members.filter(member => member.status === 'active').length} icon={<Users size={20} />} /><StatCard label="Aktivasyon bekleyenler" value={members.filter(member => member.status === 'pending').length} icon={<KeyRound size={20} />} /></div><div className="panel-section-title"><h2>Geliştirici panosu</h2><button type="button" className="text-action" onClick={() => setTab('developers')}>Panoyu düzenle <ArrowUpRight size={16} /></button></div><DeveloperCards developers={developers} /></> : <><div className="profile-grid"><section className="panel-card"><span className="panel-card-icon"><Users size={21} /></span><h2>Hesap bilgilerim</h2><p className="card-description">Bu bilgiler yalnızca hesabında ve yönetici panelinde görünür.</p><dl className="profile-details"><div><dt>Kullanıcı adı</dt><dd>{session.profile.username}</dd></div><div><dt>E-posta</dt><dd>{session.profile.email}</dd></div><div><dt>Hesap durumu</dt><dd><span className="account-state active"><Check size={12} />Aktif</span></dd></div></dl></section><PasswordSettings /></div><div className="panel-section-title"><h2>Geliştirici panosu</h2><a className="text-action" href="/#pano">Sitede görüntüle <ArrowUpRight size={16} /></a></div><DeveloperCards developers={developers} /></>}</>}{tab === 'developers' && adminOnly && <DeveloperManager developers={developers} refresh={refresh} />}{tab === 'members' && adminOnly && <MemberManager members={members} refresh={refresh} />}<footer className="workspace-footer">Semih Algan / Çalışma alanı<span>Özenle geliştirildi.</span></footer></main></div></div>
}

function getPanelPath(adminOnly: boolean) {
  return adminOnly ? '/admin' : '/panel'
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <article className="stat-card"><div><span>{label}</span>{icon}</div><strong>{String(value).padStart(2, '0')}</strong><span>Güncel kayıtlar</span></article>
}

function PasswordSettings() {
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
      await hydrateSession()
      await updateUser({ password })
      setNotice('Şifren güvenle güncellendi.')
    } catch {
      setError('Şifre güncellenemedi. Oturumunu ve bağlantını kontrol et.')
    } finally {
      setBusy(false); setPassword(''); setConfirmation('')
    }
  }
  return <section className="panel-card"><span className="panel-card-icon"><LockKeyhole size={21} /></span><h2>Şifremi güncelle</h2><p className="card-description">En az 12 karakterlik güçlü bir şifre kullan.</p><form className="account-form compact-form" onSubmit={submit}><fieldset disabled={busy}><PasswordField id="panel-password" label="Yeni şifre" value={password} onChange={setPassword} /><PasswordField id="panel-password-confirm" label="Şifre tekrar" value={confirmation} onChange={setConfirmation} /><Feedback error={error} notice={notice} /><button className="button button-primary" type="submit">{busy ? 'Güncelleniyor…' : 'Şifreyi güncelle'}<ArrowUpRight size={16} /></button></fieldset></form></section>
}

function Feedback({ error, notice }: { error: string; notice?: string }) {
  return <div className="form-feedback" aria-live="polite">{error && <p className="message message-error" role="alert">{error}</p>}{notice && <p className="message message-success" role="status">{notice}</p>}</div>
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

  return <div className="management-grid"><section className="panel-card management-form"><span className="panel-card-icon"><Plus size={21} /></span><h2>{editing ? 'Geliştiriciyi düzenle' : 'Panoya bir isim ekle'}</h2><p className="card-description">İsim ve rol herkese açık panoda görünür. Bu seçim hesap yetkisi vermez.</p><form className="account-form" onSubmit={save}><fieldset disabled={busy}><div className="form-field"><label htmlFor="developer-name">Ad soyad / görünen isim</label><input id="developer-name" value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={80} placeholder="Geliştiricinin ismi" /></div><div className="form-field"><label htmlFor="developer-role">Pano rolü</label><select id="developer-role" value={role} onChange={event => setRole(event.target.value as DeveloperRole)}>{developerRoles.map(item => <option key={item}>{item}</option>)}</select></div><Feedback error={error} notice={notice} /><button className="button button-primary form-submit" type="submit">{busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Geliştirici ekle'}<Check size={17} /></button>{editing && <button className="text-action cancel-edit" type="button" onClick={reset}><X size={15} />Düzenlemeyi iptal et</button>}</fieldset></form></section><section className="panel-card roster-card"><div className="list-heading"><h2>Panodaki isimler</h2><span>{developers.length} geliştirici</span></div>{!developers.length ? <div className="list-empty"><Code2 size={30} /><p>Henüz bir isim eklenmedi.</p><span>İlk geliştiriciyi soldaki formdan ekle.</span></div> : <ul className="developer-list">{developers.map(developer => <li key={developer.id}><div><strong>{developer.name}</strong><RoleBadge role={developer.role} /></div><div className="row-actions">{deleting === developer.id ? <><span className="delete-prompt">Kaldırılsın mı?</span><button className="danger-button" type="button" disabled={busy} onClick={() => remove(developer.id)}>Kaldır</button><button className="icon-button" type="button" aria-label="Silmeyi iptal et" onClick={() => setDeleting(null)}><X size={16} /></button></> : <><button className="icon-button" type="button" aria-label={`${developer.name} düzenle`} disabled={busy} onClick={() => { setEditing(developer.id); setName(developer.name); setRole(developer.role); setError(''); setNotice('') }}><Pencil size={16} /></button><button className="icon-button" type="button" aria-label={`${developer.name} panodan kaldır`} disabled={busy} onClick={() => setDeleting(developer.id)}><Trash2 size={16} /></button></>}</div></li>)}</ul>}</section></div>
}

type IssuedCode = { code: string; expiresAt: string; username?: string }

function MemberManager({ members, refresh }: { members: Member[]; refresh: () => Promise<void> }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [issued, setIssued] = useState<IssuedCode | null>(null)
  const [reissuing, setReissuing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setCopyStatus(''); setIssued(null)
    try {
      const result = await communityApi<IssuedCode>('invite', { username, email })
      setIssued(result)
      setUsername(''); setEmail('')
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Kod oluşturulamadı.') }
    finally { setBusy(false) }
  }

  async function reissue(member: Member) {
    setBusy(true); setError(''); setCopyStatus(''); setIssued(null)
    try {
      const result = await communityApi<IssuedCode>('reissue', { id: member.id })
      setIssued({ ...result, username: member.username })
      setReissuing(null)
      await refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Kod yenilenemedi.') }
    finally { setBusy(false) }
  }

  async function copyCode() {
    if (!issued) return
    try { await navigator.clipboard.writeText(issued.code); setCopyStatus('Aktivasyon kodu kopyalandı.') }
    catch { setCopyStatus('Kopyalama yapılamadı. Kodu seçerek kopyalayabilirsin.') }
  }

  return <><div className="management-grid"><section className="panel-card management-form"><span className="panel-card-icon"><KeyRound size={21} /></span><h2>Bir hesap davet et</h2><p className="card-description">Kullanıcı adını ve e-postasını sen belirle. Şifresini kullanıcı kendi oluşturur.</p><form className="account-form" onSubmit={invite}><fieldset disabled={busy}><div className="form-field"><label htmlFor="invite-username">Kullanıcı adı</label><input id="invite-username" value={username} onChange={event => setUsername(event.target.value.toLowerCase())} autoComplete="off" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9._\-]*" placeholder="ör. geliştirici yerine gelistirici" /><span className="field-hint">3–32 karakter. Küçük Latin harfleri, rakam, nokta, tire ve alt çizgi.</span></div><div className="form-field"><label htmlFor="invite-email">E-posta adresi</label><input id="invite-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="off" placeholder="Kullanıcının e-posta adresi" /></div><Feedback error={error} /><button className="button button-primary form-submit" type="submit">{busy ? 'İşlem yapılıyor…' : 'Tek kullanımlık kod oluştur'}<Plus size={17} /></button></fieldset></form><div className="invitation-note"><ShieldCheck size={18} /><p>Kod 48 saat geçerlidir ve yalnızca bir kez kullanılabilir. Yeni kod oluşturmak eski kodu geçersiz kılar.</p></div></section><section className="panel-card issued-code-card" aria-live="polite">{issued ? <><span className="panel-card-icon"><CheckCheck size={23} /></span><span className="small-label">DAVET HAZIR</span><h2>{issued.username}</h2><p className="card-description">Bu kodu kullanıcıya güvenli bir kanaldan ilet. Kullanıcı giriş sayfasında “Kayıt ol” seçeneğiyle şifresini oluşturur.</p><div className="issued-code"><code>{issued.code}</code><button className="icon-button" type="button" aria-label="Aktivasyon kodunu kopyala" onClick={copyCode}>{copyStatus === 'Aktivasyon kodu kopyalandı.' ? <Check size={18} /> : <Copy size={18} />}</button></div><p className="field-hint">Son kullanım: {new Date(issued.expiresAt).toLocaleString('tr-TR')}</p><p className="message message-success">Kod yalnızca bu ekranda gösterilir. Daha sonra gerektiğinde yeni kod oluşturabilirsin.</p><p className="copy-feedback" role="status">{copyStatus}</p><button className="text-action" type="button" onClick={() => { setIssued(null); setCopyStatus('') }}><X size={15} />Kodu ekrandan kaldır</button></> : <div className="code-placeholder"><KeyRound size={43} strokeWidth={1} /><h2>Bir kod, yeni bir başlangıç.</h2><p>Oluşturduğun aktivasyon kodu burada görünür.<br />Şifreyi yalnızca kullanıcı belirler.</p><div className="code-placeholder-lines" aria-hidden="true"><span /><span /><span /><span /></div></div>}</section></div><section className="panel-card members-card"><div className="list-heading"><h2>Kullanıcı hesapları</h2><span>{members.length} hesap</span></div><p className="card-description">E-postalar herkese açık panoda gösterilmez. Aktif hesapların şifrelerine erişilemez.</p><div className="members-table-wrap"><table className="members-table"><caption className="sr-only">Kullanıcı adları, e-posta adresleri ve aktivasyon durumları</caption><thead><tr><th scope="col">Kullanıcı adı</th><th scope="col">E-posta</th><th scope="col">Durum</th><th scope="col">Aktivasyon</th></tr></thead><tbody>{members.map(member => <tr key={member.id}><td><strong>{member.username}</strong></td><td>{member.email}</td><td><span className={`account-state ${member.status}`}>{member.status === 'active' ? <Check size={12} /> : <KeyRound size={12} />}{member.status === 'active' ? 'Aktif' : 'Kod bekliyor'}</span></td><td>{member.status === 'active' ? <span className="table-muted">Tamamlandı</span> : reissuing === member.id ? <div className="reissue-confirm"><span>Eski kod geçersiz olacak.</span><button type="button" className="text-action" disabled={busy} onClick={() => reissue(member)}>Yeni kod oluştur</button><button type="button" className="icon-button" aria-label="Kod yenilemeyi iptal et" disabled={busy} onClick={() => setReissuing(null)}><X size={15} /></button></div> : <button type="button" className="text-action" disabled={busy} onClick={() => setReissuing(member.id)}>Kodu yenile <KeyRound size={14} /></button>}</td></tr>)}</tbody></table></div></section></>
}
