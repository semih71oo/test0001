import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Heart, Pencil, Send, Trash2, X } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { communityApi } from '../lib/community'
import { formatDate, imageUrl } from '../lib/posts'
import type { PostDetail } from '../lib/posts'

export const Route = createFileRoute('/yazilar/$id')({
  // ssr: false KALDIRILDI! Artık sayfa sunucuda render edilerek botlara sunulacak.
  loader: async ({ params }) => {
    try {
      // Sunucuda (SSR) çalışırken relative URL çalışmaz, absolute URL gerekir.
      const baseUrl = import.meta.env.SSR ? 'https://semihalgan.com.tr' : ''
      const res = await fetch(`${baseUrl}/api/community/post?id=${encodeURIComponent(params.id)}`, { cache: 'no-store' })
      
      if (!res.ok) {
        if (res.status === 404) return { post: null, error: 'missing' }
        throw new Error('Yazı yüklenemedi')
      }
      const post = await res.json()
      return { post, error: null }
    } catch (caught) {
      return { post: null, error: 'error' }
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) return { meta: [{ title: 'Yazı Bulunamadı — Semih Algan' }] }
    
    const post = loaderData.post
    const siteUrl = 'https://semihalgan.com.tr'
    
    // Yazıya ait görsel varsa o, yoksa varsayılan og-image.png (Sosyal medya önizleme resmi)
    const ogImage = post.hasImage 
      ? `${siteUrl}/api/community/post-image?id=${post.id}&v=${post.updatedAt}` 
      : `${siteUrl}/og-image.png`
    
    // SEO ve paylaşım kartları için temizlenmiş kısa açıklama (155 karakter)
    const cleanDescription = post.body.replace(/\s+/g, ' ').substring(0, 155) + '...'

    return {
      meta: [
        { title: `${post.title} — Semih Algan` },
        { name: 'description', content: cleanDescription },
        
        // OpenGraph / Sosyal Medya (WhatsApp, LinkedIn, vb.)
        { property: 'og:title', content: `${post.title} — Semih Algan` },
        { property: 'og:description', content: cleanDescription },
        { property: 'og:image', content: ogImage },
        { property: 'og:type', content: 'article' },
        { property: 'article:published_time', content: new Date(post.createdAt).toISOString() },
        { property: 'article:modified_time', content: new Date(post.updatedAt).toISOString() },
        
        // Twitter / X Kartı
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${post.title} — Semih Algan` },
        { name: 'twitter:description', content: cleanDescription },
        { name: 'twitter:image', content: ogImage }
      ]
    }
  },
  component: PostPage,
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
  const { post: initialPost, error: loaderError } = Route.useLoaderData()
  
  const [post, setPost] = useState<PostDetail | null>(initialPost)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    setPost(initialPost)
    
    // SSR'da çerez (cookie) gönderilmediği için sunucudan gelen HTML'de kullanıcı çıkış yapmış görünür.
    // Sayfa tarayıcıda yüklendikten (Hydration) hemen sonra, oturum durumunu ve beğenileri arka planda tekrar çekiyoruz.
    if (initialPost) {
      communityApi<PostDetail>(`post?id=${encodeURIComponent(initialPost.id)}`)
        .then(updatedPost => setPost(updatedPost))
        .catch(() => {})
    }
  }, [initialPost])

  async function reloadPost() {
    if (!post) return
    const updatedPost = await communityApi<PostDetail>(`post?id=${encodeURIComponent(post.id)}`)
    setPost(updatedPost)
  }

  // OPTIMISTIC UI: Beğen butonuna basıldığı an UI güncellenir, API arkadan çağrılır.
  async function toggleLike() {
    if (!post) return
    setError('')
    
    const wasLiked = post.liked
    const newLikes = wasLiked ? post.likes - 1 : post.likes + 1
    
    // Anında Görsel Güncelleme
    setPost({ ...post, liked: !wasLiked, likes: newLikes })
    
    try {
      const result = await communityApi<{ liked: boolean; likes: number }>('like', { postId: post.id })
      // Sunucudan gelen kesin sonuçla senkronize et
      setPost(prev => prev ? { ...prev, liked: result.liked, likes: result.likes } : prev)
    } catch (caught) {
      // Hata olursa işlemi geri al
      setPost({ ...post, liked: wasLiked, likes: wasLiked ? newLikes + 1 : newLikes - 1 })
      setError(caught instanceof Error ? caught.message : 'Beğeni kaydedilemedi.')
    }
  }

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!post) return
    setBusy(true)
    setError('')
    try {
      await communityApi('comment', { postId: post.id, body: comment })
      setComment('')
      await reloadPost()
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
      await reloadPost()
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
      await reloadPost()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yorum silinemedi.')
    } finally {
      setActionBusy(false)
    }
  }

  if (loaderError === 'missing') return <PublicShell><h1>Yazı bulunamadı.</h1><p><a href="/yazilar">Tüm yazılara dön</a></p></PublicShell>
  if (loaderError === 'error' || !post) return <PublicShell><p className="message message-error" role="alert">Yazı şu an yüklenemiyor.</p></PublicShell>

  const banned = post.viewer?.commentBan

  return (
    <PublicShell>
      <small style={{ display: 'block', opacity: .6 }}>{formatDate(post.createdAt)} {post.authorName ? `· Yazar: ${post.authorName}` : ''}</small>
      <h1 style={{ margin: '6px 0 20px' }}>{post.title}</h1>
      
      {/* Görsel En-Boy düzeltmesi (maxHeight eklendi) */}
      {post.hasImage && <img src={imageUrl(post.id, post.updatedAt)} alt="" style={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 16, marginBottom: 22 }} />}
      
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
        <p>Yorum yapmak için <a href="/giris" style={{ color: 'var(--green)', textDecoration: 'underline' }}>giriş yapmalısın</a>. Hesabın yoksa yalnızca beğenebilirsin.</p>
      ) : banned ? (
        <p className="message message-error" role="alert">{banned.until ? `Yorum yapman ${formatDate(banned.until)} tarihine kadar kısıtlandı.` : 'Yorum yapman kalıcı olarak kısıtlandı.'}</p>
      ) : (
        <form onSubmit={sendComment} style={{ display: 'grid', gap: 10, margin: '12px 0 24px' }}>
          <textarea 
            value={comment} 
            onChange={event => setComment(event.target.value)} 
            required 
            maxLength={1000} 
            rows={3} 
            disabled={busy}
            placeholder={`${post.viewer.username} olarak yorum yaz…`} 
            style={{ width: '100%', borderRadius: 12, padding: 12, font: 'inherit', opacity: busy ? 0.6 : 1, border: '1px solid var(--line)' }} 
          />
          <button className="button button-primary" type="submit" disabled={busy || !comment.trim()} style={{ justifySelf: 'start', display: 'inline-flex', gap: 8, alignItems: 'center' }}>{busy ? 'Gönderiliyor…' : 'Yorumu gönder'}<Send size={16} /></button>
        </form>
      )}

      {!post.comments.length ? <p style={{ opacity: .7 }}>İlk yorumu sen yaz.</p> : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 14 }}>
          {post.comments.map(item => {
            const isOwner = post.viewer && post.viewer.id === item.memberId
            const canEdit = !!isOwner
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
                      <span title={`Son düzenleme: ${formatDate(item.editedAt)}`} style={{ fontSize: '0.78rem', color: '#557847', background: '#edf4e4', border: '1px solid #d0ddc0', padding: '2px 6px', borderRadius: 4, fontStyle: 'italic' }}>
                        (düzenlendi)
                      </span>
                    )}

                    {editingId !== item.id && (
                      <div className="row-actions" style={{ marginLeft: 6 }}>
                        {canEdit && (
                          <button type="button" className="icon-button" title="Yorumu düzenle" aria-label="Yorumu düzenle" disabled={actionBusy} onClick={() => startEdit(item.id, item.body)}>
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" className="icon-button" title="Yorumu sil" aria-label="Yorumu sil" disabled={actionBusy} onClick={() => setDeletingId(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {deletingId === item.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: 8, background: '#fff2eb', border: '1px solid #eccfc0', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: '#974d34' }}>Bu yorumu silmek istediğine emin misin?</span>
                    <button type="button" className="danger-button" disabled={actionBusy} onClick={() => deleteComment(item.id)}>
                      {actionBusy ? 'Siliniyor…' : 'Evet, sil'}
                    </button>
                    <button type="button" className="icon-button" title="Vazgeç" aria-label="Vazgeç" disabled={actionBusy} onClick={() => setDeletingId(null)}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {editingId === item.id ? (
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    <textarea
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      disabled={actionBusy}
                      style={{ width: '100%', borderRadius: 8, padding: 10, font: 'inherit', border: '1px solid #dce2d3', opacity: actionBusy ? 0.6 : 1 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="button button-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} disabled={actionBusy || !editingText.trim()} onClick={() => submitEdit(item.id)}>
                        {actionBusy ? 'Kaydediliyor…' : 'Kaydet'} <Check size={14} />
                      </button>
                      <button type="button" className="button button-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }} disabled={actionBusy} onClick={cancelEdit}>
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
