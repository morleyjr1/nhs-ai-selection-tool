# 0003 — Feedback form (store-in-database)

- **Status:** Accepted
- **Date:** 2026-06-18
- **Affects:** `app/api/feedback/route.ts`, `lib/feedback-db.ts`,
  `components/FeedbackWidget.tsx`, `app/layout.tsx`, `package.json` (adds `postgres`)

## Context

The tool needs a way for users to send feedback that is collated and passed to
the tool owner (jawad.chaudhry5@nhs.net) **without surfacing the owner's email
address** to users. Feedback should mix structured and free-text input.

## Decision

- **Storage, not email.** Submissions are written to a Postgres `feedback` table
  and the owner reviews them in the database. Because there is no `mailto:` and
  no recipient address in client code, the owner's email is never surfaced.
- **Structured + unstructured.** One structured field — feedback **type** (bug /
  suggestion / content correction / general comment) — plus a free-text message.
  (Severity, area, and submitter email were considered and dropped to keep the
  form short; page path is captured automatically as metadata.)
- **Provider-agnostic.** The code connects via a single `DATABASE_URL`
  (Supabase, Neon, or Vercel Postgres). Supabase in a UK/EU region is the
  recommended provider — see `docs/SETUP_FEEDBACK.md` — chosen for data
  residency and its built-in table viewer for collation/CSV export.
- **Delivery UI.** A floating "Feedback" button mounted once in the root layout
  opens a modal, so feedback is available on every step without per-page wiring.
- **Abuse/PII guards.** A hidden honeypot field, a 5,000-character cap,
  server-side type validation, and an on-form request not to include
  patient-identifiable information.

## Privacy

- Owner email is not in the client bundle or any response; it lives only in
  operational docs and (if email alerts are added later) a server-side env var.
- Recommended DB region is UK/EU. Users are asked not to submit PII.

## Considered and rejected

- **Email delivery (GOV.UK Notify / Resend).** Viable, but the owner preferred
  collation in a database. Notify remains the recommended route if email alerts
  are added later.
- **Third-party form embed (Tally/Google Form).** Faster, but lives outside the
  app and is less integrated.

## Consequences

- Requires a one-time DB provisioning step and a `DATABASE_URL` env var (owner
  action; documented in `docs/SETUP_FEEDBACK.md`). Until set, the form fails
  gracefully.
- No in-app admin view yet; review is via the provider's table editor. A
  protected admin page could be added later if desired.
