# Automatic GitHub Synchronization

## Continuous Commit & Push Policy
- Whenever any code edits, features, bug fixes, or improvements are completed and verified:
  1. Ensure tests pass (`npx vitest run`) and the app builds cleanly (`npm run build`).
  2. Automatically stage all modified and new files (`git add -A`).
  3. Commit with a clear, descriptive conventional commit message (`git commit -m "..."`).
  4. Automatically push the commit to the GitHub repository (`git push origin main`).
- Proceed autonomously without pausing to ask for manual permission to push.
