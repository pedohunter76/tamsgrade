import React from 'react'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="bg-amber-600 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 font-medium shadow-sm transition-all animate-in slide-in-from-top">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        <strong>Offline Mode Active:</strong> All calculations, what-if simulations, and data changes remain 100% saved in your browser.
      </span>
    </div>
  )
}
