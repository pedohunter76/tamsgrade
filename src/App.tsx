import React, { useState, useEffect, Suspense, lazy } from 'react'
import { GradeProvider, useGrade } from './context/GradeContext'
import { Navigation } from './components/Navigation'
import { HeaderBar } from './components/HeaderBar'
import { OfflineBanner } from './components/OfflineBanner'
import { SubjectModal } from './components/SubjectModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import { skipWaitingAndReload } from './pwa'
import { Loader2, AlertTriangle, X, RotateCcw, Sparkles } from 'lucide-react'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

// Code-split pages for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Subjects = lazy(() => import('./pages/Subjects').then(m => ({ default: m.Subjects })))
const Curriculum = lazy(() => import('./pages/Curriculum').then(m => ({ default: m.Curriculum })))
const GradeCalculator = lazy(() => import('./pages/GradeCalculator').then(m => ({ default: m.GradeCalculator })))
const WhatIfSimulator = lazy(() => import('./pages/WhatIfSimulator').then(m => ({ default: m.WhatIfSimulator })))
const RequiredScore = lazy(() => import('./pages/RequiredScore').then(m => ({ default: m.RequiredScore })))
const GradingGuide = lazy(() => import('./pages/GradingGuide').then(m => ({ default: m.GradingGuide })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))

const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-500 dark:text-stone-400 gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-[#0d3824] dark:text-emerald-400" />
    <span className="text-xs font-semibold tracking-wider uppercase font-mono">Loading TamsGrade...</span>
  </div>
)

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, addSubject, dbError, clearDbError, undoAction, dismissUndo, exportData } = useGrade()
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)

  useEffect(() => {
    const handleSwUpdate = () => setSwUpdateAvailable(true)
    window.addEventListener('tamsgrade:sw-update', handleSwUpdate)
    return () => window.removeEventListener('tamsgrade:sw-update', handleSwUpdate)
  }, [])

  const handleExportDataShortcut = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tamsgrade_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts({
    activeTab,
    setActiveTab,
    onOpenAddSubject: () => setIsAddSubjectModalOpen(true),
    onExportData: handleExportDataShortcut
  })

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenAddSubject={() => setIsAddSubjectModalOpen(true)} />
      case 'subjects':
        return <Subjects />
      case 'curriculum':
        return <Curriculum />
      case 'calculator':
        return <GradeCalculator />
      case 'simulator':
        return <WhatIfSimulator />
      case 'target':
        return <RequiredScore />
      case 'guide':
        return <GradingGuide />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onOpenAddSubject={() => setIsAddSubjectModalOpen(true)} />
    }
  }

  return (
    <div className="flex h-screen bg-[#f8f9f5] dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 overflow-hidden font-sans">
      {/* Navigation (Desktop Sidebar & Mobile Bottom Bar) */}
      <Navigation onOpenAddSubject={() => setIsAddSubjectModalOpen(true)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Desktop & Mobile) */}
        <HeaderBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Offline Connectivity Banner */}
        <OfflineBanner />

        {/* Database Error Banner */}
        {dbError && (
          <div
            role="alert"
            className="mx-4 sm:mx-8 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-between text-rose-800 dark:text-rose-200 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="truncate">
                <strong>Storage Notice:</strong> {dbError}. Check if private browsing is blocking local database storage.
              </span>
            </div>
            <button
              type="button"
              onClick={clearDbError}
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded text-rose-600 dark:text-rose-400"
              aria-label="Dismiss storage notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <div key={activeTab} className="page-transition">
                  {renderActiveScreen()}
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Add Subject Global Modal */}
      {isAddSubjectModalOpen && (
        <SubjectModal
          isOpen={isAddSubjectModalOpen}
          onClose={() => setIsAddSubjectModalOpen(false)}
          onSave={async (subjectData) => {
            await addSubject(subjectData)
          }}
        />
      )}

      {/* Floating Notifications: Undo & PWA Updates */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {swUpdateAvailable && (
          <aside
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-center gap-3 p-3.5 bg-[#0d3824] text-white rounded-xl shadow-2xl border border-emerald-500/30 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3"
          >
            <Sparkles className="w-5 h-5 shrink-0 text-amber-300" />
            <div className="flex-1">
              <p className="font-semibold text-white">App Update Available</p>
              <p className="text-[11px] text-emerald-200">A new version of TamsGrade is ready.</p>
            </div>
            <button
              type="button"
              onClick={() => skipWaitingAndReload()}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-900 transition-colors shadow-sm active:scale-95"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setSwUpdateAvailable(false)}
              className="p-1 hover:bg-white/10 rounded text-emerald-200"
              aria-label="Dismiss update notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </aside>
        )}

        {undoAction && (
          <aside
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-xl shadow-2xl border border-stone-800 dark:border-stone-200 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2"
          >
            <span className="flex-1 font-medium">{undoAction.message}</span>
            <button
              type="button"
              onClick={undoAction.undo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#0d3824] dark:bg-emerald-700 hover:bg-[#124b30] text-white transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              type="button"
              onClick={dismissUndo}
              className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-200 dark:hover:text-stone-800"
              aria-label="Dismiss undo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}

export function App() {
  return (
    <GradeProvider>
      <MainContent />
    </GradeProvider>
  )
}

export default App
