import { describe, it, expect } from 'vitest'
import { simulateGradeChanges } from '../simulator'
import { Subject, Assessment, SimulationChange, TransmutationProfile } from '../types'

describe('Grade Simulator Engine Tests', () => {
  const sampleSubject: Subject = {
    id: 'sub_sim1',
    code: 'ACT101',
    name: 'Intro Accounting',
    academicYear: '2026-2027',
    semester: '1st',
    units: 3,
    category: 'iabf_major',
    gradingProfileId: 'feu_iabf_accountancy',
    periodFormula: 'cumulative_100',
    categories: [
      { id: 'cat_cw', name: 'Classwork', weight: 50, calculationMethod: 'total_points' },
      { id: 'cat_ex', name: 'Exam', weight: 50, calculationMethod: 'total_points' }
    ],
    createdAt: '',
    updatedAt: ''
  }

  const sampleProfile: TransmutationProfile = {
    id: 'sim_scale',
    name: 'Sim Scale',
    institution: 'Far Eastern University Manila',
    program: 'IABF',
    applicableYear: '2026-2027',
    verificationStatus: 'verified',
    sourceReference: 'FEU Test Scale',
    ranges: [
      { id: 'r1', minRaw: 90, maxRaw: 100, officialGrade: '4.00' },
      { id: 'r2', minRaw: 80, maxRaw: 89.999, officialGrade: '3.00' },
      { id: 'r3', minRaw: 70, maxRaw: 79.999, officialGrade: '2.00' },
      { id: 'r4', minRaw: 0, maxRaw: 69.999, officialGrade: '0.00' }
    ]
  }

  it('modifies existing assessment scores immutably', () => {
    const originalAssessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_sim1', categoryId: 'cat_cw', name: 'Quiz 1', pointsEarned: 70, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_sim1', categoryId: 'cat_ex', name: 'Midterm', pointsEarned: 70, totalPossiblePoints: 100 }
    ]

    // Original grade: 70% raw -> 2.00
    // Simulation: improve a2 to 90
    const changes: SimulationChange[] = [
      {
        assessmentId: 'a2',
        categoryId: 'cat_ex',
        name: 'Midterm',
        pointsEarned: 90,
        totalPossiblePoints: 100
      }
    ]

    const result = simulateGradeChanges(sampleSubject, originalAssessments, changes, sampleProfile)

    // Original result verification
    expect(result.originalResult.unnormalizedRawGrade).toBe(70)
    expect(result.originalResult.transmutedGrade).toBe('2.00')

    // Simulated result verification
    // 70 * 0.5 + 90 * 0.5 = 35 + 45 = 80% raw -> 3.00
    expect(result.simulatedResult.unnormalizedRawGrade).toBe(80)
    expect(result.simulatedResult.transmutedGrade).toBe('3.00')
    expect(result.rawDifference).toBe(10)
    expect(result.transmutedGradeChanged).toBe(true)
    expect(result.previousTransmutedGrade).toBe('2.00')
    expect(result.newTransmutedGrade).toBe('3.00')

    // Immutability: original assessment array must not have been modified
    expect(originalAssessments[1].pointsEarned).toBe(70)
  })

  it('adds hypothetical upcoming assessments', () => {
    // Currently only Classwork completed (100 pts / 100 = 100% -> contribution 50%)
    const originalAssessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_sim1', categoryId: 'cat_cw', name: 'Quiz 1', pointsEarned: 100, totalPossiblePoints: 100 }
    ]

    // Add hypothetical Exam with 80%
    const changes: SimulationChange[] = [
      {
        categoryId: 'cat_ex',
        name: 'Hypothetical Exam',
        pointsEarned: 80,
        totalPossiblePoints: 100
      }
    ]

    const result = simulateGradeChanges(sampleSubject, originalAssessments, changes, sampleProfile)

    // Without exam (only 50% coverage), provisional grade is 100% normalized
    expect(result.originalResult.normalizedProvisionalGrade).toBe(100)
    // With exam (100% coverage), raw grade is 100*0.5 + 80*0.5 = 90%
    expect(result.simulatedResult.unnormalizedRawGrade).toBe(90)
    expect(result.simulatedResult.transmutedGrade).toBe('4.00')
    expect(originalAssessments).toHaveLength(1)
  })

  it('respects treatMissingAsZero in simulations', () => {
    // Only 1 of 2 categories completed with 80%
    const originalAssessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_sim1', categoryId: 'cat_cw', name: 'Quiz 1', pointsEarned: 80, totalPossiblePoints: 100 }
    ]

    // With treatMissingAsZero = true, missing Exam counts as 0
    // Raw grade = 80 * 0.5 + 0 = 40%
    const result = simulateGradeChanges(sampleSubject, originalAssessments, [], sampleProfile, true)
    expect(result.simulatedResult.unnormalizedRawGrade).toBe(40)
    expect(result.simulatedResult.transmutedGrade).toBe('0.00')
  })
})
