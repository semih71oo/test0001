import { useEffect, useState } from 'react'
import { Ban, Filter, Globe, MessageCircle, ShieldAlert, Trash2, UserX, X } from 'lucide-react'
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

export function ModerationManager({ members, canIpBan = true }: { members: Member[]; canIpBan?: boolean }) {
  const [session, setSession] = useState<Session | null>(null)
  const [comments, setComments] = useState<ModComment[]>([])
  const [bans, setBans] = useState<BanRow[]>([])
  const [draft, setDraft] = useState<BanDraft | null>(null)
  
  // Yasaklama formu sekmesi: 'member' (Hesap) veya 'ip' (IP Bağlantısı)
  const [activeFormTab, setActiveFormTab] = useState<'member' | 'ip'>('member')
  
  // Hesap Ban Formu
  const [memberId, setMemberId] = useState('')
  const [memberDuration, setMemberDuration] = useState('24')
  const [memberReason, setMemberReason] = useState('')

  // Doğrudan IP Ban Formu
  const [ipCommentId, setIpCommentId] = useState('')
  const [ipDuration, setIpDuration] = useState('24')
  const [ipReason, setIpReason] = useState('')
  
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

  const banIpDirectly = () => act(async () => {
    if (!ipCommentId) throw new Error('Lütfen IP yasağı uygulanacak bağlantıyı/yorumu seçin.')
    await communityApi('ban', { kind: 'ip', commentId: ipCommentId, hours: hoursOf(ipDuration), reason: ipReason })
    setIpCommentId(''); setIpReason('')
  }, 'IP yasağı uygulandı.')

  const until = (ban: BanRow) => (ban.expiresAt ? `${formatDate(ban.expiresAt)} tarihine kadar` : 'Süresiz')

  // Hiyerarşi, Yetki ve Filtreler
  const myLevel = getLevel(session?.profile.role)
  const myId = session?.profile.id
  const hasIpBanAuth = canIpBan || !!session?.isAdmin || myLevel >= 4

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

    {/* YASAKLAMA KARTI: HESAP VE IP BAN SEKMELERİ */}
    <section className="panel-card members-card">
      <div className="list-heading">
        <h2>Yasak Uygula</h2>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0 20px', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActiveFormTab('member')}
          className={`button ${activeFormTab === 'member' ? 'button-primary' : 'button-outline'}`}
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <UserX size={15} /> Hesaba Yorum Yasağı
        </button>
        {hasIpBanAuth && (
          <button
            type="button"
            onClick={() => setActiveFormTab('ip')}
            className={`button ${activeFormTab === 'ip' ? 'button-primary' : 'button-outline'}`}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Globe size={15} /> IP Yasağı (Bağlantı)
          </button>
        )}
      </div>

      {/* 1. SEKME: HESABA YORUM YASAĞI */}
      {activeFormTab === 'member' && (
        <div className="account-form" style={{ display: 'grid', gap: 10, marginTop: 0 }}>
          <div className="form-field">
            <label htmlFor="ban-member">Yasaklanacak Hesap</label>
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
            <input id="ban-member-reason" value={memberReason} onChange={event => setMemberReason(event.target.value)} maxLength={200} placeholder="Örn: Hakaret veya kural ihlali" />
          </div>
          <button className="button button-primary" type="button" disabled={busy || !memberId} onClick={banMember}>Yorum yasağı uygula<Ban size={16} /></button>
        </div>
      )}

      {/* 2. SEKME: IP YASAĞI (BAĞLANTI) */}
      {activeFormTab === 'ip' && hasIpBanAuth && (
        <div className="account-form" style={{ display: 'grid', gap: 10, marginTop: 0 }}>
          <div className="form-field">
            <label htmlFor="ban-ip-comment">Yasaklanacak IP / Yorum Kaydı</label>
            <select id="ban-ip-comment" className="custom-select" value={ipCommentId} onChange={event => setIpCommentId(event.target.value)}>
              <option value="">IP bağlantısı seç…</option>
              {comments
                .filter(c => c.memberId !== myId && myLevel > getLevel(c.role))
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.username} · IP [{c.ipTag}] · &quot;{c.body.slice(0, 35)}...&quot;
                  </option>
                ))}
            </select>
            <span className="field-hint">IP adresi gizlilik gereği yorum kayıtlarından tespit edilir. Kendi IP adresinizi yasaklayamazsınız.</span>
          </div>
          <div className="form-field">
            <label htmlFor="ban-ip-duration">Süre</label>
            <select id="ban-ip-duration" className="custom-select" value={ipDuration} onChange={event => setIpDuration(event.target.value)}>
              {banDurations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="ban-ip-reason">Sebep (isteğe bağlı)</label>
            <input id="ban-ip-reason" value={ipReason} onChange={event => setIpReason(event.target.value)} maxLength={200} placeholder="Örn: Spam saldırısı veya çoklu hesap istismarı" />
          </div>
          <button className="button modal-btn-danger" type="button" style={{ color: '#fff', background: '#974d34', border: 'none' }} disabled={busy || !ipCommentId} onClick={banIpDirectly}>
            IP Bağlantısını Yasakla <Globe size={16} />
          </button>
        </div>
      )}
    </section>

    {/* YORUMLAR LİSTESİ */}
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
                    {isMe && <small style={{ marginLeft: 8, color: '#557847' }}>(Sen)</small>}
                  </strong>
                  <small style={{ opacity: .65 }}>{formatDate(item.createdAt)} · {item.postTitle} · IP: {item.ipTag}</small>
                </div>
                <p style={{ margin: '6px 0 10px', whiteSpace: 'pre-wrap' }}>{item.body}</p>
                
                {draft?.commentId === item.id ? (
                  <div style={{ display: 'grid', gap: 8, background: '#f5f7ee', padding: 12, borderRadius: 8, border: '1px solid #dce4d1' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#4d5e4e' }}>Yasak Türü:</div>
                    <select aria-label="Yasak türü" className="custom-select" value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as 'comment' | 'ip' })}>
                      <option value="comment">Yorum yasağı (hesap)</option>
                      {hasIpBanAuth && <option value="ip">IP yasağı (bağlantı)</option>}
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
                    {canAct ? (
                      <>
                        <button className="icon-button" type="button" aria-label="Yorumu sil" title="Yorumu sil" disabled={busy} onClick={() => deleteComment(item.id)}><Trash2 size={16} /></button>
                        <button className="icon-button" type="button" aria-label="Yasakla" title="Yasakla" disabled={busy} onClick={() => setDraft({ commentId: item.id, kind: hasIpBanAuth ? 'ip' : 'comment', duration: '24', reason: '' })}><ShieldAlert size={16} /></button>
                      </>
                    ) : isMe ? (
                      <span style={{ fontSize: '11px', opacity: 0.5, fontStyle: 'italic' }}>Kendi yorumun</span>
                    ) : null}
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
