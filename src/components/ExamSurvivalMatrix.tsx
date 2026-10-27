import React from 'react'
import { ShieldCheck, ShieldAlert, Award, Star, ArrowUpRight } from 'lucide-react'
import { Subject, Assessment, TransmutationProfile } from '../engine/types'
import { calculateRequiredScore } from '../engine/requiredScore'

interface ExamSurvivalMatrixProps {
  subject: Subject
  assessments: Assessment[]
  targetCategoryId: string
  targetAssessmentName: string
  totalPossiblePoints: number
  transmutationProfile?: TransmutationProfile
  onSelectTarget: (targetRaw: number) => void
}

interface MatrixTier {
  id: string
  name: string
  subtitle: string
  targetRaw: number
  letterGrade: string
  qualityPoints: number
  icon: React.ComponentType<{ className?: string }>
  badgeBg: string
  badgeText: string
  borderColor: string
}

const MATRIX_TIERS: MatrixTier[] = [
  {
    id: 'pass',
    name: 'Passing Floor',
    subtitle: 'University Minimum',
    targetRaw: 50.0,
    letterGrade: 'D',
    qualityPoints: 1.0,
    icon: ShieldCheck,
    badgeBg: 'bg-stone-100 dark:bg-stone-800',
    badgeText: 'text-stone-700 dark:text-stone-300',
    borderColor: 'border-stone-200 dark:border-stone-800'
  },
  {
    id: 'retention',
    name: 'BSA Retention',
    subtitle: 'IABF Major Cutoff',
    targetRaw: 71.0,
    letterGrade: 'C+',
    qualityPoints: 2.5,
    icon: ShieldAlert,
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-800/80'
  },
  {
    id: 'honors',
    name: 'Magna Honors',
    subtitle: 'Dean’s Honor Roll',
    targetRaw: 85.0,
    letterGrade: 'B+',
    qualityPoints: 3.5,
    icon: Award,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    borderColor: 'border-emerald-300 dark:border-emerald-800/80'
  },
  {
    id: 'summa',
    name: 'Summa Excellence',
    subtitle: 'Highest Academic Tier',
    targetRaw: 92.0,
    letterGrade: 'A',
    qualityPoints: 4.0,
    icon: Star,
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400/40'
  }
]

export const ExamSurvivalMatrix: React.FC<ExamSurvivalMatrixProps> = ({
  subject,
  assessments,
  targetCategoryId,
  targetAssessmentName,
  totalPossiblePoints,
  transmutationProfile,
  onSelectTarget
}) => {
  if (!targetCategoryId) return null

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a14] border border-stone-200/90 dark:border-emerald-900/40 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Exam Survival & Honors Matrix
          </h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Side-by-side comparison of scores required across 4 official academic milestones
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold text-stone-400">
          Max Possible: {totalPossiblePoints} pts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MATRIX_TIERS.map((tier) => {
          let reqResult = null
          try {
            reqResult = calculateRequiredScore(
              subject,
              assessments,
              {
                subjectId: subject.id,
                targetRawGrade: tier.targetRaw,
                targetCategoryId,
                targetAssessmentName,
                totalPossiblePoints: totalPossiblePoints || 100
              },
              transmutationProfile
            )
          } catch {
            reqResult = null
          }

          const reqPct = reqResult ? reqResult.requiredPercentage : 0
          const reqPts = reqResult ? reqResult.requiredPoints : 0
          const isSecured = reqPct <= 0
          const isImpossible = reqPct > 100
          const isDemanding = reqPct > 85 && !isImpossible

          let statusBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          let statusText = 'Achievable'

          if (isSecured) {
            statusBadge = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            statusText = 'Already Secured'
          } else if (isImpossible) {
            statusBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
            statusText = 'Out of Reach'
          } else if (isDemanding) {
            statusBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
            statusText = 'Demanding'
          }

          const IconComponent = tier.icon

          return (
            <div
              key={tier.id}
              onClick={() => onSelectTarget(tier.targetRaw)}
              className={`p-4 rounded-xl border ${tier.borderColor} bg-stone-50/60 dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-850 cursor-pointer transition-all space-y-3 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <IconComponent className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {tier.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${tier.badgeBg} ${tier.badgeText}`}>
                    {tier.letterGrade} ({tier.qualityPoints.toFixed(2)})
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {tier.subtitle} &bull; {tier.targetRaw.toFixed(0)}% Raw
                </p>
              </div>

              {/* Required Score Display */}
              <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-black tabular-nums text-stone-900 dark:text-stone-100">
                    {isSecured ? '0' : reqPts.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    / {totalPossiblePoints} pts
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono font-semibold text-stone-600 dark:text-stone-400">
                    {isSecured ? '0.0%' : `${reqPct.toFixed(1)}%`}
                  </span>
                  <span className={`px-2 py-0.2 rounded-full font-bold text-[9px] ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                {/* Mini Feasibility Bar */}
                <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSecured
                        ? 'bg-emerald-500'
                        : isImpossible
                        ? 'bg-rose-500'
                        : isDemanding
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, reqPct))}%` }}
                  />
                </div>
              </div>

              {/* Action Link */}
              <div className="flex items-center justify-end text-[11px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600 transition-colors gap-0.5 pt-1">
                <span>Set as Target</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
