# TamsGrade 🔰
### Far Eastern University Manila &bull; IABF Zero-Based Grading Tracker & Simulator

[![React 19](https://img.shields.io/badge/React-19.3-005a36?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-0d3824?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-10b981?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-iOS_%26_Android-f59e0b?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Offline_Dexie_DB-062316?style=for-the-badge)](https://dexie.org)

**TamsGrade** is a specialized, zero-telemetry academic performance suite built tailored for Far Eastern University (FEU) Manila students in the **Institute of Accounts, Business and Finance (IABF)**. It enforces official FEU zero-based grading formulas, provides realistic Canvas LMS-inspired "What-If" simulations, tracks retention QPA cutoffs, and runs offline on mobile devices with native iPhone PWA support.

---

## 📱 Features at a Glance

* **🏛️ Official FEU Zero-Based Transmutation Engine**:
  * Accurate zero-based raw percentage computation: $\text{Raw Grade} = \sum (\text{Weight} \times \frac{\text{Score}}{\text{Total}})$.
  * Full support for both the **FEU Standard Undergraduate Scale** (Passing 1.00 = 50.00%) and the strict **BSA Retention Scale** (Passing 2.50 = 75.00%).
  * Explicit distinction between **Midterm Running Grade** (current academic pace) and **Final Grade** (official course destination).

* **🎯 Canvas LMS What-If Grade Simulator**:
  * Test hypothetical scores on upcoming or past exams without overwriting official academic records.
  * Revert individual scores back to actual grades with a single tap.
  * Instant feedback on whether changes improve or lower your cumulative QPA.

* **⚡ Required Score Solver (Target Calculator)**:
  * Tells you exactly what score you need on remaining exams (Midterms, Departmentals, Final Assessments) to secure your target grade (President's List 4.00, Dean's List 3.50, or BSA Retention Cutoff 2.50).

* **🎓 Complete 4-Year BS Accountancy Curriculum Roadmap**:
  * Pre-loaded with all 11 terms (1st Year to 4th Year including Midyears) from `ACT1101`, `LAW1101`, `MGT1101` to Comprehensive Reviews (`ACT1232`).
  * Easily switch between semesters with a single tap on the interactive header.

* **🏷️ Direct Given Grade Input**:
  * Received a direct letter grade from your professor? Input it with one tap via the Direct Grade modal (`A`, `B+`, `C+`, etc.) while retaining assessment breakdowns.

* **📱 Mobile First & iOS PWA Ready**:
  * Native bottom sheets with drag grabbers and safe-area insets (`env(safe-area-inset-bottom)`).
  * 44px+ touch targets and tactile press physics (`active-press`).
  * Full bleed iOS app icon with zero black-corner artifacting.
  * Auto-zoom prevention on iOS (`inputMode="decimal"` and 16px baseline).

* **🔒 100% Private & Zero-Telemetry**:
  * All grades and assessments are stored locally in your browser's IndexedDB via Dexie.js. No tracking, no third-party cloud database, no data selling.
  * Comprehensive JSON export and import for seamless offline backups.

---

## 📲 How to Install as an App on iPhone (PWA)

You can install TamsGrade directly to your iPhone home screen with a native app icon and fullscreen experience:

1. Open **Safari** on your iPhone.
2. Navigate to your hosted TamsGrade URL (or local network IP e.g. `http://<your-ip>:5173`).
3. Tap the **Share** button at the bottom of Safari (the square icon with an arrow pointing up).
4. Scroll down and tap **Add to Home Screen** (`+`).
5. Confirm the name **TamsGrade** and tap **Add** in the top right.
6. The gold & green Tamaraw insignia will now appear on your home screen and launch in fullscreen standalone mode.

---

## 🚀 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ or 20+)
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/tamsgrade.git

# Navigate into the project directory
cd tamsgrade

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
# Type-check and create production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🏗️ Project Architecture

```
tamsgrade/
├── public/                 # Static assets, PWA manifest, and iOS apple-touch-icons
│   ├── apple-touch-icon.png    # 180x180 native iOS PWA icon (full bleed)
│   ├── icon-192.png            # Android web app icon
│   ├── icon-512.png            # High-res PWA launch icon
│   ├── icon-maskable.png       # Android adaptive icon with safe margins
│   └── manifest.webmanifest    # Web App Manifest configuration
├── scripts/
│   └── generate-icons.js   # Script using Sharp to generate all icon sizes
├── src/
│   ├── components/         # Reusable UI components & bottom sheet modals
│   │   ├── AssessmentModal.tsx     # Add/edit assessment scores
│   │   ├── DirectGradeModal.tsx    # Direct letter grade assignment
│   │   ├── HeaderBar.tsx           # Academic term switcher & header
│   │   ├── Navigation.tsx          # 5-slot mobile bottom navigation + More drawer
│   │   └── SubjectModal.tsx        # Add/edit courses & category weights
│   ├── context/
│   │   └── GradeContext.tsx        # Global state, term persistence & calculation cache
│   ├── db/
│   │   └── db.ts                   # Dexie.js IndexedDB schema & default courses
│   ├── engine/             # Core FEU institutional calculation engine
│   │   ├── calculator.ts           # Zero-based percentage calculations
│   │   ├── curriculum.ts           # 11-term BSA curriculum catalog
│   │   ├── profiles.ts             # Default grading profiles & weights
│   │   ├── qpaRequirements.ts      # Latin honors & retention cutoffs
│   │   ├── simulator.ts            # What-If delta calculation algorithms
│   │   └── transmutation.ts        # Official FEU transmutation tables
│   ├── pages/              # Main view screens
│   │   ├── Dashboard.tsx           # Cumulative QPA & course cards
│   │   ├── Subjects.tsx            # Syllabus assessments & milestone pipeline
│   │   ├── WhatIfSimulator.tsx     # Canvas LMS grade simulation table
│   │   ├── RequiredScore.tsx       # Target solver
│   │   ├── Curriculum.tsx          # 4-year curriculum roadmap
│   │   ├── GradeCalculator.tsx     # Quick single-course transmute calculator
│   │   ├── GradingGuide.tsx        # FEU official grading manual & rules
│   │   └── Settings.tsx            # Preferences, JSON backup & reset
│   ├── index.css           # Design tokens, mobile touch physics & safe-area styles
│   └── main.tsx            # React root entry point
├── index.html              # HTML shell with Apple Web Clip & PWA tags
└── vite.config.ts          # Vite build & Tailwind configuration
```

---

## ⚖️ Disclaimer

*TamsGrade is an independent, student-focused tool designed to assist FEU students in monitoring their academic progress and simulating syllabus outcomes. It is not an official system of Far Eastern University or Canvas LMS. Official final marks are always those issued by your professors and the University Registrar.*
