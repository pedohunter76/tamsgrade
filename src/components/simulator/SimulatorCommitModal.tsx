import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface SimulatorCommitModalProps {
  isOpen: boolean
  subjectCode: string
  isApplying: boolean
  onClose: () => void
  onConfirm: () => void
}

export const SimulatorCommitModal: React.FC<SimulatorCommitModalProps> = ({
  isOpen,
  subjectCode,
  isApplying,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#071610] p-6 rounded-2xl max-w-md w-full border border-[#e3e6de] dark:border-emerald-950/60 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
            Commit What-If Scores to Subject
          </h3>
        </div>
        <p className="text-xs text-stone-600 dark:text-emerald-300/80 leading-relaxed font-mono">
          This will commit your hypothetical scores and add any What-If assessments to your permanent academic tracker for <strong>{subjectCode}</strong>.
          <br /><br />
          Are you sure you want to save these numbers to your official records?
        </p>
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f2eb] dark:border-emerald-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/40 border border-transparent hover:border-stone-200 dark:hover:border-emerald-900/40 transition-all cursor-pointer font-mono"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isApplying}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0d3824] hover:bg-[#11462e] text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer font-mono"
          >
            {isApplying ? 'Saving...' : 'Yes, Commit What-If Scores'}
          </button>
        </div>
      </div>
    </div>
  )
}
