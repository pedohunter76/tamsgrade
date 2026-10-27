import React from 'react'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'

interface TransmutationSpectrumProps {
  currentRawGrade: number | null
  letterGrade?: string
  transmutedGrade?: string
  qualityPoints?: number
  isBsaMajor?: boolean
}

interface Tier {
  code: string
  min: number
  max: number
  qp: number
  label: string
  color: string
  bgClass: string
  borderClass: string
  textClass: string
}

const FEU_TIERS: Tier[] = [
  {
    code: 'F',
    min: 0,
    max: 49.999,
    qp: 0.0,
    label: 'Failing',
    color: '#ef4444',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-500/40',
    textClass: 'text-rose-500'
  },
  {
    code: 'D',
    min: 50,
    max: 56.999,
    qp: 1.0,
    label: 'Conditional',
    color: '#f97316',
    bgClass: 'bg-orange-500/20',
    borderClass: 'border-orange-500/40',
    textClass: 'text-orange-500'
  },
  {
    code: 'D+',
    min: 57,
    max: 63.999,
    qp: 1.5,
    label: 'Low Pass',
    color: '#eab308',
    bgClass: 'bg-yellow-500/20',
    borderClass: 'border-yellow-500/40',
    textClass: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    code: 'C',
    min: 64,
    max: 70.999,
    qp: 2.0,
    label: 'Passing',
    color: '#84cc16',
    bgClass: 'bg-lime-500/20',
    borderClass: 'border-lime-500/40',
    textClass: 'text-lime-600 dark:text-lime-400'
  },
  {
    code: 'C+',
    min: 71,
    max: 77.999,
    qp: 2.5,
    label: 'BSA Retention',
    color: '#d4a017',
    bgClass: 'bg-amber-500/25',
    borderClass: 'border-amber-500/60',
    textClass: 'text-amber-600 dark:text-amber-400'
  },
  {
    code: 'B',
    min: 78,
    max: 84.999,
    qp: 3.0,
    label: 'Good',
    color: '#10b981',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    code: 'B+',
    min: 85,
    max: 91.999,
    qp: 3.5,
    label: 'Very Good',
    color: '#059669',
    bgClass: 'bg-emerald-600/25',
    borderClass: 'border-emerald-600/50',
    textClass: 'text-emerald-700 dark:text-emerald-300'
  },
  {
    code: 'A',
    min: 92,
    max: 100,
    qp: 4.0,
    label: 'Excellent',
    color: '#047857',
    bgClass: 'bg-emerald-700/30',
    borderClass: 'border-emerald-700/60',
    textClass: 'text-emerald-800 dark:text-emerald-200'
  }
]

export const TransmutationSpectrum: React.FC<TransmutationSpectrumProps> = ({
  currentRawGrade,
  isBsaMajor = false
}) => {
  const raw = currentRawGrade !== null ? Math.min(Math.max(currentRawGrade, 0), 100) : null

  // Find active tier
  const activeTier = raw !== null
    ? FEU_TIERS.find(t => raw >= t.min && raw <= t.max) || (raw >= 100 ? FEU_TIERS[FEU_TIERS.length - 1] : FEU_TIERS[0])
    : null

  // Next tier computation
  const activeIndex = activeTier ? FEU_TIERS.findIndex(t => t.code === activeTier.code) : -1
  const nextTier = activeIndex >= 0 && activeIndex < FEU_TIERS.length - 1 ? FEU_TIERS[activeIndex + 1] : null
  const pointsToNext = (raw !== null && nextTier) ? (nextTier.min - raw) : null

  // Percentage position of the needle (0 to 100)
  const needlePercent = raw !== null ? raw : 0

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a14] border border-stone-200/90 dark:border-emerald-900/40 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </span>
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              FEU 8-Tier Transmutation Dial & Needle
            </h3>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time mapping from raw course score into official FEU Letter Grade and Quality Points
          </p>
        </div>

        {/* Current Standing Badge */}
        {activeTier && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-stone-500">Current Tier:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black border ${activeTier.bgClass} ${activeTier.borderClass} ${activeTier.textClass}`}>
              <span>{activeTier.code}</span>
              <span className="text-[10px] font-sans font-semibold">({activeTier.qp.toFixed(2)} QP)</span>
            </span>
          </div>
        )}
      </div>

      {/* Spectrum Bar with Needle */}
      <div className="space-y-2 pt-2">
        <div className="relative">
          {/* Continuous multi-tier track */}
          <div className="h-5 w-full rounded-xl overflow-hidden flex shadow-inner border border-stone-200 dark:border-stone-800">
            {FEU_TIERS.map((tier) => {
              const widthPct = ((tier.max - tier.min + 0.001) / 100) * 100
              const isSelected = activeTier?.code === tier.code
              return (
                <div
                  key={tier.code}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: tier.color
                  }}
                  className={`relative h-full transition-opacity duration-300 flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-sm ${
                    isSelected ? 'opacity-100 ring-2 ring-white/60 z-10' : 'opacity-70 hover:opacity-90'
                  }`}
                  title={`${tier.code}: ${tier.min}% - ${tier.max}% (${tier.qp.toFixed(2)} QP)`}
                >
                  <span className="hidden sm:inline drop-shadow-sm">{tier.code}</span>
                </div>
              )
            })}
          </div>

          {/* Retention Cutoff Marker (71.0%) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center z-20"
            style={{ left: '71%' }}
          >
            <div className="w-0.5 h-full bg-amber-400 shadow-md" />
            <div className="absolute -top-5 px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-mono font-extrabold text-[8px] whitespace-nowrap shadow-sm">
              71% CUTOFF
            </div>
          </div>

          {/* Live Position Needle */}
          {raw !== null && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center transition-all duration-500 z-30"
              style={{ left: `${needlePercent}%` }}
            >
              <div className="w-1 h-6 -top-0.5 bg-stone-900 dark:bg-white rounded-full shadow-lg ring-2 ring-emerald-500" />
              <div className="absolute -bottom-6 px-1.5 py-0.5 rounded-md bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-mono font-bold text-[9px] shadow-md whitespace-nowrap">
                {raw.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Tier Range Markers Below */}
        <div className="flex justify-between text-[10px] font-mono text-stone-400 dark:text-stone-500 pt-5">
          <span>0% (F)</span>
          <span>50% (D)</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">71% (C+ Cutoff)</span>
          <span>85% (B+)</span>
          <span>92%+ (A)</span>
        </div>
      </div>

      {/* Distance to Next Tier & Retention Standing Callout */}
      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {raw !== null && raw >= 71 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="text-stone-700 dark:text-stone-300">
            {raw === null ? (
              'Enter assessment scores to locate your standing on the FEU transmutation dial.'
            ) : isBsaMajor && raw < 71 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                ⚠️ {(71 - raw).toFixed(2)}% required to reach the 71.0% (C+) BSA Major Retention Cutoff!
              </span>
            ) : isBsaMajor ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Safely above the BSA 71.0% retention cutoff (+{(raw - 71).toFixed(2)}% buffer).
              </span>
            ) : (
              <span>Standing on standard university scale.</span>
            )}
          </span>
        </div>

        {pointsToNext !== null && nextTier && (
          <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 shrink-0">
            Next Tier:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
              +{pointsToNext.toFixed(2)}%
            </strong>{' '}
            for <span className="font-mono font-bold">{nextTier.code}</span> ({nextTier.qp.toFixed(2)} QP)
          </div>
        )}
      </div>
    </div>
  )
}
