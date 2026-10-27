import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import {
  Subject,
  Assessment,
  TransmutationProfile,
  UserPreferences,
  SubjectGradeResult
} from '../engine/types'
import {
  db,
  initializeDatabase,
  DEFAULT_PREFERENCES,
  clearAllUserData,
  loadFirstSemesterSubjects
} from '../db/db'
import { calculateSubjectGrade } from '../engine/calculator'
import { validateBackupJson, BackupData } from '../engine/validation'
import {
  CurriculumTerm,
  BS_ACCOUNTANCY_CURRICULUM,
  getAcademicYearForYear
} from '../engine/curriculum'

export type NavTab = 'dashboard' | 'subjects' | 'curriculum' | 'calculator' | 'simulator' | 'target' | 'guide' | 'settings'

interface GradeContextType {
  activeTermId: string
  setActiveTermId: (termId: string) => void
  activeTerm: CurriculumTerm
  allSubjects: Subject[]
  subjects: Subject[]
  assessments: Assessment[]
  transmutationProfiles: TransmutationProfile[]
  preferences: UserPreferences
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
  selectedSubjectId: string | null
  setSelectedSubjectId: (id: string | null) => void
  isLoading: boolean

  // Grade results cache
  gradeResults: Map<string, SubjectGradeResult>
  getSubjectResult: (subjectId: string) => SubjectGradeResult | undefined

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>
  deleteSubject: (id: string) => Promise<void>
  duplicateSubject: (id: string) => Promise<string>
  archiveSubject: (id: string, isArchived: boolean) => Promise<void>

  // Assessment Actions
  addAssessment: (assessment: Omit<Assessment, 'id'>) => Promise<string>
  updateAssessment: (id: string, updates: Partial<Assessment>) => Promise<void>
  deleteAssessment: (id: string) => Promise<void>

  // Profile Actions
  addTransmutationProfile: (profile: Omit<TransmutationProfile, 'id'>) => Promise<string>
  updateTransmutationProfile: (id: string, updates: Partial<TransmutationProfile>) => Promise<void>

  // Preferences & System
  isDarkMode: boolean
  toggleTheme: () => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  resetAll: () => Promise<void>
  reloadSamples: () => Promise<void>
  loadFirstSemesterSubjects: () => Promise<void>
  exportData: () => BackupData
  importData: (jsonStr: string) => Promise<{ success: boolean; message: string }>
}

const GradeContext = createContext<GradeContextType | undefined>(undefined)

export const GradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [activeTermId, setActiveTermIdState] = useState<string>('y1_s1')
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [transmutationProfiles, setTransmutationProfiles] = useState<TransmutationProfile[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Current active term object
  const activeTerm = useMemo(() => {
    return BS_ACCOUNTANCY_CURRICULUM.find(t => t.id === activeTermId) || BS_ACCOUNTANCY_CURRICULUM[0]
  }, [activeTermId])

  // Filter subjects for the currently active academic term
  const subjects = useMemo(() => {
    return allSubjects.filter(s => (s.termId || 'y1_s1') === activeTermId)
  }, [allSubjects, activeTermId])

  // Switch academic term across all pages
  const setActiveTermId = useCallback(async (newTermId: string) => {
    setActiveTermIdState(newTermId)
    const targetTerm = BS_ACCOUNTANCY_CURRICULUM.find(t => t.id === newTermId)
    if (targetTerm) {
      const ay = getAcademicYearForYear(targetTerm.year)
      await db.preferences.update('user_preferences', {
        activeTermId: newTermId,
        defaultAcademicYear: ay,
        defaultSemester: targetTerm.semester
      })
      setPreferences(prev => ({
        ...prev,
        activeTermId: newTermId,
        defaultAcademicYear: ay,
        defaultSemester: targetTerm.semester
      }))
    }
    const termSubjects = allSubjects.filter(s => (s.termId || 'y1_s1') === newTermId)
    if (termSubjects.length > 0) {
      setSelectedSubjectId(termSubjects[0].id)
    } else {
      setSelectedSubjectId(null)
    }
  }, [allSubjects])

  // Load from Dexie on mount
  const refreshData = useCallback(async () => {
    try {
      await initializeDatabase()
      const subs = await db.subjects.toArray()
      const asms = await db.assessments.toArray()
      const profs = await db.transmutationProfiles.toArray()
      const prefsRecord = await db.preferences.get('user_preferences')

      setAllSubjects(subs)
      setAssessments(asms)
      setTransmutationProfiles(profs)
      if (prefsRecord) {
        const savedLocalTheme = localStorage.getItem('tamsgrade_theme')
        const activeTheme: 'light' | 'dark' = savedLocalTheme === 'dark' ? 'dark' : (savedLocalTheme === 'light' ? 'light' : 'light')
        localStorage.setItem('tamsgrade_theme', activeTheme)
        if (activeTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        setPreferences({ ...prefsRecord, theme: activeTheme })
        if (prefsRecord.activeTermId) {
          setActiveTermIdState(prefsRecord.activeTermId)
        }
      } else {
        const savedLocalTheme = localStorage.getItem('tamsgrade_theme')
        const activeTheme: 'light' | 'dark' = savedLocalTheme === 'dark' ? 'dark' : 'light'
        localStorage.setItem('tamsgrade_theme', activeTheme)
        if (activeTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        setPreferences(prev => ({ ...prev, theme: activeTheme }))
      }

      const initialTerm = prefsRecord?.activeTermId || 'y1_s1'
      const currentTermSubs = subs.filter(s => (s.termId || 'y1_s1') === initialTerm)
      if (currentTermSubs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(currentTermSubs[0].id)
      }
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSubjectId])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Track dark mode directly
  const isDarkMode = useMemo(() => {
    return preferences.theme === 'dark'
  }, [preferences.theme])

  // Sync theme with DOM
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [preferences.theme])

  // Quick 1-tap theme toggle
  const toggleTheme = useCallback(async () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark') || preferences.theme === 'dark'
    const nextTheme: 'light' | 'dark' = isCurrentlyDark ? 'light' : 'dark'
    localStorage.setItem('tamsgrade_theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    const newPrefs = { ...preferences, theme: nextTheme }
    await db.preferences.put({ id: 'user_preferences', ...newPrefs })
    setPreferences(newPrefs)
  }, [preferences])

  // Compute grade results for all subjects across all terms
  const gradeResults = useMemo(() => {
    const map = new Map<string, SubjectGradeResult>()
    for (const sub of allSubjects) {
      const subAssessments = assessments.filter(a => a.subjectId === sub.id)
      const transProfile = transmutationProfiles.find(p => p.id === sub.transmutationProfileId)
      const result = calculateSubjectGrade(sub, subAssessments, transProfile, preferences.treatMissingAsZero)
      map.set(sub.id, result)
    }
    return map
  }, [allSubjects, assessments, transmutationProfiles, preferences.treatMissingAsZero])

  const getSubjectResult = useCallback(
    (subjectId: string) => gradeResults.get(subjectId),
    [gradeResults]
  )

  // Subject Actions
  const addSubject = async (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const now = new Date().toISOString()
    const newSubject: Subject = {
      ...data,
      id: newId,
      termId: data.termId || activeTermId,
      academicYear: data.academicYear || getAcademicYearForYear(activeTerm.year),
      semester: data.semester || activeTerm.semester,
      createdAt: now,
      updatedAt: now
    }
    await db.subjects.add(newSubject)
    setAllSubjects(prev => [...prev, newSubject])
    setSelectedSubjectId(newId)
    return newId
  }

  const updateSubject = async (id: string, updates: Partial<Subject>): Promise<void> => {
    const now = new Date().toISOString()
    const payload = { ...updates, updatedAt: now }
    await db.subjects.update(id, payload)
    setAllSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...payload } : s)))
  }

  const deleteSubject = async (id: string): Promise<void> => {
    await db.subjects.delete(id)
    await db.assessments.where('subjectId').equals(id).delete()
    setAllSubjects(prev => prev.filter(s => s.id !== id))
    setAssessments(prev => prev.filter(a => a.subjectId !== id))
    if (selectedSubjectId === id) {
      const remaining = allSubjects.filter(s => s.id !== id && (s.termId || 'y1_s1') === activeTermId)
      setSelectedSubjectId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const duplicateSubject = async (id: string): Promise<string> => {
    const target = allSubjects.find(s => s.id === id)
    if (!target) throw new Error('Subject not found')

    const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const now = new Date().toISOString()

    // Map old category ids to new category ids
    const catIdMap = new Map<string, string>()
    const duplicatedCategories = target.categories.map(c => {
      const newCatId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      catIdMap.set(c.id, newCatId)
      return { ...c, id: newCatId }
    })

    const duplicatedSubject: Subject = {
      ...target,
      id: newId,
      code: `${target.code} (Copy)`,
      name: `${target.name} (Copy)`,
      categories: duplicatedCategories,
      createdAt: now,
      updatedAt: now
    }

    // Duplicate assessments
    const targetAssessments = assessments.filter(a => a.subjectId === id)
    const duplicatedAssessments: Assessment[] = targetAssessments.map(a => ({
      ...a,
      id: `asm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subjectId: newId,
      categoryId: catIdMap.get(a.categoryId) || a.categoryId
    }))

    await db.subjects.add(duplicatedSubject)
    if (duplicatedAssessments.length > 0) {
      await db.assessments.bulkAdd(duplicatedAssessments)
    }

    setAllSubjects(prev => [...prev, duplicatedSubject])
    setAssessments(prev => [...prev, ...duplicatedAssessments])
    setSelectedSubjectId(newId)
    return newId
  }

  const archiveSubject = async (id: string, isArchived: boolean): Promise<void> => {
    await updateSubject(id, { isArchived })
  }

  // Assessment Actions
  const addAssessment = async (data: Omit<Assessment, 'id'>): Promise<string> => {
    const newId = `asm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newAssessment: Assessment = { ...data, id: newId }
    await db.assessments.add(newAssessment)
    setAssessments(prev => [...prev, newAssessment])
    return newId
  }

  const updateAssessment = async (id: string, updates: Partial<Assessment>): Promise<void> => {
    await db.assessments.update(id, updates)
    setAssessments(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)))
  }

  const deleteAssessment = async (id: string): Promise<void> => {
    await db.assessments.delete(id)
    setAssessments(prev => prev.filter(a => a.id !== id))
  }

  // Profile Actions
  const addTransmutationProfile = async (
    data: Omit<TransmutationProfile, 'id'>
  ): Promise<string> => {
    const newId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newProfile: TransmutationProfile = { ...data, id: newId }
    await db.transmutationProfiles.add(newProfile)
    setTransmutationProfiles(prev => [...prev, newProfile])
    return newId
  }

  const updateTransmutationProfile = async (
    id: string,
    updates: Partial<TransmutationProfile>
  ): Promise<void> => {
    await db.transmutationProfiles.update(id, updates)
    setTransmutationProfiles(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)))
  }

  // Preferences & System
  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<void> => {
    if (updates.theme) {
      localStorage.setItem('tamsgrade_theme', updates.theme)
      if (updates.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    const newPrefs = { ...preferences, ...updates }
    await db.preferences.put({ id: 'user_preferences', ...newPrefs })
    setPreferences(newPrefs)
  }

  const resetAll = async (): Promise<void> => {
    await clearAllUserData()
    setAllSubjects([])
    setAssessments([])
    setSelectedSubjectId(null)
    const profs = await db.transmutationProfiles.toArray()
    setTransmutationProfiles(profs)
  }

  const reloadSamples = async (): Promise<void> => {
    await loadFirstSemesterSubjects()
    await refreshData()
  }

  const exportData = (): BackupData => {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      subjects: allSubjects,
      assessments,
      transmutationProfiles,
      preferences
    }
  }

  const importData = async (jsonStr: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonStr)
      const validation = validateBackupJson(parsed)
      if (!validation.isValid || !validation.sanitizedData) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join('; ')}`
        }
      }

      const { sanitizedData } = validation
      await db.transaction('rw', [db.subjects, db.assessments, db.transmutationProfiles, db.preferences], async () => {
        await db.subjects.clear()
        await db.assessments.clear()
        await db.transmutationProfiles.clear()

        if (sanitizedData.subjects.length > 0) {
          await db.subjects.bulkAdd(sanitizedData.subjects)
        }
        if (sanitizedData.assessments.length > 0) {
          await db.assessments.bulkAdd(sanitizedData.assessments)
        }
        if (sanitizedData.transmutationProfiles.length > 0) {
          await db.transmutationProfiles.bulkAdd(sanitizedData.transmutationProfiles)
        }
        if (sanitizedData.preferences) {
          await db.preferences.put({ id: 'user_preferences', ...sanitizedData.preferences })
        }
      })

      await refreshData()
      return {
        success: true,
        message: `Successfully imported ${sanitizedData.subjects.length} subjects and ${sanitizedData.assessments.length} assessment records.`
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error'
      return {
        success: false,
        message: `Import error: ${errorMsg}`
      }
    }
  }

  const value: GradeContextType = {
    activeTermId,
    setActiveTermId,
    activeTerm,
    allSubjects,
    subjects,
    assessments,
    transmutationProfiles,
    preferences,
    activeTab,
    setActiveTab,
    selectedSubjectId,
    setSelectedSubjectId,
    isLoading,
    gradeResults,
    getSubjectResult,
    addSubject,
    updateSubject,
    deleteSubject,
    duplicateSubject,
    archiveSubject,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    addTransmutationProfile,
    updateTransmutationProfile,
    isDarkMode,
    toggleTheme,
    updatePreferences,
    resetAll,
    reloadSamples,
    loadFirstSemesterSubjects: async () => {
      await loadFirstSemesterSubjects()
      await refreshData()
    },
    exportData,
    importData
  }

  return <GradeContext.Provider value={value}>{children}</GradeContext.Provider>
}

export function useGrade(): GradeContextType {
  const context = useContext(GradeContext)
  if (!context) {
    throw new Error('useGrade must be used within a GradeProvider')
  }
  return context
}
