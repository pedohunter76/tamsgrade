import React from 'react'
import {
  CheckCircle2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2
} from 'lucide-react'
import { Assessment, Subject } from '../../engine/types'
import { SimulationResult } from '../../engine/simulator'
import { TransmutationSpectrum } from '../TransmutationSpectrum'

interface HypotheticalItem {
  tempId: string
  categoryId: string
  name: string
  pointsEarned: number
  totalPossible: number
  period?: 'midterm' | 'final'
}

interface SimulatorAssessmentTableProps {
  currentSubject: Subject
  subjectAssessments: Assessment[]
  simulatedScoreMap: Record<string, number>
  hypotheticalAssessments: HypotheticalItem[]
  simulation: SimulationResult | null
  isBsaMajor: boolean
  onScoreChange: (assessmentId: string, score: number) => void
  onRevertSingleScore: (assessmentId: string) => void
  onAddHypothetical: (presetCatId?: string, presetPeriod?: 'midterm' | 'final') => void
  onPrepopulateSyllabus: () => void
  onUpdateHypothetical: (tempId: string, updates: Partial<HypotheticalItem>) => void
  onRemoveHypothetical: (tempId: string) => void
}

export const SimulatorAssessmentTable: React.FC<SimulatorAssessmentTableProps> = ({
  currentSubject,
  subjectAssessments,
  simulatedScoreMap,
  hypotheticalAssessments,
  simulation,
  isBsaMajor,
  onScoreChange,
  onRevertSingleScore,
  onAddHypothetical,
  onPrepopulateSyllabus,
  onUpdateHypothetical,
  onRemoveHypothetical
}) => {
  return (
    <div className="space-y-6">
      {/* Main Assessment Table Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-emerald-950/50">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
              Recorded Assessments &amp; What-If Inputs
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-emerald-400/70 mt-0.5">
              Click on any score box to enter an approximate score. Press Enter or click outside to update.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddHypothetical()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d3824] hover:bg-[#11462e] text-white font-mono text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add What-If Test</span>
            </button>
          </div>
        </div>

        {/* If 0 assessments recorded, offer instant Syllabus Blueprint generation */}
        {subjectAssessments.length === 0 && hypotheticalAssessments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#fafbfa] dark:bg-[#081a12] border border-dashed border-[#cce0d2] dark:border-emerald-900/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#eaf5ed] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-emerald-100">
                Clean Slate for {currentSubject.code}
              </h3>
              <p className="text-xs text-stone-600 dark:text-emerald-400/70 mt-1 leading-relaxed">
                No official assessments have been logged yet for this subject. In Canvas LMS, you can approximate upcoming tests based on your syllabus weights.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
              <button
                onClick={onPrepopulateSyllabus}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Populate Syllabus Blueprint</span>
              </button>
              <button
                onClick={() => onAddHypothetical()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0c2419] hover:bg-stone-50 dark:hover:bg-[#0e2c1e] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-200 font-mono text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom What-If Task</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0 touch-momentum">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-stone-200 dark:border-emerald-950/80 text-[10px] text-stone-400 dark:text-emerald-400/60 uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-bold">NAME</th>
                  <th className="py-2.5 px-3 font-bold">GROUP / PERIOD</th>
                  <th className="py-2.5 px-3 font-bold text-center">WHAT-IF SCORE</th>
                  <th className="py-2.5 px-3 font-bold text-right">OUT OF</th>
                  <th className="py-2.5 px-3 font-bold text-right">RAW %</th>
                  <th className="py-2.5 px-3 text-center font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/40">
                {/* 1. Existing Subject Assessments */}
                {subjectAssessments.map((a) => {
                  const isWhatIf = simulatedScoreMap[a.id] !== undefined
                  const displayScore = isWhatIf ? simulatedScoreMap[a.id] : (a.pointsEarned ?? '')
                  const cat = currentSubject.categories.find(c => c.id === a.categoryId)
                  const pct =
                    displayScore !== '' && a.totalPossiblePoints > 0
                      ? ((Number(displayScore) / a.totalPossiblePoints) * 100).toFixed(1)
                      : '--'

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-[#fafbfa] dark:hover:bg-[#071911] transition-colors ${
                        isWhatIf ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-stone-900 dark:text-emerald-100 block">
                          {a.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {a.date || 'Syllabus assessment'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-emerald-950/60 text-stone-600 dark:text-emerald-300 border border-stone-200 dark:border-emerald-900/40 text-[10px] uppercase font-bold">
                          {cat?.name.split('(')[0].trim() || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max={a.totalPossiblePoints * 1.5}
                            step="0.5"
                            value={displayScore}
                            placeholder="--"
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '') {
                                onRevertSingleScore(a.id)
                              } else {
                                onScoreChange(a.id, parseFloat(val) || 0)
                              }
                            }}
                            aria-label={`What-If score for ${a.name}`}
                            className={`w-18 sm:w-16 py-1.5 sm:py-1 px-2 text-center text-base sm:text-xs font-mono font-bold rounded-lg border transition-all min-h-[38px] sm:min-h-0 ${
                              isWhatIf
                                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/50'
                                : 'bg-white dark:bg-[#071911] border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100 hover:border-emerald-600'
                            }`}
                          />
                          {isWhatIf && (
                            <button
                              onClick={() => onRevertSingleScore(a.id)}
                              title="Revert this score to actual recorded grade"
                              aria-label={`Revert score for ${a.name}`}
                              className="w-8 h-8 sm:w-auto sm:h-auto min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer active-press"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-stone-500 font-mono font-bold">
                        {a.totalPossiblePoints}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-800 dark:text-emerald-200">
                        {pct !== '--' ? `${pct}%` : '--'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isWhatIf ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40">
                            What-If
                          </span>
                        ) : a.pointsEarned !== null ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#eaf5ed] dark:bg-emerald-950/60 text-[#0d3824] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
                            Actual
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                            Ungraded
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}

                {/* 2. Hypothetical What-If Assessments */}
                {hypotheticalAssessments.map((h) => {
                  const pct = h.totalPossible > 0 ? ((h.pointsEarned / h.totalPossible) * 100).toFixed(1) : '0.0'

                  return (
                    <tr
                      key={h.tempId}
                      className="bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={h.name}
                          onChange={(e) => onUpdateHypothetical(h.tempId, { name: e.target.value })}
                          aria-label="Hypothetical assessment name"
                          className="w-full text-xs font-mono font-bold bg-transparent border-b border-dashed border-emerald-400 dark:border-emerald-700 focus:outline-hidden text-stone-900 dark:text-emerald-100"
                        />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-mono">
                          Simulated Upcoming Task
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={h.categoryId}
                          onChange={(e) => onUpdateHypothetical(h.tempId, { categoryId: e.target.value })}
                          aria-label="Select category for hypothetical assessment"
                          className="py-1 px-1.5 rounded bg-white dark:bg-[#071911] border border-emerald-300 dark:border-emerald-800 text-[10px] uppercase font-bold text-[#0d3824] dark:text-emerald-300"
                        >
                          {currentSubject.categories.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name.split('(')[0].trim()} ({c.weight}%)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={h.pointsEarned}
                          onChange={(e) => onUpdateHypothetical(h.tempId, { pointsEarned: parseFloat(e.target.value) || 0 })}
                          aria-label={`Score for ${h.name}`}
                          className="w-18 sm:w-16 py-1.5 sm:py-1 px-2 text-center text-base sm:text-xs font-mono font-bold rounded-lg bg-white dark:bg-[#071911] border border-emerald-400 dark:border-emerald-700 text-[#0d3824] dark:text-emerald-100 min-h-[38px] sm:min-h-0"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="1"
                          value={h.totalPossible}
                          onChange={(e) => onUpdateHypothetical(h.tempId, { totalPossible: parseFloat(e.target.value) || 1 })}
                          aria-label={`Total possible points for ${h.name}`}
                          className="w-16 sm:w-14 py-1.5 sm:py-1 px-1.5 text-right text-base sm:text-xs font-mono font-bold rounded-lg bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-emerald-200 min-h-[38px] sm:min-h-0"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0d3824] dark:text-emerald-300">
                        {pct}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            What-If
                          </span>
                          <button
                            onClick={() => onRemoveHypothetical(h.tempId)}
                            title="Remove hypothetical task"
                            aria-label={`Remove ${h.name}`}
                            className="p-1 text-stone-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Category Simulation Adders */}
      {currentSubject.categories.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-2">
          <span className="block text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
            Quick Model Syllabus Category:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {currentSubject.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onAddHypothetical(cat.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-emerald-900/50 bg-[#fafbfa] dark:bg-[#081a12] text-xs font-mono font-semibold text-stone-700 dark:text-emerald-200 hover:border-[#0d3824] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#0d3824] dark:text-emerald-400" />
                <span>+ {cat.name.split('(')[0].trim()} ({cat.weight}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Transmutation Needle Spectrum for What-If Outcome */}
      <TransmutationSpectrum
        currentRawGrade={simulation?.simulatedResult.normalizedProvisionalGrade ?? null}
        letterGrade={simulation?.simulatedResult.letterGrade}
        transmutedGrade={simulation?.simulatedResult.transmutedGrade}
        qualityPoints={simulation?.simulatedResult.qualityPoints}
        isBsaMajor={isBsaMajor}
      />
    </div>
  )
}
