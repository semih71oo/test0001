import { createHash, randomBytes } from 'node:crypto'
import { admin, AuthError, getUser, login, logout, MissingIdentityError, requestPasswordRecovery, verifyRequestOrigin } from '@netlify/identity'
import type { Config, Context } from '@netlify/functions'
import { and, asc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm'
import { z, ZodError } from 'zod'
import { getDb } from '../../db/index.js'
import { activations, authLimits, developers, profiles } from '../../db/schema.js'
import { developerRoles } from '../../src/lib/community.js'
import { hasAdminRole } from '../lib/authorization.js'

class RequestError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function reply(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

async function readBody(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new RequestError('Geçersiz istek biçimi.', 415)
  const raw = await request.text()
  if (Buffer.byteLength(raw) > 16384) throw new RequestError('İstek çok büyük.', 413)
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new RequestError('Geçersiz istek biçimi.')
  }
}

async function limitAttempts(key: string, maximum: number) {
  const db = getDb()
  const now = new Date()
  const resetsAt = new Date(now.getTime() + 15 * 60 * 1000)
  const [bucket] = await db.insert(authLimits).values({ key: hash(key), resetsAt }).onConflictDoUpdate({
    target: authLimits.key,
    set: {
      attempts: sql`case when ${authLimits.resetsAt} < ${now} then 1 else ${authLimits.attempts} + 1 end`,
      resetsAt: sql`case when ${authLimits.resetsAt} < ${now} then ${resetsAt} else ${authLimits.resetsAt} end`,
    },
  }).returning({ attempts: authLimits.attempts })
  if (!bucket || bucket.attempts > maximum) throw new RequestError('Çok fazla deneme yapıldı. 15 dakika sonra tekrar dene.', 429)
  await db.delete(authLimits).where(lt(authLimits.resetsAt, new Date(now.getTime() - 86400000)))
}

async function requireSession(adminOnly = false) {
  const user = await getUser()
  if (!user) throw new RequestError('Devam etmek için giriş yapmalısın.', 401)
  const isAdmin = hasAdminRole(user)
  if (adminOnly && !isAdmin) throw new RequestError('Bu işlem için yönetici yetkisi gerekiyor.', 403)
  const db = getDb()
  let [profile] = await db.select().from(profiles).where(eq(profiles.identityId, user.id)).limit(1)
  if (!profile && isAdmin && user.email) {
    const username = `kurucu-${user.id.replaceAll('-', '').slice(0, 12)}`
    await db.insert(profiles).values({ identityId: user.id, username, email: user.email.toLowerCase(), status: 'active' }).onConflictDoNothing()
    ;[profile] = await db.select().from(profiles).where(eq(profiles.identityId, user.id)).limit(1)
  }
  if (!profile || profile.status !== 'active') throw new RequestError('Hesabın henüz aktive edilmedi.', 403)
  return { profile, isAdmin }
}

const usernameSchema = z.string().trim().toLowerCase().min(3).max(32).regex(/^[a-z0-9][a-z0-9._-]*$/)
const passwordSchema = z.string().min(12).max(128)
const codeSchema = z.string().trim().min(20).max(100)

async function findActivation(code: string) {
  const db = getDb()
  const [record] = await db.select({ activation: activations, profile: profiles }).from(activations)
    .innerJoin(profiles, eq(activations.profileId, profiles.id))
    .where(and(eq(activations.codeHash, hash(code)), isNull(activations.usedAt), gt(activations.expiresAt, new Date()), eq(profiles.status, 'pending'))).limit(1)
  if (!record || !record.profile.identityId) throw new RequestError('Kod geçersiz, kullanılmış veya süresi dolmuş.', 400)
  return record
}

async function issueActivation(profileId: string) {
  const db = getDb()
  const code = randomBytes(24).toString('base64url')
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
  await db.transaction(async transaction => {
    const [profile] = await transaction.select().from(profiles).where(eq(profiles.id, profileId)).for('update')
    if (!profile || profile.status !== 'pending' || !profile.identityId) throw new RequestError('Yalnızca aktivasyon bekleyen hesaplar için kod oluşturulabilir.')
    await transaction.update(activations).set({ usedAt: new Date() }).where(and(eq(activations.profileId, profileId), isNull(activations.usedAt)))
    await transaction.insert(activations).values({ profileId, codeHash: hash(code), expiresAt })
  })
  return { code, expiresAt }
}

export default async (request: Request, context: Context) => {
  try {
    const action = context.params.action ?? new URL(request.url).pathname.split('/').pop()
    const db = getDb()
    if (request.method === 'GET') {
      if (action === 'developers') return reply(await db.select({ id: developers.id, name: developers.name, role: developers.role }).from(developers).orderBy(asc(developers.createdAt)).limit(100))
      if (action === 'session') return reply(await requireSession())
      if (action === 'members') {
        await requireSession(true)
        return reply(await db.select().from(profiles).orderBy(asc(profiles.createdAt)).limit(500))
      }
      throw new RequestError('Sayfa bulunamadı.', 404)
    }
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } })
    verifyRequestOrigin(request)
    const body = await readBody(request)

    if (action === 'login') {
      await limitAttempts(`login-ip:${context.ip}`, 30)
      const input = z.object({ username: z.string().trim().toLowerCase().min(1).max(254), password: z.string().min(1).max(128), founder: z.boolean().optional() }).parse(body)
      await limitAttempts(`login-user:${input.username}`, 10)
      const [profile] = await db.select().from(profiles).where(eq(profiles.username, input.username)).limit(1)
      const email = input.founder ? input.username : profile?.status === 'active' ? profile.email : undefined
      if (!email) throw new RequestError('Kullanıcı adı veya şifre yanlış.', 401)
      try {
        const user = await login(email, input.password)
        if (input.founder && !hasAdminRole(user)) {
          await logout()
          throw new RequestError('Kullanıcı adı veya şifre yanlış.', 401)
        }
        if (!input.founder && user.id !== profile?.identityId) {
          await logout()
          throw new RequestError('Kullanıcı adı veya şifre yanlış.', 401)
        }
        return reply({ ok: true })
      } catch (error) {
        await logout().catch(() => undefined)
        if (error instanceof MissingIdentityError) throw error
        throw new RequestError('Kullanıcı adı veya şifre yanlış.', 401)
      }
    }
    if (action === 'logout') {
      await logout()
      return reply({ ok: true })
    }
    if (action === 'recover') {
      await limitAttempts(`recovery:${context.ip}`, 5)
      const input = z.object({ username: z.string().trim().toLowerCase().min(1).max(254), founder: z.boolean().optional() }).parse(body)
      const [profile] = await db.select().from(profiles).where(eq(profiles.username, input.username)).limit(1)
      const email = input.founder ? input.username : profile?.status === 'active' ? profile.email : undefined
      if (email) await requestPasswordRecovery(email).catch(() => undefined)
      return reply({ ok: true })
    }
    if (action === 'check-code' || action === 'activate') {
      await limitAttempts(`activation:${context.ip}`, 20)
      const input = z.object({ code: codeSchema, password: passwordSchema.optional() }).parse(body)
      const record = await findActivation(input.code)
      if (action === 'check-code') return reply({ username: record.profile.username })
      const password = passwordSchema.parse(input.password)
      const activated = await db.transaction(async transaction => {
        const [profile] = await transaction.select().from(profiles).where(eq(profiles.id, record.profile.id)).for('update')
        if (!profile || profile.status !== 'pending') return false
        const [claimed] = await transaction.update(activations).set({ usedAt: new Date() }).where(and(eq(activations.id, record.activation.id), isNull(activations.usedAt), gt(activations.expiresAt, new Date()))).returning({ id: activations.id })
        if (!claimed) return false
        await admin.updateUser(record.profile.identityId!, { password })
        await transaction.update(profiles).set({ status: 'active' }).where(eq(profiles.id, profile.id))
        return true
      })
      if (!activated) throw new RequestError('Kod geçersiz, kullanılmış veya süresi dolmuş.')
      return reply({ username: record.profile.username })
    }

    await requireSession(true)
    if (action === 'save-developer') {
      const input = z.object({ id: z.uuid().optional(), name: z.string().trim().min(2).max(80), role: z.enum(developerRoles) }).parse(body)
      if (input.id) {
        const [updated] = await db.update(developers).set({ name: input.name, role: input.role }).where(eq(developers.id, input.id)).returning({ id: developers.id })
        if (!updated) throw new RequestError('Geliştirici bulunamadı.', 404)
      } else {
        const count = await db.select({ count: sql<number>`count(*)::int` }).from(developers)
        if (count[0].count >= 100) throw new RequestError('Pano en fazla 100 geliştirici içerebilir.')
        await db.insert(developers).values({ name: input.name, role: input.role })
      }
      return reply({ ok: true })
    }
    if (action === 'delete-developer') {
      const input = z.object({ id: z.uuid() }).parse(body)
      await db.delete(developers).where(eq(developers.id, input.id))
      return reply({ ok: true })
    }
    if (action === 'invite') {
      const input = z.object({ username: usernameSchema, email: z.email().trim().toLowerCase().max(254) }).parse(body)
      const [existing] = await db.select({ id: profiles.id }).from(profiles).where(or(eq(profiles.username, input.username), eq(profiles.email, input.email))).limit(1)
      if (existing) throw new RequestError('Bu kullanıcı adı veya e-posta zaten kayıtlı.', 409)
      const [profile] = await db.insert(profiles).values(input).returning()
      let identityId: string | undefined
      try {
        const user = await admin.createUser({ email: input.email, password: randomBytes(48).toString('base64url'), data: { app_metadata: { roles: ['member'] }, user_metadata: { username: input.username } } })
        identityId = user.id
        await db.update(profiles).set({ identityId }).where(eq(profiles.id, profile.id))
        return reply({ ...await issueActivation(profile.id), username: profile.username }, 201)
      } catch (error) {
        if (identityId) await admin.deleteUser(identityId).catch(() => undefined)
        await db.delete(profiles).where(eq(profiles.id, profile.id))
        if (error instanceof AuthError && error.status === 422) throw new RequestError('Bu e-posta Identity içinde zaten kayıtlı olabilir.', 409)
        throw error
      }
    }
    if (action === 'reissue') {
      const input = z.object({ id: z.uuid() }).parse(body)
      return reply(await issueActivation(input.id))
    }
    throw new RequestError('Sayfa bulunamadı.', 404)
  } catch (error) {
    if (error instanceof RequestError) return reply({ error: error.message }, error.status)
    if (error instanceof ZodError) return reply({ error: 'Alanları kontrol et. Kullanıcı adı 3–32 karakter, şifre en az 12 karakter olmalı.' }, 400)
    if (error instanceof MissingIdentityError) return reply({ error: 'Hesap hizmeti henüz etkin değil. Yönetici Netlify kurulumunu tamamlamalı.' }, 503)
    if (error instanceof AuthError && error.status === 403) return reply({ error: 'Bu isteğe izin verilmiyor.' }, 403)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') return reply({ error: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' }, 409)
    return reply({ error: 'İşlem tamamlanamadı. Biraz sonra tekrar dene; sorun sürerse yöneticiyle iletişime geç.' }, 503)
  }
}

export const config: Config = { path: '/api/community/:action' }
