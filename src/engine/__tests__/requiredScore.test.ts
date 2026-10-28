import { describe, it, expect } from 'vitest'
import { calculateRequiredScore } from '../requiredScore'
import { Subject, Assessment, RequiredScoreQuery, TransmutationProfile } from '../types'
import { CalculationError } from '../calculator'

describe('Required Score Calculator Engine Tests', () => {
  const sampleSubject: Subject = {
    id: 'sub_acc101',
    code: 'ACC101',
    name: 'Financial Accounting',
    academicYear: '2026-2027',
    semester: '1st',
    units: 3,
    category: 'iabf_major',
    gradingProfileId: 'feu_iabf_accountancy',
    periodFormula: 'midterm_50_final_50',
    categories: [
      { id: 'cat_quiz', name: 'Quizzes', weight: 40, calculationMethod: 'total_points' },
      { id: 'cat_midterm', name: 'Midterm Exam', weight: 30, calculationMethod: 'total_points' },
      { id: 'cat_final', name: 'Final Exam', weight: 30, calculationMethod: 'total_points' }
    ],
    createdAt: '',
    updatedAt: ''
  }

  const sampleProfile: TransmutationProfile = {
    id: 'scale_test',
    name: 'Scale Test',
    institution: 'Far Eastern University Manila',
    program: 'IABF',
    applicableYear: '2026-2027',
    verificationStatus: 'verified',
    sourceReference: 'FEU Test Reference',
    ranges: [
      { id: 'r1', minRaw: 90, maxRaw: 100, officialGrade: '4.00' },
      { id: 'r2', minRaw: 80, maxRaw: 89.999, officialGrade: '3.00' },
      { id: 'r3', minRaw: 70, maxRaw: 79.999, officialGrade: '2.00' },
      { id: 'r4', minRaw: 0, maxRaw: 69.999, officialGrade: '0.00' }
    ]
  }

  it('calculates required score on an upcoming final exam accurately', () => {
    // Current: 90% in Quizzes (weight 40) => 36%
    // 80% in Midterm (weight 30) => 24%
    // Total current = 60%. Remaining = Final Exam (weight 30).
    // Target = 84% raw.
    // Difference needed = 84 - 60 = 24%.
    // Required score on final = (24 / 30) * 100 = 80%.
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_acc101', categoryId: 'cat_quiz', name: 'Quiz 1', pointsEarned: 90, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_acc101', categoryId: 'cat_midterm', name: 'Midterm', pointsEarned: 80, totalPossiblePoints: 100 }
    ]

    const query: RequiredScoreQuery = {
      subjectId: 'sub_acc101',
      targetRawGrade: 84,
      targetCategoryId: 'cat_final',
      targetAssessmentName: 'Final Exam',
      totalPossiblePoints: 100
    }

    const result = calculateRequiredScore(sampleSubject, assessments, query)
    expect(result.isAchievable).toBe(true)
    expect(result.requiredPercentage).toBeCloseTo(80, 2)
    expect(result.requiredPoints).toBeCloseTo(80, 2)
    expect(result.message).toContain('Achievable')
  })

  it('flags unachievable targets when mathematically impossible', () => {
    // Current total = 50% earned out of 70% completed. Remaining weight = 30%.
    // Maximum possible final grade = 50 + 30 = 80%.
    // Target = 95%.
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_acc101', categoryId: 'cat_quiz', name: 'Quiz 1', pointsEarned: 50, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_acc101', categoryId: 'cat_midterm', name: 'Midterm', pointsEarned: 100, totalPossiblePoints: 100 }
    ]

    const query: RequiredScoreQuery = {
      subjectId: 'sub_acc101',
      targetRawGrade: 95,
      targetCategoryId: 'cat_final',
      totalPossiblePoints: 100
    }

    const result = calculateRequiredScore(sampleSubject, assessments, query)
    expect(result.isAchievable).toBe(false)
    expect(result.requiredPercentage).toBeGreaterThan(100)
    expect(result.maximumPossibleGrade).toBeLessThan(95)
    expect(result.message).toContain('Unachievable')
  })

  it('detects when the target grade is already guaranteed', () => {
    // Current total = 80%. Target = 70%.
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_acc101', categoryId: 'cat_quiz', name: 'Quiz 1', pointsEarned: 100, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_acc101', categoryId: 'cat_midterm', name: 'Midterm', pointsEarned: 100, totalPossiblePoints: 100 }
    ]

    const query: RequiredScoreQuery = {
      subjectId: 'sub_acc101',
      targetRawGrade: 60,
      targetCategoryId: 'cat_final',
      totalPossiblePoints: 100
    }

    const result = calculateRequiredScore(sampleSubject, assessments, query)
    expect(result.isAchievable).toBe(true)
    expect(result.requiredPercentage).toBeLessThanOrEqual(0)
    expect(result.message).toContain('already secured')
  })

  it('looks up minimum raw percentage when target transmuted grade is specified', () => {
    // Target transmuted grade: "3.00" -> minRaw = 80 in sampleProfile
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_acc101', categoryId: 'cat_quiz', name: 'Quiz 1', pointsEarned: 80, totalPossiblePoints: 100 }
    ]

    const query: RequiredScoreQuery = {
      subjectId: 'sub_acc101',
      targetRawGrade: 50, // overridden by targetTransmutedGrade
      targetTransmutedGrade: '3.00',
      targetCategoryId: 'cat_final',
      totalPossiblePoints: 100
    }

    const result = calculateRequiredScore(sampleSubject, assessments, query, sampleProfile)
    expect(result.targetRawPercentage).toBe(80)
  })

  it('factors in assumed scores on other remaining assessments', () => {
    // Current: Quizzes = 100% (weight 40) => 40%
    // Remaining: Midterm (weight 30), Final (weight 30)
    // Assumption: Student assumes 90% on Midterm => 27%
    // Total effective contribution = 40 + 27 = 67%
    // Target = 88%
    // Required on Final: (88 - 67) / 30 * 100 = 70%
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_acc101', categoryId: 'cat_quiz', name: 'Quiz 1', pointsEarned: 100, totalPossiblePoints: 100 }
    ]

    const query: RequiredScoreQuery = {
      subjectId: 'sub_acc101',
      targetRawGrade: 88,
      targetCategoryId: 'cat_final',
      totalPossiblePoints: 100,
      otherRemainingAssumptions: [
        {
          categoryId: 'cat_midterm',
          assumedPercentage: 90,
          weightFractionOfCategory: 1
        }
      ]
    }

    const result = calculateRequiredScore(sampleSubject, assessments, query)
    expect(result.requiredPercentage).toBeCloseTo(70, 2)
  })

  it('throws CalculationError if target category does not exist', () => {
    const query: RequiredScoreQuery = {
      subjectId: 'sub_acc101',
      targetRawGrade: 75,
      targetCategoryId: 'non_existent_cat',
      totalPossiblePoints: 100
    }

    expect(() => calculateRequiredScore(sampleSubject, [], query)).toThrow(CalculationError)
  })
})
