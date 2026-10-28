import React, { useState } from 'react'
import { Sparkles, Award, ShieldCheck, AlertTriangle, Layers, Calendar } from 'lucide-react'
import { CurriculumTerm } from '../../engine/curriculum'
import { CelebrationToast } from '../CelebrationToast'

interface DashboardHeroProps {
  activeTerm: CurriculumTerm
  academicYear: string
  termQpa: string
  termLetter: string
  termGradedCount: number
  termTotalSubjects: number
  overallQpa: string
  overallLetter: string
  overallGradedCount: number
  overallTotalSubjects: number
  overallGradedUnits: number
  isBsaMajor: boolean
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  activeTerm,
  academicYear,
  termQpa,
  termLetter,
  termGradedCount,
  termTotalSubjects,
  overallQpa,
  overallLetter,
  overallGradedCount,
  overallTotalSubjects,
  overallGradedUnits,
  isBsaMajor
}) => {
  const [qpaView, setQpaView] = useState<'term' | 'overall'>('term')

  const activeQpa = qpaView === 'term' ? termQpa : overallQpa
  const activeLetter = qpaView === 'term' ? termLetter : overallLetter
  const numericQpa = parseFloat(activeQpa)

  // Honors milestone standing
  const isPresidentsList = !isNaN(numericQpa) && numericQpa >= 4.00
  const isDeansList = !isNaN(numericQpa) && numericQpa >= 3.50 && numericQpa < 4.00
  const isBelowRetention = isBsaMajor && !isNaN(numericQpa) && numericQpa < 2.50 && numericQpa > 0

  return (
    <div className="relative overflow-hidden p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 shadow-sm transition-all">
      {/* Decorative subtle background aura for Dean's/President's list */}
      {(isPresidentsList || isDeansList) && (
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-400/10 dark:bg-amber-400/5 blur-3xl pointer-events-none" />
      )}

      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-stone-400 dark:text-stone-400">
            {qpaView === 'term' ? `CURRENT TERM (SY ${academicYear} ${activeTerm.semester.toUpperCase()})` : 'ALL-SEMESTER CUMULATIVE STANDING'}
          </span>
          {isBsaMajor && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 dark:bg-[#1a241f] text-stone-500 dark:text-stone-400">
              Cutoff &ge; 2.50
            </span>
          )}
        </div>

        {/* View Toggle */}
        <div className="inline-flex p-0.5 rounded-xl bg-stone-100 dark:bg-[#1f2823] border border-stone-200/80 dark:border-stone-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setQpaView('term')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              qpaView === 'term'
                ? 'bg-white dark:bg-[#0d3824] text-[#0d3824] dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Term QPA
          </button>
          <button
            type="button"
            onClick={() => setQpaView('overall')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              qpaView === 'overall'
                ? 'bg-white dark:bg-[#0d3824] text-[#0d3824] dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Overall QPA
          </button>
        </div>
      </div>

      {/* Main QPA Metric */}
      <div className="flex items-baseline justify-between mt-3 flex-wrap gap-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl sm:text-6xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            {activeQpa}
          </span>
          <span className="text-xl sm:text-2xl font-serif text-stone-800 dark:text-stone-300">
            QPA
          </span>

          {activeLetter !== '--' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-xs font-mono font-bold text-[#0d3824] dark:text-emerald-300">
              Grade {activeLetter}
            </span>
          )}

          {activeQpa === '--' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#1f2823] text-xs font-mono text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60">
              Clean Slate • Ready for Evaluations
            </span>
          )}

          {/* Honors Milestones */}
          {isPresidentsList && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold text-amber-900 dark:text-amber-200 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              President's List Standing (4.00)
            </span>
          )}
          {isDeansList && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Dean's Honor Target (&ge; 3.50)
            </span>
          )}
        </div>

        {/* Status / Breakdown pill */}
        <div className="text-right">
          {qpaView === 'term' ? (
            <div>
              <span className="text-sm font-mono font-bold text-stone-700 dark:text-stone-200">
                {termGradedCount} of {termTotalSubjects}
              </span>
              <span className="ml-1 text-xs text-stone-400">Subjects Graded</span>
            </div>
          ) : (
            <div>
              <span className="text-sm font-mono font-bold text-stone-700 dark:text-stone-200">
                {overallGradedUnits.toFixed(1)} Units
              </span>
              <span className="ml-1 text-xs text-stone-400">across {overallGradedCount} Subjects</span>
            </div>
          )}
        </div>
      </div>

      {/* Retention Alert if applicable */}
      {isBelowRetention && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>BSA Retention Notice:</strong> Current QPA is below the 2.50 minimum retention threshold for major courses. Use Target Solver to plan required grades.
          </span>
        </div>
      )}

      {/* Milestone Celebration Toast */}
      {numericQpa >= 3.50 && (
        <CelebrationToast
          qpa={numericQpa}
          honorsTitle={isPresidentsList ? "President's List Standing" : "Dean's List Standing"}
        />
      )}
    </div>
  )
}
