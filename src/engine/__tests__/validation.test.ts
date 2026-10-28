import { describe, it, expect } from 'vitest'
import { validateBackupJson } from '../validation'

describe('Validation Engine Tests (Backup Import/Export)', () => {
  const validPayload = {
    version: '1.0.0',
    exportedAt: '2026-10-27T10:00:00.000Z',
    subjects: [
      {
        id: 'sub_1',
        code: 'ACC101',
        name: 'Financial Accounting',
        units: 3,
        categories: [
          { id: 'cat_1', name: 'Quizzes', weight: 50, calculationMethod: 'total_points' },
          { id: 'cat_2', name: 'Exam', weight: 50, calculationMethod: 'total_points' }
        ]
      }
    ],
    assessments: [
      {
        id: 'asm_1',
        subjectId: 'sub_1',
        categoryId: 'cat_1',
        name: 'Quiz 1',
        pointsEarned: 45,
        totalPossiblePoints: 50
      }
    ],
    transmutationProfiles: [],
    preferences: {
      defaultGradingProfileId: 'feu_standard_undergraduate',
      defaultAcademicYear: '2026-2027',
      defaultSemester: '1st',
      activeTermId: 'y1_s1',
      gradeDisplayPrecision: 2,
      theme: 'dark',
      treatMissingAsZero: false,
      showQualityPoints: true
    }
  }

  it('accepts and sanitizes a complete, valid backup payload', () => {
    const res = validateBackupJson(validPayload)
    expect(res.isValid).toBe(true)
    expect(res.errors).toHaveLength(0)
    expect(res.sanitizedData).toBeDefined()
    expect(res.sanitizedData?.subjects).toHaveLength(1)
    expect(res.sanitizedData?.assessments).toHaveLength(1)
    expect(res.sanitizedData?.preferences?.activeTermId).toBe('y1_s1')
  })

  it('rejects null, non-objects, and primitives', () => {
    expect(validateBackupJson(null).isValid).toBe(false)
    expect(validateBackupJson(undefined).isValid).toBe(false)
    expect(validateBackupJson('not an object').isValid).toBe(false)
    expect(validateBackupJson(12345).isValid).toBe(false)
  })

  it('rejects payloads missing subjects array', () => {
    const invalid = { ...validPayload, subjects: 'not an array' }
    const res = validateBackupJson(invalid)
    expect(res.isValid).toBe(false)
    expect(res.errors.some(e => e.includes('missing a valid "subjects" list'))).toBe(true)
  })

  it('rejects payloads missing assessments array', () => {
    const invalid = { ...validPayload, assessments: null }
    const res = validateBackupJson(invalid)
    expect(res.isValid).toBe(false)
    expect(res.errors.some(e => e.includes('missing a valid "assessments" list'))).toBe(true)
  })

  it('rejects subjects with missing id, code, or name', () => {
    const invalidSubject = {
      ...validPayload,
      subjects: [
        { id: '', code: '', name: '', categories: [] }
      ]
    }
    const res = validateBackupJson(invalidSubject)
    expect(res.isValid).toBe(false)
    expect(res.errors.some(e => e.includes('missing a valid ID'))).toBe(true)
    expect(res.errors.some(e => e.includes('missing a code'))).toBe(true)
    expect(res.errors.some(e => e.includes('missing a name'))).toBe(true)
  })

  it('rejects subjects with invalid category weights', () => {
    const invalidWeights = {
      ...validPayload,
      subjects: [
        {
          id: 'sub_bad_cat',
          code: 'BAD101',
          name: 'Bad Categories',
          categories: [
            { id: 'c1', name: 'Quiz', weight: -20 },
            { id: 'c2', name: 'Exam', weight: NaN }
          ]
        }
      ]
    }
    const res = validateBackupJson(invalidWeights)
    expect(res.isValid).toBe(false)
    expect(res.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('rejects assessments with zero or negative total possible points', () => {
    const invalidAsm = {
      ...validPayload,
      assessments: [
        { id: 'a1', subjectId: 'sub_1', categoryId: 'cat_1', name: 'A', pointsEarned: 10, totalPossiblePoints: 0 },
        { id: 'a2', subjectId: 'sub_1', categoryId: 'cat_1', name: 'B', pointsEarned: 10, totalPossiblePoints: -50 }
      ]
    }
    const res = validateBackupJson(invalidAsm)
    expect(res.isValid).toBe(false)
    expect(res.errors.some(e => e.includes('invalid total possible points'))).toBe(true)
  })

  it('rejects assessments with negative points earned', () => {
    const negativePoints = {
      ...validPayload,
      assessments: [
        { id: 'a1', subjectId: 'sub_1', categoryId: 'cat_1', name: 'Quiz', pointsEarned: -10, totalPossiblePoints: 100 }
      ]
    }
    const res = validateBackupJson(negativePoints)
    expect(res.isValid).toBe(false)
    expect(res.errors.some(e => e.includes('invalid points earned'))).toBe(true)
  })

  it('handles optional missing fields with safe defaults', () => {
    const minimal = {
      subjects: [],
      assessments: []
    }
    const res = validateBackupJson(minimal)
    expect(res.isValid).toBe(true)
    expect(res.sanitizedData?.version).toBe('1.0.0')
    expect(res.sanitizedData?.exportedAt).toBeDefined()
    expect(res.sanitizedData?.transmutationProfiles).toEqual([])
  })
})
