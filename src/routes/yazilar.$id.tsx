import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { Check, Heart, Pencil, Send, Trash2, X } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { communityApi } from '../lib/community'
import { formatDate, imageUrl } from '../lib/posts'
import type { PostDetail } from '../lib/posts'

// Kod renklendirme (Syntax Highlighting) için Highlight.js ve temasını içe aktarıyoruz
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export const Route = createFileRoute('/yazilar/$id')({
  loader: async ({ params }) => {
    try {
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
    
    const ogImage = post.hasImage 
      ? `${siteUrl}/api/community/post-image?id=${post.id}&v=${post.updatedAt}` 
      : `${siteUrl}/og-image.png`
    
    const cleanDescription = post.body.replace(/\s+/g, ' ').substring(0, 155) + '...'

    return {
      meta: [
        { title: `${post.title} — Semih Algan` },
        { name: 'description', content: cleanDescription },
        { property: 'og:title', content: `${post.title} — Semih Algan` },
        { property: 'og:description', content: cleanDescription },
        { property: 'og:image', content: ogImage },
        { property: 'og:type', content: 'article' },
        { property: 'article:published_time', content: new Date(post.createdAt).toISOString() },
        { property: 'article:modified_time', content: new Date(post.updatedAt).toISOString() },
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

// Zengin Metin (Markdown) Bileşeni
function MarkdownRenderer({ content }: { content: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sayfa render edildikten sonra <pre><code> bloklarını renklendir
    if (rootRef.current) {
      rootRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement)
      })
    }
  }, [content])

  const parseMarkdown = (text: string) => {
    const tokens: string[] = []
    
    // 1. KOD BLOKLARINI KORUMAYA AL (Çok satırlı)
    let processed = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${tokens.length}__`
      // XSS ve HTML karakterlerini escape et
      const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      tokens.push(`<pre style="margin: 16px 0; border-radius: 8px; overflow: auto; border: 1px solid var(--line); background: #f6f8fa;"><code class="language-${lang}" style="padding: 16px; font-size: 0.9rem; font-family: monospace; display: block;">${escapedCode}</code></pre>`)
      return placeholder
    })

    // 2. TEMEL GÜVENLİK (Geri kalan HTML'i etkisiz hale getir)
    processed = processed.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    
    // 3. MD KURALLARI
    // Satır içi kod (`kod`)
    processed = processed.replace(/`([^`\n]+)`/g, '<code style="background: #edf2e1; color: #507146; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace;">$1</code>')
    // Başlıklar
    processed = processed.replace(/^### (.*$)/gim, '<h3 style="margin: 24px 0 12px; font-size: 1.25rem;">$1</h3>')
    processed = processed.replace(/^## (.*$)/gim, '<h2 style="margin: 28px 0 14px; font-size: 1.5rem; letter-spacing: -0.5px;">$1</h2>')
    processed = processed.replace(/^# (.*$)/gim, '<h1 style="margin: 32px 0 16px; font-size: 1.8rem; letter-spacing: -1px;">$1</h1>')
    // Kalın ve Eğik
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Linkler
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--green); text-decoration: underline; text-underline-offset: 2px; font-weight: 600;">$1</a>')
    // Alıntı (Blockquote)
    processed = processed.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--green); padding: 6px 14px; color: var(--muted); margin: 16px 0; font-style: italic; background: #f4f6ee; border-radius: 0 8px 8px 0;">$1</blockquote>')
    // Satır atlamaları
    processed = processed.replace(/\n/g, '<br/>')

    // 4. KORUNAN KOD BLOKLARINI GERİ YÜKLE
    tokens.forEach((html, index) => {
      processed = processed.replace(`__CODE_BLOCK_${index}__`, html)
    })

    return processed
  }

  return (
    <div 
      ref={rootRef}
      style={{ lineHeight: 1.75, fontSize: '1.05rem', color: 'var(--ink)' }}
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} 
    />
  )
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

  async function toggleLike() {
    if (!post) return
    setError('')
    const wasLiked = post.liked
    const newLikes = wasLiked ? post.likes - 1 : post.likes + 1
    
    setPost({ ...post, liked: !wasLiked, likes: newLikes })
    try {
      const result = await communityApi<{ liked: boolean; likes: number }>('like', { postId: post.id })
      setPost(prev => prev ? { ...prev, liked: result.liked, likes: result.likes } : prev)
    } catch (caught) {
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
      
      {post.hasImage && <img src={imageUrl(post.id, post.updatedAt)} alt="" style={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 16, marginBottom: 22 }} />}
      
      {/* İŞTE YENİ ZENGİN METİN BİLEŞENİMİZ BURADA ÇALIŞIYOR */}
      <MarkdownRenderer content={post.body} />

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
