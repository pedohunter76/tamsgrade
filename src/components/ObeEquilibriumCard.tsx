import React from 'react'
import { Scale, CheckCircle2, Clock } from 'lucide-react'
import { Subject, Assessment } from '../engine/types'

interface ObeEquilibriumCardProps {
  subjects: Subject[]
  assessments: Assessment[]
}

export const ObeEquilibriumCard: React.FC<ObeEquilibriumCardProps> = ({
  subjects,
  assessments
}) => {
  const activeSubjects = subjects.filter(s => !s.isArchived)

  // Map category IDs to isSummative
  const categorySummativeMap = new Map<string, boolean>()
  activeSubjects.forEach(s => {
    s.categories.forEach(c => {
      categorySummativeMap.set(c.id, c.isSummative ?? (c.name.toLowerCase().includes('summative') || c.name.toLowerCase().includes('exam')))
    })
  })

  // Separate assessments into FA and SA
  const faAssessments = assessments.filter(a => {
    const isSummative = categorySummativeMap.get(a.categoryId) ?? (a.assessmentType === 'SA')
    return !isSummative
  })

  const saAssessments = assessments.filter(a => {
    const isSummative = categorySummativeMap.get(a.categoryId) ?? (a.assessmentType === 'SA')
    return isSummative
  })

  // Completed counts & scores
  const completedFa = faAssessments.filter(a => a.pointsEarned !== null)
  const completedSa = saAssessments.filter(a => a.pointsEarned !== null)

  const faAverage = completedFa.length > 0
    ? (completedFa.reduce((sum, a) => sum + ((a.pointsEarned ?? 0) / a.totalPossiblePoints) * 100, 0) / completedFa.length)
    : null

  const saAverage = completedSa.length > 0
    ? (completedSa.reduce((sum, a) => sum + ((a.pointsEarned ?? 0) / a.totalPossiblePoints) * 100, 0) / completedSa.length)
    : null

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a14] border border-stone-200/90 dark:border-emerald-900/40 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              OBE 50/50 Assessment Equilibrium
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Zero-Based Balance: Continuous Formative vs. Departmental Summative
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
          50% FA &bull; 50% SA
        </span>
      </div>

      {/* Two-Tone Visual Equilibrium Meter */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 flex">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: '50%' }}
            title="Formative Assessment (50% Syllabus Weight)"
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: '50%' }}
            title="Summative Assessment (50% Syllabus Weight)"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono font-semibold text-stone-500">
          <span>Continuous Assessment (50%)</span>
          <span>Departmental Exams (50%)</span>
        </div>
      </div>

      {/* Dual Side-by-Side Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Formative (Left) */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              Formative (FA)
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
              50% Course Total
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-stone-500">Average Performance</span>
            <span className="font-mono text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {faAverage !== null ? `${faAverage.toFixed(1)}%` : '--'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 pt-1 border-t border-emerald-200/40 dark:border-emerald-900/40">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {completedFa.length} Scored
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {faAssessments.length - completedFa.length} Pending
            </span>
          </div>
        </div>

        {/* Summative (Right) */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Summative (SA)
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
              50% (Midterm & Final)
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-stone-500">Average Exam Score</span>
            <span className="font-mono text-lg font-bold text-amber-700 dark:text-amber-300">
              {saAverage !== null ? `${saAverage.toFixed(1)}%` : '--'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 pt-1 border-t border-amber-200/40 dark:border-amber-900/40">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              {completedSa.length} Taken
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {saAssessments.length - completedSa.length} Remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
