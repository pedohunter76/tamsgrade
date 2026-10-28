import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  Calendar,
  FileText,
  Percent,
  Check,
  ShieldCheck,
  Layers
} from 'lucide-react'
import { Assessment, AssessmentCategory } from '../engine/types'
import { useGrade } from '../context/GradeContext'
import { transmuteRawGrade, formatTransmutedGradeWithLetter } from '../engine/transmutation'

interface AssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assessmentData: Omit<Assessment, 'id'>) => Promise<void>
  subjectId: string
  categories: AssessmentCategory[]
  initialData?: Assessment
  defaultAssessmentType?: 'FA' | 'SA'
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectId,
  categories,
  initialData,
  defaultAssessmentType = 'FA'
}) => {
  const { subjects, transmutationProfiles } = useGrade()

  // Find subject details for header context
  const subject = useMemo(() => {
    return subjects.find(s => s.id === subjectId)
  }, [subjects, subjectId])

  // Get subject's transmutation profile for live grade preview
  const transProfile = useMemo(() => {
    if (!subject) return undefined
    return (
      transmutationProfiles.find(p => p.id === subject.transmutationProfileId) ||
      transmutationProfiles[0]
    )
  }, [subject, transmutationProfiles])

  // Determine initial assessment type (FA vs SA)
  const determinedInitialType = useMemo<'FA' | 'SA'>(() => {
    if (initialData?.assessmentType) return initialData.assessmentType
    if (initialData?.categoryId) {
      const match = categories.find(c => c.id === initialData.categoryId)
      if (match?.assessmentType) return match.assessmentType
      if (match?.isSummative) return 'SA'
      return 'FA'
    }
    return defaultAssessmentType
  }, [initialData, categories, defaultAssessmentType])

  const [assessmentType, setAssessmentType] = useState<'FA' | 'SA'>(determinedInitialType)
  const [period, setPeriod] = useState<'midterm' | 'final'>(initialData?.period || 'midterm')
  const [name, setName] = useState(initialData?.name || '')

  // Filter categories matching the selected assessment type
  const matchingCategories = useMemo(() => {
    const directMatches = categories.filter(c => {
      if (c.assessmentType) return c.assessmentType === assessmentType
      return assessmentType === 'SA' ? !!c.isSummative : !c.isSummative
    })
    return directMatches.length > 0 ? directMatches : categories
  }, [categories, assessmentType])

  const [categoryId, setCategoryId] = useState<string>(() => {
    if (initialData?.categoryId) return initialData.categoryId
    return matchingCategories.length > 0 ? matchingCategories[0].id : ''
  })

  // Whenever assessmentType changes, ensure categoryId points to a matching category
  useEffect(() => {
    const isCurrentCategoryMatching = matchingCategories.some(c => c.id === categoryId)
    if (!isCurrentCategoryMatching && matchingCategories.length > 0) {
      setCategoryId(matchingCategories[0].id)
    }
  }, [assessmentType, matchingCategories, categoryId])

  // Task completion state
  const [isTaskDone, setIsTaskDone] = useState<boolean>(
    initialData ? initialData.pointsEarned !== null : true
  )
  const [pointsEarned, setPointsEarned] = useState<string>(
    initialData?.pointsEarned !== null && initialData?.pointsEarned !== undefined
      ? String(initialData.pointsEarned)
      : ''
  )
  const [totalPossible, setTotalPossible] = useState<string>(
    initialData?.totalPossiblePoints ? String(initialData.totalPossiblePoints) : '100'
  )
  const [isMarkedZero, setIsMarkedZero] = useState(initialData?.isMarkedZero || false)
  const [isExtraCredit, setIsExtraCredit] = useState(initialData?.isExtraCredit || false)
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState(initialData?.notes || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Real-time score percentage and transmutation calculation
  const earnedNum = parseFloat(pointsEarned)
  const possibleNum = parseFloat(totalPossible)
  const livePercentage =
    !isNaN(earnedNum) && !isNaN(possibleNum) && possibleNum > 0
      ? (earnedNum / possibleNum) * 100
      : null

  const liveTransmuted = useMemo(() => {
    if (livePercentage === null || !transProfile) return null
    return transmuteRawGrade(livePercentage, transProfile)
  }, [livePercentage, transProfile])

  // Quick preset template applicator
  const handleApplyPreset = (presetType: 'seatwork' | 'homework' | 'quiz' | 'post_test' | 'activity' | 'midterm' | 'finals' | 'project') => {
    let presetName = ''
    let targetType: 'FA' | 'SA' = 'FA'
    let keyword = ''

    switch (presetType) {
      case 'seatwork':
        presetName = 'Seatwork: '
        targetType = 'FA'
        keyword = 'formative'
        break
      case 'homework':
        presetName = 'Homework: '
        targetType = 'FA'
        keyword = 'formative'
        break
      case 'quiz':
        presetName = 'Quiz: '
        targetType = 'FA'
        keyword = 'formative'
        break
      case 'post_test':
        presetName = 'Post-Test: '
        targetType = 'FA'
        keyword = 'formative'
        break
      case 'activity':
        presetName = 'Activity: '
        targetType = 'FA'
        keyword = 'formative'
        break
      case 'midterm':
        presetName = 'Midterm Departmental Exam'
        targetType = 'SA'
        keyword = 'midterm'
        setPeriod('midterm')
        break
      case 'finals':
        presetName = 'Final Departmental Exam'
        targetType = 'SA'
        keyword = 'final'
        setPeriod('final')
        break
      case 'project':
        presetName = 'Culminating Course Project'
        targetType = 'SA'
        keyword = 'project'
        break
    }

    setAssessmentType(targetType)

    if (!name.trim() || name.endsWith(': ') || name.includes('Exam') || name.includes('Project')) {
      setName(presetName)
    }

    const pool = categories.filter(c =>
      targetType === 'SA' ? (c.assessmentType === 'SA' || c.isSummative) : (c.assessmentType === 'FA' || !c.isSummative)
    )
    const matchedCat = pool.find(c => c.name.toLowerCase().includes(keyword)) || pool[0]
    if (matchedCat) {
      setCategoryId(matchedCat.id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Please enter a task name (e.g. Quiz 1, Seatwork 2, Midterm Exam).')
      return
    }
    if (!categoryId) {
      setFormError('Please select a syllabus category.')
      return
    }

    const possibleVal = parseFloat(totalPossible)
    if (isNaN(possibleVal) || possibleVal <= 0) {
      setFormError('Total possible points must be a positive number greater than zero.')
      return
    }

    let finalEarned: number | null = null
    if (isTaskDone) {
      finalEarned = parseFloat(pointsEarned)
      if (isNaN(finalEarned) || finalEarned < 0) {
        setFormError('Points earned cannot be negative or blank when marking task as completed.')
        return
      }
      if (!isExtraCredit && finalEarned > possibleVal) {
        setFormError(
          `Points earned (${finalEarned}) cannot exceed total possible points (${possibleVal}) unless extra credit is enabled.`
        )
        return
      }
    }

    try {
      setIsSubmitting(true)
      await onSave({
        subjectId,
        categoryId,
        assessmentType,
        period,
        name: name.trim(),
        pointsEarned: isTaskDone ? finalEarned : null,
        totalPossiblePoints: possibleVal,
        isMarkedZero: isTaskDone && isMarkedZero,
        isExtraCredit,
        date,
        notes: notes.trim()
      })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task score'
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
        className="relative w-full sm:max-w-xl bg-white dark:bg-[#071610] rounded-2xl shadow-2xl border border-[#e3e6de] dark:border-emerald-950/60 overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Mobile Drag Grabber */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-stone-300 dark:bg-emerald-900/80 mx-auto my-2.5 shrink-0" />

        {/* Editorial Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4.5 border-b border-[#e3e6de] dark:border-emerald-950/60 bg-[#fafbfa] dark:bg-[#091e14] flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#e8f5ec] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40 font-mono">
                FEU IABF &bull; ASSESSMENT
              </span>
              {subject && (
                <span className="text-xs font-mono font-bold text-[#0d3824] dark:text-emerald-300">
                  {subject.code}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-emerald-50 tracking-tight">
              {initialData ? 'Edit Assessment Deliverable' : 'Record Academic Task'}
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 truncate max-w-[280px] sm:max-w-none">
              {subject ? `${subject.name}${subject.section && !subject.section.includes('109') && !subject.section.includes('Block') ? ` • Sec ${subject.section}` : ''}` : 'Zero-based raw score computation according to FEU policies'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-lg border border-[#e2e6de] dark:border-emerald-900/50 bg-white dark:bg-[#0c2419] flex items-center justify-center text-stone-500 hover:text-stone-800 dark:text-emerald-400 dark:hover:text-white transition-colors active-press cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Academic Period Selector (Midterm Running vs Finals) */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400">
              Academic Milestone Period *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPeriod('midterm')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  period === 'midterm'
                    ? 'border-[#0f3d28] dark:border-emerald-500 bg-[#f4f8f5] dark:bg-[#0a2318] ring-1 ring-[#0f3d28]/30 shadow-xs'
                    : 'border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#071610] hover:bg-[#fafbfa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 dark:text-emerald-50 font-mono">
                    ⏳ Midterm Period
                  </span>
                  {period === 'midterm' && (
                    <span className="w-4 h-4 rounded-full bg-[#0f3d28] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 dark:text-emerald-400/70 mt-1 leading-snug">
                  Running grade ahead to your Final Grade (50% milestone)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPeriod('final')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  period === 'final'
                    ? 'border-amber-600 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500/30 shadow-xs'
                    : 'border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#071610] hover:bg-[#fafbfa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 dark:text-emerald-50 font-mono">
                    🎓 Finals Period
                  </span>
                  {period === 'final' && (
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 dark:text-emerald-400/70 mt-1 leading-snug">
                  Concluding period for your official final course standing
                </p>
              </button>
            </div>
          </div>

          {/* Section 1: Assessment Classification Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400">
              Assessment Classification *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* FA Button */}
              <button
                type="button"
                onClick={() => setAssessmentType('FA')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  assessmentType === 'FA'
                    ? 'border-[#0f3d28] dark:border-emerald-500 bg-[#f4f8f5] dark:bg-[#0a2318] shadow-xs ring-1 ring-[#0f3d28]/30'
                    : 'border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#071610] hover:bg-[#fafbfa] dark:hover:bg-[#091e14]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    assessmentType === 'FA'
                      ? 'bg-[#0f3d28] text-white'
                      : 'bg-stone-100 dark:bg-[#0c261b] text-stone-700 dark:text-emerald-300 border border-stone-200 dark:border-emerald-900/40'
                  }`}>
                    FA
                  </span>
                  {assessmentType === 'FA' && (
                    <span className="w-4 h-4 rounded-full bg-[#0f3d28] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-stone-900 dark:text-emerald-50 mt-2">
                  Formative Assessment
                </div>
                <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 mt-0.5 leading-snug">
                  Quizzes, seatworks, homeworks, learning checks
                </p>
              </button>

              {/* SA Button */}
              <button
                type="button"
                onClick={() => setAssessmentType('SA')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  assessmentType === 'SA'
                    ? 'border-amber-600 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs ring-1 ring-amber-500/30'
                    : 'border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#071610] hover:bg-[#fafbfa] dark:hover:bg-[#091e14]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    assessmentType === 'SA'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-[#0c261b] text-stone-700 dark:text-emerald-300 border border-stone-200 dark:border-emerald-900/40'
                  }`}>
                    SA
                  </span>
                  {assessmentType === 'SA' && (
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-stone-900 dark:text-emerald-50 mt-2">
                  Summative Assessment
                </div>
                <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 mt-0.5 leading-snug">
                  Midterm exam, finals exam, major project
                </p>
              </button>
            </div>
          </div>

          {/* Quick Task Preset Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-stone-500 dark:text-emerald-400/80">
              Quick Task Templates ({assessmentType}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {assessmentType === 'FA' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('seatwork')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-[#eef5f0] hover:border-[#c5decb] hover:text-[#0d3824] transition-all cursor-pointer"
                  >
                    Seatwork
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('homework')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-[#eef5f0] hover:border-[#c5decb] hover:text-[#0d3824] transition-all cursor-pointer"
                  >
                    Homework
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('quiz')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-[#eef5f0] hover:border-[#c5decb] hover:text-[#0d3824] transition-all cursor-pointer"
                  >
                    Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('post_test')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-[#eef5f0] hover:border-[#c5decb] hover:text-[#0d3824] transition-all cursor-pointer"
                  >
                    Post-Test
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('activity')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-[#eef5f0] hover:border-[#c5decb] hover:text-[#0d3824] transition-all cursor-pointer"
                  >
                    Activity / Problem Set
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('midterm')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-all cursor-pointer"
                  >
                    Midterm Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('finals')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-all cursor-pointer"
                  >
                    Finals Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('project')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#e2e6de] dark:border-emerald-900/40 bg-[#fafbfa] dark:bg-[#091e14] text-stone-700 dark:text-emerald-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-all cursor-pointer"
                  >
                    Course Project
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Task Name & Syllabus Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Task Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={assessmentType === 'FA' ? 'e.g. Quiz 1: Conceptual Framework' : 'e.g. Midterm Departmental Exam'}
                required
                className="w-full text-xs py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 placeholder:text-stone-400 dark:placeholder:text-emerald-500/50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Syllabus Category ({assessmentType}) *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-emerald-50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
              >
                {matchingCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.assessmentType || (c.isSummative ? 'SA' : 'FA')}] {c.name} ({c.weight}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Task Score & Completion Status */}
          <div className="p-4 rounded-2xl bg-[#fafbfa] dark:bg-[#091e14] border border-[#e2e6de] dark:border-emerald-900/50 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-stone-700 dark:text-emerald-300 uppercase tracking-wider">
                2. Score Entry & Task Status
              </span>

              {/* Status Toggle Switch */}
              <div className="flex items-center p-0.5 rounded-lg bg-stone-200/70 dark:bg-[#0c2419] border border-stone-200 dark:border-emerald-900/40 text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsTaskDone(true)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    isTaskDone
                      ? 'bg-[#0f3d28] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-emerald-400 hover:text-stone-900'
                  }`}
                >
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTaskDone(false)
                    setIsMarkedZero(false)
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    !isTaskDone
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-stone-600 dark:text-emerald-400 hover:text-stone-900'
                  }`}
                >
                  Upcoming
                </button>
              </div>
            </div>

            {isTaskDone ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-emerald-400/80 block mb-1">
                      Points Earned *
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={pointsEarned}
                      onChange={(e) => {
                        setPointsEarned(e.target.value)
                        if (isMarkedZero && e.target.value !== '0') {
                          setIsMarkedZero(false)
                        }
                      }}
                      placeholder="e.g. 27"
                      required={isTaskDone}
                      className="w-full text-base font-mono font-bold py-2.5 px-3 rounded-xl bg-white dark:bg-[#071610] border border-[#e2e6de] dark:border-emerald-900/50 text-[#0d3824] dark:text-emerald-300 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-emerald-400/80 block mb-1">
                      Total Possible Points *
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      inputMode="decimal"
                      value={totalPossible}
                      onChange={(e) => setTotalPossible(e.target.value)}
                      placeholder="e.g. 30"
                      required
                      className="w-full text-base font-mono font-bold py-2.5 px-3 rounded-xl bg-white dark:bg-[#071610] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Real-Time Live Transmuted Score Preview */}
                {livePercentage !== null && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#071610] border border-[#e2e6de] dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                    <span className="text-stone-500 dark:text-emerald-400/80 font-medium">
                      Zero-Based Transmutation Preview:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#0d3824] dark:text-emerald-300">
                        {livePercentage.toFixed(2)}%
                      </span>
                      {liveTransmuted && (
                        <span className="px-2 py-0.5 rounded-full bg-[#e8f5ec] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40 font-mono font-bold text-xs">
                          {formatTransmutedGradeWithLetter(liveTransmuted.officialGrade, liveTransmuted.letterGrade)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Optional Score Checkboxes */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-600 dark:text-stone-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExtraCredit}
                      onChange={(e) => setIsExtraCredit(e.target.checked)}
                      className="rounded border-stone-300 text-[#0d3824] focus:ring-[#0d3824]"
                    />
                    <span>Allow Extra Credit (&gt; 100%)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMarkedZero}
                      onChange={(e) => {
                        setIsMarkedZero(e.target.checked)
                        if (e.target.checked) setPointsEarned('0')
                      }}
                      className="rounded border-stone-300 text-red-600 focus:ring-red-600"
                    />
                    <span>Mark Explicit Zero (0)</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                This task is marked as upcoming. It is tracked for schedule and target simulations, but will not affect your provisional grade until scores are entered.
              </div>
            )}
          </div>

          {/* Section 4: Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Date Completed / Due
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. PAS 1 & 2 Coverage, Chapter 4"
                className="w-full text-xs py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#0a2016] border border-[#e2e6de] dark:border-emerald-900/50 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] shadow-2xs"
              />
            </div>
          </div>

          {/* Modal Footer Actions: Sticky on Mobile with Safe Area */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-[#071610]/95 backdrop-blur-md pt-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] px-1 border-t border-[#f0f2eb] dark:border-emerald-950/50 flex items-center justify-between gap-2.5 shrink-0">
            <span className="text-[11px] font-mono text-stone-400 dark:text-emerald-500/70 hidden sm:inline">
              Zero-based IABF grading applied
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-emerald-900/40 transition-all cursor-pointer min-h-[44px] active-press shrink-0"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0f3d28] hover:bg-[#154d33] shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer min-h-[44px] active-press"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : initialData
                    ? 'Update Task'
                    : isTaskDone
                    ? `Save ${assessmentType} Task`
                    : `Save Pending Task`}
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
