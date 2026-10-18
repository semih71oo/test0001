// Konum: src/routes/api/community/$action.ts
import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

type Bindings = { DB: D1Database; SETUP_TOKEN?: string }
const DB = () => (env as unknown as Bindings).DB
const SETUP_TOKEN = () => (env as unknown as Bindings).SETUP_TOKEN

const ROLES = ['Kurucu', 'Admin', 'Moderatör', 'Developer', 'Tasarımcı']
const CODE_TTL_MS = 48 * 60 * 60 * 1000
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const COOKIE = 'sa_session'
// 32 karakter (I, O, 0, 1 yok) => 256 % 32 = 0, rastgelelikte sapma yok
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })

/* ---------- kripto yardımcıları ---------- */
const enc = new TextEncoder()
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromB64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))
const sha256 = async (text: string) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)))

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  // Workers PBKDF2 üst sınırı 100.000 iterasyon
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256)
}
async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `${toB64(salt)}:${toB64(await derive(password, salt))}`
}
async function verifyPassword(password: string, stored: string | null) {
  // Kullanıcı yoksa da aynı süreyi harca (kullanıcı adı sızdırmamak için)
  const [s, h] = (stored ?? `${toB64(new Uint8Array(16))}:${toB64(new Uint8Array(32))}`).split(':')
  const a = new Uint8Array(await derive(password, fromB64(s)))
  const b = fromB64(h)
  let diff = a.length ^ b.length
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ (b[i] ?? 0)
  return stored !== null && diff === 0
}

/* ---------- 16 haneli kod ---------- */
const generateCode = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => ALPHABET[b % 32]).join('')
const formatCode = (c: string) => c.match(/.{4}/g)!.join('-')
const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

/* ---------- genel yardımcılar ---------- */
const randomToken = () => toB64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const first = <T>(sql: string, ...args: unknown[]) => DB().prepare(sql).bind(...args).first<T>()
const all = async <T>(sql: string, ...args: unknown[]) => (await DB().prepare(sql).bind(...args).all<T>()).results
const run = (sql: string, ...args: unknown[]) => DB().prepare(sql).bind(...args).run()

async function rateLimit(request: Request, bucket: string, max: number, windowSec: number) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const row = await first<{ count: number; reset_at: number }>('SELECT count, reset_at FROM rate_limits WHERE key = ?1', key)
  if (!row || row.reset_at < now) {
    await run('INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)', key, now + windowSec * 1000)
    return
  }
  if (row.count >= max) throw new HttpError('Çok fazla deneme yaptın. Biraz sonra tekrar dene.', 429)
  await run('UPDATE rate_limits SET count = count + 1 WHERE key = ?1', key)
}

function readCookie(request: Request, name: string) {
  const match = (request.headers.get('Cookie') ?? '').split(/;\s*/).find(p => p.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

type SessionRow = { id: string; username: string; email: string; status: 'pending' | 'active'; is_admin: number; created_at: string }

async function currentSession(request: Request) {
  const token = readCookie(request, COOKIE)
  if (!token) return null
  return first<SessionRow>(
    `SELECT m.id, m.username, m.email, m.status, m.is_admin, m.created_at
       FROM sessions s JOIN members m ON m.id = s.member_id
      WHERE s.token_hash = ?1 AND s.expires_at > ?2 AND m.status = 'active'`,
    await sha256(token), Date.now(),
  )
}
async function requireSession(request: Request) {
  const s = await currentSession(request)
  if (!s) throw new HttpError('Oturum bulunamadı. Lütfen giriş yap.', 401)
  return s
}
async function requireAdmin(request: Request) {
  const s = await requireSession(request)
  if (!s.is_admin) throw new HttpError('Bu işlem için yönetici yetkisi gerekiyor.', 403)
  return s
}

const memberDto = (m: { id: string; username: string; email: string; status: string; created_at: string }) =>
  ({ id: m.id, username: m.username, email: m.email, status: m.status, createdAt: m.created_at })

function validatePassword(p: unknown): string {
  if (typeof p !== 'string' || p.length < 12) throw new HttpError('Şifre en az 12 karakter olmalı.')
  if (p.length > 200) throw new HttpError('Şifre çok uzun.')
  return p
}

async function issueCode(memberId: string) {
  const code = generateCode()
  const expiresAt = Date.now() + CODE_TTL_MS
  await run(
    'INSERT OR REPLACE INTO activation_codes (member_id, code_hash, expires_at, used_at) VALUES (?1, ?2, ?3, NULL)',
    memberId, await sha256(code), expiresAt,
  )
  return { code: formatCode(code), expiresAt: new Date(expiresAt).toISOString() }
}

async function findValidCode(rawCode: unknown) {
  if (typeof rawCode !== 'string') throw new HttpError('Kod geçersiz veya süresi dolmuş.')
  const normalized = normalizeCode(rawCode)
  if (normalized.length !== 16) throw new HttpError('Kod 16 karakter olmalı.')
  const hash = await sha256(normalized)
  const row = await first<{ member_id: string; username: string }>(
    `SELECT c.member_id, m.username FROM activation_codes c JOIN members m ON m.id = c.member_id
      WHERE c.code_hash = ?1 AND c.used_at IS NULL AND c.expires_at > ?2 AND m.status = 'pending'`,
    hash, Date.now(),
  )
  if (!row) throw new HttpError('Kod geçersiz veya süresi dolmuş.')
  return { ...row, hash }
}

/* ---------- eylemler ---------- */
type Handler = (request: Request, body: any) => Promise<Response>

const actions: Record<string, { method: 'GET' | 'POST'; run: Handler }> = {
  // Herkese açık pano
  developers: {
    method: 'GET',
    run: async () => json(await all('SELECT id, name, role FROM developers ORDER BY created_at ASC')),
  },

  session: {
    method: 'GET',
    run: async request => {
      const s = await requireSession(request)
      return json({ profile: memberDto(s), isAdmin: !!s.is_admin })
    },
  },

  members: {
    method: 'GET',
    run: async request => {
      await requireAdmin(request)
      const rows = await all<any>('SELECT id, username, email, status, created_at FROM members WHERE is_admin = 0 ORDER BY created_at DESC')
      return json(rows.map(memberDto))
    },
  },

  // Admin: nick + e-posta gir -> 16 haneli kod üret
  invite: {
    method: 'POST',
    run: async (request, body) => {
      await requireAdmin(request)
      const username = String(body.username ?? '').trim().toLowerCase()
      const email = String(body.email ?? '').trim().toLowerCase()
      if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) throw new HttpError('Kullanıcı adı 3–32 karakter olmalı (a-z, 0-9, nokta, tire, alt çizgi).')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new HttpError('Geçerli bir e-posta adresi gir.')
      if (await first('SELECT 1 FROM members WHERE username = ?1', username)) throw new HttpError('Bu kullanıcı adı zaten alınmış.', 409)
      const id = crypto.randomUUID()
      await run('INSERT INTO members (id, username, email, status, is_admin, created_at) VALUES (?1, ?2, ?3, \'pending\', 0, ?4)', id, username, email, new Date().toISOString())
      return json({ ...(await issueCode(id)), username })
    },
  },

  // Admin: süresi dolan / kaybolan kod için yenisi (eskisi geçersiz olur)
  reissue: {
    method: 'POST',
    run: async (request, body) => {
      await requireAdmin(request)
      const member = await first<{ id: string; username: string }>('SELECT id, username FROM members WHERE id = ?1 AND status = \'pending\' AND is_admin = 0', String(body.id ?? ''))
      if (!member) throw new HttpError('Bekleyen hesap bulunamadı.', 404)
      return json({ ...(await issueCode(member.id)), username: member.username })
    },
  },

  // Kayıt ol 1. adım: kodu doğrula
  'check-code': {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'code', 10, 15 * 60)
      const { username } = await findValidCode(body.code)
      return json({ username })
    },
  },

  // Kayıt ol 2. adım: şifre belirle, kod tek kullanımlık olarak yanar
  activate: {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'code', 10, 15 * 60)
      const password = validatePassword(body.password)
      const { member_id, username, hash } = await findValidCode(body.code)
      const passwordHash = await hashPassword(password)
      // Atomik tüketim: iki kişi aynı anda deneyse yalnızca biri geçer
      const consumed = await run('UPDATE activation_codes SET used_at = ?1 WHERE code_hash = ?2 AND used_at IS NULL AND expires_at > ?1', Date.now(), hash)
      if (consumed.meta.changes !== 1) throw new HttpError('Kod geçersiz veya süresi dolmuş.')
      await run('UPDATE members SET password_hash = ?1, status = \'active\' WHERE id = ?2', passwordHash, member_id)
      return json({ username })
    },
  },

  login: {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'login', 10, 15 * 60)
      const identifier = String(body.username ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      const founder = !!body.founder
      const member = founder
        ? await first<{ id: string; password_hash: string }>('SELECT id, password_hash FROM members WHERE email = ?1 AND is_admin = 1 AND status = \'active\'', identifier)
        : await first<{ id: string; password_hash: string }>('SELECT id, password_hash FROM members WHERE username = ?1 AND is_admin = 0 AND status = \'active\'', identifier)
      if (!(await verifyPassword(password, member?.password_hash ?? null)) || !member) throw new HttpError('Kullanıcı adı veya şifre hatalı.', 401)
      const token = randomToken()
      await run('INSERT INTO sessions (token_hash, member_id, expires_at) VALUES (?1, ?2, ?3)', await sha256(token), member.id, Date.now() + SESSION_TTL_MS)
      return json({ ok: true }, 200, {
        'Set-Cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`,
      })
    },
  },

  logout: {
    method: 'POST',
    run: async request => {
      const token = readCookie(request, COOKIE)
      if (token) await run('DELETE FROM sessions WHERE token_hash = ?1', await sha256(token))
      return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` })
    },
  },

  'change-password': {
    method: 'POST',
    run: async (request, body) => {
      const s = await requireSession(request)
      const password = validatePassword(body.password)
      await run('UPDATE members SET password_hash = ?1 WHERE id = ?2', await hashPassword(password), s.id)
      // Diğer oturumları kapat, mevcut olanı koru
      const token = readCookie(request, COOKIE)
      await run('DELETE FROM sessions WHERE member_id = ?1 AND token_hash != ?2', s.id, token ? await sha256(token) : '')
      return json({ ok: true })
    },
  },

  // E-posta servisi olmadığı için şifre sıfırlama şimdilik yok; arayüzü bozmasın diye sabit cevap
  recover: {
    method: 'POST',
    run: async () => json({ ok: true }),
  },

  'save-developer': {
    method: 'POST',
    run: async (request, body) => {
      await requireAdmin(request)
      const name = String(body.name ?? '').trim()
      if (name.length < 2 || name.length > 80) throw new HttpError('İsim 2–80 karakter olmalı.')
      if (!ROLES.includes(body.role)) throw new HttpError('Geçersiz rol.')
      if (body.id) await run('UPDATE developers SET name = ?1, role = ?2 WHERE id = ?3', name, body.role, String(body.id))
      else await run('INSERT INTO developers (id, name, role, created_at) VALUES (?1, ?2, ?3, ?4)', crypto.randomUUID(), name, body.role, new Date().toISOString())
      return json({ ok: true })
    },
  },

  'delete-developer': {
    method: 'POST',
    run: async (request, body) => {
      await requireAdmin(request)
      await run('DELETE FROM developers WHERE id = ?1', String(body.id ?? ''))
      return json({ ok: true })
    },
  },

  // Tek seferlik: ilk admin hesabını oluşturur. SETUP_TOKEN secret'ı gerekir, admin varsa çalışmaz.
  bootstrap: {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'bootstrap', 5, 60 * 60)
      const secret = SETUP_TOKEN()
      if (!secret || body.token !== secret) throw new HttpError('Yetkisiz.', 403)
      if (await first('SELECT 1 FROM members WHERE is_admin = 1')) throw new HttpError('Admin zaten mevcut.', 409)
      const email = String(body.email ?? '').trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError('Geçerli bir e-posta gir.')
      const password = validatePassword(body.password)
      await run(
        'INSERT INTO members (id, username, email, status, is_admin, password_hash, created_at) VALUES (?1, \'admin\', ?2, \'active\', 1, ?3, ?4)',
        crypto.randomUUID(), email, await hashPassword(password), new Date().toISOString(),
      )
      return json({ ok: true })
    },
  },
}

async function handle(request: Request, action: string) {
  try {
    const entry = Object.hasOwn(actions, action) ? actions[action] : undefined
    if (!entry || entry.method !== request.method) throw new HttpError('Bulunamadı.', 404)
    let body: any = {}
    if (request.method === 'POST') {
      // CSRF: aynı origin + JSON zorunlu
      const origin = request.headers.get('Origin')
      if (origin && new URL(origin).host !== new URL(request.url).host) throw new HttpError('Geçersiz istek kaynağı.', 403)
      if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) throw new HttpError('Geçersiz istek.', 415)
      body = await request.json().catch(() => { throw new HttpError('Geçersiz istek gövdesi.') })
    }
    return await entry.run(request, body)
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status)
    console.error(error)
    return json({ error: 'Sunucu hatası. Lütfen tekrar dene.' }, 500)
  }
}

export const Route = createFileRoute('/api/community/$action')({
  server: {
    handlers: {
      GET: ({ request, params }: { request: Request; params: { action: string } }) => handle(request, params.action),
      POST: ({ request, params }: { request: Request; params: { action: string } }) => handle(request, params.action),
    },
  },
})
