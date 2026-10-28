import React from 'react'
import {
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Plus,
  ShieldCheck
} from 'lucide-react'
import { Subject, Assessment, SubjectGradeResult } from '../../engine/types'

interface SubjectAssessmentCategoriesProps {
  currentSubject: Subject
  subjectAssessments: Assessment[]
  currentResult: SubjectGradeResult | null
  hasAssessments: boolean
  hasDirectMidterm: boolean
  hasDirectFinal: boolean
  onOpenDirectGradeModal: () => void
  onOpenAssessmentModal: (asm?: Assessment) => void
  onDeleteAssessment: (id: string, name: string) => void
}

export const SubjectAssessmentCategories: React.FC<SubjectAssessmentCategoriesProps> = ({
  currentSubject,
  subjectAssessments,
  currentResult,
  hasAssessments,
  hasDirectMidterm,
  hasDirectFinal,
  onOpenDirectGradeModal,
  onOpenAssessmentModal,
  onDeleteAssessment
}) => {
  return (
    <div className="space-y-5">
      {/* Active Direct Letter Grade Banner(s) */}
      {(hasDirectMidterm || hasDirectFinal) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-[#f0f9f3] dark:from-emerald-950/60 dark:to-[#082216] border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0d3824] dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0d3824] dark:text-emerald-300">
                  Direct Professor Grade Active
                </span>
                {hasDirectMidterm && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#0d3824] text-white">
                    Midterm (Running): {currentSubject.directMidtermLetterGrade} • {(currentSubject.directMidtermGradePoint ?? 0).toFixed(2)}
                  </span>
                )}
                {hasDirectFinal && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-800 text-white">
                    Final (Official): {currentSubject.directFinalLetterGrade || currentSubject.directLetterGrade} • {((currentSubject.directFinalGradePoint ?? currentSubject.directGradePoint) ?? 0).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 dark:text-emerald-300/80 mt-0.5">
                {currentSubject.directMidtermRemarks || currentSubject.directFinalRemarks || currentSubject.directGradeRemarks || 'Direct letter grade override is actively reflected in your grade standing.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenDirectGradeModal}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-[#0d3824] dark:text-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              Manage Grades
            </button>
          </div>
        </div>
      )}

      {/* Clean Slate Initial Notice if 0 assessments */}
      {!hasAssessments && (
        <div className="p-6 rounded-2xl bg-[#fafbfa] dark:bg-[#081a12] border border-dashed border-[#cce0d2] dark:border-emerald-900/50 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#eaf5ed] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-emerald-100">
              Ready for SY 2026-2027 First Semester
            </h3>
            <p className="text-xs text-stone-600 dark:text-emerald-400/70 mt-1 leading-relaxed">
              No existing assessments recorded yet for {currentSubject.name}. Start recording your seatworks, quizzes, and departmental exams to track your grades in real-time.
            </p>
          </div>
          <button
            onClick={() => onOpenAssessmentModal(undefined)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d3824] text-white font-mono text-xs font-semibold shadow-xs hover:bg-[#11462e] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Your First Score</span>
          </button>
        </div>
      )}

      {/* Dynamic Categories */}
      {currentSubject.categories.map((category, index) => {
        const catAssessments = subjectAssessments.filter(a => a.categoryId === category.id)
        const isCategoryCompleted = catAssessments.length > 0 && catAssessments.every(a => a.pointsEarned !== null)
        const letterTag = String.fromCharCode(65 + index) // A, B, C...

        return (
          <div
            key={category.id}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-4"
          >
            {/* Category Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-[#0d3824] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                  {letterTag}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-emerald-50">
                    {category.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-400/70">
                    {category.assessmentType === 'SA' || category.isSummative
                      ? 'Summative evaluation centrally weighted for term standing'
                      : 'Continuous formative evaluations & mastery problem sets'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 font-bold">
                  WEIGHT ALLOCATION
                </span>
                <div className="flex items-center gap-2 justify-end mt-0.5">
                  <span className="text-xs font-mono font-bold text-stone-800 dark:text-emerald-100">
                    {category.weight.toFixed(1)}% Weight
                  </span>
                  {catAssessments.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#eaf5ed] dark:bg-emerald-950/70 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40">
                      {isCategoryCompleted ? 'ASSESSED' : 'IN PROGRESS'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment Rows */}
            {catAssessments.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {catAssessments.map((asm) => {
                  const isCompleted = asm.pointsEarned !== null
                  const rawYield = isCompleted
                    ? ((asm.pointsEarned! / asm.totalPossiblePoints) * 100).toFixed(1)
                    : null

                  return (
                    <div
                      key={asm.id}
                      className="p-3 rounded-xl bg-[#fafbfa] dark:bg-[#081b12] border border-[#e9ede7] dark:border-emerald-950/80 flex items-center justify-between text-xs font-mono group hover:border-[#0d3824]/30 transition-all"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900 dark:text-emerald-50">
                              {asm.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                              asm.period === 'final'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            }`}>
                              {asm.period === 'final' ? 'Finals Period' : 'Midterm Period'}
                            </span>
                            {asm.isExtraCredit && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[10px] text-amber-800 font-bold">
                                Extra Credit
                              </span>
                            )}
                          </div>
                          {(asm.date || asm.notes) && (
                            <p className="text-[11px] text-stone-500 dark:text-emerald-400/60 truncate mt-0.5 font-sans">
                              {asm.date || asm.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right ml-4">
                        <div>
                          <span className="block text-[9px] text-stone-400 uppercase">SCORE</span>
                          <span className="block font-bold text-stone-900 dark:text-emerald-100">
                            {isCompleted ? `${asm.pointsEarned} / ${asm.totalPossiblePoints}` : `-- / ${asm.totalPossiblePoints}`}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-stone-400 uppercase">RAW YIELD</span>
                          <span className="block font-bold text-stone-900 dark:text-emerald-100">
                            {isCompleted ? `${rawYield}%` : 'PENDING'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 sm:opacity-80 sm:group-hover:opacity-100">
                          <button
                            onClick={() => onOpenAssessmentModal(asm)}
                            title="Edit score"
                            className="w-9 h-9 sm:w-7 sm:h-7 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg hover:bg-stone-200 dark:hover:bg-emerald-900/60 text-stone-500 hover:text-stone-900 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors active-press cursor-pointer"
                            aria-label={`Edit ${asm.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAssessment(asm.id, asm.name)}
                            title="Delete assessment"
                            className="w-9 h-9 sm:w-7 sm:h-7 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-400 hover:text-rose-600 transition-colors active-press cursor-pointer"
                            aria-label={`Delete ${asm.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#fafbfa] dark:bg-[#081b12] border border-dashed border-[#e2e6de] dark:border-emerald-950/70 text-center text-xs font-mono text-stone-500 dark:text-emerald-400/60 flex items-center justify-between">
                <span>No assessments entered in this category yet.</span>
                <button
                  onClick={() => onOpenAssessmentModal(undefined)}
                  className="text-[11px] font-bold text-[#0d3824] dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  + Add Assessment Score
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Audit Synchronization Footer */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-emerald-400/70 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0d3824] dark:text-emerald-400 shrink-0" />
          <span>FEU Manila IABF Zero-Based Grading Protocol &bull; Local Cache Verified</span>
        </div>
        <span className="font-bold text-stone-700 dark:text-emerald-300 uppercase tracking-wider text-[10px]">
          SY 2026-2027 ACTIVE
        </span>
      </div>
    </div>
  )
}
