import React from 'react'
import { CheckCircle2, Clock, BookOpen, Layers } from 'lucide-react'

interface SemesterProgressTrackerProps {
  gradedCount: number
  totalCount: number
  averageCoverage: string
  totalUnits: number
  gradedUnits: number
}

export const SemesterProgressTracker: React.FC<SemesterProgressTrackerProps> = ({
  gradedCount,
  totalCount,
  averageCoverage,
  totalUnits,
  gradedUnits
}) => {
  const subjectProgress = totalCount > 0 ? (gradedCount / totalCount) * 100 : 0
  const coverageNumber = parseFloat(averageCoverage) || 0

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 shadow-2xs space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0d3824] dark:text-emerald-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Semester Evaluation Progress
          </span>
        </div>
        <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
          {gradedCount} of {totalCount} Subjects Graded ({Math.round(subjectProgress)}%)
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {/* Subject completion bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-stone-500 mb-1">
            <span>Course Evaluation Ratio</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {gradedCount}/{totalCount} Courses
            </span>
          </div>
          <div className="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-200/60 dark:border-stone-700/60">
            <div
              className="h-full bg-gradient-to-r from-[#0d3824] to-[#10b981] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, subjectProgress))}%` }}
            />
          </div>
        </div>

        {/* Average Syllabus Coverage */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-stone-500 mb-1">
            <span>Average Syllabus Weight Evaluated</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {averageCoverage}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-200/60 dark:border-stone-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, coverageNumber))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meta indicators */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
          <BookOpen className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400" />
          <span>Active Units: <strong>{totalUnits.toFixed(1)}U</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 justify-end">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Graded: <strong>{gradedUnits.toFixed(1)}U</strong></span>
        </div>
      </div>
    </div>
  )
}
