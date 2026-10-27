import React, { useState, Suspense, lazy } from 'react'
import { GradeProvider, useGrade } from './context/GradeContext'
import { Navigation } from './components/Navigation'
import { HeaderBar } from './components/HeaderBar'
import { OfflineBanner } from './components/OfflineBanner'
import { SubjectModal } from './components/SubjectModal'
import { Loader2 } from 'lucide-react'

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
  const { activeTab, setActiveTab, addSubject } = useGrade()
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false)

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
    <div className="flex h-screen bg-[#f8f9f5] dark:bg-[#07140f] text-stone-900 dark:text-emerald-50 overflow-hidden font-sans">
      {/* Navigation (Desktop Sidebar & Mobile Bottom Bar) */}
      <Navigation onOpenAddSubject={() => setIsAddSubjectModalOpen(true)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Desktop & Mobile) */}
        <HeaderBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Offline Connectivity Banner */}
        <OfflineBanner />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<PageLoader />}>
              {renderActiveScreen()}
            </Suspense>
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
