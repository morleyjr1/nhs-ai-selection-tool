// ---------------------------------------------------------------------------
// Tool Intelligence lookup — orchestration layer.
//
// Automated queries: FDA, PubMed, ClinicalTrials.gov, Brave Web (all via API routes).
// Structured search links: NICE, EUDAMED, MHRA PARD, MHRA alerts,
//                          NHS England, NHS Transformation Directorate.
//
// NICE and EUDAMED are presented as structured search links rather than
// automated queries because:
//   - NICE is a React SPA; its internal API is not reliably accessible
//     from server-side code, and server-side fetches return empty shells.
//   - EUDAMED's public API does not support text-based filtering; the
//     freeText parameter is ignored and the full database (1.5M+ devices)
//     is returned regardless of query. Device detail URLs are also broken.
//
// Both are presented prominently in the panel with clear guidance on what
// to look for when the user clicks through.
// ---------------------------------------------------------------------------

import { buildAssuranceLinks, type AssuranceLink } from "./assurance";

// ── Result types ──

export interface FDAMatch {
  deviceName: string;
  manufacturer: string;
  submissionNumber: string;
  decisionDate: string;
  clearancePathway: string;
  specialty: string;
}

export interface PubMedResult {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  date: string;
  url: string;
}

export interface TrialResult {
  nctId: string;
  title: string;
  status: string;
  sponsor: string;
  phase: string;
  locations: string;
  hasUKSite: boolean;
  url: string;
}

export interface WebResult {
  title: string;
  url: string;
  snippet: string;
  isNHS: boolean;
  isGovUK: boolean;
}

export interface SmartLink {
  label: string;
  url: string;
  description: string;
  /** If true, displayed prominently in its own section rather than the
   *  generic "Verify Directly" grid at the bottom. */
  prominent?: boolean;
  /** Optional category for grouping prominent links. */
  category?: "regulatory" | "guidance" | "nhs";
}

export interface LookupResults {
  toolName: string;
  timestamp: string;

  fda: { status: "found" | "not_found" | "error"; matches: FDAMatch[]; error?: string };
  pubmed: { status: "found" | "not_found" | "error"; count: number; results: PubMedResult[]; error?: string };
  trials: { status: "found" | "not_found" | "error"; total: number; completed: number; recruiting: number; ukBased: number; results: TrialResult[]; error?: string };
  web: { status: "found" | "not_found" | "error" | "no_api_key"; results: WebResult[]; error?: string };
  assurance: {
    status: "found" | "not_found" | "error" | "no_api_key";
    iso: WebResult[];
    clinicalSafety: WebResult[];
    error?: string;
  };
  /** Static security/data-protection/standards links (company- and product-level). */
  assuranceLinks: AssuranceLink[];
  smartLinks: SmartLink[];
}

// ── Smart links ──

function buildSmartLinks(toolName: string, manufacturer?: string): SmartLink[] {
  const encoded = encodeURIComponent(toolName);
  const combinedEncoded = manufacturer
    ? encodeURIComponent(`${toolName} ${manufacturer}`)
    : encoded;

  return [
    // ── Prominent links: NICE and EUDAMED ──
    {
      label: "Search NICE guidance",
      url: `https://www.nice.org.uk/search?q=${combinedEncoded}`,
      description:
        "Look for Technology Appraisals (TA), Medtech Innovation Briefings (MIB), Diagnostics Guidance (DG), or Evidence Standards Framework assessments. NICE evaluations provide cost-effectiveness evidence relevant to NHS adoption decisions.",
      prominent: true,
      category: "guidance",
    },
    {
      label: "Search EUDAMED (EU device registry)",
      url: `https://ec.europa.eu/tools/eudamed/#/screen/search-device`,
      description:
        `Search for "${toolName}"${manufacturer ? ` or "${manufacturer}"` : ""} by trade name or manufacturer. Check CE marking status, risk classification, and whether a UK Responsible Person or EU Authorised Representative is registered. EUDAMED became mandatory for new devices from May 2026.`,
      prominent: true,
      category: "regulatory",
    },

    // ── Standard smart links ──
    {
      label: "MHRA device registration (PARD)",
      url: `https://pard.mhra.gov.uk/`,
      description:
        "Search by manufacturer name. MHRA PARD does not list AI-specific device codes — absence of results does not confirm absence of registration.",
    },
    {
      label: "MHRA safety alerts",
      url: `https://www.gov.uk/drug-device-alerts?keywords=${encoded}`,
      description:
        "Search for safety alerts, field safety notices, and recalls.",
    },
    {
      label: "NHS England AI search",
      url: `https://www.england.nhs.uk/?s=${encoded}`,
      description:
        "Search NHS England for deployment announcements, guidance, or programme references.",
    },
    {
      label: "NHS Transformation Directorate",
      url: `https://transform.england.nhs.uk/?s=${encoded}`,
      description:
        "Search for digital transformation and AI-related publications.",
    },
  ];
}

// ── Orchestrator ──

/**
 * Run all lookups for a given tool name. FDA is synchronous (static data);
 * PubMed, ClinicalTrials, and Brave are fetched via API routes.
 * NICE and EUDAMED are provided as structured search links.
 */
export async function runLookup(
  toolName: string,
  manufacturer?: string,
): Promise<LookupResults> {
  const results: LookupResults = {
    toolName,
    timestamp: new Date().toISOString(),
    fda: { status: "not_found", matches: [] },
    pubmed: { status: "not_found", count: 0, results: [] },
    trials: { status: "not_found", total: 0, completed: 0, recruiting: 0, ukBased: 0, results: [] },
    web: { status: "not_found", results: [] },
    assurance: { status: "not_found", iso: [], clinicalSafety: [] },
    assuranceLinks: buildAssuranceLinks(toolName, manufacturer),
    smartLinks: buildSmartLinks(toolName, manufacturer),
  };

  // Build a more specific query when manufacturer is known.
  const specificQuery = manufacturer
    ? `${toolName} ${manufacturer}`
    : toolName;

  // FDA, PubMed, ClinicalTrials, Brave — run in parallel via API routes.
  // FDA is served from a route (not bundled) so the ~1,500-device dataset
  // stays server-side and out of the client bundle.
  const [fdaRes, pubmedRes, trialsRes, webRes, assuranceRes] = await Promise.allSettled([
    fetch(`/api/lookup/fda?q=${encodeURIComponent(toolName)}`).then((r) => r.json()),
    fetch(`/api/lookup/pubmed?q=${encodeURIComponent(specificQuery)}`).then((r) => r.json()),
    fetch(`/api/lookup/trials?q=${encodeURIComponent(specificQuery)}`).then((r) => r.json()),
    fetch(`/api/lookup/web?q=${encodeURIComponent(toolName)}${manufacturer ? `&mfr=${encodeURIComponent(manufacturer)}` : ""}`).then((r) => r.json()),
    fetch(`/api/lookup/assurance?tool=${encodeURIComponent(toolName)}${manufacturer ? `&mfr=${encodeURIComponent(manufacturer)}` : ""}`).then((r) => r.json()),
  ]);

  if (fdaRes.status === "fulfilled") {
    results.fda = fdaRes.value;
  } else {
    results.fda = { status: "error", matches: [], error: "Request failed" };
  }

  if (assuranceRes.status === "fulfilled") {
    results.assurance = assuranceRes.value;
  } else {
    results.assurance = { status: "error", iso: [], clinicalSafety: [], error: "Request failed" };
  }

  if (pubmedRes.status === "fulfilled") {
    results.pubmed = pubmedRes.value;
  } else {
    results.pubmed = { status: "error", count: 0, results: [], error: "Request failed" };
  }

  if (trialsRes.status === "fulfilled") {
    results.trials = trialsRes.value;
  } else {
    results.trials = { status: "error", total: 0, completed: 0, recruiting: 0, ukBased: 0, results: [], error: "Request failed" };
  }

  if (webRes.status === "fulfilled") {
    results.web = webRes.value;
  } else {
    results.web = { status: "error", results: [], error: "Request failed" };
  }

  return results;
}
