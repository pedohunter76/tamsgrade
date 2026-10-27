import React, { useState, useMemo } from 'react'
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Link2,
  ChevronRight,
  Info,
  Layers,
  X,
  FileText
} from 'lucide-react'
import {
  BS_ACCOUNTANCY_CURRICULUM,
  CurriculumCourse,
  CurriculumTerm,
  TOTAL_CURRICULUM_UNITS,
  TOTAL_CURRICULUM_COURSES,
  ENROLLED_TERM_UNITS,
  findCourseByCode,
  findDownstreamDependents
} from '../engine/curriculum'
import { useGrade } from '../context/GradeContext'

export const Curriculum: React.FC = () => {
  const { setActiveTab, setSelectedSubjectId, activeTermId, setActiveTermId } = useGrade()

  // Filters
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'iabf_major' | 'gen_ed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected course for dependency inspection modal
  const [inspectedCourse, setInspectedCourse] = useState<CurriculumCourse | null>(null)

  // Compute downstream dependents for the inspected course
  const downstreamCourses = useMemo(() => {
    if (!inspectedCourse) return []
    return findDownstreamDependents(inspectedCourse.code)
  }, [inspectedCourse])

  // Filtered terms and courses
  const filteredTerms = useMemo(() => {
    return BS_ACCOUNTANCY_CURRICULUM.map(term => {
      // Filter courses in term
      const matchesYear = selectedYear === 'all' || term.year === selectedYear
      if (!matchesYear) return null

      const matchingCourses = term.courses.filter(course => {
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
        const matchesSearch =
          !searchQuery.trim() ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          course.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          course.prerequisites.some(p => p.toLowerCase().includes(searchQuery.toLowerCase().trim()))

        return matchesCategory && matchesSearch
      })

      if (matchingCourses.length === 0 && searchQuery.trim()) {
        return null
      }

      return {
        ...term,
        courses: matchingCourses
      }
    }).filter((t): t is CurriculumTerm => t !== null)
  }, [selectedYear, selectedCategory, searchQuery])

  // Aggregate stats based on current view
  const currentViewCoursesCount = useMemo(() => {
    return filteredTerms.reduce((sum, t) => sum + t.courses.length, 0)
  }, [filteredTerms])

  const currentViewUnits = useMemo(() => {
    return filteredTerms.reduce((sum, t) => sum + t.courses.reduce((cSum, c) => cSum + c.units, 0), 0)
  }, [filteredTerms])

  return (
    <div className="space-y-6">
      {/* Top Banner / Program Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#071610] border border-[#e3e6de] dark:border-emerald-950/60 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-emerald-100/50 to-transparent dark:from-emerald-900/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f5ec] dark:bg-emerald-950/80 border border-[#cbe4d2] dark:border-emerald-800/40 text-[11px] font-bold text-[#0d3824] dark:text-emerald-300 font-mono tracking-wider uppercase">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>FEU MANILA IABF &bull; BS ACCOUNTANCY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-emerald-50 tracking-tight">
              Official 4-Year Academic Curriculum Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 max-w-2xl leading-relaxed">
              Complete degree sequence covering 11 academic terms (1st to 4th Year and Midyears), totaling{' '}
              <strong className="text-stone-900 dark:text-white font-semibold">174.0 Units</strong>. Includes
              prerequisite chains and FEU IABF retention standards.
            </p>
          </div>

          {/* Quick jump to active enrolled term */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-emerald-950/60">
            <span className="text-[11px] font-mono font-medium text-stone-500 dark:text-emerald-400">
              Active Term:
            </span>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0f3d28] text-white text-xs font-bold font-mono tracking-wide shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1st Year &bull; 1st Sem (26.0u)</span>
            </div>
          </div>
        </div>

        {/* 4 Key Program Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#f0f2eb] dark:border-emerald-950/50">
          <div className="p-3.5 rounded-xl bg-[#f8faf6] dark:bg-[#0a2016] border border-[#e2e8de] dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/80 font-mono">
              TOTAL DEGREE UNITS
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#0d3824] dark:text-emerald-300 mt-1">
              {TOTAL_CURRICULUM_UNITS.toFixed(1)} <span className="text-xs font-sans font-medium text-stone-500">units</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 mt-0.5">
              11 terms (8 sem + 3 midyears)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8faf6] dark:bg-[#0a2016] border border-[#e2e8de] dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/80 font-mono">
              CURRENTLY ENROLLED
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {ENROLLED_TERM_UNITS.toFixed(1)} <span className="text-xs font-sans font-medium text-stone-500">units</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 mt-0.5">
              10 subjects enrolled in 1st Semester
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8faf6] dark:bg-[#0a2016] border border-[#e2e8de] dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/80 font-mono">
              REMAINING UNITS
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-800 dark:text-stone-200 mt-1">
              {(TOTAL_CURRICULUM_UNITS - ENROLLED_TERM_UNITS).toFixed(1)}{' '}
              <span className="text-xs font-sans font-medium text-stone-500">units</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 mt-0.5">
              66 planned subjects to graduate
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8faf6] dark:bg-[#0a2016] border border-[#e2e8de] dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400/80 font-mono">
              RETENTION STANDARD
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-amber-700 dark:text-amber-400 mt-1">
              2.50 <span className="text-xs font-sans font-medium text-stone-500">(C+ / 75%)</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 mt-0.5">
              Required for all ACT/TAX/LAW/AUD
            </p>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#071610] border border-[#e3e6de] dark:border-emerald-950/60 shadow-2xs space-y-4">
        {/* Year Pills Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-600 dark:text-emerald-300 font-mono uppercase mr-2">
            Academic Year:
          </span>
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedYear === 'all'
                ? 'bg-[#0f3d28] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-[#0d261b] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-emerald-950/60'
            }`}
          >
            All 4 Years (11 Terms)
          </button>
          {[1, 2, 3, 4].map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === yr
                  ? 'bg-[#0f3d28] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-[#0d261b] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-emerald-950/60'
              }`}
            >
              Year {yr}
              {yr === 1 && ' (61.0u)'}
              {yr === 2 && ' (52.0u)'}
              {yr === 3 && ' (51.0u)'}
              {yr === 4 && ' (30.0u)'}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#f0f2eb] dark:border-emerald-950/40">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-emerald-400/60" />
            <input
              type="text"
              placeholder="Search by code (e.g. ACT1122, TAX, LAW) or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-[#e2e6de] dark:border-emerald-900/50 bg-[#fafbfa] dark:bg-[#0a2016] text-xs text-stone-800 dark:text-emerald-100 placeholder:text-stone-400 dark:placeholder:text-emerald-500/50 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-emerald-300 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-stone-800 text-white dark:bg-emerald-800 dark:text-emerald-50'
                  : 'bg-stone-100 dark:bg-[#0a2016] text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedCategory('iabf_major')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === 'iabf_major'
                  ? 'bg-[#0f3d28] text-white dark:bg-[#154d33]'
                  : 'bg-stone-100 dark:bg-[#0a2016] text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              IABF Majors Only
            </button>
            <button
              onClick={() => setSelectedCategory('gen_ed')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === 'gen_ed'
                  ? 'bg-stone-700 text-white dark:bg-stone-700'
                  : 'bg-stone-100 dark:bg-[#0a2016] text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              General Education
            </button>
          </div>
        </div>
      </div>

      {/* Showing Results Summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-emerald-400/80 px-1 font-mono">
        <span>
          Showing {currentViewCoursesCount} courses across {filteredTerms.length} terms ({currentViewUnits.toFixed(1)} units)
        </span>
        {searchQuery && (
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            Filtered by: &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* Term-by-Term Section Cards */}
      <div className="space-y-6">
        {filteredTerms.map(term => {
          const isCurrentTerm = term.id === 'y1_s1'
          const termUnits = term.courses.reduce((sum, c) => sum + c.units, 0)

          return (
            <div
              key={term.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCurrentTerm
                  ? 'bg-white dark:bg-[#071610] border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-[#071610] border-[#e3e6de] dark:border-emerald-950/60 shadow-2xs'
              }`}
            >
              {/* Term Header */}
              <div
                className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                  isCurrentTerm
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
                    : 'bg-[#fafbfa] dark:bg-[#091e14] border-[#e3e6de] dark:border-emerald-950/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-sm ${
                      isCurrentTerm
                        ? 'bg-[#0f3d28] text-white shadow-xs'
                        : 'bg-stone-200 dark:bg-[#0d2a1d] text-stone-700 dark:text-emerald-300'
                    }`}
                  >
                    Y{term.year}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
                        {term.termName}
                      </h2>
                      {isCurrentTerm && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono uppercase tracking-wider shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ENROLLED TERM</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 dark:text-emerald-400/70">
                      {term.courses.length} subjects planned
                    </span>
                  </div>
                </div>

                {/* Term Unit Badge & Quick Activate */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-[#0c2419] border border-stone-200 dark:border-emerald-900/40 text-xs font-mono font-bold text-stone-800 dark:text-emerald-200">
                    {termUnits.toFixed(1)} UNITS TOTAL
                  </div>
                  <button
                    onClick={() => {
                      setActiveTermId(term.id)
                      setActiveTab('dashboard')
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTermId === term.id
                        ? 'bg-[#0d3824] text-white shadow-2xs'
                        : 'bg-white dark:bg-[#0c2419] border border-[#e2e6de] dark:border-emerald-900/60 text-stone-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <span>{activeTermId === term.id ? 'Active Dashboard' : 'Open in Dashboard'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Courses List */}
              <div className="divide-y divide-stone-100 dark:divide-emerald-950/40">
                {term.courses.map(course => {
                  const hasPrereq = course.prerequisites.length > 0
                  const isMajor = course.category === 'iabf_major'

                  return (
                    <div
                      key={course.code}
                      className="p-4 sm:px-6 hover:bg-[#fafbfa] dark:hover:bg-[#091e14] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                    >
                      {/* Left: Code, Name, Category */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs sm:text-sm text-[#0d3824] dark:text-emerald-300 bg-stone-100 dark:bg-[#0c261b] px-2 py-0.5 rounded border border-stone-200 dark:border-emerald-900/50">
                            {course.code}
                          </span>

                          <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {course.name}
                          </span>

                          {course.isRetentionKey && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>RETENTION KEY (2.50)</span>
                            </span>
                          )}

                          {isMajor ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#e8f5ec] dark:bg-emerald-950/60 text-[#0d3824] dark:text-emerald-300 border border-[#cbe4d2] dark:border-emerald-800/40">
                              IABF Major
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
                              Gen Ed
                            </span>
                          )}
                        </div>

                        {/* Prerequisites indicator */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-emerald-400/80">
                          {hasPrereq ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-medium text-stone-400">Prerequisites:</span>
                              {course.prerequisites.map(pr => (
                                <button
                                  key={pr}
                                  onClick={() => {
                                    const found = findCourseByCode(pr)
                                    if (found) setInspectedCourse(found)
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 font-mono text-[11px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                                  title={`Click to inspect ${pr}`}
                                >
                                  <Link2 className="w-2.5 h-2.5" />
                                  <span>{pr}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-400 dark:text-stone-500 italic">
                              No prerequisites required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Units, Status, Inspect Action */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-emerald-950/30">
                        {/* Units Badge */}
                        <div className="text-right">
                          <span className="block text-xs font-mono font-bold text-stone-800 dark:text-emerald-100">
                            {course.units.toFixed(1)} UNITS
                          </span>
                          <span className="block text-[10px] text-stone-400 dark:text-emerald-500/70">
                            {course.units === 0 ? 'Non-academic' : 'Credited'}
                          </span>
                        </div>

                        {/* Status */}
                        {course.status === 'enrolled' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>ENROLLED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 text-[11px] font-mono">
                            PLANNED
                          </span>
                        )}

                        {/* Inspect Lineage Button */}
                        <button
                          onClick={() => setInspectedCourse(course)}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-emerald-900/40 text-stone-500 hover:text-stone-800 dark:hover:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-950/60 transition-colors"
                          title="Inspect prerequisites and unlocks"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filteredTerms.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#071610] border border-dashed border-stone-300 dark:border-emerald-900/60">
            <BookOpen className="w-10 h-10 text-stone-400 dark:text-emerald-400/60 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-800 dark:text-emerald-100">
              No curriculum subjects match your search
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Try searching for course codes like ACT1101, LAW1101, TAX1101, or clear the search filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedYear('all')
                setSelectedCategory('all')
              }}
              className="mt-4 px-3 py-1.5 rounded-lg bg-[#0f3d28] text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Interactive Prerequisite & Unlock Lineage Modal */}
      {inspectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#071610] rounded-2xl border border-[#e3e6de] dark:border-emerald-900/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e3e6de] dark:border-emerald-950/60 flex items-center justify-between bg-[#fafbfa] dark:bg-[#091e14]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0f3d28] text-white flex items-center justify-center font-mono font-bold text-xs">
                  {inspectedCourse.code.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#0d3824] dark:text-emerald-300">
                      {inspectedCourse.code}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300">
                      {inspectedCourse.units.toFixed(1)} Units
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                    {inspectedCourse.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setInspectedCourse(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-emerald-200 hover:bg-stone-100 dark:hover:bg-emerald-950/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Term & Placement */}
              <div className="p-3.5 rounded-xl bg-[#f8faf6] dark:bg-[#0a2016] border border-[#e2e8de] dark:border-emerald-900/40 text-xs space-y-1">
                <div className="font-bold text-stone-800 dark:text-emerald-200">
                  Curriculum Placement: {inspectedCourse.termName}
                </div>
                <p className="text-stone-600 dark:text-emerald-300/80 text-[11px]">
                  Category: {inspectedCourse.category === 'iabf_major' ? 'IABF Accountancy Professional Major' : 'General Education'}
                </p>
                {inspectedCourse.isRetentionKey && (
                  <p className="text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>BSA Retention Policy: Minimum transmuted grade of 2.50 (C+ / 75%) required.</span>
                  </p>
                )}
              </div>

              {/* Direct Prerequisites Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-stone-500 dark:text-emerald-400/80">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>DIRECT PREREQUISITES REQUIRED TO ENROLL:</span>
                </div>

                {inspectedCourse.prerequisites.length > 0 ? (
                  <div className="space-y-2">
                    {inspectedCourse.prerequisites.map(pr => {
                      const prereqCourse = findCourseByCode(pr)
                      return (
                        <div
                          key={pr}
                          className="p-3 rounded-xl border border-stone-200 dark:border-emerald-900/40 bg-stone-50 dark:bg-[#0c2419] flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-xs text-stone-900 dark:text-emerald-200">
                              {pr}
                            </span>
                            <span className="block text-xs text-stone-600 dark:text-stone-300">
                              {prereqCourse ? prereqCourse.name : 'Prerequisite Subject'}
                            </span>
                          </div>
                          {prereqCourse && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              {prereqCourse.termName}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0c2419] border border-stone-200 dark:border-emerald-900/30 text-xs text-stone-500 dark:text-emerald-400/70 italic">
                    This subject has no prerequisite courses. Can be enrolled directly in {inspectedCourse.termName}.
                  </div>
                )}
              </div>

              {/* Downstream Unlocks Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-stone-500 dark:text-emerald-400/80">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>FUTURE COURSES UNLOCKED BY THIS SUBJECT ({downstreamCourses.length}):</span>
                </div>

                {downstreamCourses.length > 0 ? (
                  <div className="space-y-2">
                    {downstreamCourses.map(dep => (
                      <div
                        key={dep.code}
                        className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#0d2a1d]/60 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300">
                              {dep.code}
                            </span>
                            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                              {dep.units.toFixed(1)}u
                            </span>
                          </div>
                          <span className="block text-xs font-medium text-stone-800 dark:text-stone-200">
                            {dep.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60">
                          {dep.termName}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0c2419] border border-stone-200 dark:border-emerald-900/30 text-xs text-stone-500 dark:text-emerald-400/70 italic">
                    Terminal subject in the curriculum sequence. Does not serve as a prerequisite for downstream courses.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#e3e6de] dark:border-emerald-950/60 bg-[#fafbfa] dark:bg-[#091e14] flex justify-end">
              <button
                onClick={() => setInspectedCourse(null)}
                className="px-4 py-2 rounded-xl bg-[#0f3d28] text-white text-xs font-semibold shadow-xs hover:bg-[#134931] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
