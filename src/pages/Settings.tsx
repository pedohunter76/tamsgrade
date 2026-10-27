import React, { useState, useRef } from 'react'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react'
import { useGrade } from '../context/GradeContext'
import { DEFAULT_GRADING_PROFILES, DEFAULT_TRANSMUTATION_PROFILES } from '../engine/profiles'
import {
  FEU_QPA_PROGRAM_RULES,
  PROMOTION_TARGET_LABELS,
  FEUProgramId,
  FEUPromotionTarget
} from '../engine/qpaRequirements'

export const Settings: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    resetAll,
    reloadSamples,
    exportData,
    importData,
    subjects,
    assessments
  } = useGrade()

  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle Export
  const handleExport = () => {
    const data = exportData()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tamsgrade_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      if (content) {
        const result = await importData(content)
        setImportStatus(result)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b1f16] border border-[#e2e6de] dark:border-emerald-950/60 shadow-2xs space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">
          SYSTEM CONFIGURATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-emerald-50 m-0">
          Application Settings
        </h1>
        <p className="text-xs text-stone-600 dark:text-emerald-400/80 leading-relaxed font-sans mt-1">
          Customize calculation defaults, theme, decimal precision, and manage local data backups.
        </p>
      </div>

      {/* Theme & Display Options */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span>Appearance & Display</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1.5 font-medium">
              Theme Mode
            </label>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => updatePreferences({ theme: 'light' })}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  preferences.theme === 'light'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => updatePreferences({ theme: 'dark' })}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  preferences.theme === 'dark'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => updatePreferences({ theme: 'system' })}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  preferences.theme === 'system'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1.5 font-medium">
              Grade Display Precision
            </label>
            <select
              value={preferences.gradeDisplayPrecision}
              onChange={(e) => updatePreferences({ gradeDisplayPrecision: parseInt(e.target.value) || 2 })}
              className="w-full text-xs py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-mono"
            >
              <option value="1">1 Decimal Place (e.g. 85.5%)</option>
              <option value="2">2 Decimal Places (e.g. 85.50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Academic Term Defaults */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Default Academic Term & Calculation Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
              Default Academic Year
            </label>
            <input
              type="text"
              value={preferences.defaultAcademicYear}
              onChange={(e) => updatePreferences({ defaultAcademicYear: e.target.value })}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs"
            />
          </div>

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
              Default Semester
            </label>
            <select
              value={preferences.defaultSemester}
              onChange={(e) => updatePreferences({ defaultSemester: e.target.value })}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs"
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Summer / Midyear">Summer / Midyear</option>
            </select>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.treatMissingAsZero}
                onChange={(e) => updatePreferences({ treatMissingAsZero: e.target.checked })}
                className="rounded border-stone-300 text-emerald-600"
              />
              <span className="text-xs text-stone-800 dark:text-stone-200 font-medium">
                Treat missing / unrecorded assessments as zero scores in provisional grade calculations
              </span>
            </label>
            <p className="text-[11px] text-stone-500 mt-1 pl-6">
              When unchecked (recommended), incomplete assessments are excluded and your provisional grade is normalized to 100% based only on completed assessment weights.
            </p>
          </div>
        </div>
      </div>

      {/* Degree Program & Annual Promotion Target (Official FEU Regulations) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Degree Program & Promotion Target (Official FEU Rules)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Calibrates your dashboard retention warnings, annual QPA cutoffs, and UNRA/PNRA thresholds based on your specific college and target year level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
              Enrolled Degree Program
            </label>
            <select
              value={preferences.studentProgram || 'bs_accountancy'}
              onChange={(e) => updatePreferences({ studentProgram: e.target.value as FEUProgramId })}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold"
            >
              {FEU_QPA_PROGRAM_RULES.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name} ({prog.college})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
              Target Annual Promotion
            </label>
            <select
              value={preferences.targetPromotionYear || '2nd_year'}
              onChange={(e) => updatePreferences({ targetPromotionYear: e.target.value as FEUPromotionTarget })}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-semibold"
            >
              {Object.entries(PROMOTION_TARGET_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Data Backup & Offline Portability</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            All data is saved locally on your device in IndexedDB. No external servers or telemetry are used.
          </p>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Export JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Import JSON Backup</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone / Factory Reset */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Reset Academic Records</span>
        </h2>
        <p className="text-xs text-stone-500">
          Clear all stored subjects and assessments, or reload the FEU Accountancy sample curriculum.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={reloadSamples}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reload FEU Accountancy Sample Data</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Delete All Application Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#071610] p-6 rounded-2xl max-w-md w-full border border-[#e3e6de] dark:border-emerald-950/60 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-emerald-50">
                Permanently Clear All Data?
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-emerald-300/80 leading-relaxed">
              This will remove all {subjects.length} subjects and {assessments.length} assessment records from your device's IndexedDB. We suggest exporting a JSON backup first.
              <br /><br />
              Are you sure you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f2eb] dark:border-emerald-950/50">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-950/40 border border-transparent hover:border-stone-200 dark:hover:border-emerald-900/40 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await resetAll()
                  setShowResetConfirm(false)
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all cursor-pointer"
              >
                Yes, Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
