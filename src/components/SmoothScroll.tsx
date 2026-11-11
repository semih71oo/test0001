import { useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScroll() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null

    const syncMotionPreference = () => {
      if (motionPreference.matches) {
        lenis?.destroy()
        lenis = null
        return
      }

      if (!lenis) {
        lenis = new Lenis({
          autoRaf: true,
          anchors: true,
          smoothWheel: true,
          syncTouch: false,
        })
      }
    }

    syncMotionPreference()
    motionPreference.addEventListener('change', syncMotionPreference)

    return () => {
      motionPreference.removeEventListener('change', syncMotionPreference)
      lenis?.destroy()
    }
  }, [])

  return null
}
