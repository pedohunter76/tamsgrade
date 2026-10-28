import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Award,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  GraduationCap
} from 'lucide-react'
import { Subject } from '../engine/types'

interface DirectGradeModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject | null
  initialPeriod?: 'midterm' | 'final'
  onSave: (updates: Partial<Subject>) => Promise<void>
  onClear: (period?: 'midterm' | 'final' | 'all') => Promise<void>
}

interface LetterGradePreset {
  letter: string
  gradePoint: number
  rawDefault: number
  rawRange: string
  description: string
  isBsaPassing: boolean
}

const FEU_LETTER_GRADES: LetterGradePreset[] = [
  { letter: 'A', gradePoint: 4.0, rawDefault: 98.0, rawRange: '96.00% – 100%', description: "Superior • President's List", isBsaPassing: true },
  { letter: 'A-', gradePoint: 3.75, rawDefault: 93.0, rawRange: '91.00% – 95.99%', description: "Excellent • Dean's Honor", isBsaPassing: true },
  { letter: 'B+', gradePoint: 3.5, rawDefault: 88.0, rawRange: '86.00% – 90.99%', description: "Very Good • Dean's List", isBsaPassing: true },
  { letter: 'B', gradePoint: 3.0, rawDefault: 83.0, rawRange: '80.00% – 85.99%', description: 'Good Standing', isBsaPassing: true },
  { letter: 'C+', gradePoint: 2.5, rawDefault: 77.0, rawRange: '75.00% – 79.99%', description: 'Satisfactory • BSA Cutoff', isBsaPassing: true },
  { letter: 'C', gradePoint: 2.0, rawDefault: 72.0, rawRange: '70.00% – 74.99%', description: 'Fair Standing', isBsaPassing: false },
  { letter: 'D+', gradePoint: 1.5, rawDefault: 67.0, rawRange: '65.00% – 69.99%', description: 'Conditional Passing', isBsaPassing: false },
  { letter: 'D', gradePoint: 1.0, rawDefault: 62.0, rawRange: '60.00% – 64.99%', description: 'Passing Baseline', isBsaPassing: false },
  { letter: 'F', gradePoint: 0.0, rawDefault: 50.0, rawRange: 'Below 60.00%', description: 'Failing Grade', isBsaPassing: false }
]

export const DirectGradeModal: React.FC<DirectGradeModalProps> = ({
  isOpen,
  onClose,
  subject,
  initialPeriod = 'midterm',
  onSave,
  onClear
}) => {
  if (!isOpen || !subject) return null

  // Target period: Midterm Grade (Running) vs Final Grade (Destination)
  const [targetPeriod, setTargetPeriod] = useState<'midterm' | 'final'>(initialPeriod)

  // Current values based on targetPeriod
  const isMidtermTarget = targetPeriod === 'midterm'

  const activeExistingLetter = isMidtermTarget
    ? subject.directMidtermLetterGrade || subject.directLetterGrade || 'B+'
    : subject.directFinalLetterGrade || subject.directLetterGrade || 'B+'

  const activeExistingGP = isMidtermTarget
    ? subject.directMidtermGradePoint ?? subject.directGradePoint ?? 3.5
    : subject.directFinalGradePoint ?? subject.directGradePoint ?? 3.5

  const activeExistingRaw = isMidtermTarget
    ? subject.directMidtermRawScore ?? subject.directRawScore ?? 88.0
    : subject.directFinalRawScore ?? subject.directRawScore ?? 88.0

  const activeExistingRemarks = isMidtermTarget
    ? subject.directMidtermRemarks || 'Midterm running grade announced by professor'
    : subject.directFinalRemarks || 'Official Final course grade'

  const [selectedLetter, setSelectedLetter] = useState<string>(activeExistingLetter)
  const [gradePoint, setGradePoint] = useState<number>(activeExistingGP)
  const [rawScore, setRawScore] = useState<string>(String(activeExistingRaw))
  const [remarks, setRemarks] = useState<string>(activeExistingRemarks)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync state when subject or targetPeriod changes
  useEffect(() => {
    if (subject) {
      const letter = isMidtermTarget
        ? subject.directMidtermLetterGrade || subject.directLetterGrade || 'B+'
        : subject.directFinalLetterGrade || subject.directLetterGrade || 'B+'

      setSelectedLetter(letter)
      const preset = FEU_LETTER_GRADES.find(g => g.letter === letter) || FEU_LETTER_GRADES[2]

      const gp = isMidtermTarget
        ? subject.directMidtermGradePoint ?? subject.directGradePoint ?? preset.gradePoint
        : subject.directFinalGradePoint ?? subject.directGradePoint ?? preset.gradePoint
      setGradePoint(gp)

      const raw = isMidtermTarget
        ? subject.directMidtermRawScore ?? subject.directRawScore ?? preset.rawDefault
        : subject.directFinalRawScore ?? subject.directRawScore ?? preset.rawDefault
      setRawScore(String(raw))

      const rem = isMidtermTarget
        ? subject.directMidtermRemarks || 'Midterm running grade announced by professor'
        : subject.directFinalRemarks || 'Official Final course grade'
      setRemarks(rem)
    }
  }, [subject, targetPeriod])

  const handleSelectPreset = (preset: LetterGradePreset) => {
    setSelectedLetter(preset.letter)
    setGradePoint(preset.gradePoint)
    setRawScore(String(preset.rawDefault))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const numRaw = parseFloat(rawScore)
      const now = new Date().toISOString()

      if (targetPeriod === 'midterm') {
        await onSave({
          isDirectMidtermActive: true,
          directMidtermLetterGrade: selectedLetter,
          directMidtermGradePoint: Number(gradePoint),
          directMidtermRawScore: isNaN(numRaw) ? undefined : numRaw,
          directMidtermRemarks: remarks,
          directGradePeriod: subject.isDirectFinalActive ? 'both' : 'midterm',
          directGradeDate: now,
          // Sync fallback if no direct final
          isDirectGradeActive: true,
          directLetterGrade: selectedLetter,
          directGradePoint: Number(gradePoint),
          directRawScore: isNaN(numRaw) ? undefined : numRaw,
          directGradeRemarks: remarks
        })
      } else {
        await onSave({
          isDirectFinalActive: true,
          directFinalLetterGrade: selectedLetter,
          directFinalGradePoint: Number(gradePoint),
          directFinalRawScore: isNaN(numRaw) ? undefined : numRaw,
          directFinalRemarks: remarks,
          directGradePeriod: subject.isDirectMidtermActive ? 'both' : 'final',
          directGradeDate: now,
          isDirectGradeActive: true,
          directLetterGrade: selectedLetter,
          directGradePoint: Number(gradePoint),
          directRawScore: isNaN(numRaw) ? undefined : numRaw,
          directGradeRemarks: remarks
        })
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearPeriod = async () => {
    setIsSubmitting(true)
    try {
      await onClear(targetPeriod)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentPreset = FEU_LETTER_GRADES.find(g => g.letter === selectedLetter) || FEU_LETTER_GRADES[2]
  const isBsaPassing = (gradePoint ?? 0) >= 2.5
  const hasActiveGradeForPeriod = isMidtermTarget
    ? !!(subject.isDirectMidtermActive && subject.directMidtermLetterGrade)
    : !!(subject.isDirectFinalActive && subject.directFinalLetterGrade)

  // Close on Escape key & Lock background scroll while modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="direct-grade-modal-title"
        className="relative w-full max-w-xl bg-white dark:bg-[#071610] rounded-2xl shadow-2xl border border-[#e3e6de] dark:border-emerald-950/70 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Mobile Drag Grabber */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-stone-300 dark:bg-emerald-900/80 mx-auto my-2.5 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-emerald-950/60 flex items-start justify-between bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/30 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d3824] dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#0d3824] dark:text-emerald-400">
                  {subject.code}
                </span>
                <span className="text-stone-300 dark:text-emerald-800">•</span>
                <span className="text-xs font-mono text-stone-500 dark:text-emerald-400/80">
                  Direct Professor Grade
                </span>
              </div>
              <h2 id="direct-grade-modal-title" className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-emerald-50 mt-0.5">
                Input Professor-Given Grade
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-lg text-stone-500 hover:text-stone-800 dark:text-emerald-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-emerald-950/60 transition-colors flex items-center justify-center active-press cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Distinct Period Switcher: Midterm Running Grade vs Final Grade */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/70">
              Select Grade Milestone / Period:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-stone-100 dark:bg-[#05140c] border border-stone-200 dark:border-emerald-950/80">
              <button
                type="button"
                onClick={() => setTargetPeriod('midterm')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetPeriod === 'midterm'
                    ? 'bg-white dark:bg-[#0c2419] text-[#0d3824] dark:text-emerald-300 shadow-2xs border border-emerald-300 dark:border-emerald-700'
                    : 'text-stone-600 dark:text-emerald-400/60 hover:text-stone-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Midterm Grade (Running)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetPeriod('final')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetPeriod === 'final'
                    ? 'bg-white dark:bg-[#0c2419] text-[#0d3824] dark:text-emerald-300 shadow-2xs border border-emerald-300 dark:border-emerald-700'
                    : 'text-stone-600 dark:text-emerald-400/60 hover:text-stone-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Final Grade (Official)</span>
              </button>
            </div>

            {/* Differentiating Explanation Banner */}
            <div className="p-3 rounded-xl bg-[#f8faf7] dark:bg-[#071911] border border-[#e5ebe2] dark:border-emerald-950/80 flex items-start gap-2.5 text-xs font-mono text-stone-600 dark:text-emerald-300/80">
              <Info className="w-4 h-4 text-[#0d3824] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                {targetPeriod === 'midterm' ? (
                  <span>
                    <strong>Midterm Grade is your Running Grade:</strong> It represents your academic standing halfway through the semester (counting 50% toward your final grade in IABF major courses). It tracks your progress ahead to your Final Grade.
                  </span>
                ) : (
                  <span>
                    <strong>Final Grade is your Destination:</strong> It represents your official completed grade for the entire course, combining your Midterm running grade with your Final period assessments.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Visual FEU Manila Letter Grade Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/70">
                FEU Letter Grade Scale:
              </label>
              <span className="text-[11px] font-mono font-bold text-[#0d3824] dark:text-emerald-400">
                Selected: {selectedLetter} ({gradePoint.toFixed(2)} QP)
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {FEU_LETTER_GRADES.map((preset) => {
                const isSelected = selectedLetter === preset.letter
                return (
                  <button
                    key={preset.letter}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[48px] active-press ${
                      isSelected
                        ? 'bg-[#0d3824] dark:bg-emerald-600 border-[#0d3824] text-white shadow-xs ring-2 ring-[#0d3824]/20'
                        : preset.isBsaPassing
                        ? 'bg-white dark:bg-[#0b1f16] border-stone-200 dark:border-emerald-950/80 text-stone-800 dark:text-emerald-100 hover:border-[#0d3824]/40 hover:bg-stone-50'
                        : 'bg-stone-50/50 dark:bg-[#071710] border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-lg font-serif font-bold leading-none">
                      {preset.letter}
                    </span>
                    <span
                      className={`text-[10px] font-mono mt-1 ${
                        isSelected
                          ? 'text-emerald-200'
                          : 'text-stone-400 dark:text-emerald-500/70'
                      }`}
                    >
                      {preset.gradePoint.toFixed(2)} QP
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] font-mono text-stone-500 dark:text-emerald-400/70">
              {currentPreset.description} • Equivalent range: {currentPreset.rawRange}
            </p>
          </div>

          {/* 3. Detailed Grade Point & Raw % Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/70 mb-1">
                Quality Points (4.00 Scale)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="4.0"
                inputMode="decimal"
                value={gradePoint}
                onChange={(e) => setGradePoint(parseFloat(e.target.value) || 0)}
                required
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/60 font-mono text-base sm:text-xs font-bold text-stone-900 dark:text-emerald-100 focus:ring-1 focus:ring-[#0d3824] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/70 mb-1">
                Estimated Raw Score (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                inputMode="decimal"
                value={rawScore}
                onChange={(e) => setRawScore(e.target.value)}
                placeholder="e.g. 88.0"
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/60 font-mono text-base sm:text-xs font-bold text-stone-900 dark:text-emerald-100 focus:ring-1 focus:ring-[#0d3824] focus:outline-hidden"
              />
            </div>
          </div>

          {/* 4. Notes / Remarks */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/70 mb-1">
              Source / Professor Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Released in Canvas, professor announcement, or portal entry"
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/60 font-mono text-xs text-stone-800 dark:text-emerald-100 focus:ring-1 focus:ring-[#0d3824] focus:outline-hidden"
            />
          </div>

          {/* 5. BSA Accountancy Retention Alert */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-mono ${
              isBsaPassing
                ? 'bg-[#eaf5ed] dark:bg-emerald-950/50 border-[#cbe4d2] dark:border-emerald-800/40 text-[#0d3824] dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200'
            }`}
          >
            {isBsaPassing ? (
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            )}
            <div>
              <span className="font-bold block">
                {isBsaPassing
                  ? 'Satisfies BSA Retention Requirement (>= 2.50 / C+)'
                  : 'Below BSA Retention Threshold (< 2.50)'}
              </span>
              <span className="text-[11px] opacity-80 block mt-0.5">
                {targetPeriod === 'midterm'
                  ? isBsaPassing
                    ? 'Great pace! Maintaining this standing into the Final Period keeps you safely in good standing.'
                    : 'Midterm Warning: You must improve performance in the Final Period to bring your combined Final Grade above 2.50.'
                  : isBsaPassing
                  ? 'Official final grade meets IABF retention guidelines.'
                  : 'Requires academic advising for Accountancy retention.'}
              </span>
            </div>
          </div>

          {/* Action buttons: Sticky on Mobile with Safe Area */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-[#071610]/95 backdrop-blur-md pt-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] px-1 border-t border-stone-100 dark:border-emerald-950/60 flex items-center justify-between gap-2.5 shrink-0">
            {hasActiveGradeForPeriod ? (
              <button
                type="button"
                onClick={handleClearPeriod}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer min-h-[44px] active-press shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear {isMidtermTarget ? 'Midterm' : 'Final'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-emerald-900/40 transition-colors cursor-pointer min-h-[44px] active-press shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-mono font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer min-h-[44px] active-press"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : `Save Given ${isMidtermTarget ? 'Midterm' : 'Final'} Grade`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
export default DirectGradeModal
