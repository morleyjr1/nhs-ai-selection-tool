# 0007 — Integrating the AI Readiness Checklist (link/reference only)

- **Status:** Accepted
- **Date:** 2026-06-19
- **Affects:** `lib/readiness-resources.ts`, `components/LandingPage.tsx`,
  `components/ResultsStep.tsx`, `app/guide/page.tsx`

## Context

The AI Readiness Checklist (CERSI-AI / University of Birmingham; NHS England and
Health Foundation funded; a Feb 2026 consultation draft, prototype at
aireadiness.uk) assesses readiness for a *specific* AI tool from a
**harms-and-controls** angle: 20 causes of harm in 5 categories, 18 controls in 5
categories, and a gap analysis. It covers the same territory as this framework
but from a different direction (our framework runs complexity → readiness → gaps;
theirs runs harms → controls → gaps), and its control/harm categories map closely
onto our readiness/complexity dimensions.

## Decision

Integrate by **linking and referencing only** — not by reproducing its content.
The document is © 2026 University of Birmingham, all rights reserved, with no
reproduction or redistribution permitted without written consent. Embedding its
20 harms / 18 controls in-tool would require permission and is out of scope for
now (and would largely duplicate our framework).

Concretely:

1. **Catalogue.** Added to `readinessResources` (mapped to R1, R4, R7, R9, R10,
   R11), so it surfaces in the readiness card toggles and per-gap tools.
2. **Featured on the landing page** as a recommended companion source (a callout
   in "Sources and evidence base"), linking the CERSI-AI project page and the
   aireadiness.uk prototype.
3. **Featured in results.** The "Build readiness first" panel recommends it as a
   controls-based companion pass.
4. **Crosswalk in the user guide** (section 11): maps its five control categories
   and five harm categories to our dimensions — **category names only**, no
   reproduction of the harms/controls themselves.

## Considered and rejected

- **Embedding the harm/control workflow in-tool.** Requires written permission
  from the authors; revisit only if permission is obtained. Given the conceptual
  overlap, it would also be largely duplicative.

## Notes

- Primary link is the CERSI-AI project page (stable); the aireadiness.uk
  prototype is referenced in text (its direct fetch timed out during build — worth
  reconfirming it's live before wider release).
- It is a consultation draft (v5), so the catalogue note flags its status; revisit
  the links when a final version is published.
