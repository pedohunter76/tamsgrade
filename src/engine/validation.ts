import { Assessment, Subject, TransmutationProfile, UserPreferences } from './types'

export interface BackupData {
  version: string
  exportedAt: string
  subjects: Subject[]
  assessments: Assessment[]
  transmutationProfiles: TransmutationProfile[]
  preferences?: UserPreferences
}

export interface ValidationResponse {
  isValid: boolean
  errors: string[]
  sanitizedData?: BackupData
}

export function validateBackupJson(rawJson: unknown): ValidationResponse {
  const errors: string[] = []

  if (!rawJson || typeof rawJson !== 'object') {
    return { isValid: false, errors: ['Imported backup is not a valid JSON object.'] }
  }

  const data = rawJson as Partial<BackupData>

  if (!Array.isArray(data.subjects)) {
    errors.push('Backup file is missing a valid "subjects" list.')
  }

  if (!Array.isArray(data.assessments)) {
    errors.push('Backup file is missing a valid "assessments" list.')
  }

  // Validate each subject
  if (Array.isArray(data.subjects)) {
    for (let i = 0; i < data.subjects.length; i++) {
      const s = data.subjects[i]
      if (!s.id || typeof s.id !== 'string') errors.push(`Subject at index ${i} is missing a valid ID.`)
      if (!s.code || typeof s.code !== 'string') errors.push(`Subject at index ${i} is missing a code.`)
      if (!s.name || typeof s.name !== 'string') errors.push(`Subject at index ${i} is missing a name.`)
      if (!Array.isArray(s.categories)) {
        errors.push(`Subject "${s.code || i}" has no assessment categories defined.`)
      } else {
        for (const cat of s.categories) {
          if (typeof cat.weight !== 'number' || isNaN(cat.weight) || cat.weight < 0) {
            errors.push(`Category "${cat.name || 'unnamed'}" in subject "${s.code}" has an invalid weight.`)
          }
        }
      }
    }
  }

  // Validate assessments
  if (Array.isArray(data.assessments)) {
    for (let i = 0; i < data.assessments.length; i++) {
      const a = data.assessments[i]
      if (!a.id || typeof a.id !== 'string') errors.push(`Assessment at index ${i} is missing a valid ID.`)
      if (typeof a.totalPossiblePoints !== 'number' || a.totalPossiblePoints <= 0 || isNaN(a.totalPossiblePoints)) {
        errors.push(`Assessment "${a.name || i}" has invalid total possible points (must be > 0).`)
      }
      if (a.pointsEarned !== null && a.pointsEarned !== undefined) {
        if (typeof a.pointsEarned !== 'number' || isNaN(a.pointsEarned) || a.pointsEarned < 0) {
          errors.push(`Assessment "${a.name || i}" has invalid points earned.`)
        }
      }
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: {
      version: data.version || '1.0.0',
      exportedAt: data.exportedAt || new Date().toISOString(),
      subjects: data.subjects || [],
      assessments: data.assessments || [],
      transmutationProfiles: data.transmutationProfiles || [],
      preferences: data.preferences
    }
  }
}
