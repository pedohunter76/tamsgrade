let registrationRef: ServiceWorkerRegistration | null = null

export function skipWaitingAndReload(): void {
  if (registrationRef?.waiting) {
    registrationRef.waiting.postMessage({ type: 'SKIP_WAITING' })
  } else if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

export function registerServiceWorker(onUpdateAvailable?: () => void): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // In dev mode, ensure stale service worker caches do not intercept Vite ESM modules
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister()
        }
      })
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key)
          }
        })
      }
      return
    }

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registrationRef = registration
          console.log('[PWA] Service Worker registered with scope:', registration.scope)

          if (registration.waiting) {
            if (onUpdateAvailable) onUpdateAvailable()
            window.dispatchEvent(new CustomEvent('tamsgrade:sw-update'))
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[PWA] New content available; please refresh.')
                    if (onUpdateAvailable) onUpdateAvailable()
                    window.dispatchEvent(new CustomEvent('tamsgrade:sw-update'))
                  } else {
                    console.log('[PWA] Content cached for offline use.')
                  }
                }
              }
            }
          }
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error)
        })
    })
  }
}
