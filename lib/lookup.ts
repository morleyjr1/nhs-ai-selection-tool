// ---------------------------------------------------------------------------
// Tool Intelligence lookup — orchestration layer.
//
// Queries: FDA (static), PubMed, ClinicalTrials.gov, Brave Web Search,
//          NICE guidance, EUDAMED (EU device registry).
// Also generates smart links for MHRA PARD, MHRA alerts, NHS England.
// ---------------------------------------------------------------------------

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

export interface NICEResult {
  title: string;
  url: string;
  guidanceType: string;
  guidanceRef: string;
  publicationDate: string;
  snippet: string;
}

export interface EUDAMEDDevice {
  tradeName: string;
  manufacturer: string;
  manufacturerSrn: string;
  riskClass: string;
  deviceStatusType: string;
  basicUdiDi: string;
  primaryDi: string;
  authorisedRepName: string;
  eudamedUrl: string;
}

export interface SmartLink {
  label: string;
  url: string;
  description: string;
}

export interface LookupResults {
  toolName: string;
  timestamp: string;

  fda: { status: "found" | "not_found" | "error"; matches: FDAMatch[]; error?: string };
  pubmed: { status: "found" | "not_found" | "error"; count: number; results: PubMedResult[]; error?: string };
  trials: { status: "found" | "not_found" | "error"; total: number; completed: number; recruiting: number; ukBased: number; results: TrialResult[]; error?: string };
  web: { status: "found" | "not_found" | "error" | "no_api_key"; results: WebResult[]; error?: string };
  nice: { status: "found" | "not_found" | "manual_check" | "error"; count: number; results: NICEResult[]; searchUrl: string; error?: string };
  eudamed: { status: "found" | "not_found" | "manual_check" | "error"; count: number; results: EUDAMEDDevice[]; searchUrl: string; error?: string };
  smartLinks: SmartLink[];
}

// ── FDA static search ──

import fdaDevices from "./fda-devices.json";

function searchFDA(toolName: string): FDAMatch[] {
  const query = toolName.toLowerCase().trim();
  const words = query.split(/\s+/).filter((w) => w.length > 2);

  return (fdaDevices as FDAMatch[]).filter((device) => {
    const name = device.deviceName.toLowerCase();
    const mfr = device.manufacturer.toLowerCase();
    // Match if the full query appears in device name or manufacturer,
    // or if all significant words appear
    if (name.includes(query) || mfr.includes(query)) return true;
    return words.length > 1 && words.every((w) => name.includes(w) || mfr.includes(w));
  });
}

// ── Smart links for MHRA, NHS England ──
// (NICE now has its own API lookup, so removed from smart links)

function buildSmartLinks(toolName: string, manufacturer?: string): SmartLink[] {
  const encoded = encodeURIComponent(toolName);

  return [
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
 * PubMed, ClinicalTrials, Brave, NICE, and EUDAMED are fetched via API routes.
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
    nice: { status: "not_found", count: 0, results: [], searchUrl: "" },
    eudamed: { status: "not_found", count: 0, results: [], searchUrl: "" },
    smartLinks: buildSmartLinks(toolName, manufacturer),
  };

  // FDA (static, synchronous)
  try {
    const fdaMatches = searchFDA(toolName);
    results.fda = {
      status: fdaMatches.length > 0 ? "found" : "not_found",
      matches: fdaMatches,
    };
  } catch (e) {
    results.fda = { status: "error", matches: [], error: String(e) };
  }

  // Build a more specific query when manufacturer is known.
  // "MIA" alone is too generic; "MIA Kheiron" is specific enough.
  const specificQuery = manufacturer
    ? `${toolName} ${manufacturer}`
    : toolName;

  // PubMed, ClinicalTrials, Brave, NICE, EUDAMED — run in parallel via API routes
  const [pubmedRes, trialsRes, webRes, niceRes, eudamedRes] = await Promise.allSettled([
    fetch(`/api/lookup/pubmed?q=${encodeURIComponent(specificQuery)}`).then((r) => r.json()),
    fetch(`/api/lookup/trials?q=${encodeURIComponent(specificQuery)}`).then((r) => r.json()),
    fetch(`/api/lookup/web?q=${encodeURIComponent(toolName)}${manufacturer ? `&mfr=${encodeURIComponent(manufacturer)}` : ""}`).then((r) => r.json()),
    fetch(`/api/lookup/nice?q=${encodeURIComponent(specificQuery)}`).then((r) => r.json()),
    fetch(`/api/lookup/eudamed?q=${encodeURIComponent(toolName)}${manufacturer ? `&mfr=${encodeURIComponent(manufacturer)}` : ""}`).then((r) => r.json()),
  ]);

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

  if (niceRes.status === "fulfilled") {
    results.nice = niceRes.value;
  } else {
    results.nice = {
      status: "error",
      count: 0,
      results: [],
      searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(specificQuery)}`,
      error: "Request failed",
    };
  }

  if (eudamedRes.status === "fulfilled") {
    results.eudamed = eudamedRes.value;
  } else {
    results.eudamed = {
      status: "error",
      count: 0,
      results: [],
      searchUrl: `https://ec.europa.eu/tools/eudamed/#/screen/search-device`,
      error: "Request failed",
    };
  }

  return results;
}
