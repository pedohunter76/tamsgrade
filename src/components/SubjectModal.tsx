import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2, AlertCircle, CheckCircle2, HelpCircle, Check, BookOpen, Layers } from 'lucide-react'
import { Subject, SubjectCategory, AssessmentCategory, PeriodCombinationFormula } from '../engine/types'
import { DEFAULT_GRADING_PROFILES, DEFAULT_TRANSMUTATION_PROFILES } from '../engine/profiles'
import { generateUniqueId } from '../utils/ids'

interface SubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  initialData?: Subject
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [code, setCode] = useState(initialData?.code || '')
  const [section, setSection] = useState(initialData?.section || '')
  const [name, setName] = useState(initialData?.name || '')
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear || '2026-2027')
  const [semester, setSemester] = useState(initialData?.semester || '1st Semester')
  const [units, setUnits] = useState(initialData?.units || 3)
  const [schedule, setSchedule] = useState(initialData?.schedule || '')
  const [room, setRoom] = useState(initialData?.room || '')
  const [category, setCategory] = useState<SubjectCategory>(initialData?.category || 'iabf_major')
  const [gradingProfileId, setGradingProfileId] = useState(
    initialData?.gradingProfileId || 'feu_iabf_accountancy'
  )
  const [transmutationProfileId, setTransmutationProfileId] = useState(
    initialData?.transmutationProfileId ||
      (initialData?.category === 'gen_ed' ? 'feu_standard_undergraduate' : 'feu_bsa_retention_scale')
  )
  const [periodFormula, setPeriodFormula] = useState<PeriodCombinationFormula>(
    initialData?.periodFormula || 'midterm_50_final_50'
  )
  const [midtermWeight, setMidtermWeight] = useState(initialData?.midtermWeight ?? 50)
  const [finalWeight, setFinalWeight] = useState(initialData?.finalWeight ?? 50)
  const [notes, setNotes] = useState(initialData?.notes || '')

  // Categories list
  const [categories, setCategories] = useState<AssessmentCategory[]>(
    initialData?.categories || [
      { id: 'c1', name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)', weight: 50, calculationMethod: 'total_points', isSummative: false, assessmentType: 'FA', gradingPeriod: 'all' },
      { id: 'c2', name: 'Midterm Departmental Exam', weight: 25, calculationMethod: 'total_points', isSummative: true, assessmentType: 'SA', gradingPeriod: 'midterm' },
      { id: 'c3', name: 'Final Departmental Exam', weight: 25, calculationMethod: 'total_points', isSummative: true, assessmentType: 'SA', gradingPeriod: 'final' }
    ]
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Handle preset profile selection
  const handleProfileChange = (profileId: string) => {
    setGradingProfileId(profileId)
    const profile = DEFAULT_GRADING_PROFILES.find(p => p.id === profileId)
    if (profile) {
      setCategory(profile.category)
      if (profile.category === 'iabf_major') {
        setTransmutationProfileId('feu_bsa_retention_scale')
      } else if (profile.category === 'gen_ed') {
        setTransmutationProfileId('feu_standard_undergraduate')
      }
      const mappedCategories: AssessmentCategory[] = profile.defaultCategories.map((dc) => ({
        ...dc,
        id: generateUniqueId('cat')
      }))
      setCategories(mappedCategories)
    }
  }

  // Calculate sum of weights
  const totalWeight = categories.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01

  // Category handlers
  const handleAddCategory = () => {
    const newCat: AssessmentCategory = {
      id: generateUniqueId('cat'),
      name: 'New Assessment Category',
      weight: 10,
      calculationMethod: 'total_points',
      isSummative: false,
      gradingPeriod: 'all'
    }
    setCategories([...categories, newCat])
  }

  const handleUpdateCategory = (id: string, updates: Partial<AssessmentCategory>) => {
    setCategories(categories.map(c => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('Subject must have at least one assessment category.')
      return
    }
    setCategories(categories.filter(c => c.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!code.trim()) {
      setFormError('Subject code is required (e.g. ACT1101).')
      return
    }
    if (!name.trim()) {
      setFormError('Subject title is required.')
      return
    }
    if (!isWeightValid) {
      setFormError(`Total category weights must equal 100%. Current sum: ${totalWeight}%.`)
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        code: code.trim().toUpperCase(),
        section: section.trim(),
        name: name.trim(),
        academicYear,
        semester,
        units: Number(units) || 3,
        category,
        gradingProfileId,
        transmutationProfileId,
        periodFormula,
        midtermWeight: Number(midtermWeight),
        finalWeight: Number(finalWeight),
        schedule: schedule.trim(),
        room: room.trim(),
        categories,
        notes: notes.trim(),
        isArchived: initialData?.isArchived || false
      })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save subject'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close on Escape key & Lock background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

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
        className="relative w-full max-w-2xl bg-white dark:bg-[#071610] rounded-2xl shadow-2xl border border-[#e3e6de] dark:border-emerald-950/60 overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Mobile Drag Grabber Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#fafbfa] dark:bg-[#091e14] border-b border-transparent">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-emerald-900/60" />
        </div>

        {/* Editorial Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 border-b border-[#e3e6de] dark:border-emerald-950/60 bg-[#fafbfa] dark:bg-[#091e14] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#e8f5ec] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40 font-mono">
                FEU IABF &bull; COURSE REGISTRATION
              </span>
              {code && (
                <span className="text-xs font-mono font-bold text-[#0d3824] dark:text-emerald-300">
                  {code.toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-emerald-50 tracking-tight">
              {initialData ? 'Edit Subject Configuration' : 'Add New Subject'}
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70">
              Configure course details and syllabus assessment breakdown
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-8 sm:h-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl sm:rounded-lg border border-[#e2e6de] dark:border-emerald-900/50 bg-white dark:bg-[#0c2419] flex items-center justify-center text-stone-400 hover:text-stone-800 dark:text-emerald-400 dark:hover:text-white transition-colors active-press"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 touch-momentum">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Preset Profile Template Selector */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fafbfa] dark:bg-[#091e14] border border-[#e2e6de] dark:border-emerald-900/50 space-y-2 shadow-2xs">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-emerald-300">
              Select Grading Profile Template
            </label>
            <select
              value={gradingProfileId}
              onChange={(e) => handleProfileChange(e.target.value)}
              className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-white dark:bg-[#071610] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
            >
              {DEFAULT_GRADING_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.verificationStatus === 'verified' ? 'Verified Guidelines' : 'Needs Syllabus Verification'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70">
              Select an institutional template to auto-populate category weights according to FEU guidelines.
            </p>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                  Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. ACT1101"
                  required
                  className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 font-mono focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. Section 1"
                  className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 font-mono focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Subject Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Financial Accounting and Reporting"
                required
                className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Class Schedule
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. [Mon/Thu] 01:30 PM-03:00 PM"
                className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Classroom / Building
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. ROOM 707 (LEC RM), ENGINEERING BLDG"
                className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs min-h-[44px] sm:min-h-0"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Midyear Semester">Midyear Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                  Units
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  max="12"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full text-base sm:text-xs py-2.5 sm:py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs font-mono font-bold min-h-[44px] sm:min-h-0"
                />
              </div>
            </div>
          </div>

          {/* Categories Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-emerald-300">
                  Assessment Weight Breakdown
                </span>
                <span className="text-[11px] text-stone-500 dark:text-emerald-400/70">
                  Sum must equal exactly 100%
                </span>
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  isWeightValid
                    ? 'bg-[#e8f5ec] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40'
                    : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                Total: {totalWeight}%
              </div>
            </div>

            <div className="space-y-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(cat.id, { name: e.target.value })}
                      placeholder="Category name"
                      className="flex-1 text-base sm:text-xs py-2 sm:py-1.5 px-3 rounded-lg bg-white dark:bg-[#071610] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] min-h-[40px] sm:min-h-0"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max="100"
                        value={cat.weight}
                        onChange={(e) =>
                          handleUpdateCategory(cat.id, { weight: Number(e.target.value) })
                        }
                        className="w-16 sm:w-16 text-base sm:text-xs py-2 sm:py-1.5 px-2 rounded-lg bg-white dark:bg-[#071610] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 font-mono font-bold text-right min-h-[40px] sm:min-h-0"
                      />
                      <span className="text-xs text-stone-500 font-mono">%</span>
                    </div>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="w-10 h-10 sm:w-8 sm:h-8 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-emerald-950/40 transition-colors active-press"
                        aria-label="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl border border-dashed border-[#d2d6cd] dark:border-emerald-900/50 text-stone-600 dark:text-emerald-300 hover:border-[#0f3d28] hover:text-[#0f3d28] dark:hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active-press"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assessment Category</span>
            </button>
          </div>

          {/* Syllabus Notes */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
              Syllabus Policies & Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. BSA retention requirement: minimum 2.50. Quizzes held every Saturday."
              className="w-full text-base sm:text-xs p-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
            />
          </div>

          {/* Sticky Modal Footer Actions */}
          <div className="sticky bottom-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 bg-white/95 dark:bg-[#071610]/95 backdrop-blur-md border-t border-[#f0f2eb] dark:border-emerald-950/50 flex items-center justify-end gap-2.5 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-emerald-900/40 transition-all cursor-pointer active-press flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0f3d28] hover:bg-[#154d33] shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active-press"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Subject' : 'Create Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
