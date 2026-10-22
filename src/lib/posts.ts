export type PostSummary = { id: string; title: string; excerpt: string; createdAt: number; updatedAt: number; hasImage: boolean; likes: number; comments: number }

export type PostComment = {
  id: string
  body: string
  createdAt: number
  editedAt?: number | null
  username: string
  role: string
  memberId: string
}

export type PostDetail = {
  id: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
  hasImage: boolean
  likes: number
  liked: boolean
  comments: PostComment[]
  viewer: {
    id: string
    username: string
    isAdmin: boolean
    isMod: boolean
    commentBan: { until: number | null } | null
  } | null
}

export type SiteUpdate = {
  id: number
  title: string
  description?: string | null
  createdAt: number
  updatedAt: number
}

export type ModComment = { id: string; body: string; createdAt: number; username: string; role: string; memberId: string; postTitle: string; ipTag: string; commentBanned: boolean }
export type BanRow = { id: string; kind: 'ip' | 'comment'; username: string | null; ipTag: string | null; expiresAt: number | null; reason: string | null; createdAt: number }

export const imageUrl = (id: string, version: number) => `/api/community/post-image?id=${encodeURIComponent(id)}&v=${version}`
export const formatDate = (ms: number) => new Date(ms).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
export const formatDay = (ms: number) => new Date(ms).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

export const banDurations = [
  { value: '1', label: '1 saat' },
  { value: '24', label: '24 saat' },
  { value: '168', label: '7 gün' },
  { value: '720', label: '30 gün' },
  { value: 'perm', label: 'Süresiz' },
] as const
export const hoursOf = (value: string) => (value === 'perm' ? null : Number(value))
