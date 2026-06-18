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
