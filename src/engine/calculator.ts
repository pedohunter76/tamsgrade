import {
  Assessment,
  AssessmentCategory,
  CategoryCalculationMethod,
  CategoryCalculationResult,
  PeriodCombinationFormula,
  PeriodGradeDetail,
  Subject,
  SubjectGradeResult,
  TransmutationProfile
} from './types'
import { transmuteRawGrade } from './transmutation'

export class CalculationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CalculationError'
  }
}

/**
 * Calculates raw percentage for a single assessment
 */
export function calculateAssessmentPercentage(
  pointsEarned: number | null,
  totalPossiblePoints: number,
  isExtraCredit: boolean = false
): number | null {
  if (pointsEarned === null || pointsEarned === undefined) {
    return null
  }

  if (totalPossiblePoints <= 0) {
    throw new CalculationError('Total possible points must be greater than zero to prevent division by zero.')
  }

  if (pointsEarned < 0) {
    throw new CalculationError('Points earned cannot be negative.')
  }

  if (!isExtraCredit && pointsEarned > totalPossiblePoints) {
    throw new CalculationError(
      `Points earned (${pointsEarned}) cannot exceed total possible points (${totalPossiblePoints}) unless extra credit is enabled.`
    )
  }

  return (pointsEarned / totalPossiblePoints) * 100
}

/**
 * Evaluates assessments within a category based on the chosen calculation method
 */
export function calculateCategoryResult(
  category: AssessmentCategory,
  assessments: Assessment[],
  treatMissingAsZero: boolean = false
): CategoryCalculationResult {
  const categoryAssessments = assessments.filter(a => a.categoryId === category.id)
  const totalAssessmentsCount = categoryAssessments.length

  // Filter completed vs pending
  const effectiveAssessments: {
    pointsEarned: number
    totalPossible: number
    percentage: number
    isExplicitlyZero: boolean
  }[] = []

  let pendingCount = 0

  for (const a of categoryAssessments) {
    if (a.pointsEarned !== null && a.pointsEarned !== undefined) {
      const pct = calculateAssessmentPercentage(a.pointsEarned, a.totalPossiblePoints, a.isExtraCredit)
      if (pct !== null) {
        effectiveAssessments.push({
          pointsEarned: a.pointsEarned,
          totalPossible: a.totalPossiblePoints,
          percentage: pct,
          isExplicitlyZero: a.pointsEarned === 0 || !!a.isMarkedZero
        })
      }
    } else if (a.isMarkedZero) {
      effectiveAssessments.push({
        pointsEarned: 0,
        totalPossible: a.totalPossiblePoints,
        percentage: 0,
        isExplicitlyZero: true
      })
    } else if (treatMissingAsZero) {
      effectiveAssessments.push({
        pointsEarned: 0,
        totalPossible: a.totalPossiblePoints,
        percentage: 0,
        isExplicitlyZero: false
      })
    } else {
      pendingCount++
    }
  }

  const completedCount = effectiveAssessments.length

  if (completedCount === 0) {
    return {
      categoryId: category.id,
      categoryName: category.name,
      weight: category.weight,
      method: category.calculationMethod,
      totalEarned: 0,
      totalPossible: 0,
      percentage: 0,
      weightedContribution: 0,
      completedAssessmentsCount: 0,
      totalAssessmentsCount,
      hasCompletedAssessments: false,
      isSummative: !!category.isSummative
    }
  }

  // Handle drop lowest if configured
  let evaluatedAssessments = [...effectiveAssessments]
  const dropCount = category.dropLowestCount || 0
  if (dropCount > 0 && evaluatedAssessments.length > dropCount) {
    evaluatedAssessments.sort((a, b) => a.percentage - b.percentage)
    evaluatedAssessments = evaluatedAssessments.slice(dropCount)
  }

  let categoryPercentage = 0
  let totalEarned = 0
  let totalPossible = 0

  if (category.calculationMethod === 'total_points') {
    // Total-points method: sum earned / sum possible * 100
    for (const a of evaluatedAssessments) {
      totalEarned += a.pointsEarned
      totalPossible += a.totalPossible
    }
    if (totalPossible > 0) {
      categoryPercentage = (totalEarned / totalPossible) * 100
    }
  } else {
    // Equal-weight assessment method: arithmetic mean of individual percentages
    let sumPercentages = 0
    for (const a of evaluatedAssessments) {
      sumPercentages += a.percentage
      totalEarned += a.pointsEarned
      totalPossible += a.totalPossible
    }
    categoryPercentage = sumPercentages / evaluatedAssessments.length
  }

  const weightedContribution = categoryPercentage * (category.weight / 100)

  return {
    categoryId: category.id,
    categoryName: category.name,
    weight: category.weight,
    method: category.calculationMethod,
    totalEarned,
    totalPossible,
    percentage: categoryPercentage,
    weightedContribution,
    completedAssessmentsCount: completedCount,
    totalAssessmentsCount,
    hasCompletedAssessments: true,
    isSummative: !!category.isSummative
  }
}

/**
 * Calculates complete subject grade with unnormalized and normalized provisional values
 */
export function calculateSubjectGrade(
  subject: Subject,
  assessments: Assessment[],
  transmutationProfile?: TransmutationProfile,
  treatMissingAsZero: boolean = false
): SubjectGradeResult {
  const categoryResults: CategoryCalculationResult[] = []
  let totalWeightConfigured = 0
  let completedWeightCoverage = 0
  let unnormalizedRawGrade = 0

  let formativeRawGrade = 0
  let formativeCoverage = 0
  let summativeRawGrade = 0
  let summativeCoverage = 0

  for (const cat of subject.categories) {
    totalWeightConfigured += cat.weight
    const catResult = calculateCategoryResult(cat, assessments, treatMissingAsZero)
    categoryResults.push(catResult)

    if (catResult.hasCompletedAssessments) {
      completedWeightCoverage += cat.weight
      unnormalizedRawGrade += catResult.weightedContribution

      if (cat.isSummative) {
        summativeRawGrade += catResult.weightedContribution
        summativeCoverage += cat.weight
      } else {
        formativeRawGrade += catResult.weightedContribution
        formativeCoverage += cat.weight
      }
    }
  }

  // Weight validation warnings
  const isWeightValid = Math.abs(totalWeightConfigured - 100) < 0.001
  let weightWarning: string | undefined
  if (totalWeightConfigured < 100) {
    weightWarning = `Total category weights equal ${totalWeightConfigured}%, which is less than 100%. Raw contributions will reflect only the configured weight.`
  } else if (totalWeightConfigured > 100) {
    weightWarning = `Total category weights equal ${totalWeightConfigured}%, which exceeds 100%. Please adjust category weights to equal exactly 100%.`
  }

  // Normalized provisional grade
  let normalizedProvisionalGrade = 0
  if (completedWeightCoverage > 0) {
    normalizedProvisionalGrade = (unnormalizedRawGrade / completedWeightCoverage) * 100
  }

  function getFallbackRawForLetter(letter: string): number {
    switch (letter) {
      case 'A': return 98.0
      case 'A-': return 93.0
      case 'B+': return 88.0
      case 'B': return 83.0
      case 'C+': return 77.0
      case 'C': return 72.0
      case 'D+': return 67.0
      case 'D': return 62.0
      case 'F':
      default: return 50.0
    }
  }

  // 1. Direct Midterm Grade override
  const isDirectMidterm =
    !!(subject.isDirectMidtermActive && subject.directMidtermLetterGrade) ||
    (subject.isDirectGradeActive && subject.directGradePeriod === 'midterm' && !!subject.directLetterGrade)

  // 2. Direct Final Grade override
  const isDirectFinal =
    !!(subject.isDirectFinalActive && subject.directFinalLetterGrade) ||
    (subject.isDirectGradeActive && subject.directGradePeriod !== 'midterm' && !!subject.directLetterGrade)

  // Calculate Midterm Period Grade (The running grade milestone)
  let midtermGrade: PeriodGradeDetail
  if (isDirectMidterm) {
    const letter = subject.directMidtermLetterGrade || subject.directLetterGrade!
    const qp = subject.directMidtermGradePoint ?? subject.directGradePoint
    const raw = subject.directMidtermRawScore ?? subject.directRawScore ?? getFallbackRawForLetter(letter)
    midtermGrade = {
      period: 'midterm',
      rawPercentage: raw,
      letterGrade: letter,
      transmutedGrade: qp !== undefined ? qp.toFixed(2) : undefined,
      qualityPoints: qp,
      completedCoverage: 50,
      isDirect: true,
      isProjected: false,
      remarks: subject.directMidtermRemarks || subject.directGradeRemarks || 'Direct given Midterm running grade'
    }
  } else {
    // Assessment-based midterm calculation (midterm exam + formative tasks up to midterm)
    let midtermEarned = 0
    let midtermAssessedWeight = 0

    for (const cat of categoryResults) {
      const sc = subject.categories.find(s => s.id === cat.categoryId)
      if (sc?.gradingPeriod === 'midterm') {
        if (cat.hasCompletedAssessments) {
          midtermEarned += cat.weightedContribution
          midtermAssessedWeight += sc.weight
        }
      } else if (sc?.gradingPeriod === 'all') {
        const half = sc.weight / 2
        if (cat.hasCompletedAssessments) {
          midtermEarned += (cat.percentage / 100) * half
          midtermAssessedWeight += half
        }
      }
    }

    const midtermRawPct = midtermAssessedWeight > 0 ? (midtermEarned / midtermAssessedWeight) * 100 : 0
    let mLetter: string | undefined
    let mTransmuted: string | undefined
    let mQP: number | undefined

    if (midtermAssessedWeight > 0 && transmutationProfile) {
      const transmuted = transmuteRawGrade(midtermRawPct, transmutationProfile)
      if (transmuted) {
        mLetter = transmuted.letterGrade
        mTransmuted = transmuted.officialGrade
        mQP = transmuted.qualityPoints
      }
    }

    midtermGrade = {
      period: 'midterm',
      rawPercentage: midtermRawPct,
      letterGrade: mLetter,
      transmutedGrade: mTransmuted,
      qualityPoints: mQP,
      completedCoverage: midtermAssessedWeight,
      isDirect: false,
      isProjected: false,
      remarks: midtermAssessedWeight > 0 ? 'Running grade based on Midterm assessments' : 'Pending Midterm evaluations'
    }
  }

  // Calculate Final Period & Combined Course Grade
  let finalGrade: PeriodGradeDetail
  if (isDirectFinal) {
    const letter = subject.directFinalLetterGrade || subject.directLetterGrade!
    const qp = subject.directFinalGradePoint ?? subject.directGradePoint
    const raw = subject.directFinalRawScore ?? subject.directRawScore ?? getFallbackRawForLetter(letter)
    finalGrade = {
      period: 'final',
      rawPercentage: raw,
      letterGrade: letter,
      transmutedGrade: qp !== undefined ? qp.toFixed(2) : undefined,
      qualityPoints: qp,
      completedCoverage: 100,
      isDirect: true,
      isProjected: false,
      remarks: subject.directFinalRemarks || subject.directGradeRemarks || 'Official Final course grade'
    }
  } else {
    // Check final period categories
    let finalEarned = 0
    let finalAssessedWeight = 0

    for (const cat of categoryResults) {
      const sc = subject.categories.find(s => s.id === cat.categoryId)
      if (sc?.gradingPeriod === 'final') {
        if (cat.hasCompletedAssessments) {
          finalEarned += cat.weightedContribution
          finalAssessedWeight += sc.weight
        }
      } else if (sc?.gradingPeriod === 'all') {
        const half = sc.weight / 2
        if (cat.hasCompletedAssessments) {
          finalEarned += (cat.percentage / 100) * half
          finalAssessedWeight += half
        }
      }
    }

    const finalPeriodRawPct = finalAssessedWeight > 0 ? (finalEarned / finalAssessedWeight) * 100 : 0

    // Combine Midterm running grade with Final period
    let finalCourseRaw = 0
    let isProjected = false

    if (subject.periodFormula === 'midterm_50_final_50') {
      if (finalAssessedWeight > 0) {
        // Both midterm & final period have assessments: combine 50/50
        finalCourseRaw = midtermGrade.rawPercentage * 0.5 + finalPeriodRawPct * 0.5
        isProjected = completedWeightCoverage < 100
      } else if (midtermGrade.completedCoverage > 0 || isDirectMidterm) {
        // Only midterm is evaluated: Midterm Grade is the running grade ahead to Finals!
        finalCourseRaw = midtermGrade.rawPercentage
        isProjected = true
      } else {
        finalCourseRaw = 0
        isProjected = true
      }
    } else {
      // Cumulative 100%
      finalCourseRaw = completedWeightCoverage >= 100 ? unnormalizedRawGrade : normalizedProvisionalGrade
      isProjected = completedWeightCoverage < 100
    }

    let fLetter: string | undefined
    let fTransmuted: string | undefined
    let fQP: number | undefined

    if ((completedWeightCoverage > 0 || isDirectMidterm || treatMissingAsZero) && transmutationProfile) {
      const transmuted = transmuteRawGrade(finalCourseRaw, transmutationProfile)
      if (transmuted) {
        fLetter = transmuted.letterGrade
        fTransmuted = transmuted.officialGrade
        fQP = transmuted.qualityPoints
      }
    }

    finalGrade = {
      period: 'final',
      rawPercentage: finalCourseRaw,
      letterGrade: fLetter,
      transmutedGrade: fTransmuted,
      qualityPoints: fQP,
      completedCoverage: completedWeightCoverage,
      isDirect: false,
      isProjected,
      remarks: isProjected
        ? 'Midterm running grade ahead to Finals (Final period runway remaining)'
        : 'Official completed Final Course Grade'
    }
  }

  // Transmutation lookup for overall course standing
  const transmutedGrade = finalGrade.transmutedGrade || midtermGrade.transmutedGrade
  const letterGrade = finalGrade.letterGrade || midtermGrade.letterGrade
  const qualityPoints = finalGrade.qualityPoints ?? midtermGrade.qualityPoints
  const transmutationStatus = transmutationProfile?.verificationStatus
  const transmutationTableUsed = transmutationProfile?.name
  const isDirectGrade = isDirectFinal || isDirectMidterm
  const directGradeRemarks = isDirectFinal
    ? subject.directFinalRemarks || subject.directGradeRemarks
    : isDirectMidterm
    ? subject.directMidtermRemarks || subject.directGradeRemarks
    : undefined

  // Period-based standing (Midterm vs Final) for backward compatibility
  const midtermCats = categoryResults.filter(
    c => subject.categories.find(sc => sc.id === c.categoryId)?.gradingPeriod === 'midterm'
  )
  const finalCats = categoryResults.filter(
    c => subject.categories.find(sc => sc.id === c.categoryId)?.gradingPeriod === 'final'
  )

  let midtermResult: { rawGrade: number; coverage: number } | undefined
  if (midtermCats.length > 0) {
    const midCoverage = midtermCats.reduce((sum, c) => (c.hasCompletedAssessments ? sum + c.weight : sum), 0)
    const midEarned = midtermCats.reduce((sum, c) => sum + c.weightedContribution, 0)
    midtermResult = {
      rawGrade: midCoverage > 0 ? (midEarned / midCoverage) * 100 : 0,
      coverage: midCoverage
    }
  }

  let finalPeriodResult: { rawGrade: number; coverage: number } | undefined
  if (finalCats.length > 0) {
    const finCoverage = finalCats.reduce((sum, c) => (c.hasCompletedAssessments ? sum + c.weight : sum), 0)
    const finEarned = finalCats.reduce((sum, c) => sum + c.weightedContribution, 0)
    finalPeriodResult = {
      rawGrade: finCoverage > 0 ? (finEarned / finCoverage) * 100 : 0,
      coverage: finCoverage
    }
  }

  let combinedPeriodGrade: number | undefined
  if (midtermResult && finalPeriodResult && midtermResult.coverage > 0 && finalPeriodResult.coverage > 0) {
    combinedPeriodGrade = calculateCombinedPeriodGrade(
      midtermResult.rawGrade,
      finalPeriodResult.rawGrade,
      subject.periodFormula,
      subject.midtermWeight,
      subject.finalWeight
    )
  }

  return {
    subjectId: subject.id,
    categories: categoryResults,
    totalWeightConfigured,
    isWeightValid,
    weightWarning,
    completedWeightCoverage: isDirectGrade ? 100 : completedWeightCoverage,
    unnormalizedRawGrade,
    normalizedProvisionalGrade: finalGrade.rawPercentage || normalizedProvisionalGrade,
    formativeRawGrade,
    summativeRawGrade,
    formativeCoverage,
    summativeCoverage,
    midtermGrade,
    finalGrade,
    transmutedGrade,
    letterGrade,
    qualityPoints,
    transmutationStatus,
    transmutationTableUsed,
    midtermResult,
    finalPeriodResult,
    combinedPeriodGrade,
    isDirectGrade,
    directGradeRemarks
  }
}

/**
 * Combines Midterm and Final period grades according to syllabus formula
 */
export function calculateCombinedPeriodGrade(
  midtermGrade: number,
  finalPeriodGrade: number,
  formula: PeriodCombinationFormula,
  customMidtermWeight: number = 50,
  customFinalWeight: number = 50
): number {
  switch (formula) {
    case 'midterm_50_final_50':
      return midtermGrade * 0.5 + finalPeriodGrade * 0.5
    case 'midterm_33_final_67':
      return midtermGrade * (1 / 3) + finalPeriodGrade * (2 / 3)
    case 'custom':
      const totalCustom = customMidtermWeight + customFinalWeight
      if (totalCustom <= 0) return 0
      return midtermGrade * (customMidtermWeight / totalCustom) + finalPeriodGrade * (customFinalWeight / totalCustom)
    case 'cumulative_100':
    default:
      return finalPeriodGrade
  }
}

/**
 * Clean numeric rounding for display only
 */
export function roundToPrecision(value: number, precision: number = 2): number {
  if (isNaN(value)) return 0
  const factor = Math.pow(10, precision)
  return Math.round(value * factor) / factor
}

export function formatGrade(value: number, precision: number = 2): string {
  if (isNaN(value)) return '0.00'
  return roundToPrecision(value, precision).toFixed(precision)
}
