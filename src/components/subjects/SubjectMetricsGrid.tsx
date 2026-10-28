import React from 'react'
import { ArrowRight } from 'lucide-react'
import { SubjectGradeResult } from '../../engine/types'

interface SubjectMetricsGridProps {
  currentResult: SubjectGradeResult | null
  isMajor: boolean
}

export const SubjectMetricsGrid: React.FC<SubjectMetricsGridProps> = ({
  currentResult,
  isMajor
}) => {
  return (
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
  )
}
