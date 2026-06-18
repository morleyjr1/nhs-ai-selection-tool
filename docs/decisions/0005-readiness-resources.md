# 0005 — Readiness-building resource catalogue + surfacing

- **Status:** Accepted (catalogue + surfacing); best-practice exemplars and the
  submission form are related follow-ups (see "Remaining").
- **Date:** 2026-06-18
- **Affects:** `lib/readiness-resources.ts`, `components/DimensionCard.tsx`,
  `components/ResultsStep.tsx`

## Context

The readiness side of the tool was abstract. The NHS team asked for: (1)
best-practice examples per readiness dimension, (2) links to external tools that
help build readiness, (3) those tools surfaced contextually — on the dimension,
when the result is "Build readiness first," and against each specific gap, and
(4) a way for NHS staff to submit known best-practice tools.

## Decision

### Catalogue (`lib/readiness-resources.ts`)

A curated catalogue of **64 real external resources** (frameworks, templates,
standards, guidance, training), each mapped to one or more readiness dimensions
(R1–R12) via a `dimensions: string[]` field, with `getReadinessResources(id)`.
Sourced from a structured search plus the project team's own tools, then curated
by the team in a worksheet (keep/drop, remapped dimensions, 30 additions).
Coverage: every dimension has ≥4 resources (R2 thinnest at 4; R10 richest at 23).

The catalogue is the single source of truth; edit it to change what's surfaced.

### Surfacing (`components/`)

- **Per readiness dimension card:** a collapsed "Tools to help build this
  readiness (N)" toggle listing that dimension's resources (readiness side only;
  behind a toggle to keep the cards uncluttered, per the agreed UX).
- **Per gap in the results:** each prioritised-gap row shows the dimension label
  and a "Tools (N)" toggle listing resources specific to that gap's readiness
  dimension (`R{index}`) — "always where there are gaps, specific to the gap."
- **"Build readiness first" result:** a note above the prioritised gaps directs
  the user to the per-gap tools.

## Remaining (related sub-tasks)

- **A — Best-practice exemplars:** a concrete "what strong readiness looks like"
  per dimension, to share the same card toggle. To be drafted for review.
- **D — Submission form:** an NHS-staff form to submit a best-practice tool,
  stored in a new Supabase `resource_submissions` table as a review queue
  (curated before being added to the catalogue here).

## Notes

- Catalogue includes some international/academic resources (NIST, WHO, ISO,
  FUTURE-AI, TRIPOD+AI, etc.) the team chose to keep alongside UK/NHS sources.
- A couple of entries are flagged by their publishers as "under review" (ICO AI
  guidance) — refresh the catalogue periodically.
