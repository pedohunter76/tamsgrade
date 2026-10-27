import Dexie, { Table } from 'dexie'
import { Subject, Assessment, AssessmentCategory, TransmutationProfile, UserPreferences } from '../engine/types'
import { DEFAULT_TRANSMUTATION_PROFILES } from '../engine/profiles'
import { getAllCurriculumSubjects } from '../engine/curriculum'

export class TamsGradeDatabase extends Dexie {
  subjects!: Table<Subject, string>
  assessments!: Table<Assessment, string>
  transmutationProfiles!: Table<TransmutationProfile, string>
  preferences!: Table<UserPreferences & { id: string }, string>

  constructor() {
    super('TamsGradeDB')
    this.version(1).stores({
      subjects: 'id, code, category, isArchived, academicYear, semester, termId',
      assessments: 'id, subjectId, categoryId, date',
      transmutationProfiles: 'id, institution, program',
      preferences: 'id'
    })
  }
}

export const db = new TamsGradeDatabase()

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultGradingProfileId: 'feu_iabf_accountancy',
  defaultAcademicYear: '2026-2027',
  defaultSemester: '1st Semester',
  activeTermId: 'y1_s1',
  gradeDisplayPrecision: 2,
  theme: 'light',
  treatMissingAsZero: false,
  showQualityPoints: true,
  studentProgram: 'bs_accountancy',
  targetPromotionYear: '2nd_year'
}

export const FIRST_SEMESTER_SUBJECTS: Subject[] = [
  {
    id: 'sub_act1101',
    code: 'ACT1101',
    section: '',
    name: 'FINANCIAL ACCOUNTING AND REPORTING',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'iabf_major',
    gradingProfileId: 'feu_iabf_accountancy',
    transmutationProfileId: 'feu_iabf_transmutation_scale',
    periodFormula: 'midterm_50_final_50',
    midtermWeight: 50,
    finalWeight: 50,
    schedule: '[Monday] 09:00 AM-12:00 PM (Lab) | [Thursday] 10:30 AM-12:30 PM (Lec)',
    room: 'ROOM 204 (COMPLAB), ADMISSIONS BLDG | ROOM 705 (LEC RM), ENGINEERING BLDG',
    isArchived: false,
    categories: [
      {
        id: 'act_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all',
        dropLowestCount: 0
      },
      {
        id: 'act_cat_midterm',
        name: 'Midterm Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'act_cat_final',
        name: 'Final Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Mon 9:00-12:00 PM (Complab 204) & Thu 10:30-12:30 PM (Lec 705). 3.0 units. Must maintain >= 2.50 (C+) for BSA retention.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_law1101',
    code: 'LAW1101',
    section: '',
    name: 'LAW ON OBLIGATIONS AND CONTRACTS',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'iabf_major',
    gradingProfileId: 'feu_iabf_accountancy',
    transmutationProfileId: 'feu_bsa_retention_scale',
    periodFormula: 'midterm_50_final_50',
    midtermWeight: 50,
    finalWeight: 50,
    schedule: '[Monday] 01:30 PM-03:00 PM | [Thursday] 01:30 PM-03:00 PM',
    room: 'ROOM 707 (LEC RM), ENGINEERING BUILDING, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'law_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'law_cat_mid',
        name: 'Midterm Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'law_cat_fin',
        name: 'Final Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Civil Code: Obligations and Contracts. Room 707 Engineering Building.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_mgt1115',
    code: 'MGT1115',
    section: '',
    name: 'MANAGERIAL ECONOMICS',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'iabf_major',
    gradingProfileId: 'feu_iabf_accountancy',
    transmutationProfileId: 'feu_bsa_retention_scale',
    periodFormula: 'midterm_50_final_50',
    midtermWeight: 50,
    finalWeight: 50,
    schedule: '[Wednesday] 03:00 PM-04:30 PM | [Saturday] 03:00 PM-04:30 PM',
    room: 'ROOM 707 (LEC RM), ENGINEERING BUILDING, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'mgt1115_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'mgt1115_cat_mid',
        name: 'Midterm Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'mgt1115_cat_fin',
        name: 'Final Departmental Exam',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Room 707 Engineering Building. 50% FA / 50% SA.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_mgt1101',
    code: 'MGT1101',
    section: '',
    name: 'LEADERSHIP AND DECISION MAKING',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'iabf_major',
    gradingProfileId: 'feu_iabf_accountancy',
    transmutationProfileId: 'feu_bsa_retention_scale',
    periodFormula: 'cumulative_100',
    schedule: '[Wednesday] 04:30 PM-06:00 PM | [Saturday] 04:30 PM-06:00 PM',
    room: 'ROOM 707 (LEC RM), ENGINEERING BUILDING, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'mgt1101_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'mgt1101_cat_mid',
        name: 'Midterm Examination',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'mgt1101_cat_fin',
        name: 'Final Project & Examination',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Wed/Sat 4:30-6:00 PM Room 707 Engineering Building.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_flj0101',
    code: 'FLJ0101',
    section: '',
    name: 'FEU LEARNING JOURNEY 1',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 0,
    category: 'gen_ed',
    gradingProfileId: 'feu_gen_ed_obe',
    transmutationProfileId: 'feu_standard_undergraduate',
    periodFormula: 'cumulative_100',
    schedule: '[Tuesday] 09:00 PM-10:00 PM',
    room: 'FLJ AND HMR-107, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'flj_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'flj_cat_port',
        name: 'Culminating Journey Portfolio',
        weight: 30,
        calculationMethod: 'equal_weight',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Tuesday 9:00-10:00 PM at FLJ & HMR-107. 0.0 units (Non-academic journey).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_ged0121',
    code: 'GED0121',
    section: '',
    name: 'LANGUAGE ENHANCEMENT AND PROFICIENCY (LEAP)',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'gen_ed',
    gradingProfileId: 'feu_gen_ed_obe',
    transmutationProfileId: 'feu_standard_undergraduate',
    periodFormula: 'cumulative_100',
    schedule: '[Wednesday] 07:30 AM-09:00 AM | [Saturday] 07:30 AM-09:00 AM',
    room: 'ROOM 205 (DLLECT), FEUTURE CENTER, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'ged0121_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'leap_cat_mid',
        name: 'Midterm Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'leap_cat_fin',
        name: 'Final Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Wed/Sat 7:30-9:00 AM at FEUture Center Room 205.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_ged0113',
    code: 'GED0113',
    section: '',
    name: 'THE FILIPINO IN THE CONTEMPORARY WORLD',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'gen_ed',
    gradingProfileId: 'feu_gen_ed_obe',
    transmutationProfileId: 'feu_standard_undergraduate',
    periodFormula: 'cumulative_100',
    schedule: '[Wednesday] 09:00 AM-10:30 AM | [Saturday] 09:00 AM-10:30 AM',
    room: 'ROOM 509 (DLLECT), FEUTURE CENTER, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'ged113_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'ged113_cat_mid',
        name: 'Midterm Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'ged113_cat_fin',
        name: 'Final Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Wed/Sat 9:00-10:30 AM at FEUture Center Room 509.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_ged0106',
    code: 'GED0106',
    section: '',
    name: 'ART APPRECIATION',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'gen_ed',
    gradingProfileId: 'feu_gen_ed_obe',
    transmutationProfileId: 'feu_standard_undergraduate',
    periodFormula: 'cumulative_100',
    schedule: '[Wednesday] 12:00 PM-01:30 PM | [Saturday] 12:00 PM-01:30 PM',
    room: 'ROOM 208 (LEC RM), FEUTURE CENTER, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'ged106_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'art_cat_mid',
        name: 'Midterm Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'art_cat_fin',
        name: 'Final Examination',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Wed/Sat 12:00-1:30 PM at FEUture Center Room 208.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_pft0101',
    code: 'PFT0101',
    section: '',
    name: 'PHYSICAL ACTIVITIES TOWARDS HEALTH AND FITNESS 1',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 2,
    category: 'gen_ed',
    gradingProfileId: 'feu_gen_ed_obe',
    transmutationProfileId: 'feu_standard_undergraduate',
    periodFormula: 'cumulative_100',
    schedule: '[Wednesday] 01:30 PM-02:30 PM | [Saturday] 01:30 PM-02:30 PM',
    room: 'ROOM 103 (WRP MPR), FEUTURE CENTER, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'pft_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'pft_cat_mid',
        name: 'Midterm Practical Assessment',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'pft_cat_fin',
        name: 'Final Practical Assessment',
        weight: 15,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Wed/Sat 1:30-2:30 PM at Room 103 WRP MPR FEUture Center.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sub_nst0101',
    code: 'NST0101',
    section: '',
    name: 'NATIONAL SERVICE TRAINING PROGRAM 1',
    academicYear: '2026-2027',
    semester: '1st Semester',
    units: 3,
    category: 'gen_ed',
    gradingProfileId: 'feu_gen_ed_obe',
    transmutationProfileId: 'feu_standard_undergraduate',
    periodFormula: 'cumulative_100',
    schedule: '[Sunday] 08:00 AM-05:00 PM',
    room: 'NSTP AND WRP-135, MANILA CAMPUS',
    isArchived: false,
    categories: [
      {
        id: 'nstp_cat_fa',
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 70,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all'
      },
      {
        id: 'nstp_cat_mid',
        name: 'Midterm Project Proposal',
        weight: 15,
        calculationMethod: 'equal_weight',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: 'nstp_cat_fin',
        name: 'Final Community Project Output',
        weight: 15,
        calculationMethod: 'equal_weight',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: 'Sunday 8:00 AM - 5:00 PM at NSTP/WRP-135.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Complete curriculum subjects across all 11 terms (1st Year to 4th Year, 174.0 units)
export const ALL_CURRICULUM_SUBJECTS: Subject[] = getAllCurriculumSubjects(FIRST_SEMESTER_SUBJECTS)

// Empty sample assessments for a clean slate in SY 2026-2027 First Semester
export const SAMPLE_ASSESSMENTS: Assessment[] = []

/**
 * Initializes database with default profiles and student's subjects across all 11 terms.
 * Provides a clean slate for School Year 2026-2027 First Semester Block 109/110,
 * and makes all curriculum subjects across all terms available dynamically.
 */
export async function initializeDatabase(): Promise<void> {
  // Always synchronize standard transmutation profiles
  await db.transmutationProfiles.bulkPut(DEFAULT_TRANSMUTATION_PROFILES)

  const existingPrefs = await db.preferences.get('user_preferences')
  if (!existingPrefs) {
    await db.preferences.put({ id: 'user_preferences', ...DEFAULT_PREFERENCES })
  } else if (!existingPrefs.activeTermId) {
    await db.preferences.update('user_preferences', {
      activeTermId: 'y1_s1'
    })
  }

  // Check if all curriculum terms (76 subjects) have been seeded into IndexedDB
  const cleanSlateAllTerms = await db.preferences.get('clean_slate_all_terms_v7')
  const count = await db.subjects.count()

  if (!cleanSlateAllTerms || count < 70) {
    // Put all curriculum subjects into IndexedDB, preserving any assessments entered by student
    await db.subjects.bulkPut(ALL_CURRICULUM_SUBJECTS)
    await db.preferences.put({
      id: 'clean_slate_all_terms_v7',
      defaultAcademicYear: '2026-2027',
      defaultSemester: '1st Semester'
    } as any)
  }

  // One-time cleanup for Block 109/110 and theme fix
  const themeAndBlockCleanup = await db.preferences.get('theme_and_block_cleanup_v9')
  if (!themeAndBlockCleanup) {
    const allExistingSubjects = await db.subjects.toArray()
    const subjectsToUpdate = allExistingSubjects.map(s => {
      if (s.section && (s.section.includes('109') || s.section.includes('Block'))) {
        return { ...s, section: '' }
      }
      return s
    })
    await db.subjects.bulkPut(subjectsToUpdate)

    const savedLocalTheme = localStorage.getItem('tamsgrade_theme')
    const finalTheme = savedLocalTheme === 'dark' ? 'dark' : 'light'
    localStorage.setItem('tamsgrade_theme', finalTheme)
    if (existingPrefs) {
      await db.preferences.update('user_preferences', { theme: finalTheme })
    }

    await db.preferences.put({
      id: 'theme_and_block_cleanup_v9',
      defaultAcademicYear: '2026-2027',
      defaultSemester: '1st Semester'
    } as any)
  }
}

export async function loadFirstSemesterSubjects(): Promise<void> {
  await db.subjects.clear()
  await db.assessments.clear()
  await db.transmutationProfiles.clear()
  await db.transmutationProfiles.bulkAdd(DEFAULT_TRANSMUTATION_PROFILES)
  await db.subjects.bulkPut(ALL_CURRICULUM_SUBJECTS)
  if (SAMPLE_ASSESSMENTS.length > 0) {
    await db.assessments.bulkAdd(SAMPLE_ASSESSMENTS)
  }
}

export async function clearAllUserData(): Promise<void> {
  await db.subjects.clear()
  await db.assessments.clear()
  await db.transmutationProfiles.clear()
  await db.transmutationProfiles.bulkAdd(DEFAULT_TRANSMUTATION_PROFILES)
}
