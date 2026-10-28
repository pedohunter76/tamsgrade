import { describe, it, expect } from 'vitest'
import {
  validateTransmutationProfile,
  transmuteRawGrade,
  getMinimumRawForTransmutedGrade,
  formatTransmutedGradeWithLetter
} from '../transmutation'
import { TransmutationProfile } from '../types'
import { DEFAULT_TRANSMUTATION_PROFILES } from '../profiles'

const createMockProfile = (overrides: Partial<TransmutationProfile>): TransmutationProfile => ({
  id: 'mock_scale',
  name: 'Mock Scale',
  institution: 'Far Eastern University Manila',
  program: 'IABF',
  applicableYear: '2026-2027',
  verificationStatus: 'verified',
  sourceReference: 'FEU Mock Reference',
  ranges: [],
  ...overrides
})

describe('Transmutation Engine Tests', () => {
  const sampleProfile: TransmutationProfile = createMockProfile({
    id: 'test_scale',
    name: 'Test Scale',
    ranges: [
      { id: 'r1', minRaw: 90, maxRaw: 100, officialGrade: '4.00', letterGrade: 'A', qualityPoints: 4.0 },
      { id: 'r2', minRaw: 80, maxRaw: 89.999, officialGrade: '3.00', letterGrade: 'B', qualityPoints: 3.0 },
      { id: 'r3', minRaw: 70, maxRaw: 79.999, officialGrade: '2.00', letterGrade: 'C', qualityPoints: 2.0 },
      { id: 'r4', minRaw: 0, maxRaw: 69.999, officialGrade: '0.00', letterGrade: 'F', qualityPoints: 0.0 }
    ]
  })

  describe('validateTransmutationProfile', () => {
    it('validates a continuous non-overlapping profile correctly', () => {
      const result = validateTransmutationProfile(sampleProfile)
      expect(result.isValid).toBe(true)
      expect(result.hasOverlaps).toBe(false)
      expect(result.hasGaps).toBe(false)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects profiles with empty ranges', () => {
      const emptyProfile = createMockProfile({
        id: 'empty',
        name: 'Empty',
        ranges: []
      })
      const result = validateTransmutationProfile(emptyProfile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Profile contains no grade ranges.')
    })

    it('detects inverted ranges (minRaw > maxRaw)', () => {
      const inverted = createMockProfile({
        id: 'inverted',
        name: 'Inverted',
        ranges: [
          { id: 'r1', minRaw: 95, maxRaw: 85, officialGrade: '4.00' }
        ]
      })
      const result = validateTransmutationProfile(inverted)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('greater than maxRaw'))).toBe(true)
    })

    it('detects overlaps between ranges', () => {
      const overlapping = createMockProfile({
        id: 'overlap',
        name: 'Overlap',
        ranges: [
          { id: 'r1', minRaw: 0, maxRaw: 75, officialGrade: '2.00' },
          { id: 'r2', minRaw: 70, maxRaw: 100, officialGrade: '4.00' }
        ]
      })
      const result = validateTransmutationProfile(overlapping)
      expect(result.hasOverlaps).toBe(true)
      expect(result.isValid).toBe(false)
    })

    it('detects gaps between ranges', () => {
      const gapped = createMockProfile({
        id: 'gapped',
        name: 'Gapped',
        ranges: [
          { id: 'r1', minRaw: 0, maxRaw: 60, officialGrade: '0.00' },
          { id: 'r2', minRaw: 75, maxRaw: 100, officialGrade: '4.00' }
        ]
      })
      const result = validateTransmutationProfile(gapped)
      expect(result.hasGaps).toBe(true)
      expect(result.warnings.some(w => w.includes('Gap detected'))).toBe(true)
    })
  })

  describe('transmuteRawGrade', () => {
    it('correctly transmutes percentage within exact boundaries', () => {
      const grade95 = transmuteRawGrade(95, sampleProfile)
      expect(grade95?.officialGrade).toBe('4.00')

      const grade80 = transmuteRawGrade(80, sampleProfile)
      expect(grade80?.officialGrade).toBe('3.00')

      const grade70 = transmuteRawGrade(70, sampleProfile)
      expect(grade70?.officialGrade).toBe('2.00')

      const grade50 = transmuteRawGrade(50, sampleProfile)
      expect(grade50?.officialGrade).toBe('0.00')
    })

    it('handles perfect 100% and boundary values properly', () => {
      const grade100 = transmuteRawGrade(100, sampleProfile)
      expect(grade100?.officialGrade).toBe('4.00')

      const gradeOver100 = transmuteRawGrade(105, sampleProfile)
      expect(gradeOver100?.officialGrade).toBe('4.00')
    })

    it('returns null for NaN or empty ranges', () => {
      expect(transmuteRawGrade(NaN, sampleProfile)).toBeNull()
      expect(transmuteRawGrade(85, createMockProfile({ id: 'no_range', name: 'None', ranges: [] }))).toBeNull()
    })
  })

  describe('getMinimumRawForTransmutedGrade', () => {
    it('finds the minimum raw score for target grade', () => {
      expect(getMinimumRawForTransmutedGrade('4.00', sampleProfile)).toBe(90)
      expect(getMinimumRawForTransmutedGrade('3.00', sampleProfile)).toBe(80)
      expect(getMinimumRawForTransmutedGrade('A', sampleProfile)).toBe(90)
      expect(getMinimumRawForTransmutedGrade('B', sampleProfile)).toBe(80)
    })

    it('returns null when target grade does not exist', () => {
      expect(getMinimumRawForTransmutedGrade('5.00', sampleProfile)).toBeNull()
      expect(getMinimumRawForTransmutedGrade('XYZ', sampleProfile)).toBeNull()
    })
  })

  describe('formatTransmutedGradeWithLetter', () => {
    it('formats official grade with standard letter', () => {
      expect(formatTransmutedGradeWithLetter('4.00')).toBe('4.00 (A)')
      expect(formatTransmutedGradeWithLetter('3.50')).toBe('3.50 (B+)')
      expect(formatTransmutedGradeWithLetter('1.50')).toBe('1.50 (D+)')
      expect(formatTransmutedGradeWithLetter('0.00')).toBe('0.00 (F)')
    })

    it('respects explicitly provided letter grade', () => {
      expect(formatTransmutedGradeWithLetter('3.25', 'B+')).toBe('3.25 (B+)')
    })

    it('preserves grades that already have parenthesized letters', () => {
      expect(formatTransmutedGradeWithLetter('4.00 (A)')).toBe('4.00 (A)')
    })

    it('handles empty or missing grades gracefully', () => {
      expect(formatTransmutedGradeWithLetter(undefined)).toBe('--')
      expect(formatTransmutedGradeWithLetter('--')).toBe('--')
      expect(formatTransmutedGradeWithLetter('N/A')).toBe('--')
    })
  })

  describe('FEU Default Profiles Integrity', () => {
    it('ensures all default profiles are valid and complete', () => {
      for (const profile of DEFAULT_TRANSMUTATION_PROFILES) {
        const val = validateTransmutationProfile(profile)
        expect(val.isValid).toBe(true)
        expect(val.hasOverlaps).toBe(false)
      }
    })
  })
})
