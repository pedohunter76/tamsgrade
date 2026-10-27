import { describe, it, expect } from 'vitest'
import {
  FEU_QPA_PROGRAM_RULES,
  evaluateFEUQPAStanding,
  FEUProgramId,
  FEUPromotionTarget
} from '../qpaRequirements'
import { DEFAULT_TRANSMUTATION_PROFILES } from '../profiles'
import { transmuteRawGrade } from '../transmutation'
import { calculateSubjectGrade } from '../calculator'
import { Subject, Assessment } from '../types'

describe('FEU Official Academic Regulations Test Suite (Images 1 & 2)', () => {
  const officialLetterScale = DEFAULT_TRANSMUTATION_PROFILES.find(
    p => p.id === 'feu_letter_grade_official'
  )!

  // Test 1: Image 1 - Letter Grade Equivalent Scale
  describe('Image 1: FEU Scholars Society Letter Grade Equivalent & Quality Points', () => {
    it('correctly maps all 8 official FEU quality point and letter grade tiers', () => {
      // 4.00 (A: 92.00 - 100.00)
      const resA1 = transmuteRawGrade(100, officialLetterScale)
      expect(resA1?.officialGrade).toBe('A')
      expect(resA1?.qualityPoints).toBe(4.0)

      const resA2 = transmuteRawGrade(92.0, officialLetterScale)
      expect(resA2?.officialGrade).toBe('A')
      expect(resA2?.qualityPoints).toBe(4.0)

      // 3.50 (B+: 85.00 - 91.99)
      const resBp = transmuteRawGrade(88.5, officialLetterScale)
      expect(resBp?.officialGrade).toBe('B+')
      expect(resBp?.qualityPoints).toBe(3.5)

      // 3.00 (B: 78.00 - 84.99)
      const resB = transmuteRawGrade(80.0, officialLetterScale)
      expect(resB?.officialGrade).toBe('B')
      expect(resB?.qualityPoints).toBe(3.0)

      // 2.50 (C+: 71.00 - 77.99) - BSA Retention Benchmark
      const resCp = transmuteRawGrade(71.0, officialLetterScale)
      expect(resCp?.officialGrade).toBe('C+')
      expect(resCp?.qualityPoints).toBe(2.5)

      // 2.00 (C: 64.00 - 70.99)
      const resC = transmuteRawGrade(65.0, officialLetterScale)
      expect(resC?.officialGrade).toBe('C')
      expect(resC?.qualityPoints).toBe(2.0)

      // 1.50 (D+: 57.00 - 63.99)
      const resDp = transmuteRawGrade(60.0, officialLetterScale)
      expect(resDp?.officialGrade).toBe('D+')
      expect(resDp?.qualityPoints).toBe(1.5)

      // 1.00 (D: 50.00 - 56.99)
      const resD = transmuteRawGrade(52.0, officialLetterScale)
      expect(resD?.officialGrade).toBe('D')
      expect(resD?.qualityPoints).toBe(1.0)

      // 0.00 (F: 00.00 - 49.99)
      const resF = transmuteRawGrade(45.0, officialLetterScale)
      expect(resF?.officialGrade).toBe('F')
      expect(resF?.qualityPoints).toBe(0.0)
    })
  })

  // Test 2: Image 2 - FEU Annual QPA Requirements for Promotion & Retention
  describe('Image 2: FEU Annual QPA Grade Requirements for Promotion & Retention', () => {
    it('evaluates BS Accountancy promotion benchmarks accurately (1.20, 1.60, 2.00, 2.40)', () => {
      // Promotion to 2nd year (Cutoff: 1.20)
      const eval2ndPass = evaluateFEUQPAStanding(1.50, 'bs_accountancy', '2nd_year')
      expect(eval2ndPass.isQualified).toBe(true)
      expect(eval2ndPass.requiredQpa).toBe(1.20)
      expect(eval2ndPass.difference).toBeCloseTo(0.30, 2)
      expect(eval2ndPass.status).toBe('promoted')

      const eval2ndFail = evaluateFEUQPAStanding(1.10, 'bs_accountancy', '2nd_year')
      expect(eval2ndFail.isQualified).toBe(false)
      expect(eval2ndFail.status).toBe('at_risk_pnra_unra')
      expect(eval2ndFail.enrichmentWarning).toContain('PNRA')
      expect(eval2ndFail.enrichmentWarning).toContain('UNRA')
      expect(eval2ndFail.enrichmentWarning).toContain('Enrichment Program')

      // Promotion to 3rd year (Cutoff: 1.60)
      const eval3rd = evaluateFEUQPAStanding(1.65, 'bs_accountancy', '3rd_year')
      expect(eval3rd.isQualified).toBe(true)
      expect(eval3rd.requiredQpa).toBe(1.60)

      // Promotion to 4th year (Cutoff: 2.00)
      const eval4th = evaluateFEUQPAStanding(2.10, 'bs_accountancy', '4th_year')
      expect(eval4th.isQualified).toBe(true)
      expect(eval4th.requiredQpa).toBe(2.00)

      // To Graduate (Cutoff: 2.40)
      const evalGrad = evaluateFEUQPAStanding(2.35, 'bs_accountancy', 'graduate')
      expect(evalGrad.isQualified).toBe(false)
      expect(evalGrad.requiredQpa).toBe(2.40)
    })

    it('evaluates all other university degree programs correctly', () => {
      // Architecture (2nd yr: 1.50, 3rd yr: 1.80, 4th yr: 2.00, Grad: 2.20)
      const arch = evaluateFEUQPAStanding(1.70, 'bs_architecture', '2nd_year')
      expect(arch.requiredQpa).toBe(1.50)
      expect(arch.isQualified).toBe(true)

      // Education (Grad: 2.20)
      const educ = evaluateFEUQPAStanding(2.15, 'bs_education', 'graduate')
      expect(educ.requiredQpa).toBe(2.20)
      expect(educ.isQualified).toBe(false)

      // MedTech / Nursing / Psych (3rd yr: 2.00)
      const health = evaluateFEUQPAStanding(2.05, 'bs_medtech_nursing_psych', '3rd_year')
      expect(health.requiredQpa).toBe(2.00)
      expect(health.isQualified).toBe(true)

      // General University Standard (2nd yr: 1.20, 3rd yr: 1.50, 4th yr: 1.80, Grad: 2.00)
      const gen = evaluateFEUQPAStanding(1.85, 'all_other_courses', '4th_year')
      expect(gen.requiredQpa).toBe(1.80)
      expect(gen.isQualified).toBe(true)
    })
  })

  // Test 3: Zero Coverage Safety (No False Failing 5.00 Grade)
  describe('Zero Coverage Safety', () => {
    it('does not transmute a false 5.00/F grade when a subject has 0% completed weight coverage', () => {
      const emptySubject: Subject = {
        id: 'sub_empty',
        code: 'ACT1101',
        name: 'Financial Accounting',
        academicYear: '2026-2027',
        semester: '1st Semester',
        units: 6,
        category: 'iabf_major',
        gradingProfileId: 'feu_iabf_accountancy',
        periodFormula: 'midterm_50_final_50',
        categories: [
          { id: 'c1', name: 'Quizzes', weight: 50, calculationMethod: 'total_points' },
          { id: 'c2', name: 'Exams', weight: 50, calculationMethod: 'total_points' }
        ],
        createdAt: '',
        updatedAt: ''
      }

      // No assessments completed (only pending)
      const pendingAssessments: Assessment[] = [
        { id: 'a1', subjectId: 'sub_empty', categoryId: 'c1', name: 'Quiz 1', pointsEarned: null, totalPossiblePoints: 100 }
      ]

      const result = calculateSubjectGrade(emptySubject, pendingAssessments, officialLetterScale, false)
      expect(result.completedWeightCoverage).toBe(0)
      expect(result.transmutedGrade).toBeUndefined()
      expect(result.letterGrade).toBeUndefined()
      expect(result.qualityPoints).toBeUndefined()
    })
  })
})
