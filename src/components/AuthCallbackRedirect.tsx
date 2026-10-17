import { useEffect } from 'react'

export function AuthCallbackRedirect() {
  useEffect(() => {
    if (window.location.pathname !== '/giris' && /(?:^#|&)(?:invite_token|recovery_token|confirmation_token|email_change_token|access_token)=/.test(window.location.hash)) {
      window.location.replace(`/giris${window.location.hash}`)
    }
  }, [])
  return null
}
