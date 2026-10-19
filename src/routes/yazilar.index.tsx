import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { communityApi } from '../lib/community'
import { formatDay, imageUrl } from '../lib/posts'
import type { PostSummary } from '../lib/posts'

export const Route = createFileRoute('/yazilar/')({
  component: PostsPage,
  head: () => ({ meta: [{ title: 'Yazılar — Semih Algan' }, { name: 'description', content: 'Semih Algan’ın yazıları ve duyuruları.' }] }),
})

function PostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let active = true
    communityApi<PostSummary[]>('posts')
      .then(data => { if (active) { setPosts(data); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [])

  return (
    <PublicShell>
      <span className="section-eyebrow">YAZILAR</span>
      <h1 style={{ margin: '8px 0 28px' }}>Yazılar<span className="heading-dot">.</span></h1>
      {state === 'loading' && <p role="status">Yükleniyor…</p>}
      {state === 'error' && <p className="message message-error" role="alert">Yazılar şu an yüklenemiyor.</p>}
      {state === 'ready' && !posts.length && <p>Henüz bir yazı yok.</p>}
      <div style={{ display: 'grid', gap: 20 }}>
        {posts.map(post => (
          <a key={post.id} href={`/yazilar/${post.id}`} className="panel-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
            {post.hasImage && <img src={imageUrl(post.id, post.updatedAt)} alt="" loading="lazy" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }} />}
            <small style={{ opacity: .6 }}>{formatDay(post.createdAt)}</small>
            <h2 style={{ margin: '6px 0 8px' }}>{post.title}</h2>
            <p style={{ margin: 0, opacity: .75, lineHeight: 1.55 }}>{post.excerpt}{post.excerpt.length >= 200 ? '…' : ''}</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, opacity: .7, fontSize: '.9rem' }}>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Heart size={15} />{post.likes}</span>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><MessageCircle size={15} />{post.comments}</span>
            </div>
          </a>
        ))}
      </div>
    </PublicShell>
  )
}
