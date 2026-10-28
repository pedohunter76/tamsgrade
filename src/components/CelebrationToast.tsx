import React, { useEffect, useState } from 'react'
import { Sparkles, Award, X } from 'lucide-react'
import { triggerHaptic } from '../utils/haptics'

interface CelebrationToastProps {
  qpa: number
  honorsTitle: string
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({ qpa, honorsTitle }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasCelebrated, setHasCelebrated] = useState(() => {
    return sessionStorage.getItem(`celebrated_${honorsTitle}`) === 'true'
  })

  useEffect(() => {
    if (qpa >= 3.5 && !hasCelebrated) {
      setIsVisible(true)
      triggerHaptic('success')
      sessionStorage.setItem(`celebrated_${honorsTitle}`, 'true')
      setHasCelebrated(true)

      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [qpa, honorsTitle, hasCelebrated])

  if (!isVisible) return null

  const isPresidents = qpa >= 3.99

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#0d3824] via-[#10472e] to-[#0a291a] text-white shadow-2xl border border-emerald-400/40">
        {/* Animated background glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
            {isPresidents ? <Award className="w-5 h-5 text-amber-300" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                ACADEMIC MILESTONE REACHED
              </span>
            </div>
            <h4 className="text-sm font-serif font-bold text-white mt-0.5">
              {honorsTitle}!
            </h4>
            <p className="text-xs text-emerald-100/80 font-mono mt-0.5 leading-snug">
              Standing QPA of <strong>{qpa.toFixed(2)}</strong> satisfies FEU Manila IABF honor roll criteria.
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss celebration"
            className="text-emerald-200/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
