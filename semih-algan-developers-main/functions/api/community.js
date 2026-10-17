import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // In deployments, ensure these are set as environment variables.
}

const supabaseAdmin = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE_KEY ?? '')

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export async function onRequest(context) {
  const { request, params } = context
  try {
    const url = new URL(request.url)
    const action = params?.action ?? url.pathname.split('/').pop()

    if (request.method === 'GET') {
      if (action === 'developers') {
        const { data, error } = await supabaseAdmin.from('developers').select('id, name, role').order('created_at', { ascending: true }).limit(100)
        if (error) return reply({ error: error.message }, 500)
        return reply(data)
      }
      if (action === 'members') {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: true }).limit(500)
        if (error) return reply({ error: error.message }, 500)
        return reply(data)
      }
      if (action === 'session') {
        return reply({ profile: null, isAdmin: false })
      }
      return reply({ error: 'Not found' }, 404)
    }

    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } })

    const body = await request.json().catch(() => null)
    if (!body) return reply({ error: 'Invalid JSON' }, 415)

    if (action === 'invite') {
      const { username, email } = body
      if (!username || !email) return reply({ error: 'Missing fields' }, 400)
      const tempPassword = Math.random().toString(36).slice(2, 14)
      const { data: user, error: createErr } = await supabaseAdmin.auth.admin.createUser({ email, password: tempPassword, user_metadata: { username } })
      if (createErr) return reply({ error: createErr.message }, 500)
      await supabaseAdmin.from('profiles').insert([{ identity_id: user.id, username, email, status: 'pending' }])
      return reply({ ok: true }, 201)
    }

    return reply({ error: 'Not found' }, 404)
  } catch (err) {
    return reply({ error: err.message ?? String(err) }, 500)
  }
}
