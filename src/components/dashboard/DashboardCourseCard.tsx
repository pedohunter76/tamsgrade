import React from 'react'
import { Clock, GraduationCap, Award, ArrowRight } from 'lucide-react'
import { Subject, SubjectGradeResult } from '../../engine/types'
import { formatGrade } from '../../engine/calculator'
import { formatTransmutedGradeWithLetter } from '../../engine/transmutation'

interface DashboardCourseCardProps {
  subject: Subject
  gradeResult?: SubjectGradeResult
  onSelect: (subjectId: string) => void
  onDirectGrade?: (subject: Subject) => void
}

export const DashboardCourseCard: React.FC<DashboardCourseCardProps> = ({
  subject,
  gradeResult: res,
  onSelect,
  onDirectGrade
}) => {
  const hasData = res && res.completedWeightCoverage > 0
  const isMajor = subject.category === 'iabf_major'
  const qp = res?.qualityPoints ?? 3.0
  const isAttention = hasData && isMajor && qp < 2.5
  const isExemplary = hasData && qp >= 3.5

  const formattedTransmuted = res?.transmutedGrade
    ? formatTransmutedGradeWithLetter(res.transmutedGrade, res.letterGrade)
    : '--'

  return (
    <div
      onClick={() => onSelect(subject.id)}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151c18] border border-[#e2e6de] dark:border-stone-800 hover:border-[#0d3824]/40 dark:hover:border-stone-600 transition-all shadow-2xs cursor-pointer group active:scale-[0.99]"
    >
      {/* Header row: Code, category & Status pill */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
            {subject.code}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#1c2721] border border-stone-200 dark:border-stone-700/60 text-[10px] font-mono text-stone-600 dark:text-stone-300 uppercase">
            {isMajor ? `IABF MAJOR • ${subject.units}U` : `GENED • ${subject.units}U`}
          </span>
          {subject.section && !subject.section.includes('109') && !subject.section.includes('Block') && (
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-400">
              Sec {subject.section}
            </span>
          )}
        </div>

        <div>
          {subject.isDirectMidtermActive && subject.directMidtermLetterGrade ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/40 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Midterm Running • {subject.directMidtermLetterGrade} ({subject.directMidtermGradePoint?.toFixed(2)})
            </span>
          ) : subject.isDirectFinalActive && subject.directFinalLetterGrade ? (
            <span className="px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Final Grade • {subject.directFinalLetterGrade} ({subject.directFinalGradePoint?.toFixed(2)})
            </span>
          ) : subject.isDirectGradeActive && subject.directLetterGrade ? (
            <span className="px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950/70 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Direct Grade • {subject.directLetterGrade}
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
        {subject.name}
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
              ? `${formatGrade(res?.midtermGrade?.rawPercentage || 0, 1)}%`
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
            {subject.units} Lecture Units
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
              : 'Pending Finals'}
          </span>
        </div>
      </div>

      {/* Syllabus Completion Segmented Bar */}
      <div className="mt-2.5 space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
          <span>
            {hasData
              ? `${(res?.completedWeightCoverage || 0).toFixed(1)}% Syllabus Assessed`
              : 'No assessments entered yet'}
          </span>
          <span>
            {hasData
              ? `${(100 - (res?.completedWeightCoverage || 0)).toFixed(1)}% Remaining`
              : `${subject.units} Lecture Units`}
          </span>
        </div>
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
                    : 'bg-stone-200 dark:bg-stone-800'
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono gap-2 flex-wrap">
        {onDirectGrade && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDirectGrade(subject)
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-[#0d3824] dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/40 text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              {subject.isDirectMidtermActive && subject.directMidtermLetterGrade
                ? `Given Midterm: ${subject.directMidtermLetterGrade} (${(subject.directMidtermGradePoint ?? 0).toFixed(2)})`
                : subject.isDirectFinalActive && subject.directFinalLetterGrade
                ? `Given Final: ${subject.directFinalLetterGrade} (${(subject.directFinalGradePoint ?? 0).toFixed(2)})`
                : subject.isDirectGradeActive && subject.directLetterGrade
                ? `Given Grade: ${subject.directLetterGrade} (${(subject.directGradePoint ?? 0).toFixed(2)})`
                : '+ Input Given Grade'}
            </span>
          </button>
        )}
        <span className="text-[#0d3824] dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ml-auto">
          <span>View Subject</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}
