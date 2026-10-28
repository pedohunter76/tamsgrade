import React, { useState, useMemo } from 'react'
import { Plus, Target, ShieldCheck } from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { getAcademicYearForYear } from '../engine/curriculum'
import { Subject } from '../engine/types'
import { DirectGradeModal } from '../components/DirectGradeModal'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SemesterProgressTracker } from '../components/dashboard/SemesterProgressTracker'
import { DashboardCourseCard } from '../components/dashboard/DashboardCourseCard'

interface DashboardProps {
  onOpenAddSubject: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAddSubject }) => {
  const {
    subjects,
    allSubjects,
    assessments,
    gradeResults,
    setActiveTab,
    setSelectedSubjectId,
    activeTerm,
    updateSubject
  } = useGrade()

  const [directGradeSubject, setDirectGradeSubject] = useState<Subject | null>(null)
  const [courseFilter, setCourseFilter] = useState<'all' | 'iabf' | 'gened'>('all')

  // Total enrolled units in current term
  const totalUnits = useMemo(() => {
    return subjects.reduce((sum, s) => sum + (s.units || 0), 0)
  }, [subjects])

  // Current term metrics & cumulative QPA
  const {
    termGradedCount,
    termQpa,
    termLetter,
    termCoverageAvg,
    termGradedUnits
  } = useMemo(() => {
    let earnedQualityPointsTotal = 0
    let gradedUnitsTotal = 0
    let coverageSum = 0
    let gradedCount = 0

    for (const sub of subjects) {
      const res = gradeResults.get(sub.id)
      if (res && (res.completedWeightCoverage > 0 || res.isDirectGrade) && res.qualityPoints !== undefined) {
        gradedCount++
        earnedQualityPointsTotal += res.qualityPoints * sub.units
        gradedUnitsTotal += sub.units
        coverageSum += res.completedWeightCoverage
      }
    }

    const qpa = gradedUnitsTotal > 0 ? earnedQualityPointsTotal / gradedUnitsTotal : null

    let letter = '--'
    if (qpa !== null) {
      if (qpa >= 3.85) letter = 'A'
      else if (qpa >= 3.6) letter = 'A-'
      else if (qpa >= 3.3) letter = 'B+'
      else if (qpa >= 2.85) letter = 'B'
      else if (qpa >= 2.35) letter = 'C+'
      else if (qpa >= 1.85) letter = 'C'
      else if (qpa >= 1.35) letter = 'D+'
      else if (qpa >= 1.0) letter = 'D'
      else letter = 'F'
    }

    return {
      termGradedCount: gradedCount,
      termQpa: qpa !== null ? qpa.toFixed(2) : '--',
      termLetter: letter,
      termCoverageAvg: subjects.length > 0 ? (coverageSum / subjects.length).toFixed(1) : '0.0',
      termGradedUnits: gradedUnitsTotal
    }
  }, [subjects, gradeResults])

  // Cross-term overall cumulative QPA (Item 11)
  const {
    overallGradedCount,
    overallQpa,
    overallLetter,
    overallGradedUnits
  } = useMemo(() => {
    let earnedQP = 0
    let gradedUnits = 0
    let gradedCount = 0

    for (const sub of allSubjects) {
      const res = gradeResults.get(sub.id)
      if (res && (res.completedWeightCoverage > 0 || res.isDirectGrade) && res.qualityPoints !== undefined) {
        gradedCount++
        earnedQP += res.qualityPoints * (sub.units || 0)
        gradedUnits += sub.units || 0
      }
    }

    const qpa = gradedUnits > 0 ? earnedQP / gradedUnits : null
    let letter = '--'
    if (qpa !== null) {
      if (qpa >= 3.85) letter = 'A'
      else if (qpa >= 3.6) letter = 'A-'
      else if (qpa >= 3.3) letter = 'B+'
      else if (qpa >= 2.85) letter = 'B'
      else if (qpa >= 2.35) letter = 'C+'
      else if (qpa >= 1.85) letter = 'C'
      else if (qpa >= 1.35) letter = 'D+'
      else if (qpa >= 1.0) letter = 'D'
      else letter = 'F'
    }

    return {
      overallGradedCount: gradedCount,
      overallQpa: qpa !== null ? qpa.toFixed(2) : '--',
      overallLetter: letter,
      overallGradedUnits: gradedUnits
    }
  }, [allSubjects, gradeResults])

  // Filtered courses based on category tabs
  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      if (courseFilter === 'all') return true
      if (courseFilter === 'iabf') return sub.category === 'iabf_major'
      if (courseFilter === 'gened') return sub.category === 'gen_ed'
      return true
    })
  }, [subjects, courseFilter])

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setActiveTab('subjects')
  }

  // Upcoming deliverables from database
  const upcomingAssessments = useMemo(() => {
    return assessments
      .filter(a => a.pointsEarned === null)
      .slice(0, 3)
      .map(a => {
        const sub = subjects.find(s => s.id === a.subjectId)
        return {
          ...a,
          subjectCode: sub?.code || 'Course',
          subjectName: sub?.name || ''
        }
      })
  }, [assessments, subjects])

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-200">
      {/* 1. Subheader: Category, Title & Academic Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-stone-400 dark:text-stone-400">
            ACCOUNTANCY PORTFOLIO
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-0.5">
            Academic Status
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
              SY {getAcademicYearForYear(activeTerm.year)} • {activeTerm.termName} • {totalUnits.toFixed(1)} Total Units
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8f5ec] dark:bg-[#0a2217] border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Zero-Based Grading Active</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e2e6de] dark:border-emerald-900/60 bg-white dark:bg-[#0c2419] text-xs font-semibold font-mono text-stone-700 dark:text-emerald-200 hover:bg-stone-50 dark:hover:bg-[#123122] transition-all shadow-2xs active:scale-95"
          >
            <Target className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400" />
            <span>Target Solver</span>
          </button>
        </div>
      </div>

      {/* 2. Cumulative Standing Card with Term vs Overall Switcher (Item 11, Item 24) */}
      <DashboardHero
        activeTerm={activeTerm}
        academicYear={getAcademicYearForYear(activeTerm.year)}
        termQpa={termQpa}
        termLetter={termLetter}
        termGradedCount={termGradedCount}
        termTotalSubjects={subjects.length}
        overallQpa={overallQpa}
        overallLetter={overallLetter}
        overallGradedCount={overallGradedCount}
        overallTotalSubjects={allSubjects.length}
        overallGradedUnits={overallGradedUnits}
        isBsaMajor={true}
      />

      {/* 3. Semester Progress Completion Tracker (Item 12) */}
      <SemesterProgressTracker
        gradedCount={termGradedCount}
        totalCount={subjects.length}
        averageCoverage={termCoverageAvg}
        totalUnits={totalUnits}
        gradedUnits={termGradedUnits}
      />

      {/* 4. Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onOpenAddSubject}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-semibold text-xs font-mono tracking-wider transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Enrolled Subject</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('target')}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-[#0b1f16] hover:bg-stone-50 dark:hover:bg-[#0e271c] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-800 dark:text-emerald-100 font-semibold text-xs font-mono tracking-wider transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          <Target className="w-4 h-4 text-[#0d3824] dark:text-emerald-400" />
          <span>Required Score Solver</span>
        </button>
      </div>

      {/* 5. Enrolled Subjects */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Enrolled Subjects
            </h2>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
              &bull; {activeTerm.termName} ({filteredSubjects.length})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 ${
                courseFilter === 'all'
                  ? 'bg-[#0d3824] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#151c18]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCourseFilter('iabf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 ${
                courseFilter === 'iabf'
                  ? 'bg-[#0d3824] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#151c18]'
              }`}
            >
              IABF Majors
            </button>
            <button
              type="button"
              onClick={() => setCourseFilter('gened')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active:scale-95 ${
                courseFilter === 'gened'
                  ? 'bg-[#0d3824] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#151c18]'
              }`}
            >
              GenEd Core
            </button>
          </div>
        </div>

        {/* Course Cards List (Decomposed Item 7) */}
        <div className="space-y-3">
          {filteredSubjects.map((sub) => (
            <DashboardCourseCard
              key={sub.id}
              subject={sub}
              gradeResult={gradeResults.get(sub.id)}
              onSelect={handleSelectSubject}
              onDirectGrade={setDirectGradeSubject}
            />
          ))}

          {filteredSubjects.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-[#e2e6de] dark:border-stone-800 bg-white dark:bg-[#151c18] text-stone-500 dark:text-stone-400 text-xs font-mono">
              No subjects found for {activeTerm.termName} in this category filter.
            </div>
          )}
        </div>
      </div>

      {/* 6. Upcoming Assessments / Agenda */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Upcoming Agenda &amp; Deliverables
          </h2>
          <span className="text-[10px] font-mono font-bold tracking-widest text-stone-400 uppercase">
            SY {getAcademicYearForYear(activeTerm.year)}
          </span>
        </div>

        {upcomingAssessments.length > 0 ? (
          <div className="space-y-2">
            {upcomingAssessments.map(asm => (
              <div
                key={asm.id}
                onClick={() => handleSelectSubject(asm.subjectId)}
                className="p-3.5 rounded-xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 flex items-center justify-between shadow-2xs cursor-pointer hover:border-[#0d3824]/40 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-11 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60 flex flex-col items-center justify-center text-center font-mono">
                    <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold leading-none">
                      PTS
                    </span>
                    <span className="text-sm font-bold text-stone-800 dark:text-stone-200 leading-tight">
                      {asm.totalPossiblePoints}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {asm.name}
                    </h4>
                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {asm.subjectCode} &bull; {asm.date || 'Pending Evaluation'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-mono font-semibold text-stone-600 dark:text-stone-300">
                  Record Score &rarr;
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 text-xs font-mono text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>No pending assessment deadlines currently recorded.</span>
            <button
              type="button"
              onClick={() => {
                if (subjects[0]) {
                  setSelectedSubjectId(subjects[0].id)
                  setActiveTab('subjects')
                }
              }}
              className="font-bold text-[#0d3824] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Open Subject Details &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 7. Academic Notice */}
      <div className="pt-4 pb-2">
        <div className="flex items-start gap-2.5 text-[11px] font-mono text-stone-500 dark:text-stone-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#0d3824] dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Academic tracker conforming to Far Eastern University (FEU Manila) IABF zero-based grading regulations for SY 2026-2027 First Semester.
          </span>
        </div>
      </div>

      {/* Direct Letter Grade Modal */}
      <DirectGradeModal
        isOpen={!!directGradeSubject}
        subject={directGradeSubject}
        onClose={() => setDirectGradeSubject(null)}
        onSave={async (updates) => {
          if (directGradeSubject) {
            await updateSubject(directGradeSubject.id, updates)
            setDirectGradeSubject(null)
          }
        }}
        onClear={async (period) => {
          if (directGradeSubject) {
            if (period === 'midterm') {
              await updateSubject(directGradeSubject.id, {
                isDirectMidtermActive: false,
                directMidtermLetterGrade: undefined,
                directMidtermGradePoint: undefined,
                directMidtermRawScore: undefined,
                directMidtermRemarks: undefined
              })
            } else if (period === 'final') {
              await updateSubject(directGradeSubject.id, {
                isDirectFinalActive: false,
                directFinalLetterGrade: undefined,
                directFinalGradePoint: undefined,
                directFinalRawScore: undefined,
                directFinalRemarks: undefined
              })
            } else {
              await updateSubject(directGradeSubject.id, {
                isDirectGradeActive: false,
                directLetterGrade: undefined,
                directGradePoint: undefined,
                directRawScore: undefined,
                directGradeRemarks: undefined,
                isDirectMidtermActive: false,
                directMidtermLetterGrade: undefined,
                directMidtermGradePoint: undefined,
                directMidtermRawScore: undefined,
                directMidtermRemarks: undefined,
                isDirectFinalActive: false,
                directFinalLetterGrade: undefined,
                directFinalGradePoint: undefined,
                directFinalRawScore: undefined,
                directFinalRemarks: undefined
              })
            }
            setDirectGradeSubject(null)
          }
        }}
      />
    </div>
  )
}
