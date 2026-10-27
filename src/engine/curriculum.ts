import { Subject } from './types'

export interface CurriculumCourse {
  code: string
  name: string
  units: number
  prerequisites: string[]
  year: 1 | 2 | 3 | 4
  termId: string
  termName: string
  semester: '1st Semester' | '2nd Semester' | 'Midyear Semester'
  category: 'iabf_major' | 'gen_ed'
  isRetentionKey: boolean
  status: 'enrolled' | 'planned' | 'credited' | 'completed'
  description?: string
}

export interface CurriculumTerm {
  id: string
  year: 1 | 2 | 3 | 4
  yearLabel: string
  semester: '1st Semester' | '2nd Semester' | 'Midyear Semester'
  termName: string
  totalUnits: number
  courses: CurriculumCourse[]
}

export const BS_ACCOUNTANCY_CURRICULUM: CurriculumTerm[] = [
  // ==========================================
  // 1ST YEAR, 1ST SEMESTER (26.0 Units) - CURRENTLY ENROLLED
  // ==========================================
  {
    id: 'y1_s1',
    year: 1,
    yearLabel: '1st Year',
    semester: '1st Semester',
    termName: '1st Year, 1st Semester',
    totalUnits: 26.0,
    courses: [
      {
        code: 'ACT1101',
        name: 'FINANCIAL ACCOUNTING AND REPORTING',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'enrolled',
        description: 'Foundation course covering double-entry accounting, accounting cycle for service and merchandising business, and financial statements preparation.'
      },
      {
        code: 'FLJ0101',
        name: 'FEU LEARNING JOURNEY 1',
        units: 0.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Tamaraw orientation, values alignment, and personal growth foundation at FEU.'
      },
      {
        code: 'GED0106',
        name: 'ART APPRECIATION',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Exploration of aesthetics, visual art, Philippine cultural heritage, and human artistic expression.'
      },
      {
        code: 'GED0113',
        name: 'THE FILIPINO IN THE CONTEMPORARY WORLD',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Interdisciplinary study of Philippine society, globalization, diaspora, and modern socio-economic challenges.'
      },
      {
        code: 'GED0121',
        name: 'LANGUAGE ENHANCEMENT AND PROFICIENCY (LEAP)',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Intensive academic writing, critical reading, and professional verbal discourse.'
      },
      {
        code: 'LAW1101',
        name: 'LAW ON OBLIGATIONS AND CONTRACTS',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'enrolled',
        description: 'Civil Code of the Philippines provisions regarding juridical necessity, contract formation, defective contracts, and remedies.'
      },
      {
        code: 'MGT1101',
        name: 'LEADERSHIP AND DECISION MAKING',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Modern executive decision theory, organizational behavior, ethical leadership frameworks, and team dynamics.'
      },
      {
        code: 'MGT1115',
        name: 'MANAGERIAL ECONOMICS',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'enrolled',
        description: 'Microeconomic analysis applied to business decisions, pricing mechanisms, market structures, and cost theory.'
      },
      {
        code: 'NST0101',
        name: 'NATIONAL SERVICE TRAINING PROGRAM 1',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Civic Welfare Training Service focusing on citizenship, community development, and disaster risk reduction.'
      },
      {
        code: 'PFT0101',
        name: 'PHYSICAL ACTIVITIES TOWARDS HEALTH AND FITNESS 1',
        units: 2.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s1',
        termName: '1st Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'enrolled',
        description: 'Movement competency, physical fitness appraisal, and foundational wellness conditioning.'
      }
    ]
  },

  // ==========================================
  // 1ST YEAR, 2ND SEMESTER (26.0 Units)
  // ==========================================
  {
    id: 'y1_s2',
    year: 1,
    yearLabel: '1st Year',
    semester: '2nd Semester',
    termName: '1st Year, 2nd Semester',
    totalUnits: 26.0,
    courses: [
      {
        code: 'ACT1122',
        name: 'CONCEPTUAL FRAMEWORK AND ACCOUNTING STANDARDS',
        units: 3.0,
        prerequisites: ['ACT1101'],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned',
        description: 'PFRS/PAS theoretical framework, qualitative characteristics of financial reporting, measurement bases, and standard presentation.'
      },
      {
        code: 'FLJ0102',
        name: 'FEU LEARNING JOURNEY 2',
        units: 0.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0103',
        name: 'MATHEMATICS IN THE MODERN WORLD',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0104',
        name: 'SCIENCE, TECHNOLOGY, AND SOCIETY',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0116',
        name: 'RETORIKA',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'LAW1102',
        name: 'BUSINESS LAWS AND REGULATIONS 1',
        units: 3.0,
        prerequisites: ['LAW1101'],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'MGT1102',
        name: 'FUNDAMENTALS OF BUSINESS ANALYTICS WITH SPREADSHEET',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'MGT1116',
        name: 'ECONOMIC DEVELOPMENT',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'NST0102',
        name: 'NATIONAL SERVICE TRAINING PROGRAM 2',
        units: 3.0,
        prerequisites: ['NST0101'],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'PFT0102',
        name: 'PHYSICAL ACTIVITIES TOWARDS HEALTH AND FITNESS 2',
        units: 2.0,
        prerequisites: ['PFT0101'],
        year: 1,
        termId: 'y1_s2',
        termName: '1st Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 1ST YEAR, MIDYEAR SEMESTER (9.0 Units)
  // ==========================================
  {
    id: 'y1_mid',
    year: 1,
    yearLabel: '1st Year',
    semester: 'Midyear Semester',
    termName: '1st Year, Midyear Semester',
    totalUnits: 9.0,
    courses: [
      {
        code: 'ACT1110',
        name: 'GOVERNANCE, BUSINESS ETHICS, RISK MANAGEMENT AND INTERNAL CO',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_mid',
        termName: '1st Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'MGT1107',
        name: 'MANAGEMENT SCIENCE',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_mid',
        termName: '1st Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'MGT1111',
        name: 'INTERNATIONAL BUSINESS AND TRADE',
        units: 3.0,
        prerequisites: [],
        year: 1,
        termId: 'y1_mid',
        termName: '1st Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 2ND YEAR, 1ST SEMESTER (23.0 Units)
  // ==========================================
  {
    id: 'y2_s1',
    year: 2,
    yearLabel: '2nd Year',
    semester: '1st Semester',
    termName: '2nd Year, 1st Semester',
    totalUnits: 23.0,
    courses: [
      {
        code: 'ACT1105',
        name: 'COST ACCOUNTING AND CONTROL WITH SAP',
        units: 3.0,
        prerequisites: ['ACT1101'],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1146',
        name: 'INTERMEDIATE ACCOUNTING 1',
        units: 3.0,
        prerequisites: ['ACT1122'],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'BME1101',
        name: 'PRODUCTION AND OPERATIONS MANAGEMENT',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'FLJ0103',
        name: 'FEU LEARNING JOURNEY 3',
        units: 0.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0107',
        name: 'READINGS IN PHILIPPINE HISTORY',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0114',
        name: 'APPLIED ETHICS IN CONTEMPORARY TIMES',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'MGT1103',
        name: 'BUSINESS STATISTICAL ANALYSIS WITH SOFTWARE APPLICATION',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'PFT0103',
        name: 'PHYSICAL ACTIVITIES TOWARDS HEALTH AND FITNESS 3',
        units: 2.0,
        prerequisites: ['PFT0102'],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'TAX1101',
        name: 'INCOME TAXATION',
        units: 3.0,
        prerequisites: ['ACT1101'],
        year: 2,
        termId: 'y2_s1',
        termName: '2nd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 2ND YEAR, 2ND SEMESTER (20.0 Units)
  // ==========================================
  {
    id: 'y2_s2',
    year: 2,
    yearLabel: '2nd Year',
    semester: '2nd Semester',
    termName: '2nd Year, 2nd Semester',
    totalUnits: 20.0,
    courses: [
      {
        code: 'ACT1147',
        name: 'INTERMEDIATE ACCOUNTING 2',
        units: 3.0,
        prerequisites: ['ACT1146'],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1148',
        name: 'FINANCIAL MANAGEMENT',
        units: 3.0,
        prerequisites: ['ACT1146'],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'AUD1201',
        name: "INTERNAL AUDIT AND ENTITY'S CONTROL ENVIRONMENT",
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'FLJ0104',
        name: 'FEU LEARNING JOURNEY 4',
        units: 0.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0117',
        name: 'CULTURE, SOCIETY, IDEAS, AND INNOVATIONS (CSII)',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0123',
        name: 'PHILIPPINE POPULAR CULTURE AND DISCOURSES',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0124',
        name: 'PURPOSIVE COMMUNICATION',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'PFT0104',
        name: 'PHYSICAL ACTIVITIES TOWARDS HEALTH AND FITNESS 4',
        units: 2.0,
        prerequisites: ['PFT0103'],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'TAX1102',
        name: 'BUSINESS TAXATION',
        units: 3.0,
        prerequisites: ['TAX1101'],
        year: 2,
        termId: 'y2_s2',
        termName: '2nd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 2ND YEAR, MIDYEAR SEMESTER (9.0 Units)
  // ==========================================
  {
    id: 'y2_mid',
    year: 2,
    yearLabel: '2nd Year',
    semester: 'Midyear Semester',
    termName: '2nd Year, Midyear Semester',
    totalUnits: 9.0,
    courses: [
      {
        code: 'BME1102',
        name: 'STRATEGIC MANAGEMENT',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_mid',
        termName: '2nd Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0110',
        name: 'UNDERSTANDING THE SELF',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_mid',
        termName: '2nd Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'GED0122',
        name: 'THE LIFE AND WORKS OF RIZAL',
        units: 3.0,
        prerequisites: [],
        year: 2,
        termId: 'y2_mid',
        termName: '2nd Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 3RD YEAR, 1ST SEMESTER (21.0 Units)
  // ==========================================
  {
    id: 'y3_s1',
    year: 3,
    yearLabel: '3rd Year',
    semester: '1st Semester',
    termName: '3rd Year, 1st Semester',
    totalUnits: 21.0,
    courses: [
      {
        code: 'ACT1123',
        name: 'STRATEGIC COST MANAGEMENT',
        units: 3.0,
        prerequisites: ['ACT1105'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1149',
        name: 'FINANCIAL MARKETS',
        units: 3.0,
        prerequisites: ['ACT1148'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1150',
        name: 'INTERMEDIATE ACCOUNTING 3',
        units: 3.0,
        prerequisites: ['ACT1147'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1151',
        name: 'STRATEGIC BUSINESS ANALYSIS',
        units: 3.0,
        prerequisites: ['ACT1147'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1152',
        name: 'ACCOUNTING INFORMATION SYSTEM WITH SAP',
        units: 3.0,
        prerequisites: ['ACT1147'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1210',
        name: 'ACCOUNTING FOR SPECIAL TRANSACTIONS',
        units: 3.0,
        prerequisites: ['ACT1147'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1211',
        name: 'AUDITING AND ASSURANCE PRINCIPLES',
        units: 3.0,
        prerequisites: ['ACT1147'],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'FLJ0105',
        name: 'FEU LEARNING JOURNEY 5',
        units: 0.0,
        prerequisites: [],
        year: 3,
        termId: 'y3_s1',
        termName: '3rd Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 3RD YEAR, 2ND SEMESTER (21.0 Units)
  // ==========================================
  {
    id: 'y3_s2',
    year: 3,
    yearLabel: '3rd Year',
    semester: '2nd Semester',
    termName: '3rd Year, 2nd Semester',
    totalUnits: 21.0,
    courses: [
      {
        code: 'ACT1136',
        name: 'ACCOUNTING RESEARCH METHODS',
        units: 3.0,
        prerequisites: [],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1212',
        name: 'ACCOUNTING FOR GOVERNMENT AND NON- PROFIT ORGANIZATIONS',
        units: 3.0,
        prerequisites: ['ACT1150'],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1213',
        name: 'AUDITING AND ASSURANCE PRINCIPLES: CONCEPTS AND APPLICATIONS 1',
        units: 3.0,
        prerequisites: ['ACT1211', 'ACT1150'],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1214',
        name: 'AUDITING AND ASSURANCE PRINCIPLES: CONCEPTS AND APPLICATIONS 2',
        units: 3.0,
        prerequisites: ['ACT1211', 'ACT1150'],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1215',
        name: 'ACCOUNTING FOR BUSINESS COMBINATIONS',
        units: 3.0,
        prerequisites: ['ACT1210', 'ACT1150'],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1216',
        name: 'AUDITING IN A CIS ENVIRONMENT',
        units: 3.0,
        prerequisites: ['ACT1150'],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'FLJ0106',
        name: 'FEU LEARNING JOURNEY 6',
        units: 0.0,
        prerequisites: [],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'LAW1103',
        name: 'REGULATORY FRAMEWORK AND LEGAL ISSUES IN BUSINESS',
        units: 3.0,
        prerequisites: ['LAW1101'],
        year: 3,
        termId: 'y3_s2',
        termName: '3rd Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 3RD YEAR, MIDYEAR SEMESTER (9.0 Units)
  // ==========================================
  {
    id: 'y3_mid',
    year: 3,
    yearLabel: '3rd Year',
    semester: 'Midyear Semester',
    termName: '3rd Year, Midyear Semester',
    totalUnits: 9.0,
    courses: [
      {
        code: 'ACEL01',
        name: 'ELECTIVE 1',
        units: 3.0,
        prerequisites: [],
        year: 3,
        termId: 'y3_mid',
        termName: '3rd Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'ACT1153',
        name: 'ACCOUNTING INTERNSHIP 1',
        units: 3.0,
        prerequisites: ['ACT1213', 'ACT1214'],
        year: 3,
        termId: 'y3_mid',
        termName: '3rd Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1217',
        name: 'AUDITING AND ASSURANCE: SPECIALIZED INDUSTRIES',
        units: 3.0,
        prerequisites: ['ACT1213', 'ACT1214'],
        year: 3,
        termId: 'y3_mid',
        termName: '3rd Year, Midyear Semester',
        semester: 'Midyear Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 4TH YEAR, 1ST SEMESTER (15.0 Units)
  // ==========================================
  {
    id: 'y4_s1',
    year: 4,
    yearLabel: '4th Year',
    semester: '1st Semester',
    termName: '4th Year, 1st Semester',
    totalUnits: 15.0,
    courses: [
      {
        code: 'ACT1137',
        name: 'ACCOUNTANCY RESEARCH',
        units: 3.0,
        prerequisites: ['ACT1136'],
        year: 4,
        termId: 'y4_s1',
        termName: '4th Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1154',
        name: 'ACCOUNTING INTERNSHIP 2',
        units: 6.0,
        prerequisites: ['ACT1153'],
        year: 4,
        termId: 'y4_s1',
        termName: '4th Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'AUD1206',
        name: 'OPERATIONS AUDITING',
        units: 3.0,
        prerequisites: ['ACT1110'],
        year: 4,
        termId: 'y4_s1',
        termName: '4th Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'FLJ0107',
        name: 'FEU LEARNING JOURNEY 7',
        units: 0.0,
        prerequisites: [],
        year: 4,
        termId: 'y4_s1',
        termName: '4th Year, 1st Semester',
        semester: '1st Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      },
      {
        code: 'LAW1301',
        name: 'BUSINESS LAW AND REGULATIONS 2',
        units: 3.0,
        prerequisites: ['LAW1101'],
        year: 4,
        termId: 'y4_s1',
        termName: '4th Year, 1st Semester',
        semester: '1st Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      }
    ]
  },

  // ==========================================
  // 4TH YEAR, 2ND SEMESTER (15.0 Units) - INTEGRATION / CPA REVIEW
  // ==========================================
  {
    id: 'y4_s2',
    year: 4,
    yearLabel: '4th Year',
    semester: '2nd Semester',
    termName: '4th Year, 2nd Semester',
    totalUnits: 15.0,
    courses: [
      {
        code: 'ACT1155',
        name: 'ACCOUNTING INTEGRATION 1: Taxation',
        units: 2.0,
        prerequisites: ['ACT1154', 'TAX1102'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1156',
        name: 'ACCOUNTING INTEGRATION 2: Auditing',
        units: 2.0,
        prerequisites: ['ACT1154', 'ACT1213', 'ACT1214', 'ACT1216'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1157',
        name: 'ACCOUNTING INTEGRATION 3: Regulatory Framework for Business Transactions',
        units: 2.0,
        prerequisites: ['LAW1103', 'LAW1301', 'ACT1154', 'LAW1102'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1158',
        name: 'ACCOUNTING INTEGRATION 4: Financial Accounting and Reporting',
        units: 2.0,
        prerequisites: ['ACT1154', 'ACT1213', 'ACT1214', 'ACT1216'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1159',
        name: 'ACCOUNTING INTEGRATION 5: Advanced Financial Accounting and Reporting',
        units: 2.0,
        prerequisites: ['ACT1154', 'ACT1212', 'ACT1215'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1160',
        name: 'ACCOUNTING INTEGRATION 6: Management Advisory Services',
        units: 2.0,
        prerequisites: ['ACT1154', 'ACT1123', 'ACT1149', 'ACT1151', 'ACT1152'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'ACT1304',
        name: 'Updates in Financial Reporting Standards',
        units: 3.0,
        prerequisites: ['ACT1154', 'ACT1213', 'ACT1214', 'ACT1216'],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'iabf_major',
        isRetentionKey: true,
        status: 'planned'
      },
      {
        code: 'FLJ0108',
        name: 'FEU LEARNING JOURNEY 8',
        units: 0.0,
        prerequisites: [],
        year: 4,
        termId: 'y4_s2',
        termName: '4th Year, 2nd Semester',
        semester: '2nd Semester',
        category: 'gen_ed',
        isRetentionKey: false,
        status: 'planned'
      }
    ]
  }
]

// Degree statistics
export const TOTAL_CURRICULUM_UNITS = BS_ACCOUNTANCY_CURRICULUM.reduce(
  (sum, term) => sum + term.totalUnits,
  0
)

export const TOTAL_CURRICULUM_COURSES = BS_ACCOUNTANCY_CURRICULUM.reduce(
  (sum, term) => sum + term.courses.length,
  0
)

export const ENROLLED_TERM_UNITS = 26.0

// Helper to look up course details by code across all years
export function findCourseByCode(code: string): CurriculumCourse | undefined {
  for (const term of BS_ACCOUNTANCY_CURRICULUM) {
    const course = term.courses.find(c => c.code.toUpperCase() === code.toUpperCase())
    if (course) return course
  }
  return undefined
}

// Find all downstream courses that require this subject as a prerequisite
export function findDownstreamDependents(code: string): CurriculumCourse[] {
  const codeNorm = code.toUpperCase().trim()
  const dependents: CurriculumCourse[] = []
  for (const term of BS_ACCOUNTANCY_CURRICULUM) {
    for (const course of term.courses) {
      if (course.prerequisites.some(p => p.toUpperCase().trim() === codeNorm)) {
        dependents.push(course)
      }
    }
  }
  return dependents
}

/**
 * Returns the official Academic Year label for a curriculum year number.
 * Year 1: 2026-2027
 * Year 2: 2027-2028
 * Year 3: 2028-2029
 * Year 4: 2029-2030
 */
export function getAcademicYearForYear(year: number): string {
  switch (year) {
    case 1:
      return '2026-2027'
    case 2:
      return '2027-2028'
    case 3:
      return '2028-2029'
    case 4:
      return '2029-2030'
    default:
      return '2026-2027'
  }
}

/**
 * Look up a curriculum term by its unique ID (e.g. 'y1_s1', 'y1_s2', 'y2_s1', etc.)
 */
export function getTermById(termId: string): CurriculumTerm | undefined {
  return BS_ACCOUNTANCY_CURRICULUM.find(t => t.id === termId)
}

/**
 * Generates an editable, fully compliant Subject object from a CurriculumCourse
 */
export function generateSubjectFromCurriculumCourse(course: CurriculumCourse, term: CurriculumTerm): Subject {
  const isMajor = course.category === 'iabf_major'
  const codeClean = course.code.toLowerCase().replace(/[^a-z0-9]/g, '')
  const academicYear = getAcademicYearForYear(term.year)
  const now = new Date().toISOString()

  return {
    id: `sub_${codeClean}_${term.id}`,
    code: course.code,
    name: course.name,
    academicYear,
    semester: term.semester,
    termId: term.id,
    units: course.units,
    category: course.category,
    gradingProfileId: 'feu_iabf_accountancy',
    transmutationProfileId: isMajor ? 'feu_bsa_retention_scale' : 'feu_iabf_transmutation_scale',
    periodFormula: 'midterm_50_final_50',
    midtermWeight: 50,
    finalWeight: 50,
    isArchived: false,
    categories: [
      {
        id: `cat_${codeClean}_${term.id}_fa`,
        name: 'Formative Assessment (Seatworks, Homeworks, Quizzes)',
        weight: 50,
        calculationMethod: 'total_points',
        assessmentType: 'FA',
        isSummative: false,
        gradingPeriod: 'all',
        dropLowestCount: 0
      },
      {
        id: `cat_${codeClean}_${term.id}_mid`,
        name: isMajor ? 'Midterm Departmental Exam' : 'Midterm Summative Assessment',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'midterm'
      },
      {
        id: `cat_${codeClean}_${term.id}_fin`,
        name: isMajor ? 'Final Departmental Exam' : 'Final Summative Assessment',
        weight: 25,
        calculationMethod: 'total_points',
        assessmentType: 'SA',
        isSummative: true,
        gradingPeriod: 'final'
      }
    ],
    notes: course.description
      ? `${course.description} (${term.termName} • AY ${academicYear})`
      : `${term.termName} curriculum requirement for BS Accountancy (AY ${academicYear}).`,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Merges the official 1st Semester enrolled Block subjects with all subsequent terms' curriculum courses
 * to provide a complete 11-term, 76-subject database dataset (174.0 units).
 */
export function getAllCurriculumSubjects(firstSemesterBlockSubjects: Subject[]): Subject[] {
  const allSubjects: Subject[] = []

  for (const term of BS_ACCOUNTANCY_CURRICULUM) {
    if (term.id === 'y1_s1') {
      // Use the rich enrolled Block 109/110 subjects for 1st Year 1st Sem
      for (const sub of firstSemesterBlockSubjects) {
        allSubjects.push({
          ...sub,
          termId: 'y1_s1',
          academicYear: '2026-2027',
          semester: '1st Semester'
        })
      }
    } else {
      // Generate subjects for all subsequent curriculum terms
      for (const course of term.courses) {
        allSubjects.push(generateSubjectFromCurriculumCourse(course, term))
      }
    }
  }

  return allSubjects
}

