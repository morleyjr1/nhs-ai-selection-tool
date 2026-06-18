# 0002 — "Who to ask" role vocabulary and per-dimension mapping

- **Status:** Accepted
- **Date:** 2026-06-18
- **Affects:** `lib/dimensions.ts`, `components/DimensionCard.tsx`

## Context

The framework tells an assessor *what* to assess on each of the 24 dimensions,
but not *who in the organisation (or the vendor) holds the answer*. Many of the
guiding questions are already tagged `[Ask vendor]` or `[Assess internally …]`,
but that guidance was buried and inconsistent. Assessors who don't personally
know (say) the validation evidence or the IG position need a clear pointer to
the right person to approach.

## Decision

Add a per-dimension "who can help answer this?" pointer, surfaced via an ℹ️
tooltip on each dimension card.

### Controlled vocabulary (21 roles)

A fixed list of roles/sources is reused across all 24 questions, so naming is
consistent and the set is reviewable in one place (`WHO_TO_ASK_ROLES` in
`lib/dimensions.ts`). The first role listed for any dimension is its primary
source.

External: the vendor/supplier.
Clinical: CCIO; relevant clinical or specialty lead; Clinical Safety Officer.
IG & security: IG lead/DPO; Caldicott Guardian; SIRO; cyber/information security lead.
Regulatory: medical device regulatory lead.
Technical & data: CIO/IT & infrastructure lead; data/informatics/analytics team.
Operational & people: procurement/commercial/contracts lead; operational/service manager/change lead; workforce, training & education lead; HR/people team; staff representatives (union/Staff Side); finance lead.
Governance & public: AI governance group/SRO; PPI lead/patient representatives; equality & health inequalities (EDI) lead.
Evaluation: evaluation/health services research partner.

### Mapping

`whoToAskByDimension` maps each dimension id to 2–5 roles. It is typed
`Record<string, WhoToAskRole[]>`, so any role-name typo fails the build. Notable
choices: the medical device regulatory lead appears wherever device
classification or regulatory status bears on the score (C5, C8, C9, C11, R9);
the Clinical Safety Officer covers C4/C9/C11 and the safety/governance readiness
dimensions (R1, R9); HR and staff representatives sit on both workflow-change
dimensions (C7 and R7); procurement/commercial owns the vendor/supply-chain
dimensions (C12, R11, R12).

### Presentation

An ℹ️ icon in each dimension card header toggles a small popover (click-to-open,
so it works on touch as well as desktop). Chosen over always-visible tags to
keep the cards uncluttered.

## Consequences

- The vocabulary and mapping are the single source of truth in
  `lib/dimensions.ts`; edit there to change suggestions.
- This is descriptive guidance only — it does not affect scoring or floors.
- Future changes to the role list or mapping should update this record.
