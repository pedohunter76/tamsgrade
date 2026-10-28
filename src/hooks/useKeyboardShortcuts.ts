import { useEffect } from 'react'
import { NavTab } from '../context/GradeContext'
import { triggerHaptic } from '../utils/haptics'

interface ShortcutConfig {
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
  onOpenAddSubject: () => void
  onExportData: () => void
}

export function useKeyboardShortcuts({
  setActiveTab,
  onOpenAddSubject,
  onExportData
}: ShortcutConfig) {
  useEffect(() => {
    const tabMap: Record<string, NavTab> = {
      '1': 'dashboard',
      '2': 'subjects',
      '3': 'curriculum',
      '4': 'calculator',
      '5': 'simulator',
      '6': 'target',
      '7': 'guide',
      '8': 'settings'
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form controls
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      // Tab switcher numbers 1-8 (without modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && tabMap[e.key]) {
        e.preventDefault()
        triggerHaptic('light')
        setActiveTab(tabMap[e.key])
        return
      }

      // Ctrl/Cmd + S to export data backup
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        triggerHaptic('success')
        onExportData()
        return
      }

      // Alt + N or Ctrl + Alt + N for New Subject
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault()
        triggerHaptic('light')
        onOpenAddSubject()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveTab, onOpenAddSubject, onExportData])
}
