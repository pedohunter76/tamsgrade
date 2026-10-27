import { TransmutationProfile, TransmutationRange } from './types'

export interface TransmutationValidationResult {
  isValid: boolean
  hasOverlaps: boolean
  hasGaps: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates a transmutation profile for overlaps, gaps, and invalid boundaries
 */
export function validateTransmutationProfile(profile: TransmutationProfile): TransmutationValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let hasOverlaps = false
  let hasGaps = false

  if (!profile.ranges || profile.ranges.length === 0) {
    return {
      isValid: false,
      hasOverlaps: false,
      hasGaps: false,
      errors: ['Profile contains no grade ranges.'],
      warnings: []
    }
  }

  // Sort ranges ascending by minRaw
  const sortedRanges = [...profile.ranges].sort((a, b) => a.minRaw - b.minRaw)

  for (let i = 0; i < sortedRanges.length; i++) {
    const range = sortedRanges[i]
    if (range.minRaw > range.maxRaw) {
      errors.push(`Range ${range.officialGrade} has minRaw (${range.minRaw}) greater than maxRaw (${range.maxRaw}).`)
    }
    if (range.minRaw < 0 || range.maxRaw > 100) {
      warnings.push(`Range ${range.officialGrade} extends outside 0 to 100 boundary (${range.minRaw} - ${range.maxRaw}).`)
    }

    if (i > 0) {
      const prevRange = sortedRanges[i - 1]
      // Check for overlap: current minRaw is strictly less than previous maxRaw (with boundary tolerance)
      if (range.minRaw < prevRange.maxRaw - 0.0001) {
        hasOverlaps = true
        errors.push(`Overlap detected between ${prevRange.officialGrade} (up to ${prevRange.maxRaw}) and ${range.officialGrade} (from ${range.minRaw}).`)
      }
      // Check for gaps
      if (range.minRaw > prevRange.maxRaw + 0.01) {
        hasGaps = true
        warnings.push(`Gap detected between ${prevRange.officialGrade} (ends at ${prevRange.maxRaw}) and ${range.officialGrade} (starts at ${range.minRaw}). Unmapped values in between will not resolve.`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    hasOverlaps,
    hasGaps,
    errors,
    warnings
  }
}

/**
 * Converts a raw weighted percentage into the corresponding official grade
 */
export function transmuteRawGrade(
  rawPercentage: number,
  profile: TransmutationProfile
): TransmutationRange | null {
  if (isNaN(rawPercentage) || !profile.ranges || profile.ranges.length === 0) {
    return null
  }

  // Bound raw percentage between 0 and 100 for evaluation, unless extra credit is enabled
  const value = Math.max(0, rawPercentage)

  for (const range of profile.ranges) {
    const isMinInclusive = range.isMinInclusive !== false // default true
    const isMaxInclusive = range.isMaxInclusive !== false // default true

    const satisfiesMin = isMinInclusive ? value >= range.minRaw - 0.0001 : value > range.minRaw
    const satisfiesMax = isMaxInclusive ? value <= range.maxRaw + 0.0001 : value < range.maxRaw

    if (satisfiesMin && satisfiesMax) {
      return range
    }
  }

  // Edge case: if value is 100.00 and max range is 100
  if (value >= 100) {
    const topRange = [...profile.ranges].sort((a, b) => b.maxRaw - a.maxRaw)[0]
    if (topRange && value >= topRange.minRaw) {
      return topRange
    }
  }

  return null
}

/**
 * Finds the minimum raw percentage required to achieve a target transmuted grade
 */
export function getMinimumRawForTransmutedGrade(
  targetGrade: string,
  profile: TransmutationProfile
): number | null {
  const cleanTarget = targetGrade.trim().toLowerCase()
  const match = profile.ranges.find(
    r =>
      r.officialGrade.toLowerCase() === cleanTarget ||
      (r.letterGrade && r.letterGrade.toLowerCase() === cleanTarget) ||
      r.officialGrade.toLowerCase().startsWith(cleanTarget)
  )

  if (!match) {
    return null
  }

  return match.minRaw
}

/**
 * Formats a transmuted grade with its letter grade equivalent (e.g. "4.00 (A)", "3.50 (B+)")
 */
export function formatTransmutedGradeWithLetter(
  officialGrade?: string,
  letterGrade?: string
): string {
  if (!officialGrade || officialGrade === '--' || officialGrade === 'N/A') {
    return '--'
  }

  // If already contains parenthesis (e.g. "4.00 (A)")
  if (officialGrade.includes('(')) {
    return officialGrade
  }

  if (letterGrade) {
    return `${officialGrade} (${letterGrade})`
  }

  // Standard FEU Quality Point and Grade mapping fallback
  const standardLetterMap: Record<string, string> = {
    '4.00': 'A',
    '3.75': 'A-',
    '3.50': 'B+',
    '3.00': 'B',
    '2.50': 'C+',
    '2.00': 'C',
    '1.50': 'D+',
    '1.00': 'D',
    '0.00': 'F',
    '1.25': 'A-',
    '1.75': 'B',
    '2.25': 'C+',
    '2.75': 'C-',
    '5.00': 'F'
  }

  const cleanGrade = officialGrade.trim()
  const mapped = standardLetterMap[cleanGrade]
  if (mapped) {
    return `${cleanGrade} (${mapped})`
  }

  return cleanGrade
}
