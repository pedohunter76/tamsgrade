// Official Far Eastern University (FEU) QPA Grade Requirements for Promotion & Retention
// Sourced from FEU Academic Regulations & Student Guidelines

export type FEUProgramId =
  | 'bs_accountancy'
  | 'bs_architecture'
  | 'bs_education'
  | 'bs_medtech_nursing_psych'
  | 'all_other_courses'

export type FEUPromotionTarget =
  | '2nd_year'
  | '3rd_year'
  | '4th_year'
  | 'graduate'

export interface FEUProgramQPARule {
  id: FEUProgramId
  name: string
  shortName: string
  college: string
  requirements: Record<FEUPromotionTarget, number>
  notes?: string
}

export const FEU_QPA_PROGRAM_RULES: FEUProgramQPARule[] = [
  {
    id: 'bs_accountancy',
    name: 'BS Accountancy',
    shortName: 'BSA',
    college: 'Institute of Accounts, Business and Finance (IABF)',
    requirements: {
      '2nd_year': 1.20,
      '3rd_year': 1.60,
      '4th_year': 2.00,
      'graduate': 2.40
    },
    notes: 'In addition to the annual QPA requirement, BS Accountancy students must maintain at least 2.50 (C+ / 71.0%) in all professional accounting, business law, and taxation courses.'
  },
  {
    id: 'bs_architecture',
    name: 'BS Architecture',
    shortName: 'BS Arch',
    college: 'Institute of Architecture and Fine Arts (IARFA)',
    requirements: {
      '2nd_year': 1.50,
      '3rd_year': 1.80,
      '4th_year': 2.00, // until 5th year
      'graduate': 2.20
    },
    notes: 'QPA requirement of 2.00 applies until the 5th year of the architecture curriculum.'
  },
  {
    id: 'bs_education',
    name: 'BS Elementary & Secondary Education',
    shortName: 'BS Educ',
    college: 'Institute of Education (IE)',
    requirements: {
      '2nd_year': 1.50,
      '3rd_year': 1.80,
      '4th_year': 2.00,
      'graduate': 2.20
    }
  },
  {
    id: 'bs_medtech_nursing_psych',
    name: 'BS Medical Technology, Nursing & Psychology',
    shortName: 'Health & Psych',
    college: 'Institute of Health Sciences and Nursing (IHSN) & IAS',
    requirements: {
      '2nd_year': 1.50,
      '3rd_year': 2.00,
      '4th_year': 2.20,
      'graduate': 2.40
    }
  },
  {
    id: 'all_other_courses',
    name: 'University Standard (All Other Courses)',
    shortName: 'All Other',
    college: 'University-wide Standard',
    requirements: {
      '2nd_year': 1.20,
      '3rd_year': 1.50,
      '4th_year': 1.80,
      'graduate': 2.00
    }
  }
]

export interface FEUQPAStandingEvaluation {
  programName: string
  targetLabel: string
  requiredQpa: number
  actualQpa: number | null
  difference: number | null // actual - required
  isQualified: boolean
  status: 'promoted' | 'at_risk_pnra_unra' | 'awaiting_grades'
  statusBadge: string
  consequenceSummary: string
  enrichmentWarning?: string
}

export const PROMOTION_TARGET_LABELS: Record<FEUPromotionTarget, string> = {
  '2nd_year': 'Promotion to 2nd Year',
  '3rd_year': 'Promotion to 3rd Year',
  '4th_year': 'Promotion to 4th Year',
  'graduate': 'To Graduate'
}

/**
 * Evaluates student's QPA against official FEU Promotion and Retention benchmarks
 */
export function evaluateFEUQPAStanding(
  actualQpa: number | null,
  programId: FEUProgramId = 'bs_accountancy',
  target: FEUPromotionTarget = '2nd_year'
): FEUQPAStandingEvaluation {
  const program = FEU_QPA_PROGRAM_RULES.find(p => p.id === programId) || FEU_QPA_PROGRAM_RULES[0]
  const requiredQpa = program.requirements[target]
  const targetLabel = PROMOTION_TARGET_LABELS[target]

  if (actualQpa === null || isNaN(actualQpa)) {
    return {
      programName: program.name,
      targetLabel,
      requiredQpa,
      actualQpa: null,
      difference: null,
      isQualified: false,
      status: 'awaiting_grades',
      statusBadge: 'Awaiting Completed Grades',
      consequenceSummary: `Requires an annual QPA of at least ${requiredQpa.toFixed(2)} for ${targetLabel.toLowerCase()} in ${program.name}.`
    }
  }

  const diff = actualQpa - requiredQpa
  const isQualified = diff >= -0.0001

  if (isQualified) {
    return {
      programName: program.name,
      targetLabel,
      requiredQpa,
      actualQpa,
      difference: diff,
      isQualified: true,
      status: 'promoted',
      statusBadge: `Qualified for ${targetLabel}`,
      consequenceSummary: `Meeting requirement with a +${diff.toFixed(2)} safety cushion over the ${requiredQpa.toFixed(2)} minimum.`
    }
  }

  return {
    programName: program.name,
    targetLabel,
    requiredQpa,
    actualQpa,
    difference: diff,
    isQualified: false,
    status: 'at_risk_pnra_unra',
    statusBadge: 'Below Required QPA (PNRA / UNRA Risk)',
    consequenceSummary: `Current QPA of ${actualQpa.toFixed(2)} is ${Math.abs(diff).toFixed(2)} below the required ${requiredQpa.toFixed(2)} benchmark.`,
    enrichmentWarning: 'Failure to meet the required QPA will result in Program Non-readmission (PNRA) or University Non-readmission (UNRA) status. You may be required to attend the Mid-year Enrichment Program (allowed only ONCE during your entire stay at FEU) to be cleared for readmission.'
  }
}
