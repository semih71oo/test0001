import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Plus } from 'lucide-react'
import { PublicShell } from '../components/PublicShell'
import { communityApi } from '../lib/community'
import { formatDay, imageUrl } from '../lib/posts'
import type { PostSummary } from '../lib/posts'

export const Route = createFileRoute('/yazilar/')({
  loader: async () => {
    try {
      const posts = await communityApi<PostSummary[]>('posts?page=1')
      return { posts, error: null }
    } catch (error) {
      return { posts: [], error: 'Yazılar yüklenemedi.' }
    }
  },
  component: PostsPage,
  head: () => ({ 
    meta: [
      { title: 'Yazılar — Semih Algan' }, 
      { name: 'description', content: 'Semih Algan’ın yazıları ve duyuruları.' }
    ] 
  }),
})

function PostsPage() {
  const { posts: initialPosts, error } = Route.useLoaderData()
  
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20) // Limit 20'ydi

  // SSR sonrası sayfa değiştirilip geri gelindiğinde state'i senkronize tutmak için
  useEffect(() => {
    setPosts(initialPosts)
    setPage(1)
    setHasMore(initialPosts.length === 20)
  }, [initialPosts])

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const newPosts = await communityApi<PostSummary[]>(`posts?page=${nextPage}`)
      setPosts(prev => [...prev, ...newPosts])
      setPage(nextPage)
      if (newPosts.length < 20) setHasMore(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <PublicShell>
      <span className="section-eyebrow" style={{ display: 'block' }}>YAZILAR</span>
      <h1 style={{ margin: '8px 0 28px' }}>Yazılar<span className="heading-dot">.</span></h1>
      
      {error && <p className="message message-error" role="alert">{error}</p>}
      {!error && !posts.length && <p>Henüz bir yazı yok.</p>}
      
      <div style={{ display: 'grid', gap: 20 }}>
        {posts.map(post => (
          <a key={post.id} href={`/yazilar/${post.id}`} className="panel-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
            {post.hasImage && <img src={imageUrl(post.id, post.updatedAt)} alt="" loading="lazy" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }} />}
            <small style={{ opacity: .6 }}>{formatDay(post.createdAt)} {post.authorName ? `· ${post.authorName}` : ''}</small>
            <h2 style={{ margin: '6px 0 8px' }}>{post.title}</h2>
            <p style={{ margin: 0, opacity: .75, lineHeight: 1.55 }}>{post.excerpt}{post.excerpt.length >= 200 ? '…' : ''}</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, opacity: .7, fontSize: '.9rem' }}>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Heart size={15} />{post.likes}</span>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><MessageCircle size={15} />{post.comments}</span>
            </div>
          </a>
        ))}
      </div>

      {hasMore && (
        <button 
          onClick={loadMore} 
          disabled={loadingMore}
          className="button button-outline" 
          style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}>
          {loadingMore ? 'Yükleniyor...' : 'Daha fazla yükle'} <Plus size={16}/>
        </button>
      )}
    </PublicShell>
  )
}
