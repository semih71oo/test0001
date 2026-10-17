import type { UserLoginEvent } from '@netlify/functions'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index.js'
import { profiles } from '../../db/schema.js'
import { hasAdminRole } from '../lib/authorization.js'

export default {
  async userLogin(event: UserLoginEvent) {
    if (hasAdminRole(event.user)) return
    try {
      const [profile] = await getDb().select({ status: profiles.status }).from(profiles).where(eq(profiles.identityId, event.user.id)).limit(1)
      if (!profile || profile.status !== 'active') return event.deny()
    } catch {
      return event.deny()
    }
  },
}
