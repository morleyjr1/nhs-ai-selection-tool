# 0006 — Worked-example anchors: anonymised in the frontend

- **Status:** Accepted (anchors + landing introduction). Per-domain illustrative
  answers and the complexity-card toggle are an in-progress follow-up.
- **Date:** 2026-06-18
- **Affects:** `lib/anchors.ts`, `components/LandingPage.tsx`

## Context

The tool uses eight canonical real-world tools as worked examples for
calibration. Attaching illustrative complexity scores to *named real products*
in a public NHS tool is inappropriate — it could imply an authoritative judgement
that, say, a specific commercial product scores 3 on safety.

## Decision

- Each anchor keeps its **real name in the backend only** (`realName` in
  `lib/anchors.ts`, plus this ADR) and is shown in the frontend under an
  **invented archetype display name** (`displayName`). The real name is never
  rendered.
- Display ↔ real mapping: FlowCast = A&E demand forecasting (FDP/Faculty);
  ScribeMate = Dragon Copilot; RiskSense = Cera; ScanRead = Mia (Kheiron);
  SymptomChat = Limbic Access; ClinPilot = Tortus/OSLER; DoseGuide = d-Nav;
  CareAgent = Hippocratic AI.
- Anonymisation applies **only to the scored anchor tools**, not to the real
  resources/registries the tool points users to (DTAC, DSPT, Cyber Essentials,
  the FDA list, etc.) — those remain real.
- The landing page introduces all eight archetypes (display names + what each
  is and where it sits on the autonomy/agency range), flagged as illustrative
  composites, not assessments of real products.

## Remaining

Per-domain illustrative example answers (for each complexity domain, across a
spanning quartet — FlowCast, ScanRead, DoseGuide, CareAgent — at an explanatory
depth that teaches the calibration), surfaced behind an "Example answers
(illustrative only)" toggle on each complexity card.
