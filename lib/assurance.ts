// ---------------------------------------------------------------------------
// Security, data protection & standards assurance.
//
// A hybrid model (see docs/decisions/0004-assurance-checks.md):
//   - Dedicated public registers (Cyber Essentials, NHS DSPT) are surfaced as
//     one-click links to the official search — these are the authoritative
//     source and (per IASME's terms) should be checked by a person, not scraped.
//   - Looser signals (ISO certifications, DCB clinical safety) are also queried
//     automatically via the assurance API route and shown inline.
//
// Every signal is tagged company-level vs product-level, because a vendor-level
// certificate (e.g. Cyber Essentials) does NOT assure a specific product.
// ---------------------------------------------------------------------------

export type AssuranceLevel = "company" | "product";

export interface AssuranceLink {
  id: string;
  label: string;
  level: AssuranceLevel;
  /** Plain-language explanation of what holding this tells (and doesn't tell) you. */
  whatItIndicates: string;
  linkLabel: string;
  url: string;
  /** Optional instruction shown with the link (e.g. what to search for). */
  instruction?: string;
  /** If set, inline auto-search results for this key (from the assurance route) are shown. */
  autoKey?: "iso" | "clinicalSafety";
}

function webSearch(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Build the assurance links for a given tool/company. Pure and static — the
 * inline auto-search results are fetched separately via /api/lookup/assurance.
 */
export function buildAssuranceLinks(
  toolName: string,
  manufacturer?: string,
): AssuranceLink[] {
  const company = (manufacturer ?? "").trim();
  const subject = company || toolName;

  return [
    // ── Company / organisation level ──
    {
      id: "cyber-essentials",
      label: "Cyber Essentials / Cyber Essentials Plus",
      level: "company",
      whatItIndicates:
        "An NCSC-backed certification that the organisation has basic technical controls against common cyber attacks. 'Plus' adds an independent hands-on technical audit. It is organisation-level and valid for 12 months — it does not assess this specific product.",
      linkLabel: "Search the NCSC Cyber Essentials register",
      url: "https://iasme.co.uk/cyber-essentials/ncsc-certificate-search/",
      instruction: `Search the register by name for "${subject}". Only certificates issued in the last 12 months appear.`,
    },
    {
      id: "dspt",
      label: "NHS Data Security and Protection Toolkit (DSPT)",
      level: "company",
      whatItIndicates:
        "An annual self-assessment (independently audited for some organisation types) that an organisation handling NHS data meets the required data security and information governance standards. The public status is 'Standards Met', 'Standards Not Met', etc. It is organisation-level; a commercial vendor only appears if it has registered (often via an ODS code).",
      linkLabel: "Search the DSPT organisation register",
      url: "https://www.dsptoolkit.nhs.uk/OrganisationSearch",
      instruction: `Search by organisation name or ODS code for "${subject}", then check the published status is "Standards Met".`,
    },
    {
      id: "iso",
      label: "ISO 27001 / 13485 / 42001 certification",
      level: "company",
      whatItIndicates:
        "Independent certification of management systems: ISO 27001 (information security), ISO 13485 (medical-device quality management), ISO 42001 (AI management systems). Certification covers the organisation's processes, not the safety or performance of this specific product.",
      linkLabel: "Search the web for the company's ISO certifications",
      url: webSearch(`"${subject}" ("ISO 27001" OR "ISO 13485" OR "ISO 42001")`),
      autoKey: "iso",
    },

    // ── Product level ──
    {
      id: "dcb",
      label: "DCB0129 / DCB0160 clinical safety",
      level: "product",
      whatItIndicates:
        "NHS clinical safety standards: DCB0129 places duties on the manufacturer to produce a Clinical Safety Case Report (with a named Clinical Safety Officer) for the product; DCB0160 places duties on the deploying organisation. This evidence is product-specific.",
      linkLabel: "Search the web for the product's clinical safety case",
      url: webSearch(
        `("${toolName}" OR "${subject}") ("DCB0129" OR "DCB0160" OR "clinical safety case")`,
      ),
      autoKey: "clinicalSafety",
    },
  ];
}
