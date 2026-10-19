import { useEffect, useState } from 'react'
import { Ban, MessageCircle, ShieldAlert, Trash2, X } from 'lucide-react'
import { communityApi } from '../lib/community'
import type { Member } from '../lib/community'
import { banDurations, formatDate, hoursOf } from '../lib/posts'
import type { BanRow, ModComment } from '../lib/posts'

type BanDraft = { commentId: string; kind: 'comment' | 'ip'; duration: string; reason: string }

export function ModerationManager({ members }: { members: Member[] }) {
  const [comments, setComments] = useState<ModComment[]>([])
  const [bans, setBans] = useState<BanRow[]>([])
  const [draft, setDraft] = useState<BanDraft | null>(null)
  const [memberId, setMemberId] = useState('')
  const [memberDuration, setMemberDuration] = useState('24')
  const [memberReason, setMemberReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    try {
      const [c, b] = await Promise.all([communityApi<ModComment[]>('comments-admin'), communityApi<BanRow[]>('bans')])
      setComments(c); setBans(b)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Moderasyon verisi yüklenemedi.') }
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
        <div className="form-field"><label htmlFor="ban-member">Hesap</label><select id="ban-member" value={memberId} onChange={event => setMemberId(event.target.value)}><option value="">Hesap seç…</option>{members.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.username}</option>)}</select></div>
        <div className="form-field"><label htmlFor="ban-member-duration">Süre</label><select id="ban-member-duration" value={memberDuration} onChange={event => setMemberDuration(event.target.value)}>{banDurations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
        <div className="form-field"><label htmlFor="ban-member-reason">Sebep (isteğe bağlı)</label><input id="ban-member-reason" value={memberReason} onChange={event => setMemberReason(event.target.value)} maxLength={200} /></div>
        <button className="button button-primary" type="button" disabled={busy || !memberId} onClick={banMember}>Yorum yasağı uygula<Ban size={16} /></button>
      </div>
    </section>

    <section className="panel-card members-card">
      <div className="list-heading"><h2>Son yorumlar</h2><span>{comments.length} yorum</span></div>
      {!comments.length ? <div className="list-empty"><MessageCircle size={30} /><p>Henüz yorum yok.</p></div> : <ul className="developer-list">{comments.map(item => <li key={item.id} style={{ display: 'block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <strong>{item.username}{item.commentBanned && <small style={{ marginLeft: 8, opacity: .7 }}>(yorum yasaklı)</small>}</strong>
          <small style={{ opacity: .65 }}>{formatDate(item.createdAt)} · {item.postTitle} · {item.ipTag}</small>
        </div>
        <p style={{ margin: '6px 0 10px', whiteSpace: 'pre-wrap' }}>{item.body}</p>
        {draft?.commentId === item.id ? <div style={{ display: 'grid', gap: 8 }}>
          <select aria-label="Yasak türü" value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as 'comment' | 'ip' })}><option value="comment">Yorum yasağı (hesap)</option><option value="ip">IP yasağı (bağlantı)</option></select>
          <select aria-label="Süre" value={draft.duration} onChange={event => setDraft({ ...draft, duration: event.target.value })}>{banDurations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select>
          <input aria-label="Sebep" placeholder="Sebep (isteğe bağlı)" maxLength={200} value={draft.reason} onChange={event => setDraft({ ...draft, reason: event.target.value })} />
          <div className="row-actions"><button className="danger-button" type="button" disabled={busy} onClick={applyBan}>Yasağı uygula</button><button className="icon-button" type="button" aria-label="Vazgeç" onClick={() => setDraft(null)}><X size={16} /></button></div>
        </div> : <div className="row-actions">
          <button className="icon-button" type="button" aria-label="Yorumu sil" disabled={busy} onClick={() => deleteComment(item.id)}><Trash2 size={16} /></button>
          <button className="icon-button" type="button" aria-label="Yasakla" disabled={busy} onClick={() => setDraft({ commentId: item.id, kind: 'comment', duration: '24', reason: '' })}><ShieldAlert size={16} /></button>
        </div>}
      </li>)}</ul>}
    </section>
  </>
}
