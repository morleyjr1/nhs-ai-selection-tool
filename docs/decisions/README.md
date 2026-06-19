# Decision records

Architecture / design decision records (ADRs) for the NHS AI Selection Tool.

We write a short record here whenever we make a non-trivial change to the
framework's model, scoring logic, or data schema — anything a future
contributor (or a future version of us) would otherwise have to reverse-engineer
from the code. The aim is that the *reasoning* survives, not just the diff.

## Conventions

- One file per decision, numbered sequentially: `NNNN-short-slug.md`.
- Keep them short: context, the decision, the consequences, and what we
  explicitly considered and rejected.
- Status is one of `Proposed`, `Accepted`, `Superseded by NNNN`.
- When a later decision overrides an earlier one, mark the old one
  `Superseded` and link forward — don't delete it.

## Index

- [0001 — Autonomy tier and orthogonal agentic flag](./0001-autonomy-tier-and-agentic-flag.md) — *Accepted*
- [0002 — "Who to ask" role vocabulary and per-dimension mapping](./0002-who-to-ask-role-vocabulary.md) — *Accepted*
- [0003 — Feedback form (store-in-database)](./0003-feedback-form.md) — *Accepted*
- [0004 — FDA full list + security/data-protection/standards checks](./0004-assurance-checks.md) — *Accepted*
- [0005 — Readiness-building resource catalogue + surfacing](./0005-readiness-resources.md) — *Accepted*
- [0006 — Worked-example anchors: anonymised in the frontend](./0006-worked-examples.md) — *Accepted*
- [0007 — Integrating the AI Readiness Checklist (link/reference only)](./0007-ai-readiness-checklist.md) — *Accepted*
