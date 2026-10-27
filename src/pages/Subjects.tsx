import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Sliders,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Scale,
  ListFilter,
  Award,
  ArrowRight
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { AssessmentModal } from '../components/AssessmentModal'
import { DirectGradeModal } from '../components/DirectGradeModal'
import { Assessment, Subject } from '../engine/types'
import { formatGrade } from '../engine/calculator'
import { formatTransmutedGradeWithLetter } from '../engine/transmutation'

export const Subjects: React.FC = () => {
  const {
    subjects,
    assessments,
    selectedSubjectId,
    setSelectedSubjectId,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    updateSubject,
    gradeResults,
    setActiveTab,
    activeTerm,
    activeTermId
  } = useGrade()

  // Selected subject fallback or active
  const currentSubject = useMemo(() => {
    if (selectedSubjectId) {
      const found = subjects.find(s => s.id === selectedSubjectId)
      if (found) return found
    }
    return subjects[0] || null
  }, [subjects, selectedSubjectId])

  // Current calculation result from GradeContext
  const currentResult = useMemo(() => {
    if (!currentSubject) return null
    return gradeResults.get(currentSubject.id) || null
  }, [currentSubject, gradeResults])

  // Modals state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | undefined>(undefined)
  const [isDirectGradeModalOpen, setIsDirectGradeModalOpen] = useState(false)

  // Target solver state (Right Column Card)
  const [targetGrade, setTargetGrade] = useState<'4.00' | '3.75' | '3.50' | '3.00' | '2.50'>('3.50')

  // Target raw cutoff map for FEU 4.0 scale
  const targetThresholds: Record<string, { raw: number; letter: string; label: string }> = {
    '4.00': { raw: 96.0, letter: 'A', label: "President's List" },
    '3.75': { raw: 91.0, letter: 'A-', label: "Dean's Honor Target" },
    '3.50': { raw: 86.0, letter: 'B+', label: "Dean's List" },
    '3.00': { raw: 80.0, letter: 'B', label: 'Very Good' },
    '2.50': { raw: 75.0, letter: 'C+', label: 'BSA Retention Passing' }
  }

  // Dynamic remaining score requirement calculation
  const targetRequirement = useMemo(() => {
    const target = targetThresholds[targetGrade]
    if (!target) return { needed: 0, status: 'unknown' as const, remainingWeight: 100 }

    const completedWeight = currentResult?.completedWeightCoverage || 0
    const remainingWeight = Math.max(0, 100 - completedWeight)
    const earnedSoFar = currentResult?.unnormalizedRawGrade || 0
    const pointsNeeded = target.raw - earnedSoFar

    if (pointsNeeded <= 0) {
      return { needed: 0, status: 'secured' as const, remainingWeight }
    }
    if (remainingWeight <= 0) {
      return { needed: 100, status: 'unreachable' as const, remainingWeight: 0 }
    }

    const requiredPctOnRemaining = (pointsNeeded / remainingWeight) * 100
    if (requiredPctOnRemaining > 100) {
      return {
        needed: Math.round(requiredPctOnRemaining * 100) / 100,
        status: 'unreachable' as const,
        remainingWeight
      }
    }

    return {
      needed: Math.round(requiredPctOnRemaining * 100) / 100,
      status: 'achievable' as const,
      remainingWeight
    }
  }, [currentResult, targetGrade])

  // Export syllabus audit
  const handleExportAudit = () => {
    if (!currentSubject) return
    const auditData = {
      subject: `${currentSubject.code} — ${currentSubject.name}`,
      code: currentSubject.code,
      academicYear: currentSubject.academicYear || '2026-2027',
      semester: currentSubject.semester || '1st Semester',
      cumulativeRaw: currentResult ? `${formatGrade(currentResult.unnormalizedRawGrade, 2)}%` : '0.00%',
      transmutedGrade: currentResult?.transmutedGrade || '--',
      letterGrade: currentResult?.letterGrade || '--',
      formattedGrade: formatTransmutedGradeWithLetter(currentResult?.transmutedGrade, currentResult?.letterGrade),
      completedCoverage: `${currentResult?.completedWeightCoverage || 0}%`,
      timestamp: new Date().toISOString(),
      institution: 'FEU Manila IABF',
      zeroTelemetry: true
    }
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentSubject.code}_SY2026_2027_Syllabus_Audit.json`
    a.click()
  }

  // Filter assessments for the current active subject
  const subjectAssessments = useMemo(() => {
    if (!currentSubject) return []
    return assessments.filter(a => a.subjectId === currentSubject.id)
  }, [assessments, currentSubject])

  const hasAssessments = subjectAssessments.length > 0
  const isMajor = currentSubject?.category === 'iabf_major'
  const hasDirectMidterm = Boolean(currentSubject?.isDirectMidtermActive && currentSubject?.directMidtermLetterGrade)
  const hasDirectFinal = Boolean(
    (currentSubject?.isDirectFinalActive && currentSubject?.directFinalLetterGrade) ||
    (currentSubject?.isDirectGradeActive && currentSubject?.directLetterGrade)
  )

  if (!currentSubject) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#0b1f16] space-y-3">
        <BookOpen className="w-10 h-10 mx-auto text-stone-400 dark:text-emerald-500/60" />
        <h3 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
          No courses found for {activeTerm.termName}
        </h3>
        <p className="text-xs text-stone-500 dark:text-emerald-400/70 max-w-sm mx-auto">
          Select another academic term from the top bar or curriculum roadmap.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Enrolled Subjects Switcher Bar */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-momentum -mx-1 px-1">
          <span className="text-[11px] font-mono text-stone-400 dark:text-emerald-500/70 uppercase tracking-wider shrink-0 mr-1">
            ENROLLED:
          </span>
          {subjects.map((sub) => {
            const isSelected = currentSubject?.id === sub.id
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`flex items-center gap-2 px-3 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-xl sm:rounded-lg text-xs font-mono transition-all shrink-0 active-press cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d3824] text-white font-bold shadow-2xs'
                    : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-700 dark:text-emerald-200 hover:bg-stone-50'
                }`}
              >
                <span>{sub.code}</span>
                <span className="text-[10px] opacity-70 truncate max-w-[120px]">
                  {sub.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* 1. Subject Header & Academic Meta */}
      <div className="space-y-3">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono font-semibold">
          <span className="px-2.5 py-0.5 rounded-md bg-[#0d3824] text-white">
            {isMajor ? 'IABF MAJOR' : 'GENED CORE'}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200">
            {currentSubject.units || 3.0} Units Lecture
          </span>
          {currentSubject.section && (
            <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200">
              Section {currentSubject.section}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[#0d3824] dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>SY {currentSubject.academicYear || '2026-2027'} &bull; {currentSubject.semester ? currentSubject.semester.toUpperCase() : activeTerm.semester.toUpperCase()}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-emerald-50 tracking-tight">
          {currentSubject?.code} &mdash; {currentSubject?.name}
        </h1>

        {/* Schedule & Room info */}
        {(currentSubject?.schedule || currentSubject?.room) && (
          <div className="flex items-center gap-3 text-xs font-mono text-stone-500 dark:text-emerald-400/80 flex-wrap">
            {currentSubject.schedule && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400 shrink-0" />
                <span>{currentSubject.schedule}</span>
              </span>
            )}
            {currentSubject.room && (
              <span className="text-stone-400 dark:text-emerald-600/60">&bull;</span>
            )}
            {currentSubject.room && (
              <span>{currentSubject.room}</span>
            )}
          </div>
        )}

        {/* Notes / Syllabus description */}
        {currentSubject?.notes && (
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 max-w-4xl leading-relaxed">
            {currentSubject.notes}
          </p>
        )}
      </div>

      {/* 2. Top Summary Metrics (4-Column Grid: Differentiated Midterm Running vs Final Grade) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Midterm Grade (Running Milestone Ahead to Finals) */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">
              MIDTERM GRADE (RUNNING)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {currentResult?.midtermGrade.isDirect ? 'DIRECT GIVEN' : 'RUNNING MILESTONE'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-bold text-stone-900 dark:text-emerald-50">
              {currentResult?.midtermGrade.letterGrade || '--'}
            </span>
            {currentResult?.midtermGrade.transmutedGrade && (
              <span className="text-sm font-mono font-bold text-stone-500 dark:text-emerald-400/80">
                ({currentResult.midtermGrade.transmutedGrade})
              </span>
            )}
            {currentResult && currentResult.midtermGrade.completedCoverage > 0 && (
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold ml-auto">
                {currentResult.midtermGrade.rawPercentage.toFixed(1)}% raw
              </span>
            )}
          </div>
          <span className="block text-[11px] text-stone-500 dark:text-emerald-400/70 mt-1">
            {currentResult?.midtermGrade.remarks || 'Running grade ahead to Final Grade'}
          </span>
        </div>

        {/* Card 2: Final Grade (Official Course Overall / Destination) */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] font-mono font-bold tracking-wider uppercase text-stone-600 dark:text-emerald-400/60">
              FINAL GRADE (COURSE OVERALL)
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              currentResult?.finalGrade.isProjected
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
            }`}>
              {currentResult?.finalGrade.isDirect
                ? 'DIRECT GIVEN'
                : currentResult?.finalGrade.isProjected
                ? 'PROJECTED DESTINATION'
                : 'OFFICIAL FINAL'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-mono font-bold text-stone-900 dark:text-emerald-50">
              {currentResult?.finalGrade.letterGrade || '--'}
            </span>
            {currentResult?.finalGrade.transmutedGrade && (
              <span className="text-sm font-mono font-bold text-stone-500 dark:text-emerald-400/80">
                ({currentResult.finalGrade.transmutedGrade})
              </span>
            )}
            {currentResult && currentResult.finalGrade.completedCoverage > 0 && (
              <span className="text-xs font-mono text-stone-600 dark:text-stone-400 font-bold ml-auto">
                {currentResult.finalGrade.rawPercentage.toFixed(1)}% raw
              </span>
            )}
          </div>
          <span className="block text-[11px] text-stone-500 dark:text-emerald-400/70 mt-1">
            {currentResult?.finalGrade.remarks || (currentResult?.finalGrade.isProjected ? 'Paced continuously by Midterm Running Grade' : 'Final official course standing')}
          </span>
        </div>

        {/* Card 3: Period Progression Pipeline */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs">
          <span className="block text-[10px] font-mono font-bold tracking-wider uppercase text-stone-400 dark:text-emerald-400/60">
            GRADE PROGRESSION PIPELINE
          </span>
          <div className="flex items-center gap-2 mt-2 font-mono text-xs">
            <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-900/40 text-center">
              <span className="block text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Midterm</span>
              <span className="font-bold text-stone-900 dark:text-emerald-100">
                {(currentResult?.midtermGrade.completedCoverage || 0).toFixed(0)}% ev.
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <div className="flex-1 bg-stone-50 dark:bg-[#071911] p-1.5 rounded border border-stone-200 dark:border-emerald-900/30 text-center">
              <span className="block text-[9px] text-stone-500 uppercase">Finals</span>
              <span className="font-bold text-stone-900 dark:text-emerald-100">
                {(currentResult?.finalGrade.completedCoverage || 0).toFixed(0)}% total
              </span>
            </div>
          </div>
          <span className="block text-[11px] text-stone-500 dark:text-emerald-400/70 mt-1.5">
            {(100 - (currentResult?.completedWeightCoverage || 0)).toFixed(1)}% Remaining Syllabus Runway
          </span>
        </div>

        {/* Card 4: Academic Status & BSA Retention */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs">
          <span className="block text-[10px] font-mono font-bold tracking-wider uppercase text-stone-400 dark:text-emerald-400/60">
            ACADEMIC STATUS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-emerald-50">
              {currentResult && currentResult.completedWeightCoverage > 0
                ? (currentResult.finalGrade.qualityPoints ?? 3.0) >= 3.5
                  ? "Dean's Honor"
                  : (currentResult.finalGrade.qualityPoints ?? 3.0) >= 2.5
                  ? 'In Good Standing'
                  : 'Retention Alert'
                : 'Clean Slate'}
            </span>
            {currentResult?.finalGrade.qualityPoints !== undefined && (
              <span className="text-xs font-mono font-bold text-stone-500">
                ({currentResult.finalGrade.qualityPoints.toFixed(2)} QP)
              </span>
            )}
          </div>
          <span className="block text-[11px] text-stone-500 dark:text-emerald-400/70 mt-1">
            {isMajor ? 'BSA Retention Standard: >= 2.50 (C+)' : 'Standard University Curriculum'}
          </span>
        </div>
      </div>

      {/* 3. Action Buttons & Syllabus Completion Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingAssessment(undefined)
              setIsAssessmentModalOpen(true)
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0d3824] hover:bg-[#11462e] text-white font-semibold text-xs font-mono transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Assessment Score</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0c2419] hover:bg-stone-50 dark:hover:bg-[#0e2c1e] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-100 font-semibold text-xs font-mono transition-all shadow-2xs cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>Run What-If Simulation</span>
          </button>

          <button
            onClick={() => setIsDirectGradeModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs font-mono transition-all shadow-2xs cursor-pointer ${
              hasDirectMidterm || hasDirectFinal
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-white dark:bg-[#0c2419] hover:bg-stone-50 dark:hover:bg-[#0e2c1e] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {hasDirectMidterm && hasDirectFinal
                ? `Given: Midterm ${currentSubject.directMidtermLetterGrade} • Final ${currentSubject.directFinalLetterGrade || currentSubject.directLetterGrade}`
                : hasDirectMidterm
                ? `Given Midterm: ${currentSubject.directMidtermLetterGrade} (${(currentSubject.directMidtermGradePoint ?? 0).toFixed(2)})`
                : hasDirectFinal
                ? `Given Final: ${currentSubject.directFinalLetterGrade || currentSubject.directLetterGrade} (${((currentSubject.directFinalGradePoint ?? currentSubject.directGradePoint) ?? 0).toFixed(2)})`
                : '+ Input Given Grade (Midterm / Final)'}
            </span>
          </button>

          <button
            onClick={handleExportAudit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0c2419] hover:bg-stone-50 dark:hover:bg-[#0e2c1e] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-100 font-semibold text-xs font-mono transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Syllabus Audit</span>
          </button>
        </div>

        {/* Syllabus Completion Progress */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 font-bold">
              SYLLABUS EVALUATED
            </span>
            <span className="block text-xs font-mono font-bold text-stone-800 dark:text-emerald-100">
              {(currentResult?.completedWeightCoverage || 0).toFixed(1)}% Completed
            </span>
          </div>
          <div className="w-24 sm:w-28 h-2 rounded-full bg-stone-200 dark:bg-emerald-950/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0d3824] dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(100, currentResult?.completedWeightCoverage || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Split Layout: Left (Categories & Assessments) / Right (Target Solver & Scale) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Assessment Categories (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Direct Letter Grade Banner(s) */}
          {(hasDirectMidterm || hasDirectFinal) && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-[#f0f9f3] dark:from-emerald-950/60 dark:to-[#082216] border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0d3824] dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0d3824] dark:text-emerald-300">
                      Direct Professor Grade Active
                    </span>
                    {hasDirectMidterm && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#0d3824] text-white">
                        Midterm (Running): {currentSubject.directMidtermLetterGrade} • {(currentSubject.directMidtermGradePoint ?? 0).toFixed(2)}
                      </span>
                    )}
                    {hasDirectFinal && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-800 text-white">
                        Final (Official): {currentSubject.directFinalLetterGrade || currentSubject.directLetterGrade} • {((currentSubject.directFinalGradePoint ?? currentSubject.directGradePoint) ?? 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-emerald-300/80 mt-0.5">
                    {currentSubject.directMidtermRemarks || currentSubject.directFinalRemarks || currentSubject.directGradeRemarks || 'Direct letter grade override is actively reflected in your grade standing.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsDirectGradeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-[#0d3824] dark:text-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  Manage Grades
                </button>
              </div>
            </div>
          )}
          {/* Clean Slate Initial Notice if 0 assessments */}
          {!hasAssessments && (
            <div className="p-6 rounded-2xl bg-[#fafbfa] dark:bg-[#081a12] border border-dashed border-[#cce0d2] dark:border-emerald-900/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#eaf5ed] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-emerald-100">
                  Ready for SY 2026-2027 First Semester
                </h3>
                <p className="text-xs text-stone-600 dark:text-emerald-400/70 mt-1 leading-relaxed">
                  No existing assessments recorded yet for {currentSubject?.name}. Start recording your seatworks, quizzes, and departmental exams to track your grades in real-time.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAssessment(undefined)
                  setIsAssessmentModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d3824] text-white font-mono text-xs font-semibold shadow-xs hover:bg-[#11462e] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Record Your First Score</span>
              </button>
            </div>
          )}

          {/* Dynamic Categories */}
          {currentSubject?.categories.map((category, index) => {
            const catAssessments = subjectAssessments.filter(a => a.categoryId === category.id)
            const catResult = currentResult?.categories.find(c => c.categoryId === category.id)
            const isCategoryCompleted = catAssessments.length > 0 && catAssessments.every(a => a.pointsEarned !== null)
            const letterTag = String.fromCharCode(65 + index) // A, B, C...

            return (
              <div
                key={category.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-[#0d3824] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      {letterTag}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-emerald-50">
                        {category.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-emerald-400/70">
                        {category.assessmentType === 'SA' || category.isSummative
                          ? 'Summative evaluation centrally weighted for term standing'
                          : 'Continuous formative evaluations & mastery problem sets'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 font-bold">
                      WEIGHT ALLOCATION
                    </span>
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      <span className="text-xs font-mono font-bold text-stone-800 dark:text-emerald-100">
                        {category.weight.toFixed(1)}% Weight
                      </span>
                      {catAssessments.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#eaf5ed] dark:bg-emerald-950/70 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40">
                          {isCategoryCompleted ? 'ASSESSED' : 'IN PROGRESS'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assessment Rows */}
                {catAssessments.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    {catAssessments.map((asm) => {
                      const isCompleted = asm.pointsEarned !== null
                      const rawYield = isCompleted
                        ? ((asm.pointsEarned! / asm.totalPossiblePoints) * 100).toFixed(1)
                        : null

                      return (
                        <div
                          key={asm.id}
                          className="p-3 rounded-xl bg-[#fafbfa] dark:bg-[#081b12] border border-[#e9ede7] dark:border-emerald-950/80 flex items-center justify-between text-xs font-mono group hover:border-[#0d3824]/30 transition-all"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-stone-900 dark:text-emerald-50">
                                  {asm.name}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                  asm.period === 'final'
                                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                }`}>
                                  {asm.period === 'final' ? 'Finals Period' : 'Midterm Period'}
                                </span>
                                {asm.isExtraCredit && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[10px] text-amber-800 font-bold">
                                    Extra Credit
                                  </span>
                                )}
                              </div>
                              {(asm.date || asm.notes) && (
                                <p className="text-[11px] text-stone-500 dark:text-emerald-400/60 truncate mt-0.5 font-sans">
                                  {asm.date || asm.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right ml-4">
                            <div>
                              <span className="block text-[9px] text-stone-400 uppercase">SCORE</span>
                              <span className="block font-bold text-stone-900 dark:text-emerald-100">
                                {isCompleted ? `${asm.pointsEarned} / ${asm.totalPossiblePoints}` : `-- / ${asm.totalPossiblePoints}`}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-stone-400 uppercase">RAW YIELD</span>
                              <span className="block font-bold text-stone-900 dark:text-emerald-100">
                                {isCompleted ? `${rawYield}%` : 'PENDING'}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 sm:opacity-80 sm:group-hover:opacity-100">
                              <button
                                onClick={() => {
                                  setEditingAssessment(asm)
                                  setIsAssessmentModalOpen(true)
                                }}
                                title="Edit score"
                                className="w-9 h-9 sm:w-7 sm:h-7 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg hover:bg-stone-200 dark:hover:bg-emerald-900/60 text-stone-500 hover:text-stone-900 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors active-press cursor-pointer"
                                aria-label={`Edit ${asm.name}`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete assessment "${asm.name}"?`)) {
                                    await deleteAssessment(asm.id)
                                  }
                                }}
                                title="Delete assessment"
                                className="w-9 h-9 sm:w-7 sm:h-7 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-400 hover:text-rose-600 transition-colors active-press cursor-pointer"
                                aria-label={`Delete ${asm.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#fafbfa] dark:bg-[#081b12] border border-dashed border-[#e2e6de] dark:border-emerald-950/70 text-center text-xs font-mono text-stone-500 dark:text-emerald-400/60 flex items-center justify-between">
                    <span>No assessments entered in this category yet.</span>
                    <button
                      onClick={() => {
                        setEditingAssessment(undefined)
                        setIsAssessmentModalOpen(true)
                      }}
                      className="text-[11px] font-bold text-[#0d3824] dark:text-emerald-300 hover:underline"
                    >
                      + Add Assessment Score
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Audit Synchronization Footer */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-emerald-400/70 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0d3824] dark:text-emerald-400 shrink-0" />
              <span>FEU Manila IABF Zero-Based Grading Protocol &bull; Local Cache Verified</span>
            </div>
            <span className="font-bold text-stone-700 dark:text-emerald-300 uppercase tracking-wider text-[10px]">
              SY 2026-2027 ACTIVE
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Required Score Solver & Transmutation Table (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Required Score Projection Solver */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-emerald-50 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0d3824] dark:text-emerald-400" />
                <span>Required Score Solver</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#eaf5ed] dark:bg-emerald-950/70 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40">
                SOLVER
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-emerald-400/80 leading-relaxed font-sans">
              Calculates exact percentage needed across your remaining{' '}
              <strong>{(100 - (currentResult?.completedWeightCoverage || 0)).toFixed(1)}% unassessed weight</strong>{' '}
              to reach your desired transmuted grade tier.
            </p>

            {/* Target Grade Selector (with Letter Grades explicitly displayed) */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 font-bold">
                SELECT TARGET TRANSMUTED GRADE
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono">
                {(['4.00', '3.75', '3.50', '3.00', '2.50'] as const).map((grade) => {
                  const isSelected = targetGrade === grade
                  const meta = targetThresholds[grade]
                  return (
                    <button
                      key={grade}
                      onClick={() => setTargetGrade(grade)}
                      className={`p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-[#0d3824] text-white shadow-xs font-bold'
                          : 'bg-[#fafbfa] dark:bg-[#081b12] border border-[#e2e6de] dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200 hover:bg-stone-100 dark:hover:bg-[#0f2d1e]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{grade}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                          isSelected ? 'bg-emerald-800 text-white' : 'bg-stone-200 dark:bg-emerald-950/80 text-stone-700 dark:text-emerald-300'
                        }`}>
                          {meta.letter}
                        </span>
                      </div>
                      <span className="block text-[10px] opacity-80 mt-0.5 truncate">
                        {meta.raw}% min
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Required Score Result Box */}
            <div className="p-4 rounded-xl bg-[#0d3824] dark:bg-[#082216] text-white space-y-1 shadow-xs">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-200/90 font-bold">
                REQUIRED SCORE ON REMAINING WORK
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold">
                  {targetRequirement.status === 'secured'
                    ? 'Secured'
                    : targetRequirement.status === 'unreachable'
                    ? '>100%'
                    : `${targetRequirement.needed.toFixed(1)}%`}
                </span>
                <span className="text-xs font-mono text-emerald-200/80">
                  Target: {targetGrade} ({targetThresholds[targetGrade]?.letter})
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 pt-1 leading-snug font-sans">
                {targetRequirement.status === 'secured'
                  ? 'Congratulations! You have already accumulated enough raw percentage to lock in this grade tier.'
                  : targetRequirement.status === 'unreachable'
                  ? 'Mathematically unreachable with standard weights. Run a What-If simulation to explore options.'
                  : `Maintain an average of at least ${targetRequirement.needed.toFixed(1)}% across remaining assessments to finish with a ${targetGrade} (${targetThresholds[targetGrade]?.letter}).`}
              </p>
            </div>

            {/* Quick action to simulator */}
            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full py-2 px-3 rounded-xl border border-[#e2e6de] dark:border-emerald-900/60 bg-[#fafbfa] dark:bg-[#081b12] hover:bg-stone-50 dark:hover:bg-[#0e2c1e] text-stone-800 dark:text-emerald-100 text-xs font-mono font-semibold transition-all shadow-2xs"
            >
              Simulate in What-If Sandbox &rarr;
            </button>
          </div>

          {/* 2. FEU Transmutation Scale Table (with explicit Letter Grades per grade) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-emerald-50 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#0d3824] dark:text-emerald-400" />
                  <span>FEU Transmutation Scale</span>
                </h3>
                <span className="text-[11px] text-stone-500 dark:text-emerald-400/60 font-mono">
                  IABF Zero-Based 60.00% Baseline
                </span>
              </div>
              <ListFilter className="w-4 h-4 text-stone-400" />
            </div>

            <p className="text-[11px] text-stone-600 dark:text-emerald-400/80 leading-relaxed font-sans">
              FEU uses Quality Points from 4.00 (highest) to 0.00 (failure). Letter grades corresponding to each numeric grade tier:
            </p>

            {/* Transmutation Table with Letter Grades */}
            <div className="space-y-1 font-mono text-xs">
              {[
                { grade: '4.00', letter: 'A', label: "President's List", range: '96.00 – 100.00%' },
                { grade: '3.75', letter: 'A-', label: "Dean's Honor Target", range: '91.00 – 95.99%' },
                { grade: '3.50', letter: 'B+', label: "Dean's List", range: '86.00 – 90.99%' },
                { grade: '3.00', letter: 'B', label: 'Very Good', range: '80.00 – 85.99%' },
                { grade: '2.50', letter: 'C+', label: 'Good / Retention Cutoff', range: '75.00 – 79.99%' },
                { grade: '2.00', letter: 'C', label: 'Satisfactory', range: '70.00 – 74.99%' },
                { grade: '1.50', letter: 'D+', label: 'Fair', range: '65.00 – 69.99%' },
                { grade: '1.00', letter: 'D', label: 'Passing Baseline', range: '60.00 – 64.99%' },
                { grade: '0.00', letter: 'F', label: 'Failing Grade', range: '< 60.00%', isFail: true }
              ].map((row) => {
                const isCurrent = currentResult?.transmutedGrade === row.grade
                const isTarget = targetGrade === row.grade
                return (
                  <div
                    key={row.grade}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#bfe3c8] dark:border-emerald-800 font-bold text-[#0d3824] dark:text-emerald-300'
                        : 'hover:bg-stone-50 dark:hover:bg-emerald-950/30 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-16 font-bold flex items-center gap-1">
                        <span>{row.grade}</span>
                        <span className="text-[10px] text-stone-500 font-normal">({row.letter})</span>
                      </span>
                      <span className="text-[11px] font-sans truncate">{row.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] ${row.isFail ? 'text-rose-600 font-bold' : ''}`}>
                        {row.range}
                      </span>
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-2xs" />
                      )}
                      {isTarget && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-2xs" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-emerald-950/50 flex items-center gap-2 text-[10px] font-mono text-stone-500 dark:text-emerald-400/70">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400 shrink-0" />
              <span>FEU IABF retains strict Zero-Based non-curved audit policies.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Modal for Recording New Assessment */}
      {isAssessmentModalOpen && currentSubject && (
        <AssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => {
            setIsAssessmentModalOpen(false)
            setEditingAssessment(undefined)
          }}
          subjectId={currentSubject.id}
          categories={currentSubject.categories || []}
          defaultAssessmentType="FA"
          onSave={async (data) => {
            if (editingAssessment) {
              await updateAssessment(editingAssessment.id, data)
            } else {
              await addAssessment(data)
            }
            setIsAssessmentModalOpen(false)
            setEditingAssessment(undefined)
          }}
          initialData={editingAssessment}
        />
      )}

      {/* Direct Letter Grade Modal */}
      {isDirectGradeModalOpen && currentSubject && (
        <DirectGradeModal
          isOpen={isDirectGradeModalOpen}
          subject={currentSubject}
          onClose={() => setIsDirectGradeModalOpen(false)}
          onSave={async (updates) => {
            await updateSubject(currentSubject.id, updates)
            setIsDirectGradeModalOpen(false)
          }}
          onClear={async (period) => {
            if (period === 'midterm') {
              await updateSubject(currentSubject.id, {
                isDirectMidtermActive: false,
                directMidtermLetterGrade: undefined,
                directMidtermGradePoint: undefined,
                directMidtermRawScore: undefined,
                directMidtermRemarks: undefined
              })
            } else {
              await updateSubject(currentSubject.id, {
                isDirectFinalActive: false,
                isDirectGradeActive: false,
                directFinalLetterGrade: undefined,
                directFinalGradePoint: undefined,
                directFinalRawScore: undefined,
                directFinalRemarks: undefined,
                directLetterGrade: undefined,
                directGradePoint: undefined,
                directRawScore: undefined,
                directGradeRemarks: undefined
              })
            }
            setIsDirectGradeModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
