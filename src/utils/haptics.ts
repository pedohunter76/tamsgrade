/**
 * Tactile haptic feedback helper for mobile devices
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light'): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      if (type === 'light') {
        navigator.vibrate(8)
      } else if (type === 'medium') {
        navigator.vibrate(18)
      } else if (type === 'success') {
        navigator.vibrate([10, 30, 15])
      } else if (type === 'warning') {
        navigator.vibrate([20, 40, 20])
      }
    } catch {
      // Ignore device permission blocks or unsupported environments
    }
  }
}
