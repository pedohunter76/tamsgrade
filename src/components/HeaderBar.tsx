import React, { useState, useMemo } from 'react'
import {
  Building2,
  Search,
  CheckCircle2,
  ChevronDown,
  User,
  ShieldCheck,
  Command,
  SlidersHorizontal,
  Bell,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { NavTab, useGrade } from '../context/GradeContext'
import {
  BS_ACCOUNTANCY_CURRICULUM,
  getAcademicYearForYear
} from '../engine/curriculum'

interface HeaderBarProps {
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
  onOpenSearch?: () => void
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const { activeTermId, setActiveTermId, activeTerm, isDarkMode, toggleTheme } = useGrade()
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Build the complete 11-term options list from curriculum
  const termOptions = useMemo(() => {
    return BS_ACCOUNTANCY_CURRICULUM.map((term) => {
      const ay = getAcademicYearForYear(term.year)
      const semLabel = term.semester === 'Midyear Semester' ? 'Midyear Term' : term.semester
      const computedUnits = term.courses.reduce((sum, c) => sum + c.units, 0)
      let suffix = `(${computedUnits.toFixed(1)}u)`
      if (term.id === 'y1_s1') {
        suffix = `(Current • ${computedUnits.toFixed(1)}u)`
      } else if (term.year > 1) {
        suffix = `(${term.yearLabel} • ${computedUnits.toFixed(1)}u)`
      }

      return {
        id: term.id,
        year: term.year,
        yearLabel: term.yearLabel,
        label: `AY ${ay} • ${semLabel} ${suffix}`,
        shortLabel: `AY ${ay} • ${semLabel}`,
        isCurrent: term.id === 'y1_s1',
        totalUnits: computedUnits
      }
    })
  }, [])

  const currentShortLabel = `AY ${getAcademicYearForYear(activeTerm.year)} • ${
    activeTerm.semester === 'Midyear Semester' ? 'Midyear Term' : activeTerm.semester
  }`

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white dark:bg-[#131916] border-b border-[#e3e6de] dark:border-stone-800/80 sticky top-0 z-20">
        {/* Left: Term selector */}
        <div className="flex items-center gap-4">
          {/* Term Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTermDropdownOpen(!isTermDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e2e6de] dark:border-stone-700/60 bg-[#fafbfa] dark:bg-[#18201d] text-xs font-semibold text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#202b25] transition-colors shadow-2xs cursor-pointer"
            >
              <span>{currentShortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            </button>

            {isTermDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsTermDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 w-80 rounded-xl bg-white dark:bg-[#18201d] border border-[#e2e6de] dark:border-stone-700/60 shadow-xl py-1 z-50 divide-y divide-stone-100 dark:divide-stone-800 max-h-[420px] overflow-y-auto">
                  <div className="py-1">
                    {termOptions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTermId(t.id)
                          setIsTermDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          activeTermId === t.id
                            ? 'font-bold text-[#0d3824] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                        }`}
                      >
                        <span>{t.label}</span>
                        {activeTermId === t.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setActiveTab('curriculum')
                        setIsTermDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>🎓 View 4-Year Curriculum Roadmap (174.0u)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Quick Search & User Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-400" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-12 py-1.5 rounded-lg border border-[#e2e6de] dark:border-stone-700/60 bg-[#fafbfa] dark:bg-[#18201d] text-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-1 focus:ring-[#0d3824] transition-all shadow-2xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-mono text-stone-500 dark:text-stone-400">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 rounded-lg border border-[#e2e6de] dark:border-stone-700/60 bg-[#fafbfa] dark:bg-[#18201d] text-stone-600 dark:text-amber-400 hover:text-stone-900 dark:hover:text-amber-300 flex items-center justify-center transition-all shadow-2xs active-press cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Tamaraw Account Pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#e3e6de] dark:border-stone-700/60">
            <div className="text-right">
              <span className="block text-xs font-semibold text-stone-800 dark:text-stone-100 leading-tight">
                Tamaraw Account
              </span>
              <span className="block text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-400">
                {`${activeTerm.yearLabel} • ${
                  activeTerm.semester === 'Midyear Semester'
                    ? 'Midyear'
                    : activeTerm.semester.replace(' Semester', '')
                }`}
              </span>
            </div>
            <div className="w-7 h-7 rounded bg-[#0d3824] dark:bg-emerald-800 flex items-center justify-center text-white text-[11px] font-bold shadow-2xs">
              <User className="w-3.5 h-3.5 text-emerald-100" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-[#131916] border-b border-[#e2e6de] dark:border-stone-800/80 sticky top-0 z-30 shadow-2xs">
        {/* Left: Building icon & Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer active-press shrink-0"
          >
            <div className="w-8 h-8 rounded-lg border border-[#e2e6de] dark:border-stone-700/60 bg-[#fafbfa] dark:bg-[#18201d] flex items-center justify-center text-stone-800 dark:text-stone-200">
              <Building2 className="w-4 h-4 text-[#0d3824] dark:text-emerald-400" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight text-stone-900 dark:text-stone-100">
              TamsGrade
            </span>
          </button>

          {/* Interactive Mobile Term Picker Pill */}
          <button
            onClick={() => setIsTermDropdownOpen(true)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#eaf5ed] dark:bg-emerald-950/80 border border-[#cbe4d2] dark:border-emerald-800/40 text-[10px] font-mono font-bold text-[#0d3824] dark:text-emerald-300 active:scale-95 active-press transition-all cursor-pointer shrink-0 truncate max-w-[140px]"
            title="Switch Academic Term"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">
              AY {getAcademicYearForYear(activeTerm.year).slice(2, 4)}-{getAcademicYearForYear(activeTerm.year).slice(7, 9)} • {activeTerm.semester === '1st Semester' ? '1S' : activeTerm.semester === '2nd Semester' ? '2S' : 'MID'}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-500 dark:text-stone-400 shrink-0" />
          </button>
        </div>

        {/* Right: Theme Toggle, Search & IABF Avatar badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="theme-toggle-btn-mobile"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-[#e2e6de] dark:border-stone-700/60 bg-[#fafbfa] dark:bg-[#18201d] flex items-center justify-center text-stone-600 dark:text-amber-400 active-press cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (onOpenSearch) onOpenSearch()
              else setActiveTab('curriculum')
            }}
            className="w-8 h-8 rounded-lg border border-[#e2e6de] dark:border-stone-700/60 bg-[#fafbfa] dark:bg-[#18201d] flex items-center justify-center text-stone-600 dark:text-stone-300 active-press cursor-pointer"
            aria-label="Search curriculum"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-lg bg-[#0d3824] dark:bg-emerald-800 flex items-center justify-center text-white text-[10px] font-bold font-mono tracking-wider shadow-2xs">
            IABF
          </div>
        </div>
      </header>

      {/* Mobile Term Selector Bottom Sheet */}
      {isTermDropdownOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-50 bg-stone-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsTermDropdownOpen(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#141b17] rounded-t-3xl border-t border-[#e2e6de] dark:border-stone-800 shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto">
            {/* Grabber */}
            <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 block">
                  Select Academic Term
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  FEU Manila IABF &bull; BS Accountancy
                </span>
              </div>
              <button
                onClick={() => setIsTermDropdownOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                aria-label="Close term picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-1.5 divide-y divide-stone-100 dark:divide-emerald-950/40">
              {termOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTermId(t.id)
                    setIsTermDropdownOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer active-press pt-2.5 first:pt-0 ${
                    activeTermId === t.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 font-bold text-[#0d3824] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-mono">{t.label}</span>
                    <span className="block text-[10px] text-stone-500 dark:text-emerald-400/60 mt-0.5">
                      {t.yearLabel} &bull; {t.totalUnits.toFixed(1)} Academic Units
                    </span>
                  </div>
                  {activeTermId === t.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-emerald-950/50">
              <button
                onClick={() => {
                  setActiveTab('curriculum')
                  setIsTermDropdownOpen(false)
                }}
                className="w-full py-3 rounded-xl bg-[#0d3824] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 active-press cursor-pointer"
              >
                <span>🎓 View Full 4-Year Curriculum Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

