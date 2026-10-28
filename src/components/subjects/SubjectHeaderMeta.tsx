import React from 'react'
import { Clock } from 'lucide-react'
import { Subject } from '../../engine/types'

interface SubjectHeaderMetaProps {
  currentSubject: Subject
  subjects: Subject[]
  selectedSubjectId: string | null
  onSelectSubject: (id: string) => void
  activeTerm: { termName: string; semester: string }
  isMajor: boolean
}

export const SubjectHeaderMeta: React.FC<SubjectHeaderMetaProps> = ({
  currentSubject,
  subjects,
  selectedSubjectId,
  onSelectSubject,
  activeTerm,
  isMajor
}) => {
  return (
    <>
      {/* Enrolled Subjects Switcher Bar */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-momentum -mx-1 px-1">
          <span className="text-[11px] font-mono text-stone-400 dark:text-emerald-500/70 uppercase tracking-wider shrink-0 mr-1">
            ENROLLED:
          </span>
          {subjects.map((sub) => {
            const isSelected = (selectedSubjectId || currentSubject.id) === sub.id
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className={`flex items-center gap-2 px-3 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-xl sm:rounded-lg text-xs font-mono transition-all shrink-0 active-press cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d3824] text-white font-bold shadow-2xs'
                    : 'bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 text-stone-700 dark:text-emerald-200 hover:bg-stone-50'
                }`}
              >
                <span>{sub.code}</span>
                <span className="text-[10px] opacity-70 truncate max-w-[120px]">
                  {sub.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Subject Header & Academic Meta */}
      <div className="space-y-3">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono font-semibold">
          <span className="px-2.5 py-0.5 rounded-md bg-[#0d3824] text-white">
            {isMajor ? 'IABF MAJOR' : 'GENED CORE'}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200">
            {currentSubject.units || 3.0} Units Lecture
          </span>
          {currentSubject.section && (
            <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200">
              Section {currentSubject.section}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[#0d3824] dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>SY {currentSubject.academicYear || '2026-2027'} &bull; {currentSubject.semester ? currentSubject.semester.toUpperCase() : activeTerm.semester.toUpperCase()}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-emerald-50 tracking-tight">
          {currentSubject.code} &mdash; {currentSubject.name}
        </h1>

        {/* Schedule & Room info */}
        {(currentSubject.schedule || currentSubject.room) && (
          <div className="flex items-center gap-3 text-xs font-mono text-stone-500 dark:text-emerald-400/80 flex-wrap">
            {currentSubject.schedule && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0d3824] dark:text-emerald-400 shrink-0" />
                <span>{currentSubject.schedule}</span>
              </span>
            )}
            {currentSubject.room && (
              <span className="text-stone-400 dark:text-emerald-600/60">&bull;</span>
            )}
            {currentSubject.room && (
              <span>{currentSubject.room}</span>
            )}
          </div>
        )}

        {/* Notes / Syllabus description */}
        {currentSubject.notes && (
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 max-w-4xl leading-relaxed">
            {currentSubject.notes}
          </p>
        )}
      </div>
    </>
  )
}
