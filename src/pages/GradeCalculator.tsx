import React from 'react'
import {
  Calculator,
  Info,
  Award,
  Target,
  Sliders,
  ArrowRight
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { formatGrade } from '../engine/calculator'
import { TransmutationSpectrum } from '../components/TransmutationSpectrum'

export const GradeCalculator: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    getSubjectResult,
    preferences,
    setActiveTab
  } = useGrade()

  const activeSubjects = subjects.filter(s => !s.isArchived)
  const currentSubject = activeSubjects.find(s => s.id === selectedSubjectId) || activeSubjects[0]
  const result = currentSubject ? getSubjectResult(currentSubject.id) : undefined

  if (!currentSubject) {
    return (
      <div className="p-12 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0c1a14] space-y-3">
        <Calculator className="w-10 h-10 mx-auto text-stone-400" />
        <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">
          No active subjects available
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Please add a subject in the Subjects page first to view comprehensive grade calculations.
        </p>
        <button
          onClick={() => setActiveTab('subjects')}
          className="mt-2 px-4 py-2 rounded-xl bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-700 transition-colors"
        >
          Go to Subjects
        </button>
      </div>
    )
  }

  const coverage = result?.completedWeightCoverage ?? 0
  const isComplete = coverage >= 100
  const isBsaMajor = currentSubject.category === 'iabf_major' || ['ACT1101', 'LAW1101', 'MGT1115', 'MGT1101'].includes(currentSubject.code)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Subject Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-base text-[#0d3824] dark:text-emerald-400">
              {currentSubject.code}
            </span>
            {currentSubject.section && (
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#eaf5ed] dark:bg-emerald-950 text-[#0d3824] dark:text-emerald-300 font-bold border border-[#cbe4d2] dark:border-emerald-800/40">
                Sec {currentSubject.section}
              </span>
            )}
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 uppercase">
              {currentSubject.category === 'iabf_major' ? 'IABF Major' : currentSubject.category === 'gen_ed' ? 'Gen Ed' : 'Custom'}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              {currentSubject.units} Academic Units
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-emerald-50 mt-1 m-0">
            {currentSubject.name}
          </h1>
          <div className="text-xs font-mono text-stone-500 dark:text-emerald-400/70 mt-1.5 flex flex-wrap items-center gap-3">
            <span>{currentSubject.academicYear} &bull; {currentSubject.semester}</span>
            {currentSubject.schedule && <span>🕒 {currentSubject.schedule}</span>}
            {currentSubject.room && <span>📍 {currentSubject.room}</span>}
          </div>
        </div>

        {/* Subject Switcher Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="text-xs text-stone-500 hidden md:block font-mono font-semibold">Switch Course:</label>
          <select
            value={currentSubject.id}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs font-mono font-bold py-2 px-3 rounded-xl bg-[#fafbfa] dark:bg-[#081b12] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-100 focus:ring-1 focus:ring-[#0d3824] focus:outline-hidden"
          >
            {activeSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Provisional Grade Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-stone-400">Provisional Grade</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isComplete ? 'bg-[#eaf5ed] text-[#0d3824] dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
              }`}>
                {isComplete ? 'Final Complete' : 'Provisional Normalization'}
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-mono font-bold text-[#0d3824] dark:text-emerald-400 mt-2 tabular-nums">
              {result && coverage > 0 ? (
                <span>{formatGrade(result.normalizedProvisionalGrade, preferences.gradeDisplayPrecision)}%</span>
              ) : (
                <span className="text-stone-400 font-normal">Pending</span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-mono">
              {isComplete
                ? 'All 100% of category weights have been entered.'
                : `Based on ${coverage.toFixed(0)}% of completed syllabus weight normalized to 100%.`}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-emerald-950/50 text-[11px] text-stone-600 dark:text-stone-400 font-mono">
            Unnormalized raw score:{' '}
            <strong className="text-stone-900 dark:text-stone-100 tabular-nums">
              {formatGrade(result?.unnormalizedRawGrade ?? 0, preferences.gradeDisplayPrecision)}
            </strong>{' '}
            / 100 pts
          </div>
        </div>

        {/* Transmuted Grade Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-stone-400">Transmuted Grade</span>
              <Award className="w-4 h-4 text-[#c59b27]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl md:text-4xl font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                {result?.transmutedGrade || 'N/A'}
              </span>
              {result?.letterGrade && (
                <span className="text-lg font-bold text-[#0d3824] dark:text-emerald-400 font-mono">
                  ({result.letterGrade})
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-mono">
              Table: {result?.transmutationTableUsed || 'Standard FEU Scale'}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-emerald-950/50 flex items-center justify-between text-[11px] font-mono">
            <span className="text-stone-500">Quality Points:</span>
            <span className="font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {result?.qualityPoints !== undefined ? result.qualityPoints.toFixed(2) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Completed Syllabus Coverage Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-stone-400">Syllabus Coverage</span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                {coverage.toFixed(0)}% / 100%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-100 dark:bg-emerald-950/80 overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-[#0d3824] dark:bg-emerald-500' : 'bg-amber-600'
                }`}
                style={{ width: `${Math.min(100, coverage)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-mono">
              Remaining weight in syllabus:{' '}
              <strong className="font-mono text-stone-800 dark:text-stone-200 tabular-nums">
                {Math.max(0, 100 - coverage).toFixed(0)}%
              </strong>
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-3 border-t border-stone-100 dark:border-emerald-950/50 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex-1 py-1.5 rounded-xl bg-stone-100 dark:bg-[#081b12] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
            <button
              onClick={() => setActiveTab('target')}
              className="flex-1 py-1.5 rounded-xl bg-[#eaf5ed] dark:bg-emerald-950/50 hover:bg-[#dbeee0] text-[#0d3824] dark:text-emerald-300 text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Transmutation Dial & Needle Spectrum */}
      <TransmutationSpectrum
        currentRawGrade={result && coverage > 0 ? result.normalizedProvisionalGrade : null}
        letterGrade={result?.letterGrade}
        transmutedGrade={result?.transmutedGrade}
        qualityPoints={result?.qualityPoints}
        isBsaMajor={isBsaMajor}
      />

      {/* Formative vs Summative OBE Breakdown Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* FA Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a14] border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-700 text-white">
                FA
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                Formative Assessment (Continuous)
              </span>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm tabular-nums">
              {result ? `${result.formativeRawGrade.toFixed(2)} pts` : '0.00'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mb-2">
            Seatworks, Quizzes, Homeworks, Problem Sets & Activities
          </p>
          <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>Formative syllabus coverage:</span>
            <strong className="font-mono text-stone-800 dark:text-stone-200 tabular-nums">
              {result?.formativeCoverage.toFixed(0)}%
            </strong>
          </div>
        </div>

        {/* SA Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a14] border border-amber-200/80 dark:border-amber-900/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-600 text-white">
                SA
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                Summative Assessment (Exams)
              </span>
            </div>
            <span className="text-amber-700 dark:text-amber-400 font-mono font-bold text-sm tabular-nums">
              {result ? `${result.summativeRawGrade.toFixed(2)} pts` : '0.00'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mb-2">
            Midterm Exam, Finals Exam, Major Projects & Portfolios
          </p>
          <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>Summative syllabus coverage:</span>
            <strong className="font-mono text-stone-800 dark:text-stone-200 tabular-nums">
              {result?.summativeCoverage.toFixed(0)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Detailed Category Breakdown Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1a14] border border-stone-200/90 dark:border-emerald-900/40 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Category Contribution Breakdown
            </h2>
            <p className="text-xs text-stone-500">
              How each FA and SA assessment category contributes to your unnormalized and normalized grade
            </p>
          </div>
          <button
            onClick={() => setActiveTab('subjects')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline self-start sm:self-auto flex items-center gap-1"
          >
            <span>Manage Tasks in Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 dark:bg-stone-850 text-stone-600 dark:text-stone-400 border-y border-stone-200 dark:border-stone-800 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Assessment Category</th>
                <th className="py-2.5 px-3 text-center">Weight</th>
                <th className="py-2.5 px-3 text-center">Calculation Method</th>
                <th className="py-2.5 px-3 text-right">Points Earned / Possible</th>
                <th className="py-2.5 px-3 text-right">Category Score</th>
                <th className="py-2.5 px-3 text-right">Weighted Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {result?.categories.map((c) => {
                const isSA = c.isSummative
                return (
                  <tr key={c.categoryId} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/50">
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSA
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {isSA ? 'SA' : 'FA'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                        {c.categoryName}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {c.completedAssessmentsCount} of {c.totalAssessmentsCount} assessments entered
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                      {c.weight}%
                    </td>
                    <td className="py-3 px-3 text-center text-stone-500">
                      {c.method === 'total_points' ? 'Total-Points' : 'Equal-Weight'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {c.hasCompletedAssessments ? (
                        <span>
                          {c.totalEarned.toFixed(1)} / {c.totalPossible.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">No scores</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {c.hasCompletedAssessments ? `${c.percentage.toFixed(2)}%` : 'Pending'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {c.hasCompletedAssessments ? `+${c.weightedContribution.toFixed(2)}` : '0.00'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t-2 border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-850/60 font-bold">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-stone-900 dark:text-stone-100">
                  Total Accounted Weights
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-800 dark:text-emerald-400 tabular-nums">
                  {result?.completedWeightCoverage.toFixed(0)}%
                </td>
                <td colSpan={3} className="py-3 px-3 text-right text-stone-600 dark:text-stone-300">
                  Overall Raw Weighted Grade:
                </td>
                <td className="py-3 px-3 text-right font-mono text-base text-emerald-800 dark:text-emerald-400 tabular-nums">
                  {result ? result.unnormalizedRawGrade.toFixed(2) : '0.00'}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Step-by-Step Transparent Mathematical Proof */}
      <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Step-by-Step Mathematical Explanation
          </h3>
        </div>

        <div className="text-xs text-stone-700 dark:text-stone-300 space-y-2 leading-relaxed font-mono bg-white dark:bg-[#0c1a14] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          <p>
            <strong>1. Category Score Calculation:</strong>
            <br />
            {result?.categories.map(c => (
              <span key={c.categoryId} className="block text-[11px] text-stone-600 dark:text-stone-400">
                • {c.categoryName}: {c.hasCompletedAssessments ? `${c.percentage.toFixed(2)}% (${c.method === 'total_points' ? 'Sum of earned / Sum of possible' : 'Average of assessment %'})` : 'No scores entered'}
              </span>
            ))}
          </p>

          <p className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <strong>2. Weighted Contribution Formula:</strong>
            <br />
            <span className="text-[11px] text-stone-600 dark:text-stone-400">
              Contribution = Category Score × (Category Weight ÷ 100)
              <br />
              Sum of Contributions ={' '}
              {result?.categories
                .filter(c => c.hasCompletedAssessments)
                .map(c => `${c.weightedContribution.toFixed(2)}`)
                .join(' + ') || '0.00'}{' '}
              ={' '}
              <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                {result?.unnormalizedRawGrade.toFixed(2)} points
              </strong>
            </span>
          </p>

          <p className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <strong>3. Provisional Normalization (to 100% Base):</strong>
            <br />
            <span className="text-[11px] text-stone-600 dark:text-stone-400">
              Provisional Grade = (Sum of Contributions ÷ Completed Weight Coverage) × 100
              <br />
              = ({result?.unnormalizedRawGrade.toFixed(2)} ÷ {coverage.toFixed(2)}) × 100 ={' '}
              <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                {result?.normalizedProvisionalGrade.toFixed(2)}%
              </strong>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
