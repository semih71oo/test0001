import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

type Bindings = { DB: D1Database; SETUP_TOKEN?: string; RESEND_API_KEY?: string }
const DB = () => (env as unknown as Bindings).DB
const SETUP_TOKEN = () => (env as unknown as Bindings).SETUP_TOKEN
const RESEND_API_KEY = () => (env as unknown as Bindings).RESEND_API_KEY

const ROLES = ['Kurucu', 'Admin', 'Moderatör', 'Developer', 'Tasarımcı']
const CODE_TTL_MS = 48 * 60 * 60 * 1000
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const COOKIE = 'sa_session'
const SITE_URL = 'https://semihalgan.com.tr'
const RESET_TTL_MS = 30 * 60 * 1000
const RESET_FROM = 'Semih Algan <noreply@mail.semihalgan.com.tr>'

let resetTableReady = false
async function ensureResetTable() {
  if (resetTableReady) return
  await DB().prepare('CREATE TABLE IF NOT EXISTS reset_tokens (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at INTEGER NOT NULL)').run()
  resetTableReady = true
}

let dbMigrated = false
async function runMigrations() {
  if (dbMigrated) return
  try {
    await DB().prepare("ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'Üye'").run()
  } catch {}
  try {
    await DB().prepare("UPDATE members SET role = 'Kurucu' WHERE is_admin = 1 OR LOWER(role) = 'founder' OR LOWER(role) = 'kurucu'").run()
  } catch {}
  try {
    await DB().prepare('ALTER TABLE comments ADD COLUMN edited_at INTEGER DEFAULT NULL').run()
  } catch {}
  try {
    await DB().prepare(`
      CREATE TABLE IF NOT EXISTS site_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `).run()
  } catch {}
  dbMigrated = true
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  })

const enc = new TextEncoder()
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromB64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))
const sha256 = async (text: string) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)))

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256)
}
async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `${toB64(salt)}:${toB64(await derive(password, salt))}`
}
async function verifyPassword(password: string, stored: string | null) {
  const [s, h] = (stored ?? `${toB64(new Uint8Array(16))}:${toB64(new Uint8Array(32))}`).split(':')
  const a = new Uint8Array(await derive(password, fromB64(s)))
  const b = fromB64(h)
  let diff = a.length ^ b.length
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ (b[i] ?? 0)
  return stored !== null && diff === 0
}

const generateCode = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => ALPHABET[b % 32]).join('')
const formatCode = (c: string) => c.match(/.{4}/g)!.join('-')
const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')
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

type SessionRow = { id: string; username: string; email: string; status: 'pending' | 'active'; is_admin: number; role: string; created_at: string }

function getRoleInfo(role?: string | null, isAdmin?: number): { role: string; level: number } {
  const r = (role ?? '').trim().toLowerCase()
  if (isAdmin === 1 || r === 'kurucu' || r === 'founder') return { role: 'Kurucu', level: 5 }
  if (r === 'admin') return { role: 'Admin', level: 4 }
  if (r === 'baş moderatör' || r === 'bas moderator' || r === 'head mod') return { role: 'Baş Moderatör', level: 3 }
  if (r === 'moderatör' || r === 'moderator' || r === 'mod') return { role: 'Moderatör', level: 2 }
  if (r === 'özel üye' || r === 'ozel uye' || r === 'vip') return { role: 'Özel Üye', level: 1 }
  return { role: 'Üye', level: 0 }
}

const roleLevels: Record<string, number> = { 'Üye': 0, 'Özel Üye': 1, 'Moderatör': 2, 'Baş Moderatör': 3, 'Admin': 4, 'Kurucu': 5 }

async function isMaintenanceOn() {
  const row = await first<{ value: string }>('SELECT value FROM settings WHERE key = \'maintenance_on\'')
  return row?.value === '1'
}

async function currentSession(request: Request) {
  const token = readCookie(request, COOKIE)
  if (!token) return null
  const row = await first<SessionRow>(
    `SELECT m.id, m.username, m.email, m.status, m.is_admin, m.role, m.created_at
       FROM sessions s JOIN members m ON m.id = s.member_id
      WHERE s.token_hash = ?1 AND s.expires_at > ?2 AND m.status = 'active'`,
    await sha256(token), Date.now(),
  )
  if (!row) return null
  const info = getRoleInfo(row.role, row.is_admin)
  row.role = info.role
  if (info.level < 4 && (await isMaintenanceOn())) return null
  return row
}

async function requireSession(request: Request) {
  const s = await currentSession(request)
  if (!s) throw new HttpError('Oturum bulunamadı. Lütfen giriş yap.', 401)
  return s
}

async function requireRole(request: Request, minLevel: number) {
  const s = await requireSession(request)
  const info = getRoleInfo(s.role, s.is_admin)
  if (info.level < minLevel) throw new HttpError('Bu işlem için yetkiniz yok.', 403)
  return s
}

const memberDto = (m: any) => {
  const info = getRoleInfo(m.role, m.is_admin)
  return { id: m.id, username: m.username, email: m.email, status: m.status, createdAt: m.created_at, role: info.role }
}

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

const IMAGE_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/
const MAX_IMAGE_CHARS = 900_000
const fmtDate = (ms: number) => new Date(ms).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
const clientIp = (request: Request) => request.headers.get('CF-Connecting-IP') ?? 'unknown'
const ipHashOf = (request: Request) => sha256(`sa-ip-v1:${clientIp(request)}`)

async function isIpBanned(ipHash: string) {
  return !!(await first('SELECT 1 FROM bans WHERE kind = \'ip\' AND ip_hash = ?1 AND (expires_at IS NULL OR expires_at > ?2) LIMIT 1', ipHash, Date.now()))
}

async function activeCommentBan(memberId: string) {
  return first<{ expires_at: number | null }>(
    'SELECT expires_at FROM bans WHERE kind = \'comment\' AND member_id = ?1 AND (expires_at IS NULL OR expires_at > ?2) ORDER BY expires_at IS NULL DESC, expires_at DESC LIMIT 1',
    memberId, Date.now(),
  )
}

async function voterKey(request: Request, s: SessionRow | null) {
  return s ? `m:${s.id}` : `i:${await ipHashOf(request)}`
}

const queryParam = (request: Request, name: string) => new URL(request.url).searchParams.get(name) ?? ''
type Handler = (request: Request, body: any) => Promise<Response>

const actions: Record<string, { method: 'GET' | 'POST'; run: Handler }> = {
  developers: {
    method: 'GET',
    run: async () => json(await all('SELECT id, name, role FROM developers ORDER BY created_at ASC')),
  },

  session: {
    method: 'GET',
    run: async request => {
      const s = await requireSession(request)
      const info = getRoleInfo(s.role, s.is_admin)
      return json({ profile: memberDto(s), isAdmin: info.level >= 4, isMod: info.level >= 2 })
    },
  },

  members: {
    method: 'GET',
    run: async request => {
      await requireRole(request, 4)
      const rows = await all<any>('SELECT id, username, email, status, role, created_at, is_admin FROM members ORDER BY created_at DESC')
      return json(rows.map(memberDto))
    },
  },

  'set-role': {
    method: 'POST',
    run: async (request, body) => {
      const s = await requireRole(request, 4)
      const targetId = String(body.id ?? '')
      const newRole = String(body.role ?? '')
      if (!Object.keys(roleLevels).includes(newRole)) throw new HttpError('Geçersiz rol.')
      if (targetId === s.id) throw new HttpError('Kendi rolünüzü değiştiremezsiniz.', 400)

      const target = await first<{ role: string; is_admin: number }>('SELECT role, is_admin FROM members WHERE id = ?1', targetId)
      if (!target) throw new HttpError('Kullanıcı bulunamadı.', 404)

      const callerLevel = getRoleInfo(s.role, s.is_admin).level
      const targetLevel = getRoleInfo(target.role, target.is_admin).level
      const newLevel = getRoleInfo(newRole).level

      if (callerLevel < 5) {
        if (targetLevel >= 4) throw new HttpError('Diğer adminlerin veya kurucunun rolü değiştirilemez.', 403)
        if (newLevel >= 4) throw new HttpError('Yalnızca Kurucu yeni bir Admin atayabilir.', 403)
      }

      await run('UPDATE members SET role = ?1 WHERE id = ?2', newRole, targetId)
      return json({ ok: true })
    },
  },

  invite: {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const username = String(body.username ?? '').trim().toLowerCase()
      const email = String(body.email ?? '').trim().toLowerCase()
      if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) throw new HttpError('Kullanıcı adı 3–32 karakter olmalı (a-z, 0-9, nokta, tire, alt çizgi).')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new HttpError('Geçerli bir e-posta adresi gir.')
      if (await first('SELECT 1 FROM members WHERE username = ?1', username)) throw new HttpError('Bu kullanıcı adı zaten alınmış.', 409)
      const id = crypto.randomUUID()
      await run('INSERT INTO members (id, username, email, status, is_admin, role, created_at) VALUES (?1, ?2, ?3, \'pending\', 0, \'Üye\', ?4)', id, username, email, new Date().toISOString())
      return json({ ...(await issueCode(id)), username })
    },
  },

  reissue: {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const member = await first<{ id: string; username: string }>('SELECT id, username FROM members WHERE id = ?1 AND status = \'pending\'', String(body.id ?? ''))
      if (!member) throw new HttpError('Bekleyen hesap bulunamadı.', 404)
      return json({ ...(await issueCode(member.id)), username: member.username })
    },
  },

  'check-code': {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'code', 10, 15 * 60)
      const { username } = await findValidCode(body.code)
      return json({ username })
    },
  },

  activate: {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'code', 10, 15 * 60)
      const password = validatePassword(body.password)
      const { member_id, username, hash } = await findValidCode(body.code)
      const passwordHash = await hashPassword(password)
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
        ? await first<{ id: string; password_hash: string; role: string; is_admin: number }>('SELECT id, password_hash, role, is_admin FROM members WHERE email = ?1 AND status = \'active\'', identifier)
        : await first<{ id: string; password_hash: string; role: string; is_admin: number }>('SELECT id, password_hash, role, is_admin FROM members WHERE username = ?1 AND status = \'active\'', identifier)
      if (!(await verifyPassword(password, member?.password_hash ?? null)) || !member) throw new HttpError('Kullanıcı adı veya şifre hatalı.', 401)

      const info = getRoleInfo(member.role, member.is_admin)
      if (info.level < 4 && (await isMaintenanceOn())) throw new HttpError('Site bakımda. Şu an yalnızca yönetici giriş yapabilir.', 503)

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
      const token = readCookie(request, COOKIE)
      await run('DELETE FROM sessions WHERE member_id = ?1 AND token_hash != ?2', s.id, token ? await sha256(token) : '')
      return json({ ok: true })
    },
  },

  recover: {
    method: 'POST',
    run: async (request, body) => {
      if (await isMaintenanceOn()) throw new HttpError('Site bakımda. Şu an şifre sıfırlama yapılamıyor.', 503)
      await rateLimit(request, 'recover', 5, 15 * 60)
      await ensureResetTable()
      const identifier = String(body.username ?? '').trim().toLowerCase()
      const founder = !!body.founder
      const member = founder
        ? await first<{ id: string; email: string }>('SELECT id, email FROM members WHERE email = ?1 AND status = \'active\'', identifier)
        : await first<{ id: string; email: string }>('SELECT id, email FROM members WHERE username = ?1 AND status = \'active\'', identifier)
      if (member) {
        const token = randomToken()
        await run('DELETE FROM reset_tokens WHERE member_id = ?1', member.id)
        await run('INSERT INTO reset_tokens (token_hash, member_id, expires_at) VALUES (?1, ?2, ?3)', await sha256(token), member.id, Date.now() + RESET_TTL_MS)
        const link = `${SITE_URL}/giris?reset=${encodeURIComponent(token)}`
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${RESEND_API_KEY()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: RESET_FROM,
              to: member.email,
              subject: 'Şifre sıfırlama bağlantın',
              html: `<div style="font-family:sans-serif;max-width:480px"><h2>Şifreni sıfırla</h2><p>Şifreni yenilemek için aşağıdaki butona tıkla. Bağlantı 30 dakika geçerlidir ve tek kullanımlıktır.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Şifremi sıfırla</a></p><p style="color:#666;font-size:13px">Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p></div>`,
            }),
          })
          if (!res.ok) console.error('Resend hatası:', res.status, await res.text())
        } catch (err) {
          console.error('Resend isteği başarısız:', err)
        }
      }
      return json({ ok: true })
    },
  },

  'reset-password': {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'reset', 10, 15 * 60)
      await ensureResetTable()
      const password = validatePassword(body.password)
      const token = String(body.token ?? '')
      if (!token) throw new HttpError('Bağlantı geçersiz veya süresi dolmuş.')
      const tokenHash = await sha256(token)
      const row = await first<{ member_id: string }>('SELECT member_id FROM reset_tokens WHERE token_hash = ?1 AND expires_at > ?2', tokenHash, Date.now())
      if (!row) throw new HttpError('Bağlantı geçersiz veya süresi dolmuş.')
      const consumed = await run('DELETE FROM reset_tokens WHERE token_hash = ?1', tokenHash)
      if (consumed.meta.changes !== 1) throw new HttpError('Bağlantı geçersiz veya süresi dolmuş.')
      await run('UPDATE members SET password_hash = ?1 WHERE id = ?2', await hashPassword(password), row.member_id)
      await run('DELETE FROM sessions WHERE member_id = ?1', row.member_id)
      return json({ ok: true })
    },
  },

  'save-developer': {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
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
      await requireRole(request, 4)
      await run('DELETE FROM developers WHERE id = ?1', String(body.id ?? ''))
      return json({ ok: true })
    },
  },

  maintenance: {
    method: 'GET',
    run: async request => {
      const rows = await all<{ key: string; value: string }>('SELECT key, value FROM settings WHERE key IN (\'maintenance_on\', \'maintenance_message\')')
      const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
      const viewer = await currentSession(request)
      const info = getRoleInfo(viewer?.role, viewer?.is_admin)
      return json({ on: map.maintenance_on === '1', message: map.maintenance_message ?? '', viewerIsAdmin: info.level >= 4 })
    },
  },

  'set-maintenance': {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const on = body.on === true
      const message = String(body.message ?? '').trim().slice(0, 200)
      await DB().batch([
        DB().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (\'maintenance_on\', ?1)').bind(on ? '1' : '0'),
        DB().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (\'maintenance_message\', ?1)').bind(message),
      ])
      return json({ ok: true })
    },
  },

  posts: {
    method: 'GET',
    run: async () => {
      const rows = await all<any>(
        `SELECT p.id, p.title, substr(p.body, 1, 200) AS excerpt, p.created_at, p.updated_at,
                EXISTS(SELECT 1 FROM post_images i WHERE i.post_id = p.id) AS has_image,
                (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS likes,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments
           FROM posts p ORDER BY p.created_at DESC LIMIT 50`,
      )
      return json(rows.map(r => ({ id: r.id, title: r.title, excerpt: r.excerpt, createdAt: r.created_at, updatedAt: r.updated_at, hasImage: !!r.has_image, likes: r.likes, comments: r.comments })))
    },
  },

  post: {
    method: 'GET',
    run: async request => {
      const id = queryParam(request, 'id')
      const p = await first<any>('SELECT id, title, body, created_at, updated_at, EXISTS(SELECT 1 FROM post_images i WHERE i.post_id = posts.id) AS has_image FROM posts WHERE id = ?1', id)
      if (!p) throw new HttpError('Yazı bulunamadı.', 404)
      const s = await currentSession(request)
      const voter = await voterKey(request, s)
      const likes = await first<{ n: number }>('SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?1', id)
      const liked = await first('SELECT 1 FROM post_likes WHERE post_id = ?1 AND voter = ?2', id, voter)
      const comments = await all<any>('SELECT c.id, c.body, c.created_at, c.edited_at, c.member_id, m.username, m.role, m.is_admin FROM comments c JOIN members m ON m.id = c.member_id WHERE c.post_id = ?1 ORDER BY c.created_at ASC LIMIT 500', id)
      const ban = s ? await activeCommentBan(s.id) : null
      return json({
        id: p.id, title: p.title, body: p.body, createdAt: p.created_at, updatedAt: p.updated_at, hasImage: !!p.has_image,
        likes: likes?.n ?? 0, liked: !!liked,
        comments: comments.map(c => ({
          id: c.id,
          body: c.body,
          createdAt: c.created_at,
          editedAt: c.edited_at ?? null,
          memberId: c.member_id,
          username: c.username,
          role: getRoleInfo(c.role, c.is_admin).role,
        })),
        viewer: s ? {
          id: s.id,
          username: s.username,
          isAdmin: getRoleInfo(s.role, s.is_admin).level >= 4,
          isMod: getRoleInfo(s.role, s.is_admin).level >= 2,
          commentBan: ban ? { until: ban.expires_at } : null,
        } : null,
      })
    },
  },

  'post-image': {
    method: 'GET',
    run: async request => {
      const row = await first<{ mime: string; data: string }>('SELECT mime, data FROM post_images WHERE post_id = ?1', queryParam(request, 'id'))
      if (!row) throw new HttpError('Görsel bulunamadı.', 404)
      return new Response(fromB64(row.data), { headers: { 'Content-Type': row.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } })
    },
  },

  like: {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'like', 60, 600)
      const postId = String(body.postId ?? '')
      if (!(await first('SELECT 1 FROM posts WHERE id = ?1', postId))) throw new HttpError('Yazı bulunamadı.', 404)
      const voter = await voterKey(request, await currentSession(request))
      const removed = await run('DELETE FROM post_likes WHERE post_id = ?1 AND voter = ?2', postId, voter)
      let liked = false
      if (removed.meta.changes === 0) {
        await run('INSERT OR IGNORE INTO post_likes (post_id, voter, created_at) VALUES (?1, ?2, ?3)', postId, voter, Date.now())
        liked = true
      }
      const n = await first<{ n: number }>('SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?1', postId)
      return json({ liked, likes: n?.n ?? 0 })
    },
  },

  comment: {
    method: 'POST',
    run: async (request, body) => {
      const s = await requireSession(request)
      const ban = await activeCommentBan(s.id)
      if (ban) throw new HttpError(ban.expires_at ? `Yorum yapman ${fmtDate(ban.expires_at)} tarihine kadar kısıtlandı.` : 'Yorum yapman kalıcı olarak kısıtlandı.', 403)
      await rateLimit(request, 'comment', 10, 600)
      const text = String(body.body ?? '').trim()
      if (text.length < 1 || text.length > 1000) throw new HttpError('Yorum 1–1000 karakter olmalı.')
      const postId = String(body.postId ?? '')
      if (!(await first('SELECT 1 FROM posts WHERE id = ?1', postId))) throw new HttpError('Yazı bulunamadı.', 404)
      await run('INSERT INTO comments (id, post_id, member_id, body, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)', crypto.randomUUID(), postId, s.id, text, await ipHashOf(request), Date.now())
      return json({ ok: true })
    },
  },

  'edit-comment': {
    method: 'POST',
    run: async (request, body) => {
      const s = await requireSession(request)
      const ban = await activeCommentBan(s.id)
      if (ban) throw new HttpError(ban.expires_at ? `Yorum yapman ${fmtDate(ban.expires_at)} tarihine kadar kısıtlandı.` : 'Yorum yapman kalıcı olarak kısıtlandı.', 403)
      const commentId = String(body.id ?? '')
      const text = String(body.body ?? '').trim()
      if (text.length < 1 || text.length > 1000) throw new HttpError('Yorum 1–1000 karakter olmalı.')
      const existing = await first<{ id: string; member_id: string }>('SELECT id, member_id FROM comments WHERE id = ?1', commentId)
      if (!existing) throw new HttpError('Yorum bulunamadı.', 404)

      const callerLevel = getRoleInfo(s.role, s.is_admin).level
      if (existing.member_id !== s.id) {
        if (callerLevel < 4) throw new HttpError('Yalnızca kendi yorumunuzu düzenleyebilirsiniz.', 403)
        const targetMember = await first<{ role: string; is_admin: number }>('SELECT role, is_admin FROM members WHERE id = ?1', existing.member_id)
        const targetLevel = targetMember ? getRoleInfo(targetMember.role, targetMember.is_admin).level : 0
        if (targetLevel >= callerLevel) throw new HttpError('Kendi seviyenizdeki veya üstünüzdeki hesapların yorumlarını düzenleyemezsiniz.', 403)
      }

      await run('UPDATE comments SET body = ?1, edited_at = ?2 WHERE id = ?3', text, Date.now(), commentId)
      return json({ ok: true })
    },
  },

  'save-post': {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const title = String(body.title ?? '').trim()
      const text = String(body.body ?? '').trim()
      if (title.length < 3 || title.length > 120) throw new HttpError('Başlık 3–120 karakter olmalı.')
      if (text.length < 1 || text.length > 10000) throw new HttpError('Metin 1–10.000 karakter olmalı.')
      let image: { mime: string; data: string } | null = null
      if (typeof body.image === 'string' && body.image) {
        const m = body.image.length <= MAX_IMAGE_CHARS ? IMAGE_RE.exec(body.image) : null
        if (!m) throw new HttpError('Fotoğraf geçersiz ya da çok büyük.')
        image = { mime: m[1], data: m[2] }
      }
      const now = Date.now()
      let id = String(body.id ?? '')
      if (id) {
        const updated = await run('UPDATE posts SET title = ?1, body = ?2, updated_at = ?3 WHERE id = ?4', title, text, now, id)
        if (updated.meta.changes !== 1) throw new HttpError('Yazı bulunamadı.', 404)
      } else {
        id = crypto.randomUUID()
        await run('INSERT INTO posts (id, title, body, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)', id, title, text, now)
      }
      if (image) await run('INSERT OR REPLACE INTO post_images (post_id, mime, data) VALUES (?1, ?2, ?3)', id, image.mime, image.data)
      else if (body.removeImage) await run('DELETE FROM post_images WHERE post_id = ?1', id)
      return json({ ok: true, id })
    },
  },

  'delete-post': {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const id = String(body.id ?? '')
      await DB().batch([
        DB().prepare('DELETE FROM post_images WHERE post_id = ?1').bind(id),
        DB().prepare('DELETE FROM post_likes WHERE post_id = ?1').bind(id),
        DB().prepare('DELETE FROM comments WHERE post_id = ?1').bind(id),
        DB().prepare('DELETE FROM posts WHERE id = ?1').bind(id),
      ])
      return json({ ok: true })
    },
  },

  'comments-admin': {
    method: 'GET',
    run: async request => {
      await requireRole(request, 2)
      const rows = await all<any>(
        `SELECT c.id, c.body, c.created_at, c.edited_at, c.ip_hash, m.id AS member_id, m.username, m.role, m.is_admin, p.title AS post_title,
                EXISTS(SELECT 1 FROM bans b WHERE b.kind = 'comment' AND b.member_id = m.id AND (b.expires_at IS NULL OR b.expires_at > ?1)) AS comment_banned
           FROM comments c JOIN members m ON m.id = c.member_id JOIN posts p ON p.id = c.post_id
          ORDER BY c.created_at DESC LIMIT 100`,
        Date.now(),
      )
      return json(rows.map(r => ({
        id: r.id,
        body: r.body,
        createdAt: r.created_at,
        editedAt: r.edited_at ?? null,
        username: r.username,
        role: getRoleInfo(r.role, r.is_admin).role,
        memberId: r.member_id,
        postTitle: r.post_title,
        ipTag: String(r.ip_hash).slice(0, 8),
        commentBanned: !!r.comment_banned,
      })))
    },
  },

  'delete-comment': {
    method: 'POST',
    run: async (request, body) => {
      const s = await requireSession(request)
      const commentId = String(body.id ?? '')
      const existing = await first<{ member_id: string }>('SELECT member_id FROM comments WHERE id = ?1', commentId)
      if (!existing) throw new HttpError('Yorum bulunamadı.', 404)

      const callerLevel = getRoleInfo(s.role, s.is_admin).level
      if (existing.member_id !== s.id) {
        if (callerLevel < 2) throw new HttpError('Bu yorumu silme yetkiniz yok.', 403)
        const targetMember = await first<{ role: string; is_admin: number }>('SELECT role, is_admin FROM members WHERE id = ?1', existing.member_id)
        const targetLevel = targetMember ? getRoleInfo(targetMember.role, targetMember.is_admin).level : 0
        if (targetLevel >= callerLevel) throw new HttpError('Kendi seviyenizdeki veya üstünüzdeki hesapların yorumlarını silemezsiniz.', 403)
      }

      await run('DELETE FROM comments WHERE id = ?1', commentId)
      return json({ ok: true })
    },
  },

  ban: {
    method: 'POST',
    run: async (request, body) => {
      const s = await requireRole(request, 2)
      const kind = body.kind === 'ip' ? 'ip' : body.kind === 'comment' ? 'comment' : null
      if (!kind) throw new HttpError('Geçersiz yasak türü.')
      const hours = body.hours === null || body.hours === undefined || body.hours === '' ? null : Number(body.hours)
      if (hours !== null && (!Number.isFinite(hours) || hours < 1 || hours > 24 * 365)) throw new HttpError('Süre 1 saat ile 1 yıl arasında olmalı. Süresiz için boş bırak.')
      const expiresAt = hours === null ? null : Date.now() + Math.round(hours * 3600000)
      const reason = String(body.reason ?? '').trim().slice(0, 200) || null
      const comment = body.commentId ? await first<{ member_id: string; ip_hash: string }>('SELECT member_id, ip_hash FROM comments WHERE id = ?1', String(body.commentId)) : null
      if (body.commentId && !comment) throw new HttpError('Yorum bulunamadı.', 404)
      const id = crypto.randomUUID()

      if (kind === 'comment') {
        const memberId = comment?.member_id ?? String(body.memberId ?? '')
        if (memberId === s.id) throw new HttpError('Kendinize yasak uygulayamazsınız.')
        
        const target = await first<{ id: string; role: string; is_admin: number }>('SELECT id, role, is_admin FROM members WHERE id = ?1', memberId)
        if (!target) throw new HttpError('Hesap bulunamadı.', 404)

        const targetLevel = getRoleInfo(target.role, target.is_admin).level
        const callerLevel = getRoleInfo(s.role, s.is_admin).level
        if (targetLevel >= callerLevel) throw new HttpError('Kendi seviyenizdeki veya üstünüzdeki hesapları yasaklayamazsınız.')

        await run('DELETE FROM bans WHERE kind = \'comment\' AND member_id = ?1', target.id)
        await run('INSERT INTO bans (id, kind, member_id, ip_hash, expires_at, reason, created_at) VALUES (?1, \'comment\', ?2, NULL, ?3, ?4, ?5)', id, target.id, expiresAt, reason, Date.now())
      } else {
        if (!comment) throw new HttpError('IP yasağı için bir yorum seçmelisin.')
        if (comment.ip_hash === (await ipHashOf(request))) throw new HttpError('Kendi bağlantınızı yasaklayamazsınız.')
        if (comment.member_id === s.id) throw new HttpError('Kendi bağlantınızı yasaklayamazsınız.')
        
        const target = await first<{ role: string; is_admin: number }>('SELECT role, is_admin FROM members WHERE id = ?1', comment.member_id)
        const targetLevel = target ? getRoleInfo(target.role, target.is_admin).level : 0
        const callerLevel = getRoleInfo(s.role, s.is_admin).level
        if (targetLevel >= callerLevel) throw new HttpError('Kendi seviyenizdeki veya üstünüzdeki hesapların bağlantısını yasaklayamazsınız.')

        await run('DELETE FROM bans WHERE kind = \'ip\' AND ip_hash = ?1', comment.ip_hash)
        await run('INSERT INTO bans (id, kind, member_id, ip_hash, expires_at, reason, created_at) VALUES (?1, \'ip\', NULL, ?2, ?3, ?4, ?5)', id, comment.ip_hash, expiresAt, reason, Date.now())
      }
      return json({ ok: true })
    },
  },

  bans: {
    method: 'GET',
    run: async request => {
      await requireRole(request, 2)
      const rows = await all<any>(
        `SELECT b.id, b.kind, b.ip_hash, b.expires_at, b.reason, b.created_at, m.username
           FROM bans b LEFT JOIN members m ON m.id = b.member_id
          WHERE b.expires_at IS NULL OR b.expires_at > ?1 ORDER BY b.created_at DESC`,
        Date.now(),
      )
      return json(rows.map(r => ({ id: r.id, kind: r.kind, username: r.username ?? null, ipTag: r.ip_hash ? String(r.ip_hash).slice(0, 8) : null, expiresAt: r.expires_at, reason: r.reason, createdAt: r.created_at })))
    },
  },

  unban: {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 2)
      await run('DELETE FROM bans WHERE id = ?1', String(body.id ?? ''))
      return json({ ok: true })
    },
  },

  updates: {
    method: 'GET',
    run: async () => {
      const rows = await all<any>('SELECT id, title, description, created_at, updated_at FROM site_updates ORDER BY id DESC')
      return json(rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })))
    },
  },

  'save-update': {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const title = String(body.title ?? '').trim()
      const description = typeof body.description === 'string' ? body.description.trim() : null
      if (title.length < 2 || title.length > 150) throw new HttpError('Güncelleme başlığı 2–150 karakter olmalı.')
      if (description && description.length > 5000) throw new HttpError('Açıklama 5000 karakterden uzun olamaz.')
      const now = Date.now()
      const id = body.id ? Number(body.id) : null

      if (id) {
        const updated = await run('UPDATE site_updates SET title = ?1, description = ?2, updated_at = ?3 WHERE id = ?4', title, description, now, id)
        if (updated.meta.changes !== 1) throw new HttpError('Güncelleme bulunamadı.', 404)
        return json({ ok: true, id })
      } else {
        const inserted = await run('INSERT INTO site_updates (title, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)', title, description, now)
        return json({ ok: true, id: inserted.meta.last_row_id })
      }
    },
  },

  'delete-update': {
    method: 'POST',
    run: async (request, body) => {
      await requireRole(request, 4)
      const id = Number(body.id)
      if (!id) throw new HttpError('Geçersiz güncelleme kimliği.')
      await run('DELETE FROM site_updates WHERE id = ?1', id)
      return json({ ok: true })
    },
  },

  bootstrap: {
    method: 'POST',
    run: async (request, body) => {
      await rateLimit(request, 'bootstrap', 5, 60 * 60)
      const secret = SETUP_TOKEN()
      if (!secret || body.token !== secret) throw new HttpError('Yetkisiz.', 403)
      if (await first('SELECT 1 FROM members WHERE is_admin = 1 OR role = \'Kurucu\' OR role = \'founder\'')) throw new HttpError('Admin zaten mevcut.', 409)
      const email = String(body.email ?? '').trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError('Geçerli bir e-posta gir.')
      const password = validatePassword(body.password)
      await run(
        'INSERT INTO members (id, username, email, status, is_admin, role, password_hash, created_at) VALUES (?1, \'admin\', ?2, \'active\', 1, \'Kurucu\', ?3, ?4)',
        crypto.randomUUID(), email, await hashPassword(password), new Date().toISOString(),
      )
      return json({ ok: true })
    },
  },
}

async function handle(request: Request, action: string) {
  try {
    await runMigrations()
    const entry = Object.hasOwn(actions, action) ? actions[action] : undefined
    if (!entry || entry.method !== request.method) throw new HttpError('Bulunamadı.', 404)
    if (await isIpBanned(await ipHashOf(request))) {
      const viewer = await currentSession(request)
      if (getRoleInfo(viewer?.role, viewer?.is_admin).level < 4) throw new HttpError('Bu bağlantıdan erişim kısıtlandı.', 403)
    }
    let body: any = {}
    if (request.method === 'POST') {
      const origin = request.headers.get('Origin')
      if (origin && new URL(origin).host !== new URL(request.url).host) throw new HttpError('Geçersiz istek kaynağı.', 403)
      if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) throw new HttpError('Geçersiz istek.', 415)
      if (Number(request.headers.get('Content-Length') ?? 0) > 1_200_000) throw new HttpError('İstek çok büyük.', 413)
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
