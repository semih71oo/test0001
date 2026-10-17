type IdentityUser = {
  roles?: string[]
  appMetadata?: Record<string, unknown>
}

export function hasAdminRole(user: IdentityUser) {
  const authorization = user.appMetadata?.authorization
  const nestedRoles = typeof authorization === 'object' && authorization !== null && 'roles' in authorization ? authorization.roles : undefined
  return [user.roles, user.appMetadata?.roles, nestedRoles].some(roles => Array.isArray(roles) && roles.some(role => role === 'admin' || role === 'founder'))
}
