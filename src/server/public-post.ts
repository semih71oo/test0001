import { env } from 'cloudflare:workers'

// Yalnızca SSR sırasında (sunucuda) çalışır: yazıyı HTTP isteği atmadan doğrudan D1'den okur.
// Giriş yapan kullanıcıya özel bilgiler (viewer, beğeni durumu) burada yoktur;
// sayfa tarayıcıda açılınca zaten /api/community/post ile yenilenir.

type Bindings = { DB: D1Database }

function roleName(role?: string | null, isAdmin?: number | null): string {
  const r = (role ?? '').trim().toLowerCase()
  if (isAdmin === 1 || r === 'kurucu' || r === 'founder') return 'Kurucu'
  if (r === 'admin') return 'Admin'
  if (r === 'baş moderatör' || r === 'bas moderator' || r === 'head mod') return 'Baş Moderatör'
  if (r === 'moderatör' || r === 'moderator' || r === 'mod') return 'Moderatör'
  if (r === 'özel üye' || r === 'ozel uye' || r === 'vip') return 'Özel Üye'
  return 'Üye'
}

export async function getPublicPost(id: string): Promise<{ post: any; error: string | null }> {
  if (!id) return { post: null, error: 'missing' }
  const DB = (env as unknown as Bindings).DB

  const p = await DB.prepare(
    `SELECT p.id, p.title, p.body, p.created_at, p.updated_at, m.username AS author_name,
            EXISTS(SELECT 1 FROM post_images i WHERE i.post_id = p.id) AS has_image
       FROM posts p LEFT JOIN members m ON m.id = p.member_id WHERE p.id = ?1`,
  ).bind(id).first<any>()

  if (!p) return { post: null, error: 'missing' }

  const [likes, comments] = await Promise.all([
    DB.prepare('SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?1').bind(id).first<{ n: number }>(),
    DB.prepare(
      'SELECT c.id, c.body, c.created_at, c.edited_at, c.member_id, m.username, m.role, m.is_admin FROM comments c JOIN members m ON m.id = c.member_id WHERE c.post_id = ?1 ORDER BY c.created_at ASC LIMIT 500',
    ).bind(id).all<any>(),
  ])

  return {
    error: null,
    post: {
      id: p.id,
      title: p.title,
      body: p.body,
      authorName: p.author_name,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      hasImage: !!p.has_image,
      likes: likes?.n ?? 0,
      liked: false,
      comments: (comments.results ?? []).map((c: any) => ({
        id: c.id,
        body: c.body,
        createdAt: c.created_at,
        editedAt: c.edited_at ?? null,
        memberId: c.member_id,
        username: c.username,
        role: roleName(c.role, c.is_admin),
      })),
      viewer: null,
    },
  }
}
