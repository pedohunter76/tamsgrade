import React from 'react'
import { BookOpen, Scale, ListFilter, ShieldCheck } from 'lucide-react'
import { SubjectGradeResult } from '../../engine/types'

interface SubjectRequiredScoreSidebarProps {
  currentResult: SubjectGradeResult | null
  targetGrade: '4.00' | '3.75' | '3.50' | '3.00' | '2.50'
  setTargetGrade: (grade: '4.00' | '3.75' | '3.50' | '3.00' | '2.50') => void
  targetRequirement: {
    needed: number
    status: 'secured' | 'unreachable' | 'achievable' | 'unknown'
    remainingWeight: number
  }
  targetThresholds: Record<string, { raw: number; letter: string; label: string }>
  onNavigateSimulator: () => void
}

export const SubjectRequiredScoreSidebar: React.FC<SubjectRequiredScoreSidebarProps> = ({
  currentResult,
  targetGrade,
  setTargetGrade,
  targetRequirement,
  targetThresholds,
  onNavigateSimulator
}) => {
  return (
    <div className="space-y-5">
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
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
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
                      {meta?.letter}
                    </span>
                  </div>
                  <span className="block text-[10px] opacity-80 mt-0.5 truncate">
                    {meta?.raw}% min
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
          onClick={onNavigateSimulator}
          className="w-full py-2 px-3 rounded-xl border border-[#e2e6de] dark:border-emerald-900/60 bg-[#fafbfa] dark:bg-[#081b12] hover:bg-stone-50 dark:hover:bg-[#0e2c1e] text-stone-800 dark:text-emerald-100 text-xs font-mono font-semibold transition-all shadow-2xs cursor-pointer"
        >
          Simulate in What-If Sandbox &rarr;
        </button>
      </div>

      {/* 2. FEU Transmutation Scale Table */}
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
  )
}
