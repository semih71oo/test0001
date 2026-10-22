import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Heart, Pencil, Send, Trash2, X } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { ApiError, communityApi } from '../lib/community'
import { formatDate, imageUrl } from '../lib/posts'
import type { PostDetail } from '../lib/posts'

export const Route = createFileRoute('/yazilar/$id')({
  component: PostPage,
  head: () => ({ meta: [{ title: 'Yazı — Semih Algan' }] }),
})

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

function PostPage() {
  const { id } = Route.useParams()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Yorum düzenleme ve silme durumları
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)

  async function load() {
    try {
      setPost(await communityApi<PostDetail>(`post?id=${encodeURIComponent(id)}`))
      setStatus('ready')
    } catch (caught) {
      setStatus(caught instanceof ApiError && caught.status === 404 ? 'missing' : 'error')
    }
  }

  useEffect(() => { void load() }, [id])

  useEffect(() => {
    if (post?.title) document.title = `${post.title} — Semih Algan`
  }, [post?.title])

  async function toggleLike() {
    if (!post) return
    setError('')
    try {
      const result = await communityApi<{ liked: boolean; likes: number }>('like', { postId: post.id })
      setPost({ ...post, liked: result.liked, likes: result.likes })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Beğeni kaydedilemedi.')
    }
  }

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await communityApi('comment', { postId: id, body: comment })
      setComment('')
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yorum gönderilemedi.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(commentId: string, currentBody: string) {
    setDeletingId(null)
    setEditingId(commentId)
    setEditingText(currentBody)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingText('')
  }

  async function submitEdit(commentId: string) {
    if (!editingText.trim()) return
    setActionBusy(true)
    setError('')
    try {
      await communityApi('edit-comment', { id: commentId, body: editingText })
      setEditingId(null)
      setEditingText('')
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yorum güncellenemedi.')
    } finally {
      setActionBusy(false)
    }
  }

  async function deleteComment(commentId: string) {
    setActionBusy(true)
    setError('')
    try {
      await communityApi('delete-comment', { id: commentId })
      setDeletingId(null)
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yorum silinemedi.')
    } finally {
      setActionBusy(false)
    }
  }

  if (status === 'loading') return <PublicShell><p role="status">Yükleniyor…</p></PublicShell>
  if (status === 'missing') return <PublicShell><h1>Yazı bulunamadı.</h1><p><a href="/yazilar">Tüm yazılara dön</a></p></PublicShell>
  if (status === 'error' || !post) return <PublicShell><p className="message message-error" role="alert">Yazı şu an yüklenemiyor.</p></PublicShell>

  const banned = post.viewer?.commentBan

  return (
    <PublicShell>
      <small style={{ display: 'block', opacity: .6 }}>{formatDate(post.createdAt)}</small>
      <h1 style={{ margin: '6px 0 20px' }}>{post.title}</h1>
      {post.hasImage && <img src={imageUrl(post.id, post.updatedAt)} alt="" style={{ width: '100%', borderRadius: 16, marginBottom: 22 }} />}
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '1.05rem' }}>{post.body}</div>

      <div style={{ margin: '28px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" className="button button-outline" onClick={toggleLike} aria-pressed={post.liked} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />{post.liked ? 'Beğendin' : 'Beğen'} · {post.likes}
        </button>
        {!post.viewer && <small style={{ opacity: .65 }}>Beğenmek için hesap gerekmez.</small>}
      </div>

      <h2>Yorumlar ({post.comments.length})</h2>
      {error && <p className="message message-error" role="alert">{error}</p>}

      {!post.viewer ? (
        <p>Yorum yapmak için <a href="/giris">giriş yapmalısın</a>. Hesabın yoksa yalnızca beğenebilirsin.</p>
      ) : banned ? (
        <p className="message message-error" role="alert">{banned.until ? `Yorum yapman ${formatDate(banned.until)} tarihine kadar kısıtlandı.` : 'Yorum yapman kalıcı olarak kısıtlandı.'}</p>
      ) : (
        <form onSubmit={sendComment} style={{ display: 'grid', gap: 10, margin: '12px 0 24px' }}>
          <textarea value={comment} onChange={event => setComment(event.target.value)} required maxLength={1000} rows={3} placeholder={`${post.viewer.username} olarak yorum yaz…`} style={{ width: '100%', borderRadius: 12, padding: 12, font: 'inherit' }} />
          <button className="button button-primary" type="submit" disabled={busy || !comment.trim()} style={{ justifySelf: 'start', display: 'inline-flex', gap: 8, alignItems: 'center' }}>{busy ? 'Gönderiliyor…' : 'Yorumu gönder'}<Send size={16} /></button>
        </form>
      )}

      {!post.comments.length ? <p style={{ opacity: .7 }}>İlk yorumu sen yaz.</p> : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 14 }}>
          {post.comments.map(item => {
            const isOwner = post.viewer && post.viewer.id === item.memberId
            const canEdit = isOwner || post.viewer?.isAdmin
            const canDelete = isOwner || post.viewer?.isMod || post.viewer?.isAdmin

            return (
              <li key={item.id} className="panel-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '.9rem' }}>
                  <strong>
                    {item.username} <AccountRoleBadge role={item.role} />
                  </strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ opacity: .6 }}>{formatDate(item.createdAt)}</span>
                    {item.editedAt && (
                      <span
                        title={`Son düzenleme: ${formatDate(item.editedAt)}`}
                        style={{
                          fontSize: '0.78rem',
                          color: '#557847',
                          background: '#edf4e4',
                          border: '1px solid #d0ddc0',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontStyle: 'italic',
                        }}
                      >
                        (düzenlendi)
                      </span>
                    )}

                    {/* Düzenleme & Silme butonları */}
                    {editingId !== item.id && (
                      <div className="row-actions" style={{ marginLeft: 6 }}>
                        {canEdit && (
                          <button
                            type="button"
                            className="icon-button"
                            title="Yorumu düzenle"
                            aria-label="Yorumu düzenle"
                            disabled={actionBusy}
                            onClick={() => startEdit(item.id, item.body)}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="icon-button"
                            title="Yorumu sil"
                            aria-label="Yorumu sil"
                            disabled={actionBusy}
                            onClick={() => setDeletingId(item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Silme Onay Kutusu */}
                {deletingId === item.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: 8, background: '#fff2eb', border: '1px solid #eccfc0', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: '#974d34' }}>Bu yorumu silmek istediğine emin misin?</span>
                    <button
                      type="button"
                      className="danger-button"
                      disabled={actionBusy}
                      onClick={() => deleteComment(item.id)}
                    >
                      {actionBusy ? 'Siliniyor…' : 'Evet, sil'}
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title="Vazgeç"
                      aria-label="Vazgeç"
                      disabled={actionBusy}
                      onClick={() => setDeletingId(null)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Yorum Metni veya Düzenleme Formu */}
                {editingId === item.id ? (
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    <textarea
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      style={{ width: '100%', borderRadius: 8, padding: 10, font: 'inherit', border: '1px solid #dce2d3' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="button button-primary"
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        disabled={actionBusy || !editingText.trim()}
                        onClick={() => submitEdit(item.id)}
                      >
                        {actionBusy ? 'Kaydediliyor…' : 'Kaydet'} <Check size={14} />
                      </button>
                      <button
                        type="button"
                        className="button button-outline"
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        disabled={actionBusy}
                        onClick={cancelEdit}
                      >
                        Vazgeç <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{item.body}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </PublicShell>
  )
}
