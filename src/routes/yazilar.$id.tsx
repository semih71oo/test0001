import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Heart, Send } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { ApiError, communityApi } from '../lib/community'
import { formatDate, imageUrl } from '../lib/posts'
import type { PostDetail } from '../lib/posts'

export const Route = createFileRoute('/yazilar/$id')({
  component: PostPage,
  head: () => ({ meta: [{ title: 'Yazı — Semih Algan' }] }),
})

function PostPage() {
  const { id } = Route.useParams()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Beğeni kaydedilemedi.') }
  }

  async function sendComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      await communityApi('comment', { postId: id, body: comment })
      setComment('')
      await load()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Yorum gönderilemedi.') }
    finally { setBusy(false) }
  }

  if (status === 'loading') return <PublicShell><p role="status">Yükleniyor…</p></PublicShell>
  if (status === 'missing') return <PublicShell><h1>Yazı bulunamadı.</h1><p><a href="/yazilar">Tüm yazılara dön</a></p></PublicShell>
  if (status === 'error' || !post) return <PublicShell><p className="message message-error" role="alert">Yazı şu an yüklenemiyor.</p></PublicShell>

  const banned = post.viewer?.commentBan

  return (
    <PublicShell>
      <small style={{ opacity: .6 }}>{formatDate(post.createdAt)}</small>
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
          {post.comments.map(item => (
            <li key={item.id} className="panel-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '.9rem' }}><strong>{item.username}</strong><span style={{ opacity: .6 }}>{formatDate(item.createdAt)}</span></div>
              <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </PublicShell>
  )
}
