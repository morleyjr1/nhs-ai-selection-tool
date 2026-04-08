# Build Status — NHS AI Selection Tool

- **Repository:** https://github.com/morleyjr1/nhs-ai-selection-tool
- **Production (Vercel):** https://nhs-ai-selection-tool.vercel.app

## Step 0 — Plumbing & scaffold
- **Date:** 2026-04-08
- **Status:** Complete. Next.js 15 (App Router, TypeScript, Tailwind, ESLint) scaffolded; placeholder landing page in place.
- **Commit:** 4b4a2e3

## Step 1a — Dimensions module
- **Date:** 2026-04-08
- **Commit:** 0c14b66
- **Status:** Complete. `lib/dimensions.ts` contains all 24 dimensions (C1–C12, R1–R12) transcribed verbatim from `NHS_AI_Selection_Tool_Web_Spec.md`. Type-checks under `npx tsc --noEmit`.
- **Verification script output (`npx tsx scripts/verify-dimensions.ts`):**
  ```
  Total dimensions: 24
  Complexity dimensions: 12
  Readiness dimensions: 12
  Empty / short whyItMatters: []
  Dimensions with conditionalNote: [ 'R4', 'R9' ]
  Dimensions with !=3 score descriptors: []
  ```
- **Spec vs PDF cross-check:** Could not be performed mechanically — `pdftotext` / `poppler` is not installed on this machine, so the PDF was not parsed line-by-line. The transcription used `NHS_AI_Selection_Tool_Web_Spec.md` as the source of truth (per instructions) and `NHS_AI_Selection_Tool_12x12_Framework.md` as a secondary reference for the formal `longLabel` titles. No textual discrepancies were observed between the spec and the markdown framework for the score descriptors, guiding questions, why-it-matters text, or conditional notes that were transcribed. **Action item:** if a PDF reader becomes available, re-run a cross-check against `NHS_AI_Selection_Tool_Framework_and_Validation.pdf` and update this entry.
- **Notes on long vs short labels:**
  - `shortLabel` uses ampersands as in the spec (e.g. "Task & Decision Complexity").
  - `longLabel` uses the formal "and" form from the markdown framework section headings (e.g. "Task and Decision Complexity"), and includes the trailing word "Complexity" / "Readiness" where the framework does (e.g. "Information Governance Complexity", "Data Infrastructure Readiness"). Two readiness dimensions — R4 ("Human Oversight Capacity") and R8 ("Evaluation Readiness") — do not gain a trailing "Readiness" because the framework heading itself does not.
- **No typos were silently corrected.** No content was paraphrased.
