import { createClient, Session } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // allow build in environments where vars are provided at runtime
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '')

export async function hydrateSession() {
  try {
    const { data } = await supabase.auth.getSession()
    if (!data?.session) return null
    const session: Session = data.session
    return { profile: session.user.user_metadata ?? {}, isAdmin: (session.user.user_metadata as any)?.roles?.includes('admin') }
  } catch {
    return null
  }
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function handleAuthCallback() {
  // Supabase redirects/callbacks can be handled here if needed.
  return null
}

export async function acceptInvite(_token: string, _password: string) {
  throw new Error('Use server-side invite flow with Supabase admin API')
}

export async function updateUser(data: Record<string, unknown>) {
  const user = await supabase.auth.getUser()
  if (!user?.data?.user) throw new Error('Not authenticated')
  const id = user.data.user.id
  // Supabase client cannot update password for current user directly here; use supabase.auth.updateUser
  if ((data as any).password) {
    await supabase.auth.updateUser({ password: (data as any).password })
  }
}

export default supabase
