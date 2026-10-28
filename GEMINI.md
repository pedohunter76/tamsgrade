# Workspace Instructions & Automation Rules

## 1. Automatic GitHub Synchronization
- Always automatically commit and push working, verified changes directly to the GitHub repository (`origin main`) after completing any fix, feature, or improvement.
- Verification workflow before push:
  1. Unit tests pass: `npx vitest run`
  2. Production build succeeds: `npm run build`
  3. Git push: `git add -A ; git commit -m "..." ; git push origin main`
- Execute pushes autonomously without waiting for separate confirmation.

## 2. FEU Manila IABF Standards
- Preserve the zero-based grading formulas, 1.00–4.00 transmutation scale, 2.50 BSA retention cutoff, and Taste Skill typography and color tokens.
