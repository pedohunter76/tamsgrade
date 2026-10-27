import React from 'react'
import { Award, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react'

interface QpaRadialCompassProps {
  currentQpa: number | null
  requiredQpa: number
  programName: string
  targetLabel: string
  status: 'promoted' | 'at_risk_pnra_unra' | 'awaiting_grades'
  difference: number | null
  atRiskMajorCount: number
}

export const QpaRadialCompass: React.FC<QpaRadialCompassProps> = ({
  currentQpa,
  requiredQpa: _requiredQpa,
  programName,
  targetLabel,
  status,
  difference,
  atRiskMajorCount
}) => {
  // SVG Gauge calculations
  // Angle range: 140deg to 400deg (260 degree arc)
  const size = 220
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const center = size / 2

  const startAngle = 140
  const endAngle = 400
  const angleSpan = endAngle - startAngle // 260 degrees

  // Max scale is 4.00
  const maxQpa = 4.0
  const safeQpa = currentQpa !== null ? Math.min(Math.max(currentQpa, 0), maxQpa) : 0
  const fillFraction = safeQpa / maxQpa
  const currentAngle = startAngle + fillFraction * angleSpan

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    }
  }

  const describeArc = (x: number, y: number, r: number, startAng: number, endAng: number) => {
    const start = polarToCartesian(x, y, r, endAng)
    const end = polarToCartesian(x, y, r, startAng)
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1'
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ')
  }

  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle)
  const valueArc = fillFraction > 0.005
    ? describeArc(center, center, radius, startAngle, currentAngle)
    : ''

  // Milestones to render as needle ticks along arc
  const milestones = [
    { value: 1.20, label: '1.20 Min', color: 'border-stone-400 dark:border-stone-500' },
    { value: 2.50, label: '2.50 Retention', color: 'border-amber-500' },
    { value: 3.25, label: '3.25 Cum Laude', color: 'border-emerald-500' },
    { value: 3.55, label: '3.55 Magna', color: 'border-emerald-400' },
    { value: 3.80, label: '3.80 Summa', color: 'border-amber-400' }
  ]

  // Color scheme based on academic standing
  const isAtRisk = status === 'at_risk_pnra_unra' || atRiskMajorCount > 0

  const strokeGradientId = isAtRisk
    ? 'compassRiskGradient'
    : currentQpa !== null && currentQpa >= 3.25
    ? 'compassHonorsGradient'
    : 'compassSafeGradient'

  return (
    <div className="relative flex flex-col items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#0c1a14] border border-stone-200/90 dark:border-emerald-900/40 shadow-sm overflow-hidden">
      {/* Subtle background glow */}
      <div className={`absolute -right-8 -top-8 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isAtRisk ? 'bg-rose-500' : 'bg-emerald-500'
      }`} />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
            <Award className="w-4 h-4 text-amber-500" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              FEU Retention & Honors Compass
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {targetLabel} &bull; {programName}
            </p>
          </div>
        </div>

        {/* Live Safety Cushion Badge */}
        {difference !== null && (
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            difference >= 0 && atRiskMajorCount === 0
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
          }`}>
            {difference >= 0 && atRiskMajorCount === 0 ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span>
              {difference >= 0 ? `+${difference.toFixed(2)} Cushion` : `${difference.toFixed(2)} Deficit`}
            </span>
          </div>
        )}
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative my-1">
        <svg width={size} height={size - 20} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <linearGradient id="compassSafeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#D4A017" />
            </linearGradient>
            <linearGradient id="compassHonorsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D4A017" />
            </linearGradient>
            <linearGradient id="compassRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={backgroundArc}
            fill="none"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-800"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value track */}
          {valueArc && (
            <path
              d={valueArc}
              fill="none"
              stroke={`url(#${strokeGradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Milestone markers along the arc */}
          {milestones.map((m) => {
            const angle = startAngle + (m.value / maxQpa) * angleSpan
            const tickInner = polarToCartesian(center, center, radius - strokeWidth / 2 - 2, angle)
            const tickOuter = polarToCartesian(center, center, radius + strokeWidth / 2 + 2, angle)
            return (
              <line
                key={m.value}
                x1={tickInner.x}
                y1={tickInner.y}
                x2={tickOuter.x}
                y2={tickOuter.y}
                stroke="currentColor"
                strokeWidth={2}
                className="text-stone-400 dark:text-stone-600"
              />
            )
          })}
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 top-6 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Cumulative QPA
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-4xl font-extrabold tracking-tight tabular-nums text-stone-900 dark:text-stone-100">
              {currentQpa !== null ? currentQpa.toFixed(2) : '--'}
            </span>
            <span className="font-mono text-xs font-semibold text-stone-400 dark:text-stone-500">
              / 4.00
            </span>
          </div>

          <div className="mt-1">
            {currentQpa === null ? (
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Awaiting Graded Courses
              </span>
            ) : isAtRisk ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3 h-3" /> Below Retention Cutoff
              </span>
            ) : currentQpa >= 3.80 ? (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                ★ Summa Cum Laude Standing
              </span>
            ) : currentQpa >= 3.55 ? (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ★ Magna Cum Laude Standing
              </span>
            ) : currentQpa >= 3.25 ? (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ★ Cum Laude Standing
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Regular Good Standing
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Threshold Key Ticks */}
      <div className="w-full grid grid-cols-3 gap-1 pt-3 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
        <div className="text-left">
          <span className="font-mono font-bold text-stone-700 dark:text-stone-300">1.20</span>
          <p className="truncate">Promotion Min</p>
        </div>
        <div className="text-center">
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">2.50</span>
          <p className="truncate">BSA Retention</p>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">3.25+</span>
          <p className="truncate">Latin Honors</p>
        </div>
      </div>
    </div>
  )
}
