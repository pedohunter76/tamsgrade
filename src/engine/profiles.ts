import { GradingProfile, TransmutationProfile } from './types'

/**
 * Standard FEU Manila Grading Profiles (SY 2026-2027)
 * Note: Under FEU Outcome-Based Education (OBE):
 * - General Education courses adopt 70% Formative + 30% Summative assessments.
 * - IABF Major/Professional Accountancy courses adopt 50% Formative + 50% Summative assessments.
 * Under FEU IABF BSA Retention Policy for SY 2026-2027, students must maintain at least a 2.50 (71.0%)
 * in all professional courses (Accounting, Business Law, and Taxation) for program retention.
 */
export const DEFAULT_GRADING_PROFILES: GradingProfile[] = [
  {
    id: 'feu_gen_ed_obe',
    name: 'FEU General Education (70% Formative / 30% Summative)',
    category: 'gen_ed',
    formativeRatio: 70,
    summativeRatio: 30,
    description: 'Outcome-Based Education framework for General Education courses for SY 2026-2027. Emphasizes continuous assessment (70% FA) with midterm and final departmental evaluations (30% SA).',
    verificationStatus: 'verified',
    sourceReference: 'FEU General Education Curriculum Manual & Academic Policies (SY 2026-2027 OBE Guidelines)',
    effectiveDate: '2026-08-01',
    defaultCategories: [
      {
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all',
        dropLowestCount: 0
      },
      {
        name: 'Midterm Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        name: 'Final Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Formative component comprises 70% encompassing all seatworks, homeworks, and quizzes. Summative components total 30% (Midterm 15%, Final 15%). Category distributions may be customized per course syllabus.'
  },
  {
    id: 'feu_iabf_accountancy',
    name: 'FEU IABF BS Accountancy (SY 2026-2027 Guidelines)',
    category: 'iabf_major',
    formativeRatio: 50,
    summativeRatio: 50,
    description: 'Official grading distribution for IABF BS Accountancy professional courses for School Year 2026-2027. Requires 50% formative evaluations and 50% summative departmental examinations. Students must maintain a minimum grade of 2.50 (71.0%) for BSA retention.',
    verificationStatus: 'verified',
    sourceReference: 'FEU IABF BS Accountancy Retention Circular & Course Syllabus Guidelines (SY 2026-2027)',
    effectiveDate: '2026-08-01',
    defaultCategories: [
      {
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all',
        dropLowestCount: 0
      },
      {
        name: 'Midterm Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        name: 'Final Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'SY 2026-2027 Policy: Formative Assessment (50%) includes all seatworks, homeworks, problem sets, and quizzes. Summative Departmental Exams comprise 50% (Midterm 25% + Final 25%). Minimum BSA Retention threshold is 2.50 (71.0% raw score) across all professional Accounting, Law, and Tax courses.'
  },
  {
    id: 'custom_flexible_profile',
    name: 'Custom Syllabus Profile',
    category: 'custom',
    formativeRatio: 0,
    summativeRatio: 0,
    description: 'Custom profile allowing full control over all category weights, calculation methods, and grading periods.',
    verificationStatus: 'user_custom',
    sourceReference: 'User-specified Course Syllabus',
    defaultCategories: [
      {
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        name: 'Summative Examinations & Major Projects',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'all'
      }
    ],
  }
]

/**
 * Standard FEU Manila Transmutation Tables for SY 2026-2027
 * FEU uses a numeric quality point system from 1.00 (highest) to 4.00/5.00 (failure).
 * For BS Accountancy majors, the critical retention cutoff is 2.50 (71.0% raw percentage).
 */
export const DEFAULT_TRANSMUTATION_PROFILES: TransmutationProfile[] = [
  {
    id: 'feu_iabf_transmutation_scale',
    name: 'FEU Transmutation Scale (IABF Zero-Based 60% Baseline)',
    institution: 'Far Eastern University Manila',
    program: 'IABF BS Accountancy',
    applicableYear: '2026-2027',
    verificationStatus: 'verified',
    sourceReference: 'FEU IABF Zero-Based Grading Scale (SY 2026-2027 OBE Guidelines)',
    effectiveDate: '2026-08-01',
    lastVerifiedDate: '2026-10-27',
    notes: 'FEU IABF retains strict Zero-Based non-curved audit policies. 60.00% is the absolute passing baseline.',
    ranges: [
      { id: 'iabf_400', minRaw: 96, maxRaw: 100, officialGrade: '4.00', letterGrade: 'A', qualityPoints: 4.0, description: "President's List" },
      { id: 'iabf_375', minRaw: 91, maxRaw: 95.999, officialGrade: '3.75', letterGrade: 'A-', qualityPoints: 3.75, description: "Dean's Honor Target" },
      { id: 'iabf_350', minRaw: 86, maxRaw: 90.999, officialGrade: '3.50', letterGrade: 'B+', qualityPoints: 3.5, description: "Dean's List" },
      { id: 'iabf_300', minRaw: 80, maxRaw: 85.999, officialGrade: '3.00', letterGrade: 'B', qualityPoints: 3.0, description: 'Very Good' },
      { id: 'iabf_250', minRaw: 75, maxRaw: 79.999, officialGrade: '2.50', letterGrade: 'C+', qualityPoints: 2.5, description: 'Good' },
      { id: 'iabf_200', minRaw: 70, maxRaw: 74.999, officialGrade: '2.00', letterGrade: 'C', qualityPoints: 2.0, description: 'Satisfactory' },
      { id: 'iabf_150', minRaw: 65, maxRaw: 69.999, officialGrade: '1.50', letterGrade: 'D+', qualityPoints: 1.5, description: 'Fair' },
      { id: 'iabf_100', minRaw: 60, maxRaw: 64.999, officialGrade: '1.00', letterGrade: 'D', qualityPoints: 1.0, description: 'Passing Baseline' },
      { id: 'iabf_000', minRaw: 0, maxRaw: 59.999, officialGrade: '0.00', letterGrade: 'F', qualityPoints: 0.0, description: 'Failing Grade' }
    ]
  },
  {
    id: 'feu_bsa_retention_scale',
    name: 'FEU BSA Accountancy Retention Scale (SY 2026-2027)',
    institution: 'Far Eastern University Manila',
    program: 'BS Accountancy (IABF)',
    applicableYear: '2026-2027',
    verificationStatus: 'verified',
    sourceReference: 'FEU IABF BS Accountancy Academic Guidelines & Retention Policy (SY 2026-2027)',
    effectiveDate: '2026-08-01',
    lastVerifiedDate: '2026-10-26',
    notes: 'FEU IABF BSA Retention Standard: Students must maintain at least 2.50 (C+ / 71.0% raw) in all major professional courses (Accounting, Law, Tax). Grades below 2.50 result in BSA disqualification.',
    ranges: [
      { id: 'ba1', minRaw: 96, maxRaw: 100, officialGrade: '1.00', letterGrade: 'A', qualityPoints: 4.0, description: 'Superior / Highest Honors (Summa Standing)' },
      { id: 'ba2', minRaw: 92, maxRaw: 95.999, officialGrade: '1.25', letterGrade: 'A-', qualityPoints: 3.75, description: 'Very Good (Top Honors)' },
      { id: 'ba3', minRaw: 88, maxRaw: 91.999, officialGrade: '1.50', letterGrade: 'B+', qualityPoints: 3.5, description: 'Above Average (Magna Standing)' },
      { id: 'ba4', minRaw: 84, maxRaw: 87.999, officialGrade: '1.75', letterGrade: 'B', qualityPoints: 3.25, description: 'Good (Cum Laude Standing)' },
      { id: 'ba5', minRaw: 80, maxRaw: 83.999, officialGrade: '2.00', letterGrade: 'B-', qualityPoints: 3.0, description: 'Satisfactory (Safe Retention)' },
      { id: 'ba6', minRaw: 75, maxRaw: 79.999, officialGrade: '2.25', letterGrade: 'C+', qualityPoints: 2.75, description: 'Fair (Above Retention Cutoff)' },
      { id: 'ba7', minRaw: 71, maxRaw: 74.999, officialGrade: '2.50', letterGrade: 'C+', qualityPoints: 2.5, description: 'BSA Retention Cutoff (Minimum Passing for Majors)' },
      { id: 'ba8', minRaw: 66, maxRaw: 70.999, officialGrade: '2.75', letterGrade: 'C-', qualityPoints: 2.25, description: 'Below BSA Retention Cutoff (Disqualification Risk)' },
      { id: 'ba9', minRaw: 60, maxRaw: 65.999, officialGrade: '3.00', letterGrade: 'D', qualityPoints: 2.0, description: 'University Passing Only (Below BSA Retention Cutoff)' },
      { id: 'ba10', minRaw: 55, maxRaw: 59.999, officialGrade: '4.00', letterGrade: 'E', qualityPoints: 1.0, description: 'Conditional / Remedial Exam Required' },
      { id: 'ba11', minRaw: 0, maxRaw: 54.999, officialGrade: '5.00', letterGrade: 'F', qualityPoints: 0.0, description: 'Failing (Repeat Course Required)' }
    ]
  },
  {
    id: 'feu_letter_grade_official',
    name: 'FEU Official Letter Grade Equivalent (Quality Point System)',
    institution: 'Far Eastern University Manila',
    program: 'University-wide & IABF Standard',
    applicableYear: '2026-2027',
    verificationStatus: 'verified',
    sourceReference: 'FEU Scholars Society & University Policy on Academic Integrity',
    effectiveDate: '2026-08-01',
    lastVerifiedDate: '2026-10-26',
    notes: 'Official FEU 4.00 Quality Point System. 4.00 (A: 92-100%), 3.50 (B+: 85-91.99%), 3.00 (B: 78-84.99%), 2.50 (C+: 71-77.99%), 2.00 (C: 64-70.99%), 1.50 (D+: 57-63.99%), 1.00 (D: 50-56.99%), 0.00 (F: 0-49.99%). P = Passed, AW = Authorized Withdrawal, IP = In Progress.',
    ranges: [
      { id: 'feu_lg_a', minRaw: 92, maxRaw: 100, officialGrade: 'A', letterGrade: 'A', qualityPoints: 4.0, description: 'Excellent / Highest Standing' },
      { id: 'feu_lg_bp', minRaw: 85, maxRaw: 91.999, officialGrade: 'B+', letterGrade: 'B+', qualityPoints: 3.5, description: 'Very Good' },
      { id: 'feu_lg_b', minRaw: 78, maxRaw: 84.999, officialGrade: 'B', letterGrade: 'B', qualityPoints: 3.0, description: 'Good' },
      { id: 'feu_lg_cp', minRaw: 71, maxRaw: 77.999, officialGrade: 'C+', letterGrade: 'C+', qualityPoints: 2.5, description: 'Satisfactory / BSA Major Retention Cutoff' },
      { id: 'feu_lg_c', minRaw: 64, maxRaw: 70.999, officialGrade: 'C', letterGrade: 'C', qualityPoints: 2.0, description: 'Fair / Passing' },
      { id: 'feu_lg_dp', minRaw: 57, maxRaw: 63.999, officialGrade: 'D+', letterGrade: 'D+', qualityPoints: 1.5, description: 'Low Passing' },
      { id: 'feu_lg_d', minRaw: 50, maxRaw: 56.999, officialGrade: 'D', letterGrade: 'D', qualityPoints: 1.0, description: 'Conditional Passing' },
      { id: 'feu_lg_f', minRaw: 0, maxRaw: 49.999, officialGrade: 'F', letterGrade: 'F', qualityPoints: 0.0, description: 'Failing (Repeat Course Required)' }
    ]
  },
  {
    id: 'feu_standard_undergraduate',
    name: 'FEU Manila Standard Undergraduate Scale (SY 2026-2027)',
    institution: 'Far Eastern University Manila',
    program: 'Undergraduate General Education & Electives',
    applicableYear: '2026-2027',
    verificationStatus: 'verified',
    sourceReference: 'FEU Student Handbook & Academic Grading Regulations (SY 2026-2027)',
    effectiveDate: '2026-08-01',
    lastVerifiedDate: '2026-10-26',
    notes: 'Standard 4.0 grading scale: 1.00 is 96-100%, 3.00 is passing (60-63% raw). 4.00 is conditional removal. 5.00 represents Failure.',
    ranges: [
      { id: 'r1', minRaw: 96, maxRaw: 100, officialGrade: '1.00', letterGrade: 'A', qualityPoints: 4.0, description: 'Excellent / Superior' },
      { id: 'r2', minRaw: 92, maxRaw: 95.999, officialGrade: '1.25', letterGrade: 'A-', qualityPoints: 3.75, description: 'Very Good' },
      { id: 'r3', minRaw: 88, maxRaw: 91.999, officialGrade: '1.50', letterGrade: 'B+', qualityPoints: 3.5, description: 'Good' },
      { id: 'r4', minRaw: 84, maxRaw: 87.999, officialGrade: '1.75', letterGrade: 'B', qualityPoints: 3.25, description: 'Good' },
      { id: 'r5', minRaw: 80, maxRaw: 83.999, officialGrade: '2.00', letterGrade: 'B-', qualityPoints: 3.0, description: 'Satisfactory' },
      { id: 'r6', minRaw: 76, maxRaw: 79.999, officialGrade: '2.25', letterGrade: 'C+', qualityPoints: 2.75, description: 'Fair' },
      { id: 'r7', minRaw: 72, maxRaw: 75.999, officialGrade: '2.50', letterGrade: 'C', qualityPoints: 2.5, description: 'Fair' },
      { id: 'r8', minRaw: 68, maxRaw: 71.999, officialGrade: '2.75', letterGrade: 'C-', qualityPoints: 2.25, description: 'Passing' },
      { id: 'r9', minRaw: 64, maxRaw: 67.999, officialGrade: '3.00', letterGrade: 'D', qualityPoints: 2.0, description: 'Passing' },
      { id: 'r10', minRaw: 60, maxRaw: 63.999, officialGrade: '4.00', letterGrade: 'E', qualityPoints: 1.0, description: 'Conditional / Remedial' },
      { id: 'r11', minRaw: 0, maxRaw: 59.999, officialGrade: '5.00', letterGrade: 'F', qualityPoints: 0.0, description: 'Failing' }
    ]
  }
]
