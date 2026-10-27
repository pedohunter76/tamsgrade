import { Assessment, Subject, TransmutationProfile, RequiredScoreQuery, RequiredScoreResult } from './types'
import { calculateCategoryResult, CalculationError } from './calculator'
import { getMinimumRawForTransmutedGrade } from './transmutation'

/**
 * Calculates the required score on an upcoming assessment to reach a target course grade
 */
export function calculateRequiredScore(
  subject: Subject,
  assessments: Assessment[],
  query: RequiredScoreQuery,
  transmutationProfile?: TransmutationProfile
): RequiredScoreResult {
  let effectiveTargetRaw = query.targetRawGrade

  // If user provided targetTransmutedGrade and transmutation profile is available, lookup minimum raw percentage
  if (query.targetTransmutedGrade && transmutationProfile) {
    const minRaw = getMinimumRawForTransmutedGrade(query.targetTransmutedGrade, transmutationProfile)
    if (minRaw !== null) {
      effectiveTargetRaw = minRaw
    }
  }

  const targetCategory = subject.categories.find(c => c.id === query.targetCategoryId)
  if (!targetCategory) {
    throw new CalculationError(`Target category with ID "${query.targetCategoryId}" does not exist on subject.`)
  }

  // Calculate current completed weighted contribution and completed weight coverage across all categories
  let currentWeightedContribution = 0
  let completedCategoryWeightTotal = 0
  let totalConfiguredWeight = 0

  for (const cat of subject.categories) {
    totalConfiguredWeight += cat.weight
    const catResult = calculateCategoryResult(cat, assessments, false)
    if (catResult.hasCompletedAssessments) {
      currentWeightedContribution += catResult.weightedContribution
      completedCategoryWeightTotal += cat.weight
    }
  }

  // Calculate weight allocated to the target assessment
  const targetCategoryAssessments = assessments.filter(a => a.categoryId === targetCategory.id)
  const isTargetAlreadyInAssessments = targetCategoryAssessments.some(
    a => a.name.toLowerCase() === query.targetAssessmentName?.toLowerCase()
  )

  let targetAssessmentWeight = targetCategory.weight

  if (targetCategory.calculationMethod === 'total_points') {
    let totalCategoryPoints = query.totalPossiblePoints
    for (const a of targetCategoryAssessments) {
      if (a.name.toLowerCase() !== query.targetAssessmentName?.toLowerCase()) {
        totalCategoryPoints += a.totalPossiblePoints
      }
    }
    if (totalCategoryPoints > 0) {
      targetAssessmentWeight = targetCategory.weight * (query.totalPossiblePoints / totalCategoryPoints)
    }
  } else {
    const count = targetCategoryAssessments.length + (isTargetAlreadyInAssessments ? 0 : 1)
    targetAssessmentWeight = count > 0 ? targetCategory.weight / count : targetCategory.weight
  }

  // Factor in assumed scores from other remaining assessments if specified
  let assumedOtherContribution = 0
  let assumedOtherWeight = 0

  if (query.otherRemainingAssumptions && query.otherRemainingAssumptions.length > 0) {
    for (const assumption of query.otherRemainingAssumptions) {
      const cat = subject.categories.find(c => c.id === assumption.categoryId)
      if (cat) {
        const weightFraction = assumption.weightFractionOfCategory ?? 1
        const effectiveWeight = cat.weight * weightFraction
        assumedOtherWeight += effectiveWeight
        assumedOtherContribution += (assumption.assumedPercentage / 100) * effectiveWeight
      }
    }
  }

  const effectiveCurrentContribution = currentWeightedContribution + assumedOtherContribution
  const decimalWeight = targetAssessmentWeight / 100

  if (decimalWeight <= 0) {
    throw new CalculationError('Target assessment has zero weight in the course calculation.')
  }

  // Required assessment percentage = (Target raw percentage - Current weighted contribution) / Remaining assessment weight * 100
  const pointsDifferenceNeeded = effectiveTargetRaw - effectiveCurrentContribution
  const requiredPercentage = (pointsDifferenceNeeded / targetAssessmentWeight) * 100
  const requiredPoints = (requiredPercentage / 100) * query.totalPossiblePoints

  // Remaining weight in the course not yet completed
  const remainingCourseWeight = Math.max(0, 100 - completedCategoryWeightTotal)
  // Max possible: already earned + remaining weight (scoring 100% on everything left)
  const maximumPossibleGrade = currentWeightedContribution + remainingCourseWeight
  // Min possible: already earned (scoring 0% on everything left)
  const minimumPossibleGrade = currentWeightedContribution

  const isAchievable = requiredPercentage <= 100

  let message = ''
  if (requiredPercentage <= 0) {
    message = `Target grade of ${effectiveTargetRaw.toFixed(2)}% is already secured based on your current assessment scores!`
  } else if (isAchievable) {
    message = `Achievable: You need ${requiredPoints.toFixed(1)} / ${query.totalPossiblePoints} points (${requiredPercentage.toFixed(2)}%) on this assessment.`
  } else {
    message = `Unachievable through this assessment alone: You would need ${requiredPercentage.toFixed(2)}% (${requiredPoints.toFixed(1)} / ${query.totalPossiblePoints} pts). Your maximum possible final grade is ${maximumPossibleGrade.toFixed(2)}%.`
  }

  return {
    targetRawPercentage: effectiveTargetRaw,
    targetTransmutedGrade: query.targetTransmutedGrade,
    currentWeightedContribution: effectiveCurrentContribution,
    remainingTotalWeight: remainingCourseWeight,
    targetAssessmentWeight,
    requiredPercentage,
    requiredPoints,
    totalPossiblePoints: query.totalPossiblePoints,
    isAchievable,
    maximumPossibleGrade,
    minimumPossibleGrade,
    message
  }
}
