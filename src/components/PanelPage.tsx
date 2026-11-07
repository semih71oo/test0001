import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  FileText,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'
import { ApiError, communityApi } from '../lib/community'
import type { Developer, Member, Session } from '../lib/community'
import { DeveloperCards } from './DeveloperBoard'
import { MaintenanceManager } from './MaintenanceManager'
import { ModerationManager } from './ModerationManager'
import { PostManager } from './PostManager'
import { DeveloperManager } from './panel/DeveloperManager'
import { MemberManager } from './panel/MemberManager'
import { UpdateManager } from './panel/UpdateManager'
import {
  TwoFactorSettings,
  PasswordSettings,
  DeleteAccountSettings,
} from './panel/AccountSecurity'

type PanelTab =
  | 'overview'
  | 'developers'
  | 'members'
  | 'posts'
  | 'updates'
  | 'moderation'
  | 'maintenance'

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
    if (adminOnly && currentSession?.isAdmin) {
      setMembers(await communityApi<Member[]>('members'))
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const currentSession = await communityApi<Session>('session')
        if (!active) return
        if (adminOnly && !currentSession.isMod) {
          throw new ApiError('Yönetim paneline erişmek için yetki gerekiyor.', 403)
        }
        setSession(currentSession)
        const data = await communityApi<Developer[]>('developers')
        if (active) setDevelopers(data)
        if (adminOnly && currentSession.isAdmin) {
          const accounts = await communityApi<Member[]>('members')
          if (active) setMembers(accounts)
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Panel yüklenemedi.')
          setStatus(caught instanceof ApiError ? caught.status : 503)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
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

  if (loading) {
    return (
      <div className="panel-gate container" aria-busy="true">
        <span className="brand-icon"><Code2 size={24} /></span>
        <h2>Çalışma alanın hazırlanıyor.</h2>
        <p role="status">Oturum ve erişim yetkileri kontrol ediliyor…</p>
        <div className="panel-loading-bar" />
      </div>
    )
  }

  if (!session || status === 403) {
    const adminDenied = adminOnly && status === 403
    const signInRequired = status === 401 || status === 403
    return (
      <div className="panel-gate container">
        <ShieldCheck size={42} />
        <span className="section-eyebrow">GÜVENLİ ÇALIŞMA ALANI</span>
        <h1>
          {adminDenied
            ? 'Bu alan yetkililere özel.'
            : status === 403
              ? 'Hesabın henüz hazır değil.'
              : status === 401
                ? 'Önce bir merhaba.'
                : 'Panel şu an yüklenemiyor.'}
        </h1>
        <p role="alert">{error}</p>
        <a
          className="button button-primary"
          href={adminDenied ? '/panel' : signInRequired ? '/giris' : getPanelPath(adminOnly)}
        >
          {adminDenied ? 'Kullanıcı paneline dön' : signInRequired ? 'Girişe dön' : 'Tekrar dene'}
          <ArrowUpRight size={18} />
        </a>
        <a className="back-link" href="/">
          <ArrowLeft size={15} />Ana sayfa
        </a>
      </div>
    )
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
          <div className="workspace-label">
            <span className="status-dot" />{adminOnly ? 'YÖNETİM ALANI' : 'KİŞİSEL ALAN'}
          </div>
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
              session.isMod && (
                <a className="sidebar-link" href="/admin">
                  <ShieldCheck size={18} />Yönetim paneli<ArrowUpRight size={14} />
                </a>
              )
            )}
          </nav>
          <div className="sidebar-note">
            <LockKeyhole size={19} />
            <p>
              {adminOnly
                ? 'Pano rolleri görünüm içindir. Yönetim yetkileri yalnızca sistem yöneticisi tarafından atanır.'
                : 'Şifren yalnızca sana ait. Bu alanda güvenle güncelleyebilirsin.'}
            </p>
          </div>
          <div className="sidebar-profile">
            <span className="profile-monogram">{session.profile.username.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{session.profile.username}</strong>
              <span>{session.profile.role}</span>
            </div>
          </div>
        </aside>

        <main className="workspace-main" id="panel-content">
          <div className="workspace-heading">
            <div>
              <span className="section-eyebrow">
                {adminOnly ? 'YÖNETİM PANELİ' : 'KULLANICI PANELİ'} /{' '}
                {tab === 'overview'
                  ? 'GENEL BAKIŞ'
                  : tab === 'developers'
                    ? 'GELİŞTİRİCİLER'
                    : tab === 'posts'
                      ? 'YAZILAR'
                      : tab === 'updates'
                        ? 'GÜNCELLEMELER'
                        : tab === 'moderation'
                          ? 'MODERASYON'
                          : tab === 'maintenance'
                            ? 'BAKIM'
                            : 'KULLANICILAR'}
              </span>
              <h1>
                {tab === 'overview'
                  ? 'Çalışma alanına hoş geldin.'
                  : tab === 'developers'
                    ? 'İsimler, roller, bir ekip.'
                    : tab === 'posts'
                      ? 'Fikirlerini yazıya dök.'
                      : tab === 'updates'
                        ? 'Sitedeki yenilikleri duyur.'
                        : tab === 'moderation'
                          ? 'Yorumlar ve yasaklar.'
                          : tab === 'maintenance'
                            ? 'Siteyi tek tuşla bakıma al.'
                            : 'Hesaplar ve yetkiler.'}
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
                      <StatCard label="Aktif hesaplar" value={members.filter(m => m.status === 'active').length} icon={<Users size={20} />} />
                      <StatCard label="Aktivasyon bekleyenler" value={members.filter(m => m.status === 'pending').length} icon={<KeyRound size={20} />} />
                    </div>

                    <TwoFactorSettings />

                    <div className="panel-section-title">
                      <h2>Geliştirici panosu</h2>
                      <button type="button" className="text-action" onClick={() => setTab('developers')}>
                        Panoyu düzenle <ArrowUpRight size={16} />
                      </button>
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

          {tab === 'developers' && adminOnly && session.isAdmin && (
            <DeveloperManager developers={developers} refresh={refresh} />
          )}
          {tab === 'members' && adminOnly && session.isAdmin && (
            <MemberManager members={members} refresh={refresh} session={session} />
          )}
          {tab === 'posts' && adminOnly && session.isAdmin && <PostManager />}
          {tab === 'updates' && adminOnly && session.isAdmin && <UpdateManager />}
          {tab === 'moderation' && adminOnly && session.isMod && (
            <ModerationManager members={members} canIpBan={session.isAdmin} />
          )}
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
