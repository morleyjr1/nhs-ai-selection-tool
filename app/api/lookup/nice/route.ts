// ---------------------------------------------------------------------------
// NICE guidance lookup.
// GET /api/lookup/nice?q=Brainomix+e-Stroke
//
// Strategy: NICE's public website is a React SPA that loads search results
// client-side via JavaScript, so server-side fetching of nice.org.uk/search
// returns only the shell HTML with no actual results. Instead, we use the
// NICE search API that powers the website internally.
//
// The NICE website calls:
//   https://www.nice.org.uk/api/search?q=...
// This returns JSON with document results. No API key is required.
//
// Falls back to manual_check with a direct URL if the API changes.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

// The internal API endpoint that the NICE website SPA uses
const NICE_API_URL = "https://www.nice.org.uk/api/search";

interface NICEResult {
  title: string;
  url: string;
  guidanceType: string;
  guidanceRef: string;
  publicationDate: string;
  snippet: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { status: "error", count: 0, results: [], error: "Missing query parameter" },
      { status: 400 },
    );
  }

  const searchUrl = `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`;

  try {
    // Query the NICE internal search API.
    // Parameters observed from the NICE website:
    //   q  = search query
    //   ps = page size
    //   sp = start page (0-indexed)
    //   om = order/filter as JSON (optional)
    const apiUrl = `${NICE_API_URL}?q=${encodeURIComponent(q)}&ps=25`;

    const res = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "NHS-AI-Adoption-Tool/1.0 (academic research)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`NICE API returned ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("json")) {
      // If NICE doesn't return JSON, fall back to manual check
      throw new Error("NICE API did not return JSON");
    }

    const data = await res.json();
    return parseNICEResponse(data, q, searchUrl);

  } catch (e) {
    console.error("NICE lookup error:", e);

    // Graceful fallback — always give the user a manual search link
    return NextResponse.json({
      status: "manual_check",
      count: 0,
      results: [],
      searchUrl,
      error: "Unable to query NICE automatically. Use the direct link to search manually.",
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNICEResponse(data: any, q: string, searchUrl: string) {
  try {
    // The NICE API response structure varies but common shapes are:
    //   { documents: [...], ... }
    //   { results: [...], ... }
    //   { searchResults: { documents: [...] }, ... }
    // Each document typically has: title, pathAndQuery, guidanceRef,
    // niceDocType, teaser/summary, publicationDate, etc.
    const documents: unknown[] =
      data?.documents ??
      data?.results ??
      data?.searchResults?.documents ??
      data?.searchResults ??
      [];

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({
        status: "not_found",
        count: 0,
        results: [],
        searchUrl,
      });
    }

    // Filter for actual guidance documents (not navigation pages, corporate
    // pages, or generic "how to use NICE" pages).
    const results: NICEResult[] = documents
      .filter((doc: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = doc as any;
        const title = (d.title ?? d.Title ?? "").toLowerCase();
        const path = (d.pathAndQuery ?? d.url ?? d.id ?? "").toLowerCase();

        // Exclude navigation/meta pages
        const excludePatterns = [
          "category to find",
          "list organised by",
          "about nice",
          "our programmes",
          "get involved",
          "jobs at nice",
          "nice website",
          "contact us",
          "accessibility",
          "terms and conditions",
          "syndication",
          "/about/",
          "/process/",
          "/standards-and-indicators/",
        ];
        if (excludePatterns.some((p) => title.includes(p) || path.includes(p))) {
          return false;
        }

        // Prefer paths that look like guidance references
        if (path.includes("/guidance/")) return true;

        // Accept if it has a guidance type or reference
        if (d.guidanceRef || d.niceDocType || d.guidanceType) return true;

        // Accept if the title looks substantive (more than 5 words,
        // not a navigation label)
        const wordCount = title.split(/\s+/).length;
        return wordCount > 5;
      })
      .slice(0, 10)
      .map((doc: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = doc as any;
        const path = d.pathAndQuery ?? "";
        const ref = extractGuidanceRef(path);
        return {
          title: d.title ?? d.Title ?? "Untitled",
          url: path.startsWith("http")
            ? path
            : path
              ? `https://www.nice.org.uk${path}`
              : searchUrl,
          guidanceType:
            d.guidanceType ?? d.niceDocType ?? (ref ? classifyRef(ref) : ""),
          guidanceRef: d.guidanceRef ?? ref ?? "",
          publicationDate: d.publicationDate ?? d.lastUpdated ?? "",
          snippet: d.teaser ?? d.summary ?? d.metaDescription ?? "",
        };
      });

    return NextResponse.json({
      status: results.length > 0 ? "found" : "not_found",
      count: results.length,
      results,
      searchUrl,
    });
  } catch {
    return NextResponse.json({
      status: "not_found",
      count: 0,
      results: [],
      searchUrl,
    });
  }
}

function extractGuidanceRef(path: string): string {
  // Extract guidance reference from paths like /guidance/TA123 or /guidance/mib45
  const match = path.match(/\/guidance\/([\w]+\d+)/i);
  return match ? match[1] : "";
}

function classifyRef(ref: string): string {
  const prefix = ref.toLowerCase().replace(/\d+/g, "").trim();
  const labels: Record<string, string> = {
    ta: "Technology Appraisal",
    hst: "Highly Specialised Technology",
    dg: "Diagnostics Guidance",
    mtg: "Medical Technologies Guidance",
    mib: "Medtech Innovation Briefing",
    ipg: "Interventional Procedures",
    ng: "NICE Guideline",
    cg: "Clinical Guideline",
    qs: "Quality Standard",
    ph: "Public Health Guideline",
  };
  return labels[prefix] ?? "Guidance";
}
