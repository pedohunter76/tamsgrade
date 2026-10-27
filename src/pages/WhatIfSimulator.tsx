import React, { useState, useMemo } from 'react'
import {
  Sliders,
  RotateCcw,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  BookOpen,
  Layers,
  Award,
  HelpCircle,
  ArrowRight
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { simulateGradeChanges } from '../engine/simulator'
import { SimulationChange } from '../engine/types'
import { formatGrade } from '../engine/calculator'
import { formatTransmutedGradeWithLetter } from '../engine/transmutation'
import { TransmutationSpectrum } from '../components/TransmutationSpectrum'

export const WhatIfSimulator: React.FC = () => {
  const {
    subjects,
    assessments,
    transmutationProfiles,
    preferences,
    selectedSubjectId,
    setSelectedSubjectId,
    updateAssessment,
    addAssessment,
    activeTerm
  } = useGrade()

  const activeSubjects = useMemo(() => subjects.filter(s => !s.isArchived), [subjects])
  const currentSubject = useMemo(() => {
    if (selectedSubjectId) {
      const found = activeSubjects.find(s => s.id === selectedSubjectId)
      if (found) return found
    }
    return activeSubjects[0] || null
  }, [activeSubjects, selectedSubjectId])

  // Track modified assessment values in simulation state
  const [simulatedScoreMap, setSimulatedScoreMap] = useState<Record<string, number>>({})
  const [hypotheticalAssessments, setHypotheticalAssessments] = useState<
    { tempId: string; categoryId: string; name: string; pointsEarned: number; totalPossible: number; period?: 'midterm' | 'final' }[]
  >([])

  const [isApplying, setIsApplying] = useState(false)
  const [showApplyConfirm, setShowApplyConfirm] = useState(false)

  // Subject assessments for current selected subject
  const subjectAssessments = useMemo(() => {
    if (!currentSubject) return []
    return assessments.filter(a => a.subjectId === currentSubject.id)
  }, [assessments, currentSubject])

  const transmutationProfile = useMemo(() => {
    if (!currentSubject?.transmutationProfileId) return undefined
    return transmutationProfiles.find(p => p.id === currentSubject.transmutationProfileId)
  }, [currentSubject, transmutationProfiles])

  // Build simulation changes list
  const simulationChanges: SimulationChange[] = useMemo(() => {
    const list: SimulationChange[] = []

    // Existing assessments modified in simulation
    for (const a of subjectAssessments) {
      if (simulatedScoreMap[a.id] !== undefined) {
        list.push({
          assessmentId: a.id,
          categoryId: a.categoryId,
          name: a.name,
          pointsEarned: simulatedScoreMap[a.id],
          totalPossiblePoints: a.totalPossiblePoints,
          period: a.period
        })
      }
    }

    // Hypothetical new assessments
    for (const h of hypotheticalAssessments) {
      list.push({
        tempId: h.tempId,
        categoryId: h.categoryId,
        name: h.name,
        pointsEarned: h.pointsEarned,
        totalPossiblePoints: h.totalPossible,
        period: h.period
      })
    }

    return list
  }, [subjectAssessments, simulatedScoreMap, hypotheticalAssessments])

  // Compute simulation result
  const simulation = useMemo(() => {
    if (!currentSubject) return null
    return simulateGradeChanges(
      currentSubject,
      subjectAssessments,
      simulationChanges,
      transmutationProfile,
      preferences.treatMissingAsZero
    )
  }, [currentSubject, subjectAssessments, simulationChanges, transmutationProfile, preferences.treatMissingAsZero])

  // Handlers for Canvas What-If functionality
  const handleScoreChange = (assessmentId: string, score: number) => {
    setSimulatedScoreMap(prev => ({ ...prev, [assessmentId]: score }))
  }

  // Revert a single assessment back to actual recorded score (Canvas back-arrow feature)
  const handleRevertSingleScore = (assessmentId: string) => {
    setSimulatedScoreMap(prev => {
      const next = { ...prev }
      delete next[assessmentId]
      return next
    })
  }

  // Canvas "Revert to Actual Score" button - restores all original grades
  const handleRevertAllToActual = () => {
    setSimulatedScoreMap({})
    setHypotheticalAssessments([])
  }

  const handleAddHypothetical = (presetCatId?: string, presetPeriod: 'midterm' | 'final' = 'midterm') => {
    if (!currentSubject || currentSubject.categories.length === 0) return
    const targetCatId = presetCatId || currentSubject.categories[0].id
    const targetCat = currentSubject.categories.find(c => c.id === targetCatId)
    const newTempId = `hypo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    setHypotheticalAssessments(prev => [
      ...prev,
      {
        tempId: newTempId,
        categoryId: targetCatId,
        name: `${targetCat?.name.split('(')[0].trim() || 'Assessment'} (What-If)`,
        pointsEarned: 85,
        totalPossible: 100,
        period: presetPeriod
      }
    ])
  }

  // 1-click syllabus template population for clean-slate courses
  const handlePrepopulateSyllabus = () => {
    if (!currentSubject || currentSubject.categories.length === 0) return
    const newHypotheticals = currentSubject.categories.map((cat, idx) => ({
      tempId: `hypo_tmpl_${Date.now()}_${idx}`,
      categoryId: cat.id,
      name: `${cat.name.split('(')[0].trim() || 'Course Component'} (Hypothetical)`,
      pointsEarned: idx === 0 ? 85 : 88,
      totalPossible: 100,
      period: (idx === 0 ? 'midterm' : 'final') as 'midterm' | 'final'
    }))
    setHypotheticalAssessments(newHypotheticals)
  }

  const handleRemoveHypothetical = (tempId: string) => {
    setHypotheticalAssessments(prev => prev.filter(h => h.tempId !== tempId))
  }

  const handleApplyChanges = async () => {
    if (!currentSubject) return
    setIsApplying(true)
    try {
      // Apply updated existing assessments
      for (const [id, newScore] of Object.entries(simulatedScoreMap)) {
        await updateAssessment(id, { pointsEarned: newScore })
      }
      // Add hypotheticals as real assessments
      for (const h of hypotheticalAssessments) {
        await addAssessment({
          subjectId: currentSubject.id,
          categoryId: h.categoryId,
          name: h.name,
          pointsEarned: h.pointsEarned,
          totalPossiblePoints: h.totalPossible
        })
      }
      handleRevertAllToActual()
      setShowApplyConfirm(false)
      alert('What-If scores successfully committed to your academic records!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply simulation changes.'
      alert(`Error: ${msg}`)
    } finally {
      setIsApplying(false)
    }
  }

  if (!currentSubject) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-[#e2e6de] dark:border-emerald-950/60 bg-white dark:bg-[#0b1f16] space-y-3">
        <BookOpen className="w-10 h-10 mx-auto text-stone-400 dark:text-emerald-500/60" />
        <h3 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
          No courses found for {activeTerm.termName}
        </h3>
        <p className="text-xs text-stone-500 dark:text-emerald-400/70 max-w-sm mx-auto">
          Select another academic term from the top bar to simulate What-If scores.
        </p>
      </div>
    )
  }

  const whatIfCount = Object.keys(simulatedScoreMap).length + hypotheticalAssessments.length
  const rawDiff = simulation ? simulation.rawDifference : 0
  const isPositive = rawDiff > 0.001
  const isNegative = rawDiff < -0.001
  const isBsaMajor = currentSubject.category === 'iabf_major' || ['ACT1101', 'LAW1101', 'MGT1115', 'MGT1101'].includes(currentSubject.code)
  const isDirectGradeActive = !!(currentSubject.isDirectGradeActive && currentSubject.directLetterGrade)

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
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
            onChange={(e) => {
              setSelectedSubjectId(e.target.value)
              handleRevertAllToActual()
            }}
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
              onClick={handleRevertAllToActual}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c2419] hover:bg-stone-100 dark:hover:bg-[#0e2c1e] text-stone-800 dark:text-emerald-100 border border-[#e2e6de] dark:border-emerald-800/80 text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-600 dark:text-emerald-400" />
              <span>Revert to Actual Score</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Canvas Side-by-Side Layout: Left Table (8 cols) & Right Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Canvas Gradebook Assessment Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
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
                  onClick={() => handleAddHypothetical()}
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
                    onClick={handlePrepopulateSyllabus}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Populate Syllabus Blueprint</span>
                  </button>
                  <button
                    onClick={() => handleAddHypothetical()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#0c2419] hover:bg-stone-50 border border-[#e2e6de] dark:border-emerald-900/60 text-stone-800 dark:text-emerald-200 font-mono text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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
                                    handleRevertSingleScore(a.id)
                                  } else {
                                    handleScoreChange(a.id, parseFloat(val) || 0)
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
                                  onClick={() => handleRevertSingleScore(a.id)}
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
                      const cat = currentSubject.categories.find(c => c.id === h.categoryId)
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
                              onChange={(e) =>
                                setHypotheticalAssessments(prev =>
                                  prev.map(item => (item.tempId === h.tempId ? { ...item, name: e.target.value } : item))
                                )
                              }
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
                              onChange={(e) =>
                                setHypotheticalAssessments(prev =>
                                  prev.map(item => (item.tempId === h.tempId ? { ...item, categoryId: e.target.value } : item))
                                )
                              }
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
                              onChange={(e) =>
                                setHypotheticalAssessments(prev =>
                                  prev.map(item =>
                                    item.tempId === h.tempId ? { ...item, pointsEarned: parseFloat(e.target.value) || 0 } : item
                                  )
                                )
                              }
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
                              onChange={(e) =>
                                setHypotheticalAssessments(prev =>
                                  prev.map(item =>
                                    item.tempId === h.tempId ? { ...item, totalPossible: parseFloat(e.target.value) || 1 } : item
                                  )
                                )
                              }
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
                                onClick={() => handleRemoveHypothetical(h.tempId)}
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
                    onClick={() => handleAddHypothetical(cat.id)}
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

        {/* RIGHT COLUMN: Canvas LMS Grade Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#0d3824] shadow-2xs">
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
                {simulation?.simulatedResult.categories.map((c) => {
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
                  onClick={handleRevertAllToActual}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-emerald-950/60 hover:bg-stone-200 dark:hover:bg-emerald-900/60 text-stone-800 dark:text-emerald-200 border border-stone-200 dark:border-emerald-800/40 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert to Actual Score</span>
                </button>
              )}

              {whatIfCount > 0 && (
                <button
                  onClick={() => setShowApplyConfirm(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-mono font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Commit What-If Scores to Subject</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Committing Simulation */}
      {showApplyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#071610] p-6 rounded-2xl max-w-md w-full border border-[#e3e6de] dark:border-emerald-950/60 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
                Commit What-If Scores to Subject
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-emerald-300/80 leading-relaxed font-mono">
              This will commit your hypothetical scores and add any What-If assessments to your permanent academic tracker for <strong>{currentSubject.code}</strong>.
              <br /><br />
              Are you sure you want to save these numbers to your official records?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f2eb] dark:border-emerald-950/50">
              <button
                onClick={() => setShowApplyConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/40 border border-transparent hover:border-stone-200 dark:hover:border-emerald-900/40 transition-all cursor-pointer font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyChanges}
                disabled={isApplying}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0d3824] hover:bg-[#11462e] text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer font-mono"
              >
                {isApplying ? 'Saving...' : 'Yes, Commit What-If Scores'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default WhatIfSimulator
