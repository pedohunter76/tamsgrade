import React, { useState } from 'react'
import {
  Building2,
  BookOpen,
  Calculator,
  Sliders,
  Target,
  GraduationCap,
  Settings,
  ShieldCheck,
  Scale,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Plus,
  Sun,
  Moon
} from 'lucide-react'
import { useGrade, NavTab } from '../context/GradeContext'

interface NavItem {
  id: NavTab
  label: string
  mobileLabel: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Dashboard', icon: Building2 },
  { id: 'subjects', label: 'My Subjects', mobileLabel: 'Courses', icon: BookOpen },
  { id: 'curriculum', label: 'Curriculum Roadmap', mobileLabel: 'Roadmap', icon: GraduationCap },
  { id: 'calculator', label: 'Grade Calculator', mobileLabel: 'Transmute', icon: Calculator },
  { id: 'simulator', label: 'What-If Simulator', mobileLabel: 'What-If', icon: Sliders },
  { id: 'target', label: 'What Score Do I Need?', mobileLabel: 'Solver', icon: Target },
  { id: 'guide', label: 'Grading Guide', mobileLabel: 'Rubrics', icon: Scale },
  { id: 'settings', label: 'Settings', mobileLabel: 'Config', icon: Settings },
]

// 4 Primary Mobile Tabs + More drawer
const PRIMARY_MOBILE_TABS: NavTab[] = ['dashboard', 'subjects', 'simulator', 'target']

export const Navigation: React.FC<{ onOpenAddSubject: () => void }> = ({ onOpenAddSubject }) => {
  const { activeTab, setActiveTab, isDarkMode, toggleTheme } = useGrade()
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false)

  const isMoreActive = !PRIMARY_MOBILE_TABS.includes(activeTab)

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#131916] text-stone-900 dark:text-stone-100 border-r border-[#e3e6de] dark:border-stone-800/80 shrink-0 select-none relative z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#e3e6de] dark:border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold tracking-tight text-xl text-stone-900 dark:text-stone-100">
              TAMSGRADE
            </span>
          </div>
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-1">
            FEU IABF &bull; BS Accountancy
          </p>
        </div>

        {/* Institutional Modules List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-400">
            INSTITUTIONAL MODULES
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group active-press ${
                    isActive
                      ? 'bg-[#0f3d28] dark:bg-[#154d33] text-white shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-[#f4f7f2] dark:hover:bg-[#1a241f] hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-stone-500 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-100'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar with Safe Area Support */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071610]/95 backdrop-blur-md border-t border-[#e3e6de] dark:border-emerald-950/60 shadow-lg px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 items-center">
          {PRIMARY_MOBILE_TABS.map((tabId) => {
            const item = NAV_ITEMS.find(n => n.id === tabId)!
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMoreDrawerOpen(false)
                }}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl min-h-[46px] transition-all active:scale-90 active-press select-none cursor-pointer ${
                  isActive
                    ? 'text-[#0d3824] dark:text-emerald-300 font-bold'
                    : 'text-stone-500 dark:text-emerald-400/60 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-100 dark:bg-emerald-950/90' : ''}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0d3824] dark:text-emerald-300' : ''}`} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.mobileLabel}</span>
              </button>
            )
          })}

          {/* 5th Tab: "More ☰" Button */}
          <button
            onClick={() => setIsMoreDrawerOpen(!isMoreDrawerOpen)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl min-h-[46px] transition-all active:scale-90 active-press select-none cursor-pointer ${
              isMoreActive || isMoreDrawerOpen
                ? 'text-[#0d3824] dark:text-emerald-300 font-bold'
                : 'text-stone-500 dark:text-emerald-400/60 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isMoreActive || isMoreDrawerOpen ? 'bg-emerald-100 dark:bg-emerald-950/90' : ''}`}>
              <Menu className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {isMoreActive ? NAV_ITEMS.find(n => n.id === activeTab)?.mobileLabel || 'More' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer (Slide-up Sheet) */}
      {isMoreDrawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-stone-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMoreDrawerOpen(false)}
          />

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#141b17] rounded-t-3xl border-t border-[#e2e6de] dark:border-stone-800 shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto">
            {/* Grabber handle */}
            <div className="w-12 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 block">
                  More Features
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  FEU Manila IABF Modules
                </span>
              </div>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-1.5">
              {[
                { id: 'curriculum', label: 'Curriculum Roadmap', desc: '174.0 Total Academic Units (4-Year)', icon: GraduationCap },
                { id: 'calculator', label: 'Grade Transmutation Calculator', desc: 'Convert raw percentage to FEU Quality Points', icon: Calculator },
                { id: 'guide', label: 'Grading Guide & Regulations', desc: 'Official letter scale, QPA retention, UNRA/PNRA', icon: Scale },
                { id: 'settings', label: 'System Settings', desc: 'Theme, zero-telemetry & precision preferences', icon: Settings }
              ].map((m) => {
                const Icon = m.icon
                const isSelected = activeTab === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveTab(m.id as NavTab)
                      setIsMoreDrawerOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer active-press ${
                      isSelected
                        ? 'bg-[#0f3d28] dark:bg-[#154d33] text-white shadow-xs'
                        : 'bg-[#fafbfa] dark:bg-[#18201d] border border-[#e8ece4] dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#202b25]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/70 text-[#0d3824] dark:text-emerald-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold text-xs">{m.label}</span>
                        <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-stone-500 dark:text-stone-400'}`}>
                          {m.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                  </button>
                )
              })}
            </div>

            {/* Theme Mode Toggle in Drawer */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <button
                onClick={() => toggleTheme()}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#fafbfa] dark:bg-[#18201d] border border-[#e8ece4] dark:border-stone-700/60 text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#223028] transition-all cursor-pointer active-press"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="block font-bold text-xs">{isDarkMode ? 'Theme: Dark Mode' : 'Theme: Light Mode'}</span>
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {isDarkMode ? 'Tap to switch to crisp Light UI' : 'Tap to switch to refined Dark Mode'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Quick Enroll Subject Action */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false)
                  onOpenAddSubject()
                }}
                className="w-full py-3 rounded-xl bg-[#0d3824] hover:bg-[#11462e] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs active-press cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Enroll New Custom Course</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
