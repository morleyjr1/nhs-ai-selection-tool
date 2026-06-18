# 0001 — Autonomy tier and orthogonal agentic flag

- **Status:** Accepted
- **Date:** 2026-06-18
- **Affects:** `lib/types.ts`, `lib/constants.ts`, `lib/floors.ts`, `lib/flags.ts`,
  `components/BasicDataStep.tsx`, `components/SelectionTool.tsx`, `lib/pdf-report.ts`,
  `scripts/classify.test.ts`

## Context

The original Q4 `category` field used a fixed 1–4 scale (purely administrative →
administrative-in-clinical → clinical decision support → autonomous clinical
function). The category number drove the scoring logic in two places: the
autonomy floors (`category === 4` forced C4 ≥ 2 and C9 ≥ 2) and a free-text
consistency flag (fired when the stated purpose sounded clinical but the category
was ≤ 2).

This collapsed two distinctions that matter for risk:

1. **Degree of autonomy.** A narrow, single-decision autonomous tool (e.g. d-Nav
   insulin titration; EyeArt retinopathy grading) behaves nothing like an
   open-ended autonomous system. Both lack a clinician reviewing each output, but
   the risk surface differs by orders of magnitude.

2. **Agency.** Whether the system *plans and executes multi-step sequences of
   actions* — choosing what to do next, using tools, adapting as it goes — is
   orthogonal to how much human gate exists. An agentic system can be
   decision-support (a copilot that drafts and a clinician signs off, e.g.
   Tortus/OSLER) or fully autonomous (a patient-facing care agent, e.g.
   Hippocratic AI). Agency is therefore a separate axis, not a higher rung on the
   autonomy scale.

## Decision

### 1. Replace the 4-level category with a 5-level autonomy tier

`ToolCategory` (1–4) becomes `AutonomyTier` (1–5); the `BasicData.category` field
becomes `BasicData.autonomyTier`:

| Tier | Label | Notes |
|------|-------|-------|
| 1 | Administrative | No patient-level clinical data, no influence on clinical decisions. |
| 2 | Administrative in a clinical setting | Handles patient data / sits in the workflow but documents rather than recommends. |
| 3 | Clinical decision support | Informs a clinician's decision; a human makes the final call. |
| 4 | **Bounded autonomous** clinical function | Acts without per-output review, but on a single, narrow, well-defined decision within a fixed protocol. |
| 5 | **Fully autonomous** clinical function | Acts without a clinician gate across an open-ended or multi-step scope. Highest scrutiny. |

The split is of the former tier 4 ("autonomous") into 4 (bounded) and 5 (full).
Tiers 1–3 are unchanged in meaning.

The 8 *functional* categories discussed during design (operational analytics,
encounter documentation, patient admin comms, risk prediction, diagnostic
support, triage/patient-facing, treatment/content drafting, autonomous function)
are **not** a separate code field. They are descriptive groupings used to choose
anchors and will be surfaced as examples within the tier descriptions and in the
forthcoming worked-examples / user-guide step.

### 2. Add an orthogonal `agentic` boolean

`BasicData.agentic: boolean` — does the tool plan and carry out multi-step action
sequences towards a goal, rather than producing a single bounded output? Asked of
every tool, independent of tier.

### 3. Floor rules keyed off tier + agency, not the raw category number

All floors remain cumulative (the highest applicable floor wins per dimension).

| Trigger | Condition | Floors |
|---------|-----------|--------|
| Stochastic | `determinism === 2` | C4 ≥ 2, C5 ≥ 2, C11 ≥ 2 *(unchanged)* |
| Autonomous | `autonomyTier >= 4` (bounded **or** full) | C4 ≥ 2, C9 ≥ 2 *(was `category === 4`)* |
| **Agentic** | `agentic === true` | C4 ≥ 2, C5 ≥ 2, C11 ≥ 2 *(new — inherits the stochastic floors, since agentic systems are effectively stochastic)* |
| **Agentic AND autonomous** | `agentic === true && autonomyTier >= 4` | C4 = 3, C5 = 3, C9 = 3, C11 = 3 *(new — hard ceiling-floor)* |
| Class IIb | `deviceClass === 4` | C9 ≥ 2 *(unchanged)* |
| Class III | `deviceClass === 5` | C9 = 3 *(unchanged)* |

The agentic-and-autonomous rule forces the four dimensions that are *intrinsically*
maximal for this class — human oversight (C4), validation (C5), safety consequence
(C9), and monitoring/drift (C11) — to the top of the scale. These are the same four
that already pile up under stochastic + autonomous + Class III; this corner is where
they all max out together. A hard 3 removes assessor discretion on these dimensions
for this combination: this is a deliberate precautionary policy, consistent with
Class III already forcing C9 = 3.

### 4. Consistency flag

The `cross-category-clinical` flag (targets `CATEGORY`, fires when the stated
purpose reads as clinical but the tier is ≤ 2) is retained unchanged in behaviour —
its `score <= 2` condition still corresponds to administrative / admin-in-clinical
on the new tier scale. `evaluateFlags`'s third parameter is renamed `category` →
`autonomyTier` for clarity.

## Canonical anchors (locked)

A fixed set of real, NHS-relevant tools used as calibration anchors across the
whole tool — worked examples, regression checks, and the user guide all reference
back to these. The set is chosen to span the grid (functional role × autonomy tier
× agentic flag) from the bottom of the scale to the top.

| Tool | Functional role | Autonomy tier | Agentic | Anchors |
|------|-----------------|---------------|---------|---------|
| NHS A&E demand forecasting (FDP / Faculty) | Operational analytics | Administrative | No | Bottom of scale; no floors fire |
| Dragon Copilot *(ambient-scribe function only)* | Encounter documentation | Admin-in-clinical | No | Low clinical anchor |
| Cera | Risk prediction & early warning | Decision-support | No | Short time-to-harm |
| Mia (Kheiron) | Diagnostic interpretation support | Decision-support | No | Imaging reader |
| Limbic Access | Triage / patient-facing | Decision-support | No | Patient-facing, Class IIa; exercises stochastic floors |
| Tortus (OSLER) | Clinical copilot | Decision-support *(supervised)* | **Yes** | Agentic-but-not-autonomous keystone; exercises agentic-only floors |
| d-Nav | Bounded autonomous | Bounded autonomous | No | Narrow single-decision autonomy |
| Hippocratic AI | Fully autonomous | Full autonomous | **Yes** | Super-floor corner: hard-3 on C4/C5/C9/C11 |

Notes:
- **Dragon Copilot** is pinned to its core ambient-scribe function so it remains a
  clean *non-agentic* documentation anchor; Microsoft's agentic roadmap is noted
  but is not part of the anchor.
- **Tortus** is the keystone that justifies making agency orthogonal: it takes
  supervised EHR actions (lab requests, coding, drafting) but a clinician retains
  the gate — agentic without being autonomous.

## Considered and rejected

- **Agency as a higher autonomy rung (tier 6).** Rejected: agency is orthogonal,
  not "more autonomous". An agentic decision-support tool (Tortus) is the
  counter-example a linear scale cannot represent.
- **A separate 8-way functional-category code field.** Rejected for now: the
  scoring logic needs only tier + agency; the functional categories are
  descriptive and belong with the worked examples (a later step). Revisit if the
  UI or analytics later need the finer classification.

## Consequences

- Worked examples (the 10 in the source spec) are **parked**, not rewritten here —
  they are not wired into the running tool. They will be rebuilt against this model
  in the dedicated worked-examples / user-guide step.
- Any future change to this model, the floors, or the anchor set should update this
  record (or supersede it with a new one).
