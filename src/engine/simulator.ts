import { Assessment, Subject, TransmutationProfile, SimulationChange, SimulationResult } from './types'
import { calculateSubjectGrade } from './calculator'

/**
 * Simulates what-if grade scenarios without mutating original assessment records
 */
export function simulateGradeChanges(
  subject: Subject,
  originalAssessments: Assessment[],
  simulatedChanges: SimulationChange[],
  transmutationProfile?: TransmutationProfile,
  treatMissingAsZero: boolean = false
): SimulationResult {
  // 1. Calculate original result
  const originalResult = calculateSubjectGrade(
    subject,
    originalAssessments,
    transmutationProfile,
    treatMissingAsZero
  )

  // 2. Deep clone original assessments
  const clonedAssessments: Assessment[] = originalAssessments.map(a => ({ ...a }))

  // 3. Apply simulated changes
  for (const change of simulatedChanges) {
    if (change.assessmentId) {
      // Modify existing assessment
      const targetIndex = clonedAssessments.findIndex(a => a.id === change.assessmentId)
      if (targetIndex >= 0) {
        clonedAssessments[targetIndex] = {
          ...clonedAssessments[targetIndex],
          pointsEarned: change.pointsEarned,
          totalPossiblePoints: change.totalPossiblePoints
        }
      }
    } else {
      // Add hypothetical assessment
      const hypotheticalId = change.tempId || `hypo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      clonedAssessments.push({
        id: hypotheticalId,
        subjectId: subject.id,
        categoryId: change.categoryId,
        name: change.name || 'Hypothetical Assessment',
        pointsEarned: change.pointsEarned,
        totalPossiblePoints: change.totalPossiblePoints,
        period: change.period
      })
    }
  }

  // 4. Calculate simulated result
  // If simulated changes are present, evaluate bottom-up syllabus calculation so hypothetical scores are reflected
  const hasDirectActive = Boolean(
    subject.isDirectGradeActive || subject.isDirectMidtermActive || subject.isDirectFinalActive
  )
  const subjectForSimulation =
    simulatedChanges.length > 0 && hasDirectActive
      ? {
          ...subject,
          isDirectGradeActive: false,
          isDirectMidtermActive: false,
          isDirectFinalActive: false
        }
      : subject

  const simulatedResult = calculateSubjectGrade(
    subjectForSimulation,
    clonedAssessments,
    transmutationProfile,
    treatMissingAsZero
  )

  // 5. Compare results
  const rawDifference = simulatedResult.unnormalizedRawGrade - originalResult.unnormalizedRawGrade
  const transmutedGradeChanged = originalResult.transmutedGrade !== simulatedResult.transmutedGrade

  return {
    originalResult,
    simulatedResult,
    rawDifference,
    transmutedGradeChanged,
    previousTransmutedGrade: originalResult.transmutedGrade,
    newTransmutedGrade: simulatedResult.transmutedGrade
  }
}
