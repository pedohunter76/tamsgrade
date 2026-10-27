// Types for TamsGrade calculation engine and database models

export type SubjectCategory = 'gen_ed' | 'iabf_major' | 'custom'

export type CategoryCalculationMethod = 'total_points' | 'equal_weight'

export type PeriodCombinationFormula = 
  | 'midterm_50_final_50'      // Midterm (50%) + Final (50%)
  | 'midterm_33_final_67'      // 1/3 Midterm + 2/3 Final Tentative
  | 'cumulative_100'           // 100% Semester Cumulative
  | 'custom'                   // Custom weights

export type VerificationStatus = 'verified' | 'needs_verification' | 'user_custom'

export interface TransmutationRange {
  id: string
  minRaw: number        // e.g. 96
  maxRaw: number        // e.g. 100
  officialGrade: string // e.g. "1.00" or "A"
  letterGrade?: string  // e.g. "A"
  qualityPoints?: number // e.g. 4.0
  description?: string  // e.g. "Excellent"
  isMinInclusive?: boolean // default true
  isMaxInclusive?: boolean // default true
}

export interface TransmutationProfile {
  id: string
  name: string
  institution: string
  program: string
  applicableYear: string
  ranges: TransmutationRange[]
  verificationStatus: VerificationStatus
  sourceReference: string
  effectiveDate?: string
  lastVerifiedDate?: string
  notes?: string
}

export interface AssessmentCategory {
  id: string
  name: string
  weight: number // e.g. 20 for 20%
  calculationMethod: CategoryCalculationMethod
  assessmentType?: 'FA' | 'SA' // 'FA' = Formative (Seatworks, Quizzes, Post-Test), 'SA' = Summative (Midterm Exam, Finals Exam, Project)
  isSummative?: boolean // true for Summative (SA), false for Formative (FA)
  gradingPeriod?: 'midterm' | 'final' | 'all'
  dropLowestCount?: number // e.g. drop 1 lowest quiz
}

export interface Assessment {
  id: string
  subjectId: string
  categoryId: string
  assessmentType?: 'FA' | 'SA' // 'FA' (Seatworks, Quizzes, Post-Test) or 'SA' (Midterm Exam, Finals Exam, Project)
  period?: 'midterm' | 'final' // 'midterm' running milestone vs 'final' period
  name: string
  pointsEarned: number | null // null = pending / not yet taken
  totalPossiblePoints: number
  isMarkedZero?: boolean // explicitly marked as 0 vs pending
  isExtraCredit?: boolean
  date?: string
  notes?: string
}

export interface GradingProfile {
  id: string
  name: string
  category: SubjectCategory
  formativeRatio: number // e.g. 70 for 70%
  summativeRatio: number // e.g. 30 for 30%
  description: string
  defaultCategories: Omit<AssessmentCategory, 'id'>[]
  verificationStatus: VerificationStatus
  sourceReference: string
  effectiveDate?: string
  notes?: string
}

export interface Subject {
  id: string
  code: string // e.g. "ACT1101" or "FAR"
  section?: string // e.g. "5", "17", "131"
  name: string // e.g. "Financial Accounting and Reporting"
  academicYear: string // e.g. "2026-2027"
  semester: string // e.g. "1st Semester"
  termId?: string // e.g. "y1_s1", "y1_s2", etc.
  units: number // e.g. 3 or 6
  category: SubjectCategory
  gradingProfileId: string
  transmutationProfileId?: string
  periodFormula: PeriodCombinationFormula
  midtermWeight?: number // e.g. 50
  finalWeight?: number // e.g. 50
  schedule?: string // e.g. "[Monday] 09:00 AM-12:00 PM"
  room?: string // e.g. "ROOM 707 (LEC RM), ENGINEERING BUILDING"
  categories: AssessmentCategory[]
  notes?: string
  isArchived?: boolean

  // Direct Professor-Given Grade Override
  directGradePeriod?: 'midterm' | 'final' | 'both'
  directLetterGrade?: string // e.g. "A", "B+", "C+"
  directGradePoint?: number // e.g. 4.0, 3.5, 2.5
  directRawScore?: number // e.g. 96, 88, 75
  isDirectGradeActive?: boolean // true if user enabled direct given grade
  directGradeRemarks?: string // e.g. "Given directly by professor on portal"
  directGradeDate?: string // ISO timestamp

  // Differentiated Midterm Running Grade vs Final Grade direct overrides
  directMidtermLetterGrade?: string
  directMidtermGradePoint?: number
  directMidtermRawScore?: number
  isDirectMidtermActive?: boolean
  directMidtermRemarks?: string

  directFinalLetterGrade?: string
  directFinalGradePoint?: number
  directFinalRawScore?: number
  isDirectFinalActive?: boolean
  directFinalRemarks?: string

  createdAt: string
  updatedAt: string
}

export interface PeriodGradeDetail {
  period: 'midterm' | 'final'
  rawPercentage: number // 0-100 unrounded
  transmutedGrade?: string // e.g. "3.50"
  letterGrade?: string // e.g. "B+"
  qualityPoints?: number // e.g. 3.50
  completedCoverage: number // % of total syllabus weight assessed in this period
  isDirect?: boolean // true if given directly by professor
  isProjected?: boolean // true if running grade projected forward
  remarks?: string
}

export interface CategoryCalculationResult {
  categoryId: string
  categoryName: string
  weight: number
  method: CategoryCalculationMethod
  totalEarned: number
  totalPossible: number
  percentage: number // 0-100 unrounded
  weightedContribution: number // percentage * (weight / 100)
  completedAssessmentsCount: number
  totalAssessmentsCount: number
  hasCompletedAssessments: boolean
  isSummative: boolean
}

export interface SubjectGradeResult {
  subjectId: string
  categories: CategoryCalculationResult[]
  totalWeightConfigured: number // e.g. 100%
  isWeightValid: boolean // true if totalWeightConfigured === 100
  weightWarning?: string

  // Actual assessments coverage
  completedWeightCoverage: number // sum of weights for categories that have entered scores
  unnormalizedRawGrade: number // sum of category.weightedContribution
  normalizedProvisionalGrade: number // unnormalizedRawGrade / (completedWeightCoverage / 100)

  // Formative & Summative summary
  formativeRawGrade: number
  summativeRawGrade: number
  formativeCoverage: number
  summativeCoverage: number

  // Distinct Midterm Grade (Running Grade) vs Final Grade (Destination)
  midtermGrade: PeriodGradeDetail
  finalGrade: PeriodGradeDetail

  // Transmuted result (overall course standing)
  transmutedGrade?: string
  letterGrade?: string
  qualityPoints?: number
  transmutationStatus?: VerificationStatus
  transmutationTableUsed?: string
  isDirectGrade?: boolean
  directGradeRemarks?: string

  // Period grades if configured
  midtermResult?: {
    rawGrade: number
    coverage: number
  }
  finalPeriodResult?: {
    rawGrade: number
    coverage: number
  }
  combinedPeriodGrade?: number
}

export interface RequiredScoreQuery {
  subjectId: string
  targetRawGrade: number // e.g. 75 or 85
  targetTransmutedGrade?: string // e.g. "2.00"
  targetCategoryId: string
  targetAssessmentName?: string
  totalPossiblePoints: number
  // If there are other remaining assessments, user can specify assumed percentages
  otherRemainingAssumptions?: {
    assessmentId?: string
    categoryId: string
    assumedPercentage: number // 0-100
    weightFractionOfCategory?: number
  }[]
}

export interface RequiredScoreResult {
  targetRawPercentage: number
  targetTransmutedGrade?: string
  currentWeightedContribution: number
  remainingTotalWeight: number
  targetAssessmentWeight: number
  requiredPercentage: number // unrounded
  requiredPoints: number // unrounded
  totalPossiblePoints: number
  isAchievable: boolean // true if requiredPercentage <= 100 (or if extra credit allows)
  maximumPossibleGrade: number // if 100% on target and all remaining
  minimumPossibleGrade: number // if 0% on target and all remaining
  message: string
}

export interface SimulationChange {
  assessmentId?: string // undefined if hypothetical new
  tempId?: string
  categoryId: string
  name: string
  pointsEarned: number
  totalPossiblePoints: number
  period?: 'midterm' | 'final'
}

export interface SimulationResult {
  originalResult: SubjectGradeResult
  simulatedResult: SubjectGradeResult
  rawDifference: number // simulated - original
  transmutedGradeChanged: boolean
  previousTransmutedGrade?: string
  newTransmutedGrade?: string
}

export interface UserPreferences {
  defaultGradingProfileId: string
  defaultAcademicYear: string
  defaultSemester: string
  activeTermId?: string // e.g. "y1_s1"
  gradeDisplayPrecision: number // 1 or 2
  theme: 'light' | 'dark' | 'system'
  treatMissingAsZero: boolean
  showQualityPoints: boolean
  studentProgram?: 'bs_accountancy' | 'bs_architecture' | 'bs_education' | 'bs_medtech_nursing_psych' | 'all_other_courses'
  targetPromotionYear?: '2nd_year' | '3rd_year' | '4th_year' | 'graduate'
}
