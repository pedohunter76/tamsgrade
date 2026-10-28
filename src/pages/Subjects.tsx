import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  Sliders,
  Download,
  Award
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { AssessmentModal } from '../components/AssessmentModal'
import { DirectGradeModal } from '../components/DirectGradeModal'
import { Assessment } from '../engine/types'
import { formatGrade } from '../engine/calculator'
import { formatTransmutedGradeWithLetter } from '../engine/transmutation'
import { SubjectHeaderMeta } from '../components/subjects/SubjectHeaderMeta'
import { SubjectMetricsGrid } from '../components/subjects/SubjectMetricsGrid'
import { SubjectAssessmentCategories } from '../components/subjects/SubjectAssessmentCategories'
import { SubjectRequiredScoreSidebar } from '../components/subjects/SubjectRequiredScoreSidebar'

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
    activeTerm
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

  const handleDeleteAssessment = async (id: string, name: string) => {
    if (confirm(`Delete assessment "${name}"?`)) {
      await deleteAssessment(id)
    }
  }

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
      {/* 1. Header & Academic Meta */}
      <SubjectHeaderMeta
        currentSubject={currentSubject}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={setSelectedSubjectId}
        activeTerm={activeTerm}
        isMajor={isMajor}
      />

      {/* 2. Top Summary Metrics */}
      <SubjectMetricsGrid
        currentResult={currentResult}
        isMajor={isMajor}
      />

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
        <div className="lg:col-span-8">
          <SubjectAssessmentCategories
            currentSubject={currentSubject}
            subjectAssessments={subjectAssessments}
            currentResult={currentResult}
            hasAssessments={hasAssessments}
            hasDirectMidterm={hasDirectMidterm}
            hasDirectFinal={hasDirectFinal}
            onOpenDirectGradeModal={() => setIsDirectGradeModalOpen(true)}
            onOpenAssessmentModal={(asm) => {
              setEditingAssessment(asm)
              setIsAssessmentModalOpen(true)
            }}
            onDeleteAssessment={handleDeleteAssessment}
          />
        </div>

        {/* RIGHT COLUMN: Required Score Solver & Transmutation Table (4 cols) */}
        <div className="lg:col-span-4">
          <SubjectRequiredScoreSidebar
            currentResult={currentResult}
            targetGrade={targetGrade}
            setTargetGrade={setTargetGrade}
            targetRequirement={targetRequirement}
            targetThresholds={targetThresholds}
            onNavigateSimulator={() => setActiveTab('simulator')}
          />
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
