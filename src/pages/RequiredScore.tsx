import React, { useState, useMemo } from 'react'
import {
  Target,
  Info
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { calculateRequiredScore } from '../engine/requiredScore'
import { ExamSurvivalMatrix } from '../components/ExamSurvivalMatrix'

export const RequiredScore: React.FC = () => {
  const {
    subjects,
    assessments,
    transmutationProfiles,
    selectedSubjectId,
    setSelectedSubjectId,
    preferences
  } = useGrade()

  const activeSubjects = subjects.filter(s => !s.isArchived)
  const currentSubject = activeSubjects.find(s => s.id === selectedSubjectId) || activeSubjects[0]

  // Mode: target raw percentage vs target transmuted grade
  const [targetMode, setTargetMode] = useState<'raw' | 'transmuted'>('raw')
  const [targetRawPercentage, setTargetRawPercentage] = useState<number>(75)
  const [targetTransmutedGrade, setTargetTransmutedGrade] = useState<string>('2.50')

  // Target assessment
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    currentSubject?.categories.length > 0 ? currentSubject.categories[0].id : ''
  )
  const [targetAssessmentName, setTargetAssessmentName] = useState<string>('Final Departmental Examination')
  const [totalPossiblePoints, setTotalPossiblePoints] = useState<number>(100)

  // Other remaining assessment assumptions
  const [otherAssumptions, setOtherAssumptions] = useState<{ categoryId: string; assumedPercentage: number }[]>([])

  const transmutationProfile = useMemo(() => {
    if (!currentSubject?.transmutationProfileId) return undefined
    return transmutationProfiles.find(p => p.id === currentSubject.transmutationProfileId)
  }, [currentSubject, transmutationProfiles])

  // Sync category selection when subject changes
  React.useEffect(() => {
    if (currentSubject && currentSubject.categories.length > 0) {
      if (!currentSubject.categories.some(c => c.id === selectedCategoryId)) {
        setSelectedCategoryId(currentSubject.categories[0].id)
      }
    }
  }, [currentSubject, selectedCategoryId])

  // Subject assessments
  const subjectAssessments = useMemo(() => {
    if (!currentSubject) return []
    return assessments.filter(a => a.subjectId === currentSubject.id)
  }, [assessments, currentSubject])

  // Calculate required score result
  const result = useMemo(() => {
    if (!currentSubject || !selectedCategoryId) return null
    try {
      return calculateRequiredScore(
        currentSubject,
        subjectAssessments,
        {
          subjectId: currentSubject.id,
          targetRawGrade: targetRawPercentage,
          targetTransmutedGrade: targetMode === 'transmuted' ? targetTransmutedGrade : undefined,
          targetCategoryId: selectedCategoryId,
          targetAssessmentName,
          totalPossiblePoints: totalPossiblePoints || 100,
          otherRemainingAssumptions: otherAssumptions
        },
        transmutationProfile
      )
    } catch (err) {
      console.error(err)
      return null
    }
  }, [
    currentSubject,
    subjectAssessments,
    targetMode,
    targetRawPercentage,
    targetTransmutedGrade,
    selectedCategoryId,
    targetAssessmentName,
    totalPossiblePoints,
    otherAssumptions,
    transmutationProfile
  ])

  if (!currentSubject) {
    return (
      <div className="p-12 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0c1a14] space-y-3">
        <Target className="w-10 h-10 mx-auto text-stone-400" />
        <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
          No active subjects available
        </h3>
      </div>
    )
  }

  const isAchievable = result?.isAchievable ?? false
  const requiredPct = result?.requiredPercentage ?? 0
  const isSecured = requiredPct <= 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-base text-[#0d3824] dark:text-emerald-400">
              {currentSubject.code}
            </span>
            <span className="text-xs font-mono text-stone-400 font-semibold">&bull; Target Exam Score Solver</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-emerald-50 mt-1 m-0">
            Required Exam Score Calculator
          </h1>
          <p className="text-xs text-stone-500 dark:text-emerald-400/70 mt-1 font-mono">
            Determine the exact point target required on upcoming exams to satisfy FEU retention and honors criteria.
          </p>
        </div>

        {/* Switch Subject */}
        <div className="flex items-center gap-2.5 shrink-0">
          <label className="text-xs text-stone-500 hidden sm:block font-mono font-semibold">Course:</label>
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

      {/* Target Setup Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Target Grade Goal */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0d3824] text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              <span>Define Target Course Grade</span>
            </h2>

            {/* Target Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-stone-850 text-xs font-mono">
              <button
                onClick={() => setTargetMode('raw')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  targetMode === 'raw'
                    ? 'bg-white dark:bg-stone-700 text-[#0d3824] dark:text-emerald-300 font-bold shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                Raw Percentage (%)
              </button>
              <button
                onClick={() => setTargetMode('transmuted')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  targetMode === 'transmuted'
                    ? 'bg-white dark:bg-stone-700 text-[#0d3824] dark:text-emerald-300 font-bold shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                FEU Scale (1.00-4.00)
              </button>
            </div>
          </div>

          {targetMode === 'raw' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 font-medium">
                  Target Overall Raw Percentage (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.5"
                    value={targetRawPercentage}
                    onChange={(e) => setTargetRawPercentage(parseFloat(e.target.value) || 0)}
                    className="w-28 text-xl font-mono font-bold py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-emerald-800 dark:text-emerald-400 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={targetRawPercentage}
                    onChange={(e) => setTargetRawPercentage(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Target Chips for FEU Official Letter Grade & Retention Guidelines */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  FEU Official Grade Benchmarks:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetRawPercentage(92)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    92% (4.00 / A)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetRawPercentage(85)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    85% (3.50 / B+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetRawPercentage(78)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    78% (3.00 / B)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetRawPercentage(71)}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-400 dark:border-amber-700 font-black hover:bg-amber-500/30 transition-colors shadow-xs"
                  >
                    71% (2.50 / C+ BSA Cutoff)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetRawPercentage(64)}
                    className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
                  >
                    64% (2.00 / C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetRawPercentage(50)}
                    className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
                  >
                    50% (1.00 / D Passing)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 font-medium">
                  Target Transmuted Grade
                </label>
                <select
                  value={targetTransmutedGrade}
                  onChange={(e) => setTargetTransmutedGrade(e.target.value)}
                  className="w-full text-base font-mono font-bold py-2.5 px-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-emerald-800 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {transmutationProfile?.ranges.map((r) => (
                    <option key={r.id} value={r.officialGrade}>
                      {r.officialGrade} {r.letterGrade ? `(${r.letterGrade})` : ''} • Min Raw: {r.minRaw}% • {r.description || ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  The calculator automatically resolves the minimum raw percentage threshold required for this grade tier from the configured transmutation table ({transmutationProfile?.name}).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Upcoming Assessment Details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a14] border border-stone-200/90 dark:border-emerald-900/40 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span>Select Target Assessment</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 font-medium">
                Assessment Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {currentSubject.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.weight}% of course)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 font-medium">
                  Assessment Title
                </label>
                <input
                  type="text"
                  value={targetAssessmentName}
                  onChange={(e) => setTargetAssessmentName(e.target.value)}
                  placeholder="e.g. Final Exam"
                  className="w-full text-xs py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs text-stone-600 dark:text-stone-400 block mb-1.5 font-medium">
                  Total Possible Points
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={totalPossiblePoints}
                  onChange={(e) => setTotalPossiblePoints(parseFloat(e.target.value) || 1)}
                  className="w-full text-xs font-mono font-bold py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Result Banner */}
      {result && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 transition-all relative overflow-hidden ${
            isSecured
              ? 'bg-gradient-to-br from-[#052b1e] to-[#021811] text-white border-emerald-800'
              : isAchievable
              ? 'bg-gradient-to-br from-[#052b1e] via-[#054c34] to-[#021811] text-white border-emerald-800'
              : 'bg-gradient-to-br from-[#2a0808] to-[#150404] text-white border-rose-900/80'
          }`}
        >
          {/* Subtle glow */}
          <div className="absolute right-0 top-0 bottom-0 w-80 opacity-15 pointer-events-none flex items-center justify-center">
            <Target className="w-72 h-72 text-amber-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                    isSecured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isAchievable
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isSecured ? 'Already Secured' : isAchievable ? 'Achievable Goal' : 'Mathematically Impossible'}
                </span>
                <span className="text-xs text-emerald-200/80 font-mono">
                  Target Course Score: {result.targetRawPercentage.toFixed(2)}% raw
                </span>
              </div>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl sm:text-5xl font-mono font-extrabold text-amber-400 tabular-nums">
                  {isSecured ? '0' : result.requiredPoints.toFixed(1)}{' '}
                  <span className="text-lg sm:text-2xl font-sans font-normal text-white">/ {result.totalPossiblePoints} pts</span>
                </span>
                <span className="text-lg sm:text-2xl font-mono font-bold text-emerald-200 tabular-nums">
                  ({isSecured ? '0.00' : result.requiredPercentage.toFixed(2)}%)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl pt-1 leading-relaxed">
                {result.message}
              </p>
            </div>

            {/* Target Breakdown Metric Box */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 shrink-0 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between gap-6">
                <span className="text-white/60 font-sans">Current Progress:</span>
                <span className="font-bold text-white tabular-nums">
                  {result.currentWeightedContribution.toFixed(2)} pts
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-white/60 font-sans">Assessment Weight:</span>
                <span className="font-bold text-white tabular-nums">
                  {result.targetAssessmentWeight.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-white/60 font-sans">Max Possible Grade:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {result.maximumPossibleGrade.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-white/60 font-sans">Min Possible Grade:</span>
                <span className="font-bold text-stone-300 tabular-nums">
                  {result.minimumPossibleGrade.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Tier Exam Survival & Honors Matrix */}
      <ExamSurvivalMatrix
        subject={currentSubject}
        assessments={subjectAssessments}
        targetCategoryId={selectedCategoryId}
        targetAssessmentName={targetAssessmentName}
        totalPossiblePoints={totalPossiblePoints}
        transmutationProfile={transmutationProfile}
        onSelectTarget={(targetRaw) => {
          setTargetMode('raw')
          setTargetRawPercentage(targetRaw)
        }}
      />

      {/* Formula & Transparency Card */}
      <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs text-stone-600 dark:text-stone-300">
        <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Transparent Mathematical Proof</span>
        </h3>
        <p className="leading-relaxed font-mono bg-white dark:bg-[#0c1a14] p-4 rounded-xl border border-stone-200 dark:border-stone-800 tabular-nums">
          Required Percentage = (Target Raw % − Current Weighted Contribution) ÷ (Remaining Assessment Weight ÷ 100)
          <br />
          = ({result?.targetRawPercentage.toFixed(2)} − {result?.currentWeightedContribution.toFixed(2)}) ÷ ({((result?.targetAssessmentWeight ?? 1) / 100).toFixed(2)})
          <br />
          = <strong>{result?.requiredPercentage.toFixed(2)}%</strong> ({result?.requiredPoints.toFixed(1)} points out of {result?.totalPossiblePoints})
        </p>
      </div>
    </div>
  )
}
