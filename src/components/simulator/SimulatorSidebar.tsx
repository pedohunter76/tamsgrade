import React from 'react'
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { Subject, UserPreferences, CategoryCalculationResult } from '../../engine/types'
import { SimulationResult } from '../../engine/simulator'
import { formatGrade } from '../../engine/calculator'
import { formatTransmutedGradeWithLetter } from '../../engine/transmutation'

interface SimulatorSidebarProps {
  currentSubject: Subject
  simulation: SimulationResult | null
  whatIfCount: number
  preferences: UserPreferences
  isDirectGradeActive: boolean
  onRevertAll: () => void
  onConfirmCommit: () => void
}

export const SimulatorSidebar: React.FC<SimulatorSidebarProps> = ({
  currentSubject,
  simulation,
  whatIfCount,
  preferences,
  isDirectGradeActive,
  onRevertAll,
  onConfirmCommit
}) => {
  const rawDiff = simulation ? simulation.rawDifference : 0
  const isPositive = rawDiff > 0.001
  const isNegative = rawDiff < -0.001

  return (
    <div className="space-y-5">
      {/* Canvas Course Total Standing Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-5">
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 font-bold">
            CANVAS TOTAL GRADE
          </span>
          <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-emerald-50 mt-0.5">
            {whatIfCount > 0 ? 'What-If Projected Standing' : 'Actual Course Standing'}
          </h3>
        </div>

        {/* Giant What-If Score Badge */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0d3824] to-[#12442c] text-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 font-bold">
              {whatIfCount > 0 ? 'WHAT-IF PROJECTED GRADES' : 'ACTUAL COURSE STANDING'}
            </span>
            {whatIfCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#0d3824] dark:bg-emerald-950 dark:text-emerald-300 border border-transparent dark:border-emerald-700/60 shadow-2xs">
                Hypothetical
              </span>
            )}
          </div>

          {/* Differentiated Midterm Running vs Final Grade Milestone Pipeline */}
          <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800/80 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">
                  Midterm Running
                </span>
                <span className="text-base font-bold text-white">
                  {simulation?.simulatedResult.midtermGrade.letterGrade || '--'}
                  <span className="text-xs font-normal text-emerald-200 ml-1">
                    ({simulation?.simulatedResult.midtermGrade.rawPercentage ? `${simulation.simulatedResult.midtermGrade.rawPercentage.toFixed(1)}%` : '--'})
                  </span>
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0 mx-2" />

              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">
                  Final Course Grade
                </span>
                <span className="text-base font-bold text-white">
                  {simulation?.simulatedResult.finalGrade.letterGrade || '--'}
                  <span className="text-xs font-normal text-emerald-200 ml-1">
                    ({simulation?.simulatedResult.finalGrade.rawPercentage ? `${simulation.simulatedResult.finalGrade.rawPercentage.toFixed(1)}%` : '--'})
                  </span>
                </span>
              </div>
            </div>
            <div className="text-[10px] text-emerald-300/80 font-sans leading-tight">
              Midterm grade is the running milestone ahead to your official Final Grade.
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-mono font-bold tabular-nums">
              {simulation
                ? `${formatGrade(simulation.simulatedResult.normalizedProvisionalGrade, preferences.gradeDisplayPrecision)}`
                : '0.00'}
            </span>
            <span className="text-lg font-mono text-emerald-200">% Projected Raw</span>
          </div>

          {/* Transmuted Letter Grade & QPA */}
          <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-mono text-emerald-200 uppercase">
                FINAL LETTER GRADE
              </span>
              <span className="text-lg font-mono font-bold text-white">
                {formatTransmutedGradeWithLetter(
                  simulation?.simulatedResult.transmutedGrade,
                  simulation?.simulatedResult.letterGrade
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-mono text-emerald-200 uppercase">
                QUALITY POINTS
              </span>
              <span className="text-lg font-mono font-bold text-white">
                {simulation?.simulatedResult.qualityPoints !== undefined
                  ? simulation.simulatedResult.qualityPoints.toFixed(2)
                  : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison vs Original Recorded Standing */}
        <div className="p-3.5 rounded-xl bg-[#fafbfa] dark:bg-[#071911] border border-[#e5ebe2] dark:border-emerald-950/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-500 dark:text-emerald-400/70">Original Midterm Running:</span>
            <span className="font-bold text-stone-900 dark:text-emerald-100">
              {simulation && simulation.originalResult.midtermGrade.completedCoverage > 0
                ? `${simulation.originalResult.midtermGrade.rawPercentage.toFixed(1)}% (${simulation.originalResult.midtermGrade.letterGrade || '--'})`
                : currentSubject.isDirectMidtermActive && currentSubject.directMidtermLetterGrade
                ? `Given Midterm: ${currentSubject.directMidtermLetterGrade}`
                : 'Awaiting scores'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-500 dark:text-emerald-400/70">Original Final Standing:</span>
            <span className="font-bold text-stone-900 dark:text-emerald-100">
              {simulation && simulation.originalResult.completedWeightCoverage > 0
                ? `${formatGrade(simulation.originalResult.normalizedProvisionalGrade, 2)}% (${simulation.originalResult.letterGrade || '--'})`
                : currentSubject.isDirectFinalActive && currentSubject.directFinalLetterGrade
                ? `Given Final: ${currentSubject.directFinalLetterGrade}`
                : isDirectGradeActive
                ? `Given Grade: ${currentSubject.directLetterGrade}`
                : 'Clean Slate (0% Graded)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-stone-200/80 dark:border-emerald-950/50">
            <span className="text-stone-500 dark:text-emerald-400/70">Projected Impact:</span>
            <div className="flex items-center gap-1 font-bold">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : isNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              ) : null}
              <span
                className={
                  isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isNegative
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-stone-500'
                }
              >
                {isPositive ? `+${rawDiff.toFixed(2)}%` : `${rawDiff.toFixed(2)}%`}
              </span>
            </div>
          </div>

          {simulation?.transmutedGradeChanged && (
            <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
              Transmuted tier shifts from {formatTransmutedGradeWithLetter(simulation.previousTransmutedGrade, simulation.originalResult.letterGrade)} &rarr; {formatTransmutedGradeWithLetter(simulation.newTransmutedGrade, simulation.simulatedResult.letterGrade)}!
            </p>
          )}
        </div>

        {/* Canvas Assignment Groups / Category Breakdown */}
        <div className="space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 font-bold">
            ASSIGNMENT GROUPS BREAKDOWN
          </span>
          <div className="space-y-1.5 divide-y divide-stone-100 dark:divide-emerald-950/40 text-xs font-mono">
            {simulation?.simulatedResult.categories.map((c: CategoryCalculationResult) => {
              const cat = currentSubject.categories.find(sc => sc.id === c.categoryId)
              const weight = cat?.weight || 0
              return (
                <div key={c.categoryId} className="pt-1.5 first:pt-0 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-emerald-200 block truncate max-w-[180px]">
                      {cat?.name.split('(')[0].trim() || 'Category'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Weight: {weight}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 dark:text-emerald-100">
                      {c.hasCompletedAssessments ? `${c.percentage.toFixed(1)}%` : '--'}
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      {c.weightedContribution.toFixed(2)} / {weight} pts
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* BSA Retention Cutoff Check */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#071911] border border-stone-200 dark:border-emerald-950/80 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">BSA Retention Status:</span>
            <span
              className={`font-bold ${
                (simulation?.simulatedResult.qualityPoints ?? 3.0) >= 2.5
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {(simulation?.simulatedResult.qualityPoints ?? 3.0) >= 2.5
                ? 'In Good Standing (>= 2.50)'
                : 'Retention Alert (< 2.50)'}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 leading-tight">
            Requires minimum 2.50 (C+ • 75.00%) retention threshold for BSA accountancy curriculum.
          </p>
        </div>

        {/* Actions: Revert to Actual Score & Commit */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-emerald-950/50">
          {whatIfCount > 0 && (
            <button
              onClick={onRevertAll}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-emerald-950/60 hover:bg-stone-200 dark:hover:bg-emerald-900/60 text-stone-800 dark:text-emerald-200 border border-stone-200 dark:border-emerald-800/40 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Actual Score</span>
            </button>
          )}

          {whatIfCount > 0 && (
            <button
              onClick={onConfirmCommit}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-mono font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Commit What-If Scores to Subject</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
