import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Ban,
  Check,
  CheckCheck,
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import { communityApi, accountRoles } from '../../lib/community'
import type { Member, Session } from '../../lib/community'

type IssuedCode = { code: string; expiresAt: string; username?: string }

function Feedback({ error, notice }: { error: string; notice?: string }) {
  return (
    <div className="form-feedback" aria-live="polite">
      {error && <p className="message message-error" role="alert">{error}</p>}
      {notice && <p className="message message-success" role="status">{notice}</p>}
    </div>
  )
}

export function MemberManager({
  members,
  refresh,
  session,
}: {
  members: Member[]
  refresh: () => Promise<void>
  session: Session
}) {
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
    setBusy(true)
    setError('')
    setNotice('')
    setCopyStatus('')
    setIssued(null)
    try {
      const result = await communityApi<IssuedCode>('invite', { username, email })
      setIssued(result)
      setUsername('')
      setEmail('')
      setNotice('Aktivasyon kodu başarıyla oluşturuldu.')
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Kod oluşturulamadı.')
    } finally {
      setBusy(false)
    }
  }

  async function reissue(member: Member) {
    setBusy(true)
    setError('')
    setNotice('')
    setCopyStatus('')
    setIssued(null)
    try {
      const result = await communityApi<IssuedCode>('reissue', { id: member.id })
      setIssued({ ...result, username: member.username })
      setReissuing(null)
      setNotice(`"${member.username}" için yeni kod oluşturuldu.`)
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Kod yenilenemedi.')
    } finally {
      setBusy(false)
    }
  }

  async function changeRole(member: Member, newRole: string) {
    setBusy(true)
    setError('')
    setNotice('')
    setCopyStatus('')
    try {
      await communityApi('set-role', { id: member.id, role: newRole })
      setNotice(`"${member.username}" hesabının rolü "${newRole}" olarak güncellendi.`)
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Rol güncellenemedi.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmSuspend(member: Member) {
    setBusy(true)
    setError('')
    setNotice('')
    setCopyStatus('')
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'İşlem yapılamadı.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteAccount(member: Member) {
    setBusy(true)
    setError('')
    setNotice('')
    setCopyStatus('')
    try {
      await communityApi('delete-member', { id: member.id })
      setDeletingMember(null)
      setNotice(`"${member.username}" hesabı ve varsa davet kodları başarıyla silindi.`)
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Hesap silinemedi.')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    if (!issued) return
    try {
      await navigator.clipboard.writeText(issued.code)
      setCopyStatus('Aktivasyon kodu kopyalandı.')
    } catch {
      setCopyStatus('Kopyalama yapılamadı. Kodu seçerek kopyalayabilirsin.')
    }
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
          <span className="panel-card-icon">
            <KeyRound size={21} />
          </span>
          <h2>Bir hesap davet et</h2>
          <p className="card-description">
            Kullanıcı adını ve e-postasını sen belirle. Şifresini kullanıcı kendi oluşturur.
          </p>
          <form className="account-form" onSubmit={invite}>
            <fieldset disabled={busy}>
              <div className="form-field">
                <label htmlFor="invite-username">Kullanıcı adı</label>
                <input
                  id="invite-username"
                  value={username}
                  onChange={event => setUsername(event.target.value.toLowerCase())}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  minLength={3}
                  maxLength={32}
                  pattern="[a-z0-9][a-z0-9._\-]*"
                  placeholder="ör. geliştirici yerine gelistirici"
                />
                <span className="field-hint">
                  3–32 karakter. Küçük Latin harfleri, rakam, nokta, tire ve alt çizgi.
                </span>
              </div>
              <div className="form-field">
                <label htmlFor="invite-email">E-posta adresi</label>
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  maxLength={254}
                  autoComplete="off"
                  placeholder="Kullanıcının e-posta adresi"
                />
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
              <span className="panel-card-icon">
                <CheckCheck size={23} />
              </span>
              <span className="small-label">DAVET HAZIR</span>
              <h2>{issued.username}</h2>
              <p className="card-description">
                Bu kodu kullanıcıya ilet. Kullanıcı giriş sayfasında “Kayıt ol” seçeneğiyle şifresini oluşturur.
              </p>
              <div className="issued-code">
                <code>{issued.code}</code>
                <button className="icon-button" type="button" aria-label="Aktivasyon kodunu kopyala" onClick={copyCode}>
                  {copyStatus === 'Aktivasyon kodu kopyalandı.' ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="field-hint">Son kullanım: {new Date(issued.expiresAt).toLocaleString('tr-TR')}</p>
              <p className="message message-success">
                Kod yalnızca bu ekranda gösterilir. Daha sonra gerektiğinde yeni kod oluşturabilirsin.
              </p>
              <p className="copy-feedback" role="status">
                {copyStatus}
              </p>
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setIssued(null)
                  setCopyStatus('')
                }}
              >
                <X size={15} />Kodu ekrandan kaldır
              </button>
            </>
          ) : (
            <div className="code-placeholder">
              <KeyRound size={43} strokeWidth={1} />
              <h2>Bir kod, yeni bir başlangıç.</h2>
              <p>
                Oluşturduğun aktivasyon kodu burada görünür.<br />
                Şifreyi yalnızca kullanıcı belirler.
              </p>
              <div className="code-placeholder-lines" aria-hidden="true">
                <span /><span /><span /><span />
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="panel-card members-card">
        <div className="list-heading">
          <h2>Kullanıcı hesapları</h2>
          <span>{filteredMembers.length} / {members.length} hesap</span>
        </div>
        <p className="card-description" style={{ marginBottom: 16 }}>
          E-postalar herkese açık panoda gösterilmez. Aktif hesapların şifrelerine erişilemez.
        </p>

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
