import { useEffect, useState } from 'react'
import { Ban, Filter, MessageCircle, ShieldAlert, Trash2, X } from 'lucide-react'
import { communityApi } from '../lib/community'
import type { Member, Session } from '../lib/community'
import { banDurations, formatDate, hoursOf } from '../lib/posts'
import type { BanRow, ModComment } from '../lib/posts'

type BanDraft = { commentId: string; kind: 'comment' | 'ip'; duration: string; reason: string }

const roleLevels: Record<string, number> = { 'Üye': 0, 'Özel Üye': 1, 'Moderatör': 2, 'Baş Moderatör': 3, 'Admin': 4, 'Kurucu': 5 }
const getLevel = (role?: string) => roleLevels[role || 'Üye'] || 0

function AccountRoleBadge({ role }: { role: string }) {
  if (!role || role === 'Üye') return null
  let cls = ''
  switch (role) {
    case 'Kurucu': cls = 'acc-role-kurucu'; break
    case 'Admin': cls = 'acc-role-admin'; break
    case 'Baş Moderatör': cls = 'acc-role-bas-moderator'; break
    case 'Moderatör': cls = 'acc-role-moderator'; break
    case 'Özel Üye': cls = 'acc-role-ozel-uye'; break
  }
  if (!cls) return null
  return <span className={`acc-role ${cls}`}>{role}</span>
}

export function ModerationManager({ members, canIpBan = false }: { members: Member[]; canIpBan?: boolean }) {
  const [session, setSession] = useState<Session | null>(null)
  const [comments, setComments] = useState<ModComment[]>([])
  const [bans, setBans] = useState<BanRow[]>([])
  const [draft, setDraft] = useState<BanDraft | null>(null)
  
  const [memberId, setMemberId] = useState('')
  const [memberDuration, setMemberDuration] = useState('24')
  const [memberReason, setMemberReason] = useState('')
  
  const [selectedPost, setSelectedPost] = useState<string>('')
  
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    try {
      const [c, b, s] = await Promise.all([
        communityApi<ModComment[]>('comments-admin'), 
        communityApi<BanRow[]>('bans'),
        communityApi<Session>('session')
      ])
      setComments(c)
      setBans(b)
      setSession(s)
    } catch (caught) { 
      setError(caught instanceof Error ? caught.message : 'Moderasyon verisi yüklenemedi.') 
    }
  }
  
  useEffect(() => { void load() }, [])

  async function act(work: () => Promise<unknown>, success: string) {
    setBusy(true); setError(''); setNotice('')
    try { await work(); setNotice(success); await load() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'İşlem yapılamadı.') }
    finally { setBusy(false) }
  }

  const deleteComment = (id: string) => act(() => communityApi('delete-comment', { id }), 'Yorum silindi.')
  const unban = (id: string) => act(() => communityApi('unban', { id }), 'Yasak kaldırıldı.')
  
  const applyBan = () => draft && act(async () => {
    await communityApi('ban', { kind: draft.kind, commentId: draft.commentId, hours: hoursOf(draft.duration), reason: draft.reason })
    setDraft(null)
  }, draft.kind === 'ip' ? 'IP yasağı uygulandı.' : 'Yorum yasağı uygulandı.')
  
  const banMember = () => act(async () => {
    await communityApi('ban', { kind: 'comment', memberId, hours: hoursOf(memberDuration), reason: memberReason })
    setMemberId(''); setMemberReason('')
  }, 'Yorum yasağı uygulandı.')

  const until = (ban: BanRow) => (ban.expiresAt ? `${formatDate(ban.expiresAt)} tarihine kadar` : 'Süresiz')

  // Hiyerarşi ve Filtreleme Değişkenleri
  const myLevel = getLevel(session?.profile.role)
  const myId = session?.profile.id

  const uniquePosts = Array.from(new Set(comments.map(c => c.postTitle))).sort()
  const filteredComments = selectedPost ? comments.filter(c => c.postTitle === selectedPost) : comments

  return <>
    {(error || notice) && <div className="form-feedback" aria-live="polite">{error && <p className="message message-error" role="alert">{error}</p>}{notice && <p className="message message-success" role="status">{notice}</p>}</div>}

    <section className="panel-card members-card">
      <div className="list-heading"><h2>Aktif yasaklar</h2><span>{bans.length} yasak</span></div>
      {!bans.length ? <p className="card-description">Şu an aktif yasak yok.</p> : <ul className="developer-list">{bans.map(ban => <li key={ban.id}>
        <div><strong>{ban.kind === 'ip' ? `IP yasağı · ${ban.ipTag}` : `Yorum yasağı · ${ban.username ?? 'hesap'}`}</strong><small style={{ display: 'block', opacity: .65 }}>{until(ban)}{ban.reason ? ` · ${ban.reason}` : ''}</small></div>
        <div className="row-actions"><button className="danger-button" type="button" disabled={busy} onClick={() => unban(ban.id)}>Kaldır</button></div>
      </li>)}</ul>}
      <p className="field-hint" style={{ marginTop: 12 }}>IP yasağı o bağlantıdan giriş, beğeni ve yorum dahil tüm işlemleri engeller. Aynı IP’yi paylaşan başka kişileri de etkileyebilir (ör. mobil operatör ağları), bu yüzden çoğu durumda yorum yasağı daha güvenlidir. Kendi bağlantını yasaklayamazsın.</p>
    </section>

    <section className="panel-card members-card">
      <div className="list-heading"><h2>Hesaba yorum yasağı</h2></div>
      <div className="account-form" style={{ display: 'grid', gap: 10 }}>
        <div className="form-field">
          <label htmlFor="ban-member">Hesap</label>
          <select id="ban-member" className="custom-select" value={memberId} onChange={event => setMemberId(event.target.value)}>
            <option value="">Hesap seç…</option>
            {members.filter(m => m.status === 'active' && m.id !== myId && myLevel > getLevel(m.role)).map(m => (
              <option key={m.id} value={m.id}>{m.username} ({m.role})</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="ban-member-duration">Süre</label>
          <select id="ban-member-duration" className="custom-select" value={memberDuration} onChange={event => setMemberDuration(event.target.value)}>
            {banDurations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="ban-member-reason">Sebep (isteğe bağlı)</label>
          <input id="ban-member-reason" value={memberReason} onChange={event => setMemberReason(event.target.value)} maxLength={200} />
        </div>
        <button className="button button-primary" type="button" disabled={busy || !memberId} onClick={banMember}>Yorum yasağı uygula<Ban size={16} /></button>
      </div>
    </section>

    <section className="panel-card members-card">
      <div className="list-heading"><h2>Son yorumlar</h2><span>{filteredComments.length} yorum</span></div>
      
      {comments.length > 0 && (
        <div className="filter-bar">
          <Filter size={18} color="#61715b" />
          <label htmlFor="post-filter">Yazıya göre filtrele:</label>
          <select id="post-filter" className="custom-select" value={selectedPost} onChange={e => setSelectedPost(e.target.value)}>
            <option value="">Tüm yazılar</option>
            {uniquePosts.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      {!filteredComments.length ? (
        <div className="list-empty">
          <MessageCircle size={30} />
          <p>{comments.length > 0 ? 'Bu yazıya ait yorum bulunmuyor.' : 'Henüz yorum yok.'}</p>
        </div>
      ) : (
        <ul className="developer-list">
          {filteredComments.map(item => {
            const targetLevel = getLevel(item.role)
            const isMe = item.memberId === myId
            const canAct = !isMe && myLevel > targetLevel

            return (
              <li key={item.id} style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <strong>
                    {item.username} <AccountRoleBadge role={item.role} />
                    {item.commentBanned && <small style={{ marginLeft: 8, opacity: .7 }}>(yorum yasaklı)</small>}
                  </strong>
                  <small style={{ opacity: .65 }}>{formatDate(item.createdAt)} · {item.postTitle} · {item.ipTag}</small>
                </div>
                <p style={{ margin: '6px 0 10px', whiteSpace: 'pre-wrap' }}>{item.body}</p>
                
                {draft?.commentId === item.id ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <select aria-label="Yasak türü" className="custom-select" value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as 'comment' | 'ip' })}>
                      <option value="comment">Yorum yasağı (hesap)</option>
                      {canIpBan && <option value="ip">IP yasağı (bağlantı)</option>}
                    </select>
                    <select aria-label="Süre" className="custom-select" value={draft.duration} onChange={event => setDraft({ ...draft, duration: event.target.value })}>
                      {banDurations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <input aria-label="Sebep" placeholder="Sebep (isteğe bağlı)" maxLength={200} value={draft.reason} onChange={event => setDraft({ ...draft, reason: event.target.value })} style={{ width: '100%', background: '#fafbf6', border: '1px solid #dce2d3', borderRadius: 8, height: 42, padding: '0 14px', fontSize: 12, fontFamily: 'inherit' }} />
                    <div className="row-actions">
                      <button className="danger-button" type="button" disabled={busy} onClick={applyBan}>Yasağı uygula</button>
                      <button className="icon-button" type="button" aria-label="Vazgeç" onClick={() => setDraft(null)}><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="row-actions">
                    {canAct && (
                      <>
                        <button className="icon-button" type="button" aria-label="Yorumu sil" disabled={busy} onClick={() => deleteComment(item.id)}><Trash2 size={16} /></button>
                        <button className="icon-button" type="button" aria-label="Yasakla" disabled={busy} onClick={() => setDraft({ commentId: item.id, kind: 'comment', duration: '24', reason: '' })}><ShieldAlert size={16} /></button>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  </>
}
