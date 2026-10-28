import React, { useState, useMemo } from 'react'
import { BookOpen } from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { simulateGradeChanges } from '../engine/simulator'
import { SimulationChange } from '../engine/types'
import { generateUniqueId } from '../utils/ids'
import { SimulatorHeader } from '../components/simulator/SimulatorHeader'
import { SimulatorAssessmentTable } from '../components/simulator/SimulatorAssessmentTable'
import { SimulatorSidebar } from '../components/simulator/SimulatorSidebar'
import { SimulatorCommitModal } from '../components/simulator/SimulatorCommitModal'

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
    const newTempId = generateUniqueId('hypo')
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
      tempId: generateUniqueId(`hypo_tmpl_${idx}`),
      categoryId: cat.id,
      name: `${cat.name.split('(')[0].trim() || 'Course Component'} (Hypothetical)`,
      pointsEarned: idx === 0 ? 85 : 88,
      totalPossible: 100,
      period: (idx === 0 ? 'midterm' : 'final') as 'midterm' | 'final'
    }))
    setHypotheticalAssessments(newHypotheticals)
  }

  const handleUpdateHypothetical = (
    tempId: string,
    updates: Partial<{ name: string; categoryId: string; pointsEarned: number; totalPossible: number }>
  ) => {
    setHypotheticalAssessments(prev =>
      prev.map(item => (item.tempId === tempId ? { ...item, ...updates } : item))
    )
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
  const isBsaMajor = currentSubject.category === 'iabf_major' || ['ACT1101', 'LAW1101', 'MGT1115', 'MGT1101'].includes(currentSubject.code)
  const isDirectGradeActive = !!(currentSubject.isDirectGradeActive && currentSubject.directLetterGrade)

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Bar & Course Switcher */}
      <SimulatorHeader
        currentSubject={currentSubject}
        activeSubjects={activeSubjects}
        activeTerm={activeTerm}
        isBsaMajor={isBsaMajor}
        isDirectGradeActive={isDirectGradeActive}
        whatIfCount={whatIfCount}
        onSelectSubject={(id) => {
          setSelectedSubjectId(id)
          handleRevertAllToActual()
        }}
        onRevertAll={handleRevertAllToActual}
      />

      {/* 2. Side-by-Side Layout: Left Table (8 cols) & Right Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Canvas Gradebook Assessment Table (8 cols) */}
        <div className="lg:col-span-8">
          <SimulatorAssessmentTable
            currentSubject={currentSubject}
            subjectAssessments={subjectAssessments}
            simulatedScoreMap={simulatedScoreMap}
            hypotheticalAssessments={hypotheticalAssessments}
            simulation={simulation}
            isBsaMajor={isBsaMajor}
            onScoreChange={handleScoreChange}
            onRevertSingleScore={handleRevertSingleScore}
            onAddHypothetical={handleAddHypothetical}
            onPrepopulateSyllabus={handlePrepopulateSyllabus}
            onUpdateHypothetical={handleUpdateHypothetical}
            onRemoveHypothetical={handleRemoveHypothetical}
          />
        </div>

        {/* RIGHT COLUMN: Canvas LMS Grade Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <SimulatorSidebar
            currentSubject={currentSubject}
            simulation={simulation}
            whatIfCount={whatIfCount}
            preferences={preferences}
            isDirectGradeActive={isDirectGradeActive}
            onRevertAll={handleRevertAllToActual}
            onConfirmCommit={() => setShowApplyConfirm(true)}
          />
        </div>
      </div>

      {/* Confirmation Modal for Committing Simulation */}
      <SimulatorCommitModal
        isOpen={showApplyConfirm}
        subjectCode={currentSubject.code}
        isApplying={isApplying}
        onClose={() => setShowApplyConfirm(false)}
        onConfirm={handleApplyChanges}
      />
    </div>
  )
}

export default WhatIfSimulator
