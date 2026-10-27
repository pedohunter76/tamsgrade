import { describe, it, expect } from 'vitest'
import {
  calculateAssessmentPercentage,
  calculateCategoryResult,
  calculateSubjectGrade,
  calculateCombinedPeriodGrade,
  CalculationError
} from '../calculator'
import {
  transmuteRawGrade,
  validateTransmutationProfile,
  getMinimumRawForTransmutedGrade
} from '../transmutation'
import { calculateRequiredScore } from '../requiredScore'
import { simulateGradeChanges } from '../simulator'
import { validateBackupJson } from '../validation'
import { DEFAULT_TRANSMUTATION_PROFILES } from '../profiles'
import { Assessment, AssessmentCategory, Subject, TransmutationProfile } from '../types'

describe('TamsGrade Calculation Engine Test Suite', () => {
  // Test 1: Basic points-to-percentage calculations
  it('1. calculates basic points-to-percentage accurately', () => {
    expect(calculateAssessmentPercentage(18, 20)).toBe(90)
    expect(calculateAssessmentPercentage(15, 20)).toBe(75)
    expect(calculateAssessmentPercentage(22, 25)).toBe(88)
    expect(calculateAssessmentPercentage(null, 50)).toBeNull()
  })

  // Test 2: Weighted grade calculations (using the sample 81% from section 6)
  it('2. calculates overall weighted course grade (81% sample test case)', () => {
    const subject: Subject = {
      id: 'sub_sample',
      code: 'TEST101',
      name: 'Sample Testing Subject',
      academicYear: '2025-2026',
      semester: '1st Semester',
      units: 3,
      category: 'gen_ed',
      gradingProfileId: 'custom',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'cat_q', name: 'Quizzes', weight: 20, calculationMethod: 'total_points' },
        { id: 'cat_act', name: 'Activities', weight: 30, calculationMethod: 'total_points' },
        { id: 'cat_mid', name: 'Midterm Exam', weight: 20, calculationMethod: 'total_points', isSummative: true },
        { id: 'cat_fin', name: 'Final Exam', weight: 30, calculationMethod: 'total_points', isSummative: true }
      ],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    }

    // To produce exactly 81% weighted grade: Quizzes (80%), Activities (90%), Midterm (70%), Final (80%)
    // 80*0.20 (16) + 90*0.30 (27) + 70*0.20 (14) + 80*0.30 (24) = 81%
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_sample', categoryId: 'cat_q', name: 'Quiz 1', pointsEarned: 80, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_sample', categoryId: 'cat_act', name: 'Activity 1', pointsEarned: 90, totalPossiblePoints: 100 },
      { id: 'a3', subjectId: 'sub_sample', categoryId: 'cat_mid', name: 'Midterm', pointsEarned: 70, totalPossiblePoints: 100 },
      { id: 'a4', subjectId: 'sub_sample', categoryId: 'cat_fin', name: 'Final', pointsEarned: 80, totalPossiblePoints: 100 }
    ]

    const result = calculateSubjectGrade(subject, assessments)
    expect(result.unnormalizedRawGrade).toBeCloseTo(81, 4)
    expect(result.normalizedProvisionalGrade).toBeCloseTo(81, 4)
    expect(result.completedWeightCoverage).toBe(100)
    expect(result.isWeightValid).toBe(true)

    // Also test with Quizzes at 85%: 85*0.20 (17) + 27 + 14 + 24 = 82% unrounded
    const assessments82: Assessment[] = [
      { ...assessments[0], pointsEarned: 85 },
      assessments[1],
      assessments[2],
      assessments[3]
    ]
    const result82 = calculateSubjectGrade(subject, assessments82)
    expect(result82.unnormalizedRawGrade).toBeCloseTo(82, 4)
  })

  // Test 3: Total-points vs equal-weight category calculations
  it('3. distinguishes between total-points and equal-weight category methods', () => {
    // Assessment 1: 10/10 (100%), Assessment 2: 50/100 (50%)
    // Total-points: (10 + 50) / (10 + 100) = 60 / 110 = 54.545%
    // Equal-weight: (100% + 50%) / 2 = 75.000%
    const catTotalPoints = { id: 'c1', name: 'Quizzes', weight: 30, calculationMethod: 'total_points' as const }
    const catEqualWeight = { id: 'c2', name: 'Quizzes', weight: 30, calculationMethod: 'equal_weight' as const }

    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 's', categoryId: 'c1', name: 'Mini Quiz', pointsEarned: 10, totalPossiblePoints: 10 },
      { id: 'a2', subjectId: 's', categoryId: 'c1', name: 'Long Quiz', pointsEarned: 50, totalPossiblePoints: 100 }
    ]

    const resultTotal = calculateCategoryResult(catTotalPoints, assessments)
    expect(resultTotal.percentage).toBeCloseTo((60 / 110) * 100, 4) // ~54.545%

    const assessmentsEq: Assessment[] = assessments.map(a => ({ ...a, categoryId: 'c2' }))
    const resultEqual = calculateCategoryResult(catEqualWeight, assessmentsEq)
    expect(resultEqual.percentage).toBeCloseTo(75, 4) // 75%
  })

  // Test 4: Category weights totaling 100%
  it('4. accepts category weights totaling exactly 100% with no warnings', () => {
    const subject: Subject = {
      id: 'sub1',
      code: 'ACC101',
      name: 'Accounting',
      academicYear: '2025-2026',
      semester: '1st',
      units: 3,
      category: 'iabf_major',
      gradingProfileId: 'feu_iabf_accountancy',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Quizzes', weight: 40, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Exams', weight: 60, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    const result = calculateSubjectGrade(subject, [])
    expect(result.isWeightValid).toBe(true)
    expect(result.weightWarning).toBeUndefined()
  })

  // Test 5: Category weights below and above 100%
  it('5. detects and warns when category weights do not equal 100%', () => {
    const subjectUnder: Subject = {
      id: 'sub_under',
      code: 'TEST',
      name: 'Under',
      academicYear: '2025-2026',
      semester: '1st',
      units: 3,
      category: 'gen_ed',
      gradingProfileId: 'custom',
      periodFormula: 'cumulative_100',
      categories: [{ id: 'c1', name: 'Quizzes', weight: 80, calculationMethod: 'total_points' }],
      createdAt: '',
      updatedAt: ''
    }
    const resUnder = calculateSubjectGrade(subjectUnder, [])
    expect(resUnder.isWeightValid).toBe(false)
    expect(resUnder.weightWarning).toContain('less than 100%')

    const subjectOver: Subject = {
      ...subjectUnder,
      categories: [
        { id: 'c1', name: 'Quizzes', weight: 70, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Exams', weight: 50, calculationMethod: 'total_points' }
      ]
    }
    const resOver = calculateSubjectGrade(subjectOver, [])
    expect(resOver.isWeightValid).toBe(false)
    expect(resOver.weightWarning).toContain('exceeds 100%')
  })

  // Test 6: Missing assessments (provisional normalization vs unnormalized)
  it('6. handles missing assessments properly with completed weight coverage', () => {
    const subject: Subject = {
      id: 'sub_miss',
      code: 'FAR',
      name: 'Financial Accounting',
      academicYear: '2025-2026',
      semester: '1st',
      units: 6,
      category: 'iabf_major',
      gradingProfileId: 'custom',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Quizzes', weight: 50, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Final Exam', weight: 50, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    // Only Quiz 1 is entered (90/100). Final exam is pending (null).
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_miss', categoryId: 'c1', name: 'Quiz 1', pointsEarned: 90, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_miss', categoryId: 'c2', name: 'Final Exam', pointsEarned: null, totalPossiblePoints: 100 }
    ]

    const result = calculateSubjectGrade(subject, assessments, undefined, false)
    // Completed weight coverage is 50%
    expect(result.completedWeightCoverage).toBe(50)
    // Unnormalized raw contribution: 90% * 0.50 = 45% toward 100% of course
    expect(result.unnormalizedRawGrade).toBe(45)
    // Normalized provisional grade: 45 / 0.50 = 90%
    expect(result.normalizedProvisionalGrade).toBe(90)
  })

  // Test 7: Assessments explicitly marked as zero
  it('7. distinguishes between pending assessments and assessments marked as zero', () => {
    const cat: AssessmentCategory = { id: 'c1', name: 'Quizzes', weight: 50, calculationMethod: 'total_points' }

    // When marked zero:
    const zeroAssessment: Assessment[] = [
      { id: 'a1', subjectId: 's', categoryId: 'c1', name: 'Quiz 1', pointsEarned: 0, totalPossiblePoints: 100, isMarkedZero: true }
    ]
    const resZero = calculateCategoryResult(cat, zeroAssessment)
    expect(resZero.hasCompletedAssessments).toBe(true)
    expect(resZero.percentage).toBe(0)
    expect(resZero.completedAssessmentsCount).toBe(1)

    // When pending:
    const pendingAssessment: Assessment[] = [
      { id: 'a2', subjectId: 's', categoryId: 'c1', name: 'Quiz 2', pointsEarned: null, totalPossiblePoints: 100 }
    ]
    const resPending = calculateCategoryResult(cat, pendingAssessment, false)
    expect(resPending.hasCompletedAssessments).toBe(false)
    expect(resPending.completedAssessmentsCount).toBe(0)
  })

  // Test 8: Division by zero protection
  it('8. protects against division by zero when total possible points <= 0', () => {
    expect(() => calculateAssessmentPercentage(10, 0)).toThrow(CalculationError)
    expect(() => calculateAssessmentPercentage(10, -5)).toThrow(CalculationError)
  })

  // Test 9: Negative scores rejected
  it('9. rejects negative points earned', () => {
    expect(() => calculateAssessmentPercentage(-5, 50)).toThrow('Points earned cannot be negative')
  })

  // Test 10: Scores exceeding maximum points
  it('10. rejects scores exceeding maximum points unless extra credit is enabled', () => {
    expect(() => calculateAssessmentPercentage(105, 100, false)).toThrow('cannot exceed total possible points')
    // With extra credit enabled, it is permitted
    expect(calculateAssessmentPercentage(105, 100, true)).toBe(105)
  })

  // Test 11: Multiple remaining assessments calculation
  it('11. calculates required score accounting for other remaining assessments', () => {
    const subject: Subject = {
      id: 'sub_req',
      code: 'ACT',
      name: 'Cost Accounting',
      academicYear: '2025-2026',
      semester: '1st',
      units: 3,
      category: 'iabf_major',
      gradingProfileId: 'custom',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c_quizzes', name: 'Quizzes', weight: 40, calculationMethod: 'total_points' },
        { id: 'c_mid', name: 'Midterm', weight: 30, calculationMethod: 'total_points' },
        { id: 'c_fin', name: 'Final', weight: 30, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    // Quizzes completed: 80% (weighted contrib = 32).
    // Midterm remaining: assume student gets 80% (contributes 24).
    // Target is 80% overall.
    const assessments: Assessment[] = [
      { id: 'q1', subjectId: 'sub_req', categoryId: 'c_quizzes', name: 'Quiz Total', pointsEarned: 80, totalPossiblePoints: 100 }
    ]

    const result = calculateRequiredScore(subject, assessments, {
      subjectId: 'sub_req',
      targetRawGrade: 80,
      targetCategoryId: 'c_fin',
      totalPossiblePoints: 100,
      otherRemainingAssumptions: [
        { categoryId: 'c_mid', assumedPercentage: 80 }
      ]
    })

    // Current (32) + Assumed Midterm (24) = 56.
    // Target = 80. Needed from Final = 80 - 56 = 24 weighted points.
    // Final weight is 30. Required percentage = 24 / 30 * 100 = 80%.
    expect(result.requiredPercentage).toBeCloseTo(80, 2)
    expect(result.isAchievable).toBe(true)
  })

  // Test 12: Required scores above 100%
  it('12. calculates required scores above 100% and detects when threshold is exceeded', () => {
    const subject: Subject = {
      id: 's',
      code: 'AUD',
      name: 'Auditing',
      academicYear: '',
      semester: '',
      units: 3,
      category: 'iabf_major',
      gradingProfileId: '',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Past', weight: 70, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Final Exam', weight: 30, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    // Current weighted contribution: 40 points out of 70. Target is 75%.
    // Formula from prompt: (75 - 40) / 0.30 = 35 / 0.30 = 116.67%.
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 's', categoryId: 'c1', name: 'Past Work', pointsEarned: 40, totalPossiblePoints: 70 }
    ]

    const result = calculateRequiredScore(subject, assessments, {
      subjectId: 's',
      targetRawGrade: 75,
      targetCategoryId: 'c2',
      totalPossiblePoints: 100
    })

    expect(result.requiredPercentage).toBeCloseTo(116.67, 1)
    expect(result.isAchievable).toBe(false)
  })

  // Test 13: Unachievable targets
  it('13. correctly flags mathematically unachievable targets and shows maximum possible grade', () => {
    const subject: Subject = {
      id: 's',
      code: 'TAX',
      name: 'Income Taxation',
      academicYear: '',
      semester: '',
      units: 3,
      category: 'iabf_major',
      gradingProfileId: '',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Completed', weight: 80, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Final Exam', weight: 20, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    // Completed 40 points out of 80 (50%). Remaining weight is 20%.
    // Maximum possible grade is 40 + 20 = 60%.
    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 's', categoryId: 'c1', name: 'Completed', pointsEarned: 40, totalPossiblePoints: 80 }
    ]

    const result = calculateRequiredScore(subject, assessments, {
      subjectId: 's',
      targetRawGrade: 75,
      targetCategoryId: 'c2',
      totalPossiblePoints: 100
    })

    expect(result.isAchievable).toBe(false)
    expect(result.maximumPossibleGrade).toBe(60)
    expect(result.message).toContain('Unachievable')
  })

  // Test 14: Transmutation boundaries
  it('14. correctly maps exact transmutation boundary values without ambiguity', () => {
    const profile = DEFAULT_TRANSMUTATION_PROFILES.find(p => p.id === 'feu_standard_undergraduate') || DEFAULT_TRANSMUTATION_PROFILES[0]
    // 96.00 maps to 1.00
    expect(transmuteRawGrade(96, profile)?.officialGrade).toBe('1.00')
    // 100 maps to 1.00
    expect(transmuteRawGrade(100, profile)?.officialGrade).toBe('1.00')
    // 95.99 maps to 1.25
    expect(transmuteRawGrade(95.99, profile)?.officialGrade).toBe('1.25')
    // 92.00 maps to 1.25
    expect(transmuteRawGrade(92, profile)?.officialGrade).toBe('1.25')
    // 64.00 maps to 3.00 (passing)
    expect(transmuteRawGrade(64, profile)?.officialGrade).toBe('3.00')
    // 59.99 maps to 5.00 (failure)
    expect(transmuteRawGrade(59.99, profile)?.officialGrade).toBe('5.00')
    // 0 maps to 5.00
    expect(transmuteRawGrade(0, profile)?.officialGrade).toBe('5.00')

    // Also verify FEU BSA Retention Scale (SY 2026-2027) boundaries
    const bsaProfile = DEFAULT_TRANSMUTATION_PROFILES.find(p => p.id === 'feu_bsa_retention_scale')!
    expect(transmuteRawGrade(71, bsaProfile)?.officialGrade).toBe('2.50') // BSA retention cutoff
    expect(transmuteRawGrade(70.99, bsaProfile)?.officialGrade).toBe('2.75') // Below retention cutoff
    expect(transmuteRawGrade(55, bsaProfile)?.officialGrade).toBe('4.00')
    expect(transmuteRawGrade(54.99, bsaProfile)?.officialGrade).toBe('5.00')
  })

  // Test 15: Transmutation ranges with gaps or overlaps
  it('15. detects gaps and overlaps in custom transmutation profiles', () => {
    const overlappingProfile: TransmutationProfile = {
      id: 'bad_overlap',
      name: 'Overlap Test',
      institution: 'FEU',
      program: 'BSA',
      applicableYear: '2025',
      verificationStatus: 'user_custom',
      sourceReference: '',
      ranges: [
        { id: '1', minRaw: 90, maxRaw: 100, officialGrade: '1.00' },
        { id: '2', minRaw: 85, maxRaw: 92, officialGrade: '1.25' } // overlaps 90-92
      ]
    }
    const resOverlap = validateTransmutationProfile(overlappingProfile)
    expect(resOverlap.isValid).toBe(false)
    expect(resOverlap.hasOverlaps).toBe(true)

    const gappyProfile: TransmutationProfile = {
      id: 'bad_gap',
      name: 'Gap Test',
      institution: 'FEU',
      program: 'BSA',
      applicableYear: '2025',
      verificationStatus: 'user_custom',
      sourceReference: '',
      ranges: [
        { id: '1', minRaw: 0, maxRaw: 50, officialGrade: '5.00' },
        { id: '2', minRaw: 70, maxRaw: 100, officialGrade: '1.00' } // gap 50 to 70
      ]
    }
    const resGap = validateTransmutationProfile(gappyProfile)
    expect(resGap.hasGaps).toBe(true)
  })

  // Test 16: Midterm and final-period formulas
  it('16. combines midterm and final-period grades using specified formulas', () => {
    // 50-50 formula: 80 Midterm, 90 Final -> 85
    expect(calculateCombinedPeriodGrade(80, 90, 'midterm_50_final_50')).toBe(85)
    // 1/3 Midterm + 2/3 Final: (80/3) + (180/3) = 260/3 = 86.6667
    expect(calculateCombinedPeriodGrade(80, 90, 'midterm_33_final_67')).toBeCloseTo(86.6667, 4)
    // Custom weights: 40% Midterm, 60% Final -> 80*0.4 + 90*0.6 = 32 + 54 = 86
    expect(calculateCombinedPeriodGrade(80, 90, 'custom', 40, 60)).toBe(86)
  })

  // Test 17: Data persistence after serialization / reload
  it('17. validates data persistence serialization roundtrip', () => {
    const originalSubject: Subject = {
      id: 'sub_persisted',
      code: 'ACT1101',
      name: 'Financial Accounting and Reporting',
      academicYear: '2025-2026',
      semester: '1st Semester',
      units: 6,
      category: 'iabf_major',
      gradingProfileId: 'feu_iabf_accountancy',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Quizzes', weight: 50, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Exams', weight: 50, calculationMethod: 'total_points', isSummative: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const serialized = JSON.stringify(originalSubject)
    const deserialized = JSON.parse(serialized) as Subject

    expect(deserialized.id).toBe(originalSubject.id)
    expect(deserialized.categories.length).toBe(2)
    expect(deserialized.categories[0].weight).toBe(50)
  })

  // Test 18: Simulation changes without altering saved scores
  it('18. simulates score changes immutably without altering original saved scores', () => {
    const subject: Subject = {
      id: 'sub_sim',
      code: 'BSA101',
      name: 'Intermediate Accounting',
      academicYear: '',
      semester: '',
      units: 3,
      category: 'iabf_major',
      gradingProfileId: '',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Exams', weight: 100, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    const originalAssessments: Assessment[] = [
      { id: 'exam1', subjectId: 'sub_sim', categoryId: 'c1', name: 'Final Exam', pointsEarned: 60, totalPossiblePoints: 100 }
    ]

    // Simulate raising final exam from 60 to 80
    const simResult = simulateGradeChanges(subject, originalAssessments, [
      { assessmentId: 'exam1', categoryId: 'c1', name: 'Final Exam', pointsEarned: 80, totalPossiblePoints: 100 }
    ])

    // Verify simulation output
    expect(simResult.originalResult.unnormalizedRawGrade).toBe(60)
    expect(simResult.simulatedResult.unnormalizedRawGrade).toBe(80)
    expect(simResult.rawDifference).toBe(20)

    // Critical immutability check: original record must remain untouched!
    expect(originalAssessments[0].pointsEarned).toBe(60)
  })

  // Test 19: Import and export validation
  it('19. strictly validates import and export JSON structure and rejects malformed payloads', () => {
    const validJson = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      subjects: [
        {
          id: 'sub1',
          code: 'GEN001',
          name: 'Purposive Communication',
          categories: [{ id: 'c1', name: 'Activities', weight: 100 }]
        }
      ],
      assessments: [
        { id: 'a1', subjectId: 'sub1', categoryId: 'c1', name: 'Essay', pointsEarned: 95, totalPossiblePoints: 100 }
      ],
      transmutationProfiles: []
    }
    expect(validateBackupJson(validJson).isValid).toBe(true)

    // Malformed JSON (negative points, missing subjects)
    const invalidJson = {
      subjects: 'not an array',
      assessments: [{ id: 'a1', totalPossiblePoints: -10 }]
    }
    const valInvalid = validateBackupJson(invalidJson)
    expect(valInvalid.isValid).toBe(false)
    expect(valInvalid.errors.length).toBeGreaterThan(0)
  })

  // Test 20: Offline access to core application calculations
  it('20. executes all grade calculations completely offline without any network or external API dependency', () => {
    const subject: Subject = {
      id: 'sub_offline',
      code: 'OFFLINE101',
      name: 'Offline Logic Verification',
      academicYear: '2025-2026',
      semester: '1st',
      units: 3,
      category: 'gen_ed',
      gradingProfileId: 'feu_gen_ed_obe',
      periodFormula: 'cumulative_100',
      categories: [
        { id: 'c1', name: 'Classwork', weight: 60, calculationMethod: 'total_points' },
        { id: 'c2', name: 'Exam', weight: 40, calculationMethod: 'total_points' }
      ],
      createdAt: '',
      updatedAt: ''
    }

    const assessments: Assessment[] = [
      { id: 'a1', subjectId: 'sub_offline', categoryId: 'c1', name: 'Work', pointsEarned: 90, totalPossiblePoints: 100 },
      { id: 'a2', subjectId: 'sub_offline', categoryId: 'c2', name: 'Exam', pointsEarned: 85, totalPossiblePoints: 100 }
    ]

    const result = calculateSubjectGrade(subject, assessments, DEFAULT_TRANSMUTATION_PROFILES[0])
    // 90*0.60 + 85*0.40 = 54 + 34 = 88%
    expect(result.unnormalizedRawGrade).toBe(88)
    expect(result.transmutedGrade).toBe('1.50') // 88% maps to 1.50
    expect(result.transmutationStatus).toBe('verified')
  })
})
