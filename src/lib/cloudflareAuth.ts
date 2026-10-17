export async function hydrateSession() {
  return null
}

export async function logout() {
  return undefined
}

export async function handleAuthCallback() {
  return null
}

export async function acceptInvite(_token: string, _password: string) {
  throw new Error('Cloudflare auth layer is not configured yet. Connect this app to Cloudflare Access, Auth.js, or your own Workers auth endpoint.')
}

export async function updateUser(_data: Record<string, unknown>) {
  throw new Error('Cloudflare auth layer is not configured yet. Connect this app to Cloudflare Access, Auth.js, or your own Workers auth endpoint.')
}
