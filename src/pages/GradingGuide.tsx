import React, { useState } from 'react'
import {
  GraduationCap,
  BookOpen,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Layers,
  Award,
  Sliders,
  Target,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react'
import { DEFAULT_GRADING_PROFILES, DEFAULT_TRANSMUTATION_PROFILES } from '../engine/profiles'
import {
  FEU_QPA_PROGRAM_RULES,
  evaluateFEUQPAStanding,
  FEUProgramId,
  FEUPromotionTarget,
  PROMOTION_TARGET_LABELS
} from '../engine/qpaRequirements'

export const GradingGuide: React.FC = () => {
  // Transmutation scale selector state (Flagship FEU Letter Grade vs BSA Retention Scale vs Standard Undergraduate)
  const [selectedScaleId, setSelectedScaleId] = useState<string>('feu_letter_grade_official')

  // Mini interactive calculator state for Total Points vs Equal Weight
  const [demoEarned1, setDemoEarned1] = useState<number>(10)
  const [demoPossible1, setDemoPossible1] = useState<number>(10)
  const [demoEarned2, setDemoEarned2] = useState<number>(50)
  const [demoPossible2, setDemoPossible2] = useState<number>(100)

  // Interactive Promotion QPA Tester state
  const [testQpa, setTestQpa] = useState<number>(2.40)
  const [testProgram, setTestProgram] = useState<FEUProgramId>('bs_accountancy')
  const [testTargetYear, setTestTargetYear] = useState<FEUPromotionTarget>('2nd_year')

  // Calculations for mini demo
  const pct1 = demoPossible1 > 0 ? (demoEarned1 / demoPossible1) * 100 : 0
  const pct2 = demoPossible2 > 0 ? (demoEarned2 / demoPossible2) * 100 : 0
  const totalPointsMethod =
    demoPossible1 + demoPossible2 > 0
      ? ((demoEarned1 + demoEarned2) / (demoPossible1 + demoPossible2)) * 100
      : 0
  const equalWeightMethod = (pct1 + pct2) / 2

  const activeScale =
    DEFAULT_TRANSMUTATION_PROFILES.find((p) => p.id === selectedScaleId) ||
    DEFAULT_TRANSMUTATION_PROFILES[0]

  const testedEvaluation = evaluateFEUQPAStanding(testQpa, testProgram, testTargetYear)

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0b1f16] text-stone-900 dark:text-emerald-50 shadow-2xs border border-[#e2e6de] dark:border-emerald-950/60 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#eaf5ed] dark:bg-emerald-950/80 text-[#0d3824] dark:text-emerald-300 font-bold text-xs uppercase tracking-wide border border-[#cbe4d2] dark:border-emerald-800/40 font-mono">
            Official Academic Regulations &bull; Far Eastern University
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-stone-900 dark:text-emerald-50 m-0">
          FEU Manila Zero-Based Grading &amp; Promotion Handbook
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 leading-relaxed font-sans">
          Official academic handbook for Far Eastern University (FEU) Manila students, detailing zero-based scoring mechanics, the official FEU Scholars Society Letter Grade Equivalent scale, University QPA promotion and retention benchmarks, and UNRA/PNRA academic standing policies.
        </p>
      </div>

      {/* Guide Navigation Sections */}
      <div className="space-y-8">
        {/* Section 1: Official FEU Letter Grade Equivalent (Quality Point System) */}
        <section className="p-6 md:p-7 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-600/30 dark:border-emerald-500/30 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400">
              <span className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center shadow-xs">
                1
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                  FEU Official Letter Grade Equivalent & Quality Points
                </h2>
                <p className="text-[11px] text-stone-500">
                  Published by FEU Scholars Society &bull; Adheres to University Policy on Academic Integrity
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[11px] font-bold self-start sm:self-auto">
              University Standard (4.00 Max)
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Far Eastern University calculates student academic standing, scholarship qualification, and graduation honors using the official <strong>Quality Point Average (QPA)</strong> system. Each raw numerical score translates directly to a corresponding Letter Grade and Quality Point:
          </p>

          {/* Letter Grade Equivalent Table (Direct from Image 1) */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-emerald-900 text-white font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-center">Quality Point</th>
                  <th className="py-3 px-4 text-center">Numerical Equivalent (%)</th>
                  <th className="py-3 px-4 text-center">Letter Grade</th>
                  <th className="py-3 px-4">Academic Significance & Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono">
                <tr className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 bg-emerald-50/30 dark:bg-emerald-950/10">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-emerald-800 dark:text-emerald-400">4.00</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-800 dark:text-stone-200">92.00 – 100.00</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-emerald-700 dark:text-emerald-300">A</td>
                  <td className="py-2.5 px-4 font-sans text-stone-600 dark:text-stone-300 font-medium">Superior Academic Excellence (Summa Cum Laude Track)</td>
                </tr>
                <tr className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-emerald-800 dark:text-emerald-400">3.50</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-800 dark:text-stone-200">85.00 – 91.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-emerald-700 dark:text-emerald-300">B+</td>
                  <td className="py-2.5 px-4 font-sans text-stone-600 dark:text-stone-300 font-medium">Very Good (Magna Cum Laude Track)</td>
                </tr>
                <tr className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-emerald-800 dark:text-emerald-400">3.00</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-800 dark:text-stone-200">78.00 – 84.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-emerald-700 dark:text-emerald-300">B</td>
                  <td className="py-2.5 px-4 font-sans text-stone-600 dark:text-stone-300 font-medium">Good (Cum Laude Track)</td>
                </tr>
                <tr className="bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/60 font-semibold border-y-2 border-amber-400/80">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-amber-800 dark:text-amber-400">2.50</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-900 dark:text-stone-100">71.00 – 77.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-amber-700 dark:text-amber-300">C+</td>
                  <td className="py-2.5 px-4 font-sans text-amber-950 dark:text-amber-200 font-bold">
                    ★ FEU IABF BS Accountancy Major Retention Cutoff (Minimum Passing for Professional Courses)
                  </td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-[#15231c]/50">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-stone-700 dark:text-stone-300">2.00</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-800 dark:text-stone-200">64.00 – 70.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-stone-700 dark:text-stone-300">C</td>
                  <td className="py-2.5 px-4 font-sans text-stone-600 dark:text-stone-400 font-medium">Fair / Standard University Passing (Disqualification for BSA Major Courses)</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-[#15231c]/50">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-stone-700 dark:text-stone-300">1.50</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-800 dark:text-stone-200">57.00 – 63.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-stone-700 dark:text-stone-300">D+</td>
                  <td className="py-2.5 px-4 font-sans text-stone-600 dark:text-stone-400 font-medium">Low Passing (Below Promotion Threshold for Most Majors)</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-[#15231c]/50">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-stone-700 dark:text-stone-300">1.00</td>
                  <td className="py-2.5 px-4 font-bold text-center text-stone-800 dark:text-stone-200">50.00 – 56.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-stone-700 dark:text-stone-300">D</td>
                  <td className="py-2.5 px-4 font-sans text-stone-600 dark:text-stone-400 font-medium">Conditional Passing / Severe Retention Risk</td>
                </tr>
                <tr className="bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100/50">
                  <td className="py-2.5 px-4 font-black text-center text-sm text-red-700 dark:text-red-400">0.00</td>
                  <td className="py-2.5 px-4 font-bold text-center text-red-700 dark:text-red-300">00.00 – 49.99</td>
                  <td className="py-2.5 px-4 font-black text-center text-base text-red-700 dark:text-red-400">F</td>
                  <td className="py-2.5 px-4 font-sans text-red-800 dark:text-red-300 font-bold">Failing (Repeat Course Required)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Special Marks & Policy Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40">
              <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono text-sm">P = Passed</span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Assigned for non-credit or zero-unit clearance courses</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40">
              <span className="font-bold text-amber-700 dark:text-amber-400 font-mono text-sm">AW = Authorized Withdrawal</span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Officially dropped course within university clearance deadlines</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40">
              <span className="font-bold text-blue-700 dark:text-blue-400 font-mono text-sm">IP = In Progress</span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">For Apprenticeship, Practicum, and OJT courses</p>
            </div>
          </div>
        </section>

        {/* Section: Midterm Grade vs. Final Grade Running Grade Mechanics */}
        <section className="p-6 md:p-7 rounded-2xl bg-white dark:bg-stone-900 border-2 border-[#0d3824]/40 dark:border-emerald-600/40 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400">
              <span className="w-7 h-7 rounded-lg bg-[#0d3824] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                ★
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                  Midterm Grade vs. Final Grade: The Running Grade Architecture
                </h2>
                <p className="text-[11px] text-stone-500">
                  FEU Manila IABF Academic Progress Framework &bull; Running Milestone Ahead to Official Final Grade
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0d3824] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold self-start sm:self-auto">
              Progressive Evaluation
            </span>
          </div>

          <div className="space-y-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            <p>
              At Far Eastern University (FEU Manila IABF), student grading follows a progressive continuous-assessment model. It is essential to distinguish between your <strong>Midterm Grade</strong> and your <strong>Final Grade</strong>:
            </p>

            {/* Side-by-side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Midterm Grade Card */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0d3824] dark:text-emerald-300 font-mono">
                    Midterm Grade (Running Grade)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0d3824] text-white">
                    50% Milestone
                  </span>
                </div>
                <p className="text-[11px] text-stone-700 dark:text-emerald-200/90 leading-relaxed font-sans">
                  The Midterm Grade is the <strong>running evaluation ahead to your Final Grade</strong>. It assesses all formative tasks, quizzes, seatworks, and the Departmental Midterm Exam completed during the first half of the semester.
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#071911] border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-mono text-stone-800 dark:text-emerald-100">
                  ✓ Reflects mid-semester momentum<br/>
                  ✓ Released on Canvas as provisional standing<br/>
                  ✓ Feeds 50% into periodic final formulas
                </div>
              </div>

              {/* Final Grade Card */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100 font-mono">
                    Final Grade (Official Course Grade)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 dark:bg-stone-700 text-white dark:text-stone-100">
                    100% Course Total
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                  The Final Grade is the <strong>permanent, official grade</strong> recorded on your University Transcript and evaluated against QPA retention standards (e.g. BSA 2.50 C+ retention).
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/50 text-[11px] font-mono text-stone-800 dark:text-emerald-200">
                  ✓ Cumulative course culmination<br/>
                  ✓ Determines honors (President's / Dean's List)<br/>
                  ✓ Official basis for graduation &amp; promotion
                </div>
              </div>
            </div>

            {/* Formula Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <span className="font-bold text-[#0d3824] dark:text-emerald-300 block text-xs font-mono uppercase tracking-wider">
                Periodic Grading Formula (FEU IABF Standard)
              </span>
              <div className="p-3 rounded-lg bg-white dark:bg-[#081a12] border border-emerald-300/80 dark:border-emerald-800/60 font-mono text-xs text-stone-900 dark:text-emerald-100 text-center font-bold">
                Final Grade = (Midterm Running Grade &times; 50%) + (Final Period Grade &times; 50%)
              </div>
              <p className="text-[11px] text-stone-600 dark:text-emerald-300/80 leading-relaxed">
                Prior to the Finals Period, your projected Final Grade is continuously paced by your current Midterm running grade. As you record scores for finals assignments and the Departmental Final Exam, your official Final Grade locks in.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: FEU Annual QPA Grade Requirements for Promotion & Retention */}
        <section className="p-6 md:p-7 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-700/40 dark:border-emerald-600/40 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400">
              <span className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center shadow-xs">
                2
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                  FEU Annual QPA Requirements for Promotion & Retention
                </h2>
                <p className="text-[11px] text-stone-500">
                  Official Far Eastern University Policy (Est. 1928) &bull; Academic Year Promotion Cutoffs
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold self-start sm:self-auto">
              University Policy Reminder
            </span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 leading-relaxed space-y-1">
            <span className="font-bold uppercase tracking-wide text-[10px] text-amber-700 dark:text-amber-400 block">
              University Academic Regulation
            </span>
            <p>
              Students must meet the annual Quality Point Average (QPA) requirement in order to be qualified for promotion to the next level or for retention in Far Eastern University.
            </p>
          </div>

          {/* Program Cutoff Table (Direct from Image 2) */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-emerald-950 text-white font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Program / Field of Study</th>
                  <th className="py-3 px-4 text-center">Promotion to 2nd Year</th>
                  <th className="py-3 px-4 text-center">Promotion to 3rd Year</th>
                  <th className="py-3 px-4 text-center">Promotion to 4th Year</th>
                  <th className="py-3 px-4 text-center">To Graduate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono">
                <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 font-semibold">
                  <td className="py-2.5 px-4 font-sans font-bold text-stone-900 dark:text-stone-100">
                    BS Accountancy (IABF)
                  </td>
                  <td className="py-2.5 px-4 text-center text-emerald-800 dark:text-emerald-300 font-bold">1.20</td>
                  <td className="py-2.5 px-4 text-center text-emerald-800 dark:text-emerald-300 font-bold">1.60</td>
                  <td className="py-2.5 px-4 text-center text-emerald-800 dark:text-emerald-300 font-bold">2.00</td>
                  <td className="py-2.5 px-4 text-center text-amber-700 dark:text-amber-300 font-extrabold text-sm">2.40</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-[#15231c]/50">
                  <td className="py-2.5 px-4 font-sans font-medium text-stone-800 dark:text-stone-200">
                    BS Architecture (IARFA)
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold">1.50</td>
                  <td className="py-2.5 px-4 text-center font-bold">1.80</td>
                  <td className="py-2.5 px-4 text-center font-bold">2.00 <span className="text-[10px] font-sans text-stone-400 block">(until 5th yr)</span></td>
                  <td className="py-2.5 px-4 text-center font-bold text-stone-900 dark:text-stone-100">2.20</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-[#15231c]/50">
                  <td className="py-2.5 px-4 font-sans font-medium text-stone-800 dark:text-stone-200">
                    BS Elementary & Secondary Education (IE)
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold">1.50</td>
                  <td className="py-2.5 px-4 text-center font-bold">1.80</td>
                  <td className="py-2.5 px-4 text-center font-bold">2.00</td>
                  <td className="py-2.5 px-4 text-center font-bold text-stone-900 dark:text-stone-100">2.20</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-[#15231c]/50">
                  <td className="py-2.5 px-4 font-sans font-medium text-stone-800 dark:text-stone-200">
                    BS MedTech, BS Nursing, & BS Psychology
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold">1.50</td>
                  <td className="py-2.5 px-4 text-center font-bold">2.00</td>
                  <td className="py-2.5 px-4 text-center font-bold">2.20</td>
                  <td className="py-2.5 px-4 text-center font-extrabold text-sm text-stone-900 dark:text-stone-100">2.40</td>
                </tr>
                <tr className="bg-stone-100/90 dark:bg-[#14231b] hover:bg-stone-200/80 dark:hover:bg-[#192c22] font-semibold border-t-2 border-stone-300 dark:border-emerald-800/80">
                  <td className="py-2.5 px-4 font-sans font-bold text-stone-900 dark:text-emerald-100">
                    University Standard (All Other Courses)
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-emerald-800 dark:text-emerald-300">1.20</td>
                  <td className="py-2.5 px-4 text-center font-bold text-emerald-800 dark:text-emerald-300">1.50</td>
                  <td className="py-2.5 px-4 text-center font-bold text-emerald-800 dark:text-emerald-300">1.80</td>
                  <td className="py-2.5 px-4 text-center font-extrabold text-sm text-emerald-800 dark:text-emerald-300">2.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PNRA vs UNRA Consequences & Mid-year Enrichment Program Callout (Direct from Image 2) */}
          <div className="space-y-3 pt-1">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Consequences of Failure to Meet the Required QPA</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-1.5">
                <span className="font-bold text-red-900 dark:text-red-200 block text-xs">
                  1. Program Non-Readmission (PNRA Status)
                </span>
                <p className="text-[11px] text-red-800/90 dark:text-red-300/90 leading-relaxed">
                  Will result in Program Non-readmission (PNRA) status. The student will be disqualified from their specific degree program and may shift to another program.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                  2. University Non-Readmission (UNRA Status)
                </span>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  The student may retain their program, but will be tagged as UNRA (University Non-readmission status) and will be required to attend an enrichment program this mid-year term to be cleared for readmission.
                </p>
              </div>
            </div>

            {/* Critical Note and Did You Know Callouts */}
            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[10px] uppercase shrink-0">
                  Note
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 text-[11px]">
                  A student can attend the enrichment program only <u>ONCE</u> in their entire stay at FEU.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-300 dark:border-amber-700 flex items-start gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-800 text-amber-300 font-black text-[10px] uppercase shrink-0 mt-0.5">
                  Did you know...
                </span>
                <p className="text-[11px] text-stone-800 dark:text-stone-200 leading-relaxed">
                  The <strong>Mid-year Enrichment Program</strong> may save you from an UNRA/PNRA status due to a QPA that is below the cut-off. Ensure you register promptly if flagged by the University Registrar.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Promotion QPA Tester Widget */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40 space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Interactive FEU Promotion QPA Eligibility Tester
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-stone-500 font-semibold text-[11px] mb-1">
                  Your Projected QPA (0.00 – 4.00):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="4"
                  value={testQpa}
                  onChange={(e) => setTestQpa(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono font-bold py-1.5 px-3 rounded-lg bg-white dark:bg-[#071911] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-stone-500 font-semibold text-[11px] mb-1">
                  Program of Study:
                </label>
                <select
                  value={testProgram}
                  onChange={(e) => setTestProgram(e.target.value as FEUProgramId)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-white dark:bg-[#071911] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {FEU_QPA_PROGRAM_RULES.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-500 font-semibold text-[11px] mb-1">
                  Target Promotion:
                </label>
                <select
                  value={testTargetYear}
                  onChange={(e) => setTestTargetYear(e.target.value as FEUPromotionTarget)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-white dark:bg-[#071911] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {Object.entries(PROMOTION_TARGET_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Result Pill */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              testedEvaluation.isQualified
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {testedEvaluation.isQualified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span className="font-semibold">
                  {testedEvaluation.isQualified
                    ? `Qualified! Exceeds the ${testedEvaluation.requiredQpa.toFixed(2)} threshold by +${testedEvaluation.difference?.toFixed(2)}`
                    : `Below Benchmark! Short by ${Math.abs(testedEvaluation.difference || 0).toFixed(2)} against the ${testedEvaluation.requiredQpa.toFixed(2)} requirement (PNRA / UNRA Risk)`}
                </span>
              </div>
              <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg bg-white dark:bg-stone-900 border">
                {testQpa.toFixed(2)} QPA
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Zero-Based Grading Mechanics */}
        <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
              What Zero-Based Grading Means
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            In standard Philippine universities, some grading systems use a base of 50 or 60 (where getting 0 points gives a 50% or 60% baseline). At Far Eastern University (FEU), scoring operates strictly on an uncurved <strong>zero-based model</strong>:
          </p>
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40 text-xs font-mono text-stone-800 dark:text-emerald-200">
            Assessment Percentage = (Points Earned ÷ Total Possible Points) × 100
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            If you score 0 out of 20 on a quiz, your earned score is strictly 0%. There is no arbitrary curve, baseline inflation, or artificial minimum floor unless an explicit syllabus policy defines one. Every point you earn directly builds your final course standing.
          </p>
        </section>

        {/* Section 4: Interactive Method Comparison Calculator (Total Points vs Equal Weight) */}
        <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
              Total-Points Method vs. Equal-Weight Method
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            When multiple assessments exist in one category (e.g. Quizzes), syllabi calculate the category percentage using one of two methods. <em>Notice how they can produce vastly different results:</em>
          </p>

          {/* Interactive Calculator */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40 space-y-3">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
              Try It: Interactive Method Comparison Calculator
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/50 space-y-1.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Assessment 1 (Short Quiz)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoEarned1}
                    onChange={(e) => setDemoEarned1(parseFloat(e.target.value) || 0)}
                    className="w-16 font-mono font-bold text-right py-1 px-2 rounded bg-stone-50 dark:bg-[#14231b] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={demoPossible1}
                    onChange={(e) => setDemoPossible1(parseFloat(e.target.value) || 1)}
                    className="w-16 font-mono font-bold text-right py-1 px-2 rounded bg-stone-50 dark:bg-[#14231b] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100"
                  />
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">({pct1.toFixed(0)}%)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#071911] border border-stone-200 dark:border-emerald-900/50 space-y-1.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Assessment 2 (Long Quiz)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoEarned2}
                    onChange={(e) => setDemoEarned2(parseFloat(e.target.value) || 0)}
                    className="w-16 font-mono font-bold text-right py-1 px-2 rounded bg-stone-50 dark:bg-[#14231b] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={demoPossible2}
                    onChange={(e) => setDemoPossible2(parseFloat(e.target.value) || 1)}
                    className="w-16 font-mono font-bold text-right py-1 px-2 rounded bg-stone-50 dark:bg-[#14231b] border border-stone-300 dark:border-emerald-900/60 text-stone-900 dark:text-emerald-100"
                  />
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">({pct2.toFixed(0)}%)</span>
                </div>
              </div>
            </div>

            {/* Results comparison */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] text-stone-500 block">Total-Points Method</span>
                <div className="text-base font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  {totalPointsMethod.toFixed(2)}%
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  ({demoEarned1 + demoEarned2} ÷ {demoPossible1 + demoPossible2}) × 100
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] text-stone-500 block">Equal-Weight Method</span>
                <div className="text-base font-mono font-bold text-amber-800 dark:text-amber-300">
                  {equalWeightMethod.toFixed(2)}%
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Average of ({pct1.toFixed(0)}% + {pct2.toFixed(0)}%) ÷ 2
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Transmutation Table Reference */}
        <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                5
              </span>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 m-0">
                All Configured Transmutation Profiles
              </h2>
            </div>

            {/* Scale Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedScaleId('feu_letter_grade_official')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedScaleId === 'feu_letter_grade_official'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                FEU Letter Scale
              </button>
              <button
                type="button"
                onClick={() => setSelectedScaleId('feu_bsa_retention_scale')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedScaleId === 'feu_bsa_retention_scale'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                BSA Retention Scale
              </button>
              <button
                type="button"
                onClick={() => setSelectedScaleId('feu_standard_undergraduate')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedScaleId === 'feu_standard_undergraduate'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Standard Undergraduate
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40 text-xs">
            <span className="font-bold text-stone-900 dark:text-stone-100 block">
              {activeScale.name}
            </span>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
              {activeScale.notes}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-emerald-900/60">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-[#121c17] text-stone-600 dark:text-emerald-200/80 border-b border-stone-200 dark:border-emerald-900/60 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Official Grade</th>
                  <th className="py-2.5 px-3">Raw Percentage Range</th>
                  <th className="py-2.5 px-3">Letter Grade</th>
                  <th className="py-2.5 px-3">Quality Points</th>
                  <th className="py-2.5 px-3">Status / Retention Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                {activeScale.ranges.map((r) => {
                  const isRetentionCutoff = r.officialGrade === '2.50' || r.officialGrade === 'C+'
                  const isBelowRetention =
                    ['2.75', '3.00', '4.00', '5.00', 'C', 'D+', 'D', 'F'].includes(r.officialGrade) &&
                    (r.qualityPoints !== undefined ? r.qualityPoints < 2.50 : true)

                  let rowStyle = 'hover:bg-stone-50/50 dark:hover:bg-[#15231c]/50'
                  if (isRetentionCutoff) {
                    rowStyle = 'bg-amber-50/80 dark:bg-amber-950/40 font-semibold'
                  } else if (isBelowRetention && r.officialGrade === 'F') {
                    rowStyle = 'bg-red-50/40 dark:bg-red-950/20'
                  }

                  return (
                    <tr key={r.id} className={rowStyle}>
                      <td className="py-2 px-3 font-bold text-emerald-800 dark:text-emerald-400">
                        <div className="flex items-center gap-1.5">
                          <span>{r.officialGrade}</span>
                          {isRetentionCutoff && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-stone-950 font-bold uppercase font-sans">
                              Retention Cutoff
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-stone-700 dark:text-stone-300">
                        {r.minRaw}% – {r.maxRaw}%
                      </td>
                      <td className="py-2 px-3 text-stone-600 dark:text-stone-400">
                        {r.letterGrade || '—'}
                      </td>
                      <td className="py-2 px-3 font-bold text-stone-800 dark:text-stone-200">
                        {r.qualityPoints?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-2 px-3 font-sans text-stone-600 dark:text-stone-400">
                        {r.description || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6: Official Source Verification Registry */}
        <section className="p-6 rounded-2xl bg-stone-50 dark:bg-[#0c1a14] border border-stone-200 dark:border-emerald-950/60 space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 m-0">
              Official Source Verification Registry
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            To ensure academic integrity, TamsGrade distinguishes verified institutional guidelines from syllabus-dependent requirements:
          </p>

          <div className="space-y-3">
            {DEFAULT_GRADING_PROFILES.map((gp) => (
              <div
                key={gp.id}
                className="p-3.5 rounded-xl bg-white dark:bg-[#121d18] border border-stone-200 dark:border-emerald-900/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{gp.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      gp.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {gp.verificationStatus === 'verified' ? 'Verified Guideline' : 'Needs Syllabus Verification'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  <strong>Source:</strong> {gp.sourceReference}
                </p>
                {gp.notes && (
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">{gp.notes}</p>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Academic Disclaimer:</strong> TamsGrade is an independent student productivity tool created for Far Eastern University students. Always confirm specific passing scores, qualifying exam thresholds, and retention policies directly with your official course syllabus and academic department.
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
