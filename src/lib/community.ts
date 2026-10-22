export const developerRoles = ['Kurucu', 'Admin', 'Moderatör', 'Developer', 'Tasarımcı'] as const
export type DeveloperRole = typeof developerRoles[number]
export type Developer = { id: string; name: string; role: DeveloperRole }

// Yeni hesap rolleri
export const accountRoles = ['Üye', 'Özel Üye', 'Moderatör', 'Baş Moderatör', 'Admin', 'Kurucu'] as const
export type AccountRole = typeof accountRoles[number]

export type Member = { id: string; username: string; email: string; status: 'pending' | 'active'; createdAt: string; role: AccountRole }
export type Session = { profile: Member; isAdmin: boolean; isMod: boolean }

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export async function communityApi<Result>(action: string, body?: Record<string, unknown>): Promise<Result> {
  const response = await fetch(`/api/community/${action}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(data?.error ?? 'İşlem tamamlanamadı. Lütfen tekrar dene.', response.status)
  return data as Result
}
