# 0004 — FDA full list + security/data-protection/standards checks

- **Status:** Accepted
- **Date:** 2026-06-18
- **Affects:** `lib/fda-devices.json`, `app/api/lookup/fda/route.ts`, `lib/lookup.ts`,
  `lib/assurance.ts`, `app/api/lookup/assurance/route.ts`,
  `components/ToolIntelligence.tsx`, `lib/pdf-report.ts`

## Context

The first-page Tool Intelligence panel stored only an 8-row placeholder of the
FDA AI/ML device list, and offered no view on a tool's security, data-protection,
or standards posture. The NHS team asked for (a) the full FDA list and (b) an
automatic check of NHS DSPT status and related assurances.

## Decision

### FDA list

- Replace the placeholder with the **full FDA AI/ML-Enabled Medical Device list**
  (~1,524 devices), mapped to the existing `FDAMatch` shape (panel → specialty;
  clearance pathway derived from the submission-number prefix: DEN → De Novo,
  K → 510(k), P → PMA).
- **Move FDA matching to a server route** (`/api/lookup/fda`) so the ~300 KB
  dataset stays server-side and never ships in the client bundle. `runLookup`
  now fetches it alongside the other lookups.
- Refresh by replacing `lib/fda-devices.json` from the FDA download.

### Security, data protection & standards

A **hybrid** model, with every signal tagged **company-level** or
**product-level** (a vendor-level certificate does not assure a specific product):

| Signal | Level | How |
|--------|-------|-----|
| Cyber Essentials / Plus | Company | One-click link to the NCSC/IASME register (their terms require human checking, not scraping) |
| NHS DSPT ("Standards Met") | Company | One-click link to the DSPT organisation register |
| ISO 27001 / 13485 / 42001 | Company | Constrained web search, auto-run + inline results, plus a search link |
| DCB0129 / DCB0160 clinical safety | Product | Constrained web search, auto-run + inline results, plus a search link |

- Dedicated registers are **links** (authoritative, free, compliant); looser
  signals are **auto-searched** via `/api/lookup/assurance` (Brave), shown inline.
- Each signal carries a plain-language **"what it indicates"** explainer.
- The UI groups results into "about the company" vs "about this product" with a
  caution that company-level certificates don't assure the product. The existing
  FDA result is itself product-level.

## Privacy / compliance notes

- The Cyber Essentials register is linked, not queried, in line with IASME's terms
  (certificate-checking only, no automated data research).
- DSPT exposes only summary status publicly; a commercial vendor appears only if
  registered (often via an ODS code).
- Auto-search requires `BRAVE_SEARCH_API_KEY`; without it the register/search
  links still work and the panel degrades gracefully.

## Considered and rejected

- **Auto-querying the Cyber Essentials/DSPT registers** — rejected: not reliably
  web-indexable and (for Cyber Essentials) contrary to the register's terms.
- **A product-level DSPT/Cyber Essentials check** — not meaningful; these are
  organisation-level, hence the explicit company/product tagging.
