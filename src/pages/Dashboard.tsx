import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Sliders,
  Award
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { formatGrade } from '../engine/calculator'
import { formatTransmutedGradeWithLetter } from '../engine/transmutation'
import { getAcademicYearForYear } from '../engine/curriculum'
import { Subject } from '../engine/types'
import { DirectGradeModal } from '../components/DirectGradeModal'

interface DashboardProps {
  onOpenAddSubject: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAddSubject }) => {
  const {
    subjects,
    assessments,
    gradeResults,
    setActiveTab,
    setSelectedSubjectId,
    activeTermId,
    activeTerm,
    updateSubject
  } = useGrade()

  const [directGradeSubject, setDirectGradeSubject] = useState<Subject | null>(null)
  const [courseFilter, setCourseFilter] = useState<'all' | 'iabf' | 'gened'>('all')

  // Total enrolled units
  const totalUnits = useMemo(() => {
    return subjects.reduce((sum, s) => sum + (s.units || 0), 0)
  }, [subjects])

  // Count evaluated subjects & compute cumulative QPA
  const { gradedSubjectsCount, cumulativeQpa, cumulativeLetter, totalCoverageSum } = useMemo(() => {
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

    // Determine letter grade for cumulative QPA
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
      gradedSubjectsCount: gradedCount,
      cumulativeQpa: qpa !== null ? qpa.toFixed(2) : '--',
      cumulativeLetter: letter,
      totalCoverageSum: subjects.length > 0 ? (coverageSum / subjects.length).toFixed(1) : '0.0'
    }
  }, [subjects, gradeResults])

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

  // Find any upcoming assessments from DB
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
            <span className="text-stone-300 dark:text-emerald-900">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8f5ec] dark:bg-[#0a2217] border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Zero-Based Grading Active</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('target')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e2e6de] dark:border-emerald-900/60 bg-white dark:bg-[#0c2419] text-xs font-semibold font-mono text-stone-700 dark:text-emerald-200 hover:bg-stone-50 transition-all shadow-2xs"
          >
            <Target className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400" />
            <span>Target Solver</span>
          </button>
        </div>
      </div>

      {/* 2. Cumulative Standing Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-stone-400 dark:text-stone-400">
            CUMULATIVE TERM STANDING (SY {getAcademicYearForYear(activeTerm.year)} {activeTerm.semester.toUpperCase()})
          </span>
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-400">
            BSA Retention Standard: &ge; 2.50 (C+)
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-2 flex-wrap gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
              {cumulativeQpa}
            </span>
            <span className="text-xl sm:text-2xl font-serif text-stone-800 dark:text-stone-200">
              QPA
            </span>
            {cumulativeLetter !== '--' && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[11px] font-mono font-bold text-[#0d3824] dark:text-emerald-300">
                Grade: {cumulativeLetter}
              </span>
            )}
            {cumulativeQpa === '--' && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-[#1f2823] text-[11px] font-mono text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60">
                Clean Slate • Ready for Scores
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-mono font-bold text-stone-700 dark:text-stone-100">
              2.50
            </span>
            <span className="ml-1 text-xs text-stone-400 dark:text-stone-400">Cutoff Limit</span>
          </div>
        </div>
      </div>

      {/* 3. Three Mini Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Enrolled Courses */}
        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400">
            <span>ENROLLED SUBJECTS</span>
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {subjects.length} Courses
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">
            {totalUnits.toFixed(1)} Academic Units
          </div>
        </div>

        {/* Evaluated Progress */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400">
            <span>SYLLABUS PROGRESS</span>
            <span className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-emerald-950/80 border border-stone-200 dark:border-emerald-800/40 text-[9px] font-mono font-bold text-stone-600 dark:text-emerald-300">
              {gradedSubjectsCount} Graded
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {totalCoverageSum}%
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">
            Average Term Evaluation
          </div>
        </div>

        {/* Academic Standard */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400">
            <span>FEU IABF PROTOCOL</span>
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Zero-Based
          </div>
          <div className="text-[11px] font-mono font-semibold text-[#0d3824] dark:text-emerald-400">
            60.00% Passing Baseline
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <button
          onClick={onOpenAddSubject}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-semibold text-xs font-mono tracking-wider transition-all shadow-xs active-press cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Enrolled Subject</span>
        </button>

        <button
          onClick={() => setActiveTab('target')}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-[#0b1f16] hover:bg-stone-50 dark:hover:bg-[#0e271c] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-800 dark:text-emerald-100 font-semibold text-xs font-mono tracking-wider transition-all shadow-2xs active-press cursor-pointer"
        >
          <Target className="w-4 h-4 text-[#0d3824] dark:text-emerald-400" />
          <span>Required Score Solver</span>
        </button>
      </div>

      {/* 5. Enrolled Subjects */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-emerald-50">
              Enrolled Subjects
            </h2>
            <span className="text-xs text-stone-400 dark:text-emerald-400/60 font-medium">
              &bull; {activeTerm.termName} ({filteredSubjects.length})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active-press min-h-[36px] sm:min-h-0 flex items-center ${
                courseFilter === 'all'
                  ? 'bg-[#0d3824] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-600 dark:text-emerald-300 hover:bg-stone-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCourseFilter('iabf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active-press min-h-[36px] sm:min-h-0 flex items-center ${
                courseFilter === 'iabf'
                  ? 'bg-[#0d3824] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-600 dark:text-emerald-300 hover:bg-stone-50'
              }`}
            >
              IABF Majors
            </button>
            <button
              onClick={() => setCourseFilter('gened')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all active-press min-h-[36px] sm:min-h-0 flex items-center ${
                courseFilter === 'gened'
                  ? 'bg-[#0d3824] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-600 dark:text-emerald-300 hover:bg-stone-50'
              }`}
            >
              GenEd Core
            </button>
          </div>
        </div>

        {/* Course Cards List */}
        <div className="space-y-3">
          {filteredSubjects.map((sub) => {
            const res = gradeResults.get(sub.id)
            const hasData = res && res.completedWeightCoverage > 0
            const isMajor = sub.category === 'iabf_major'
            const qp = res?.qualityPoints ?? 3.0
            const isAttention = hasData && isMajor && qp < 2.5
            const isExemplary = hasData && qp >= 3.5

            const formattedTransmuted = res?.transmutedGrade
              ? formatTransmutedGradeWithLetter(res.transmutedGrade, res.letterGrade)
              : '--'

            return (
              <div
                key={sub.id}
                onClick={() => handleSelectSubject(sub.id)}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 hover:border-[#0d3824]/40 dark:hover:border-stone-600 transition-all shadow-2xs cursor-pointer group active-press"
              >
                {/* Header row: Code, category & Status pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                      {sub.code}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#1c2721] border border-stone-200 dark:border-stone-700/60 text-[10px] font-mono text-stone-600 dark:text-stone-300 uppercase">
                      {isMajor ? `IABF MAJOR • ${sub.units}U` : `GENED • ${sub.units}U`}
                    </span>
                    {sub.section && !sub.section.includes('109') && !sub.section.includes('Block') && (
                      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-400">
                        Sec {sub.section}
                      </span>
                    )}
                  </div>

                  <div>
                    {sub.isDirectMidtermActive && sub.directMidtermLetterGrade ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/40 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Midterm Running • {sub.directMidtermLetterGrade} ({sub.directMidtermGradePoint?.toFixed(2)})
                      </span>
                    ) : sub.isDirectFinalActive && sub.directFinalLetterGrade ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Final Grade • {sub.directFinalLetterGrade} ({sub.directFinalGradePoint?.toFixed(2)})
                      </span>
                    ) : sub.isDirectGradeActive && sub.directLetterGrade ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Direct Grade • {sub.directLetterGrade}
                      </span>
                    ) : !hasData ? (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#1a231e] border border-stone-200 dark:border-stone-700/60 text-[10px] font-mono font-medium text-stone-500 dark:text-stone-400">
                        Clean Slate • 0% Graded
                      </span>
                    ) : isAttention ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#fef7ee] dark:bg-amber-950/50 border border-[#fde4ca] dark:border-amber-800/40 text-[10px] font-mono font-bold text-[#b45309] dark:text-amber-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
                        Attention Req. (&lt; 2.50)
                      </span>
                    ) : isExemplary ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300">
                        • Exemplary Standing
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300">
                        + On Pace
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Name */}
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mt-1.5 group-hover:text-[#0d3824] dark:group-hover:text-emerald-300 transition-colors">
                  {sub.name}
                </h3>

                {/* 3-Column Metrics Container distinguishing Midterm vs Final Grade */}
                <div className="mt-3 p-3 rounded-xl bg-[#f8faf7] dark:bg-[#19221d] border border-[#e5ebe2] dark:border-stone-800/80 grid grid-cols-3 text-center">
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-400 uppercase font-bold">
                      MIDTERM RUNNING
                    </span>
                    <span className="block text-sm font-mono font-bold text-stone-800 dark:text-stone-100 mt-0.5">
                      {res?.midtermGrade?.letterGrade
                        ? `${res.midtermGrade.letterGrade} (${res.midtermGrade.transmutedGrade || '--'})`
                        : hasData
                        ? `${formatGrade(res.midtermGrade?.rawPercentage || 0, 1)}%`
                        : '--'}
                    </span>
                    <span className="block text-[9px] font-mono text-stone-400 dark:text-stone-400 mt-0.5">
                      {res?.midtermGrade?.isDirect ? 'Given Midterm' : 'Running Grade'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-400 uppercase font-bold">
                      FINAL GRADE
                    </span>
                    <span
                      className={`block text-sm font-mono font-bold mt-0.5 ${
                        isAttention
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-[#0d3824] dark:text-emerald-400 font-extrabold'
                      }`}
                    >
                      {res?.finalGrade?.letterGrade
                        ? `${res.finalGrade.letterGrade} (${res.finalGrade.transmutedGrade || '--'})`
                        : formattedTransmuted}
                    </span>
                    <span className="block text-[9px] font-mono text-stone-400 dark:text-stone-400 mt-0.5">
                      {res?.finalGrade?.isProjected ? 'Projected Course Pace' : 'Official Destination'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-400 uppercase font-bold">
                      SYLLABUS
                    </span>
                    <span className="block text-sm font-mono font-bold text-stone-800 dark:text-stone-100 mt-0.5">
                      {Math.round(res?.completedWeightCoverage || 0)}% Graded
                    </span>
                    <span className="block text-[9px] font-mono text-stone-400 dark:text-stone-400 mt-0.5">
                      {sub.units} Lecture Units
                    </span>
                  </div>
                </div>

                {/* Milestone Pipeline: Midterm Running -> Finals Destination */}
                <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#fafbfa] dark:bg-[#141b17] border border-[#e8ece5] dark:border-stone-800/80 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-stone-500 dark:text-stone-400">Midterm Running:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-100">
                      {res?.midtermGrade?.letterGrade
                        ? `${res.midtermGrade.letterGrade} (${res.midtermGrade.rawPercentage.toFixed(1)}%)`
                        : 'In Progress'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400 shrink-0" />
                    <span className="text-stone-500 dark:text-stone-400">Final Destination:</span>
                    <span className="font-bold text-[#0d3824] dark:text-emerald-400">
                      {res?.finalGrade?.letterGrade
                        ? `${res.finalGrade.letterGrade} (${res.finalGrade.rawPercentage.toFixed(1)}%)`
                        : 'Awaiting Finals'}
                    </span>
                  </div>
                </div>

                {/* Progress bar row */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-emerald-400/70">
                    <span>
                      {hasData
                        ? `${(res?.completedWeightCoverage || 0).toFixed(1)}% Syllabus Assessed`
                        : 'No assessments entered yet'}
                    </span>
                    <span>
                      {hasData
                        ? `${(100 - (res?.completedWeightCoverage || 0)).toFixed(1)}% Remaining`
                        : `${sub.units} Lecture Units`}
                    </span>
                  </div>
                  {/* Segmented Bar (10 segments) */}
                  <div className="grid grid-cols-10 gap-1 h-1.5">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const isFilled = idx < Math.round((res?.completedWeightCoverage || 0) / 10)
                      return (
                        <div
                          key={idx}
                          className={`rounded-full h-full ${
                            isFilled
                              ? isAttention
                                ? 'bg-amber-600'
                                : 'bg-[#0d3824] dark:bg-emerald-500'
                              : 'bg-stone-200 dark:bg-emerald-950/60'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Footer link to manage assessments & Direct grade button */}
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-emerald-950/50 flex items-center justify-between text-xs text-stone-500 dark:text-emerald-400/70 font-mono gap-2 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDirectGradeSubject(sub)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-[#0d3824] dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/40 text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active-press min-h-[40px] sm:min-h-0"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {sub.isDirectMidtermActive && sub.directMidtermLetterGrade
                        ? `Given Midterm: ${sub.directMidtermLetterGrade} (${(sub.directMidtermGradePoint ?? 0).toFixed(2)})`
                        : sub.isDirectFinalActive && sub.directFinalLetterGrade
                        ? `Given Final: ${sub.directFinalLetterGrade} (${(sub.directFinalGradePoint ?? 0).toFixed(2)})`
                        : sub.isDirectGradeActive && sub.directLetterGrade
                        ? `Given Grade: ${sub.directLetterGrade} (${(sub.directGradePoint ?? 0).toFixed(2)})`
                        : '+ Input Given Grade'}
                    </span>
                  </button>
                  <span className="text-[#0d3824] dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform min-h-[40px] sm:min-h-0 items-center">
                    <span>View Subject</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )
          })}
          {filteredSubjects.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#0b1f16] text-stone-500 dark:text-emerald-400/70 text-xs font-mono">
              No subjects found for {activeTerm.termName} in this category filter.
            </div>
          )}
        </div>
      </div>

      {/* 6. Upcoming Assessments / Agenda */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-emerald-50">
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
                className="p-3.5 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 flex items-center justify-between shadow-2xs cursor-pointer hover:border-[#0d3824]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-11 rounded-lg bg-stone-100 dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/40 flex flex-col items-center justify-center text-center font-mono">
                    <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold leading-none">
                      PTS
                    </span>
                    <span className="text-sm font-bold text-stone-800 dark:text-emerald-100 leading-tight">
                      {asm.totalPossiblePoints}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-emerald-100">
                      {asm.name}
                    </h4>
                    <p className="text-[11px] font-mono text-stone-500 dark:text-emerald-400/60">
                      {asm.subjectCode} &bull; {asm.date || 'Pending Evaluation'}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-900/40 text-[10px] font-mono font-semibold text-stone-600 dark:text-emerald-300">
                  Record Score &rarr;
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 text-xs font-mono text-stone-500 dark:text-emerald-400/70 flex items-center justify-between">
            <span>No pending assessment deadlines currently recorded.</span>
            <button
              onClick={() => {
                if (subjects[0]) {
                  setSelectedSubjectId(subjects[0].id)
                  setActiveTab('subjects')
                }
              }}
              className="font-bold text-[#0d3824] dark:text-emerald-400 hover:underline"
            >
              Open Subject Details &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 7. Academic Notice */}
      <div className="pt-4 pb-2">
        <div className="flex items-start gap-2.5 text-[11px] font-mono text-stone-500 dark:text-emerald-400/70 leading-relaxed">
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
