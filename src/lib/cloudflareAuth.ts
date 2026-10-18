// Konum: src/lib/cloudflareAuth.ts
import { communityApi } from './community'

// Oturum artık HttpOnly çerezle sunucuda tutuluyor; istemci tarafında yapılacak bir şey yok.
export async function hydrateSession() {
  return null
}

export async function logout() {
  return undefined
}

export async function handleAuthCallback() {
  return null
}

// Netlify davet akışından kalma; yeni sistemde kullanılmıyor.
export async function acceptInvite(_token: string, _password: string) {
  throw new Error('Davet bağlantısı artık kullanılmıyor. 16 haneli aktivasyon kodunu kullan.')
}

export async function updateUser(data: Record<string, unknown>) {
  if (typeof data.password !== 'string') throw new Error('Geçersiz istek.')
  await communityApi('change-password', { password: data.password })
}
