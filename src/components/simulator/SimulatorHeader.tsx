import React from 'react'
import { Award, RotateCcw, Sliders } from 'lucide-react'
import { Subject } from '../../engine/types'

interface SimulatorHeaderProps {
  currentSubject: Subject
  activeSubjects: Subject[]
  activeTerm: { termName: string }
  isBsaMajor: boolean
  isDirectGradeActive: boolean
  whatIfCount: number
  onSelectSubject: (id: string) => void
  onRevertAll: () => void
}

export const SimulatorHeader: React.FC<SimulatorHeaderProps> = ({
  currentSubject,
  activeSubjects,
  activeTerm,
  isBsaMajor,
  isDirectGradeActive,
  whatIfCount,
  onSelectSubject,
  onRevertAll
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Header Bar & Course Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="font-bold text-[#0d3824] dark:text-emerald-400">
              {currentSubject.code}
            </span>
            <span className="text-stone-300 dark:text-emerald-800/80">•</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-900/40 text-[10px] font-bold text-stone-600 dark:text-emerald-300 uppercase">
              {isBsaMajor ? 'IABF MAJOR' : 'GENED CORE'} • {currentSubject.units}U
            </span>
            <span className="text-stone-300 dark:text-emerald-800/80">•</span>
            <span className="text-stone-500 dark:text-emerald-400/80">
              {activeTerm.termName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-emerald-50 mt-1.5 m-0">
            {currentSubject.name}
          </h1>

          <p className="text-xs text-stone-500 dark:text-emerald-400/70 mt-1 font-mono">
            Canvas LMS What-If Grade Simulator • Calculate how hypothetical scores impact your total course grade without altering your official records.
          </p>
        </div>

        {/* Course Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={currentSubject.id}
            onChange={(e) => onSelectSubject(e.target.value)}
            aria-label="Select course for What-If simulation"
            className="text-xs font-mono font-bold py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#081b12] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-100 focus:ring-1 focus:ring-[#0d3824] focus:outline-hidden cursor-pointer shadow-2xs"
          >
            {activeSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Direct Professor Grade Notice (if applicable) */}
      {isDirectGradeActive && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-[#f0f9f3] dark:from-emerald-950/60 dark:to-[#082216] border border-emerald-200 dark:border-emerald-800/60 flex items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0d3824] dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0d3824] dark:text-emerald-300">
                  Direct Professor Grade Active: {currentSubject.directLetterGrade} ({currentSubject.directGradePoint?.toFixed(2)})
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-emerald-300/80 mt-0.5">
                Entering What-If scores below calculates your hypothetical bottom-up syllabus grade side-by-side with your given grade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Official Canvas LMS What-If Announcement & Global Revert Bar */}
      <div
        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
          whatIfCount > 0
            ? 'bg-[#eaf5ed] dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800/80'
            : 'bg-white dark:bg-[#0b1f16] border-[#e2e6de] dark:border-emerald-950/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              whatIfCount > 0
                ? 'bg-[#0d3824] text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-emerald-950/60 text-[#0d3824] dark:text-emerald-400'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-emerald-100">
                {whatIfCount > 0
                  ? `Viewing What-If Grades (${whatIfCount} Hypothetical Score${whatIfCount > 1 ? 's' : ''} Active)`
                  : 'Canvas LMS What-If Mode Ready'}
              </span>
              {whatIfCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0d3824] text-white shadow-2xs">
                  Active Simulation
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 dark:text-emerald-400/80 mt-0.5 font-mono">
              {whatIfCount > 0
                ? "This calculation includes hypothetical scores and does not affect your official records. Click 'Revert to Actual Score' to restore your original grades."
                : "Click any score in the table below to enter a hypothetical score and calculate what your total grade will be. Only you can view What-If scores."}
            </p>
          </div>
        </div>

        {/* Global Canvas "Revert to Actual Score" Button */}
        {whatIfCount > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRevertAll}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c2419] hover:bg-stone-100 dark:hover:bg-[#0e2c1e] text-stone-800 dark:text-emerald-100 border border-[#e2e6de] dark:border-emerald-800/80 text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-600 dark:text-emerald-400" />
              <span>Revert to Actual Score</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
