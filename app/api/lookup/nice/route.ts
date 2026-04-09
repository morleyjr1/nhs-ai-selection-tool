// ---------------------------------------------------------------------------
// NICE guidance lookup.
// GET /api/lookup/nice?q=Brainomix+e-Stroke
//
// Queries the NICE website search endpoint, which returns JSON with guidance
// results. No API key required for the public search — the syndication API
// (api.nice.org.uk) needs a licence, but the public search is open.
//
// Falls back gracefully: if the search endpoint changes shape or blocks
// server-side requests, returns a "manual_check" status with a direct URL.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const NICE_SEARCH_URL = "https://www.nice.org.uk/search";

// NICE guidance programme codes relevant to health AI / medtech
const RELEVANT_PROGRAMMES = new Set([
  "ta",   // Technology Appraisals
  "hst",  // Highly Specialised Technologies
  "dg",   // Diagnostics Guidance
  "mtg",  // Medical Technologies Guidance
  "mib",  // Medtech Innovation Briefings
  "ipg",  // Interventional Procedures Guidance
  "ng",   // NICE Guidelines (occasionally relevant)
  "qs",   // Quality Standards
]);

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

  try {
    // NICE website search accepts a JSON response when asked via Accept header
    // or via the /api/search endpoint. Try the public search URL with JSON.
    const searchUrl = `${NICE_SEARCH_URL}?q=${encodeURIComponent(q)}&ps=20&om=[{"gst":["Published"]}]`;

    const res = await fetch(searchUrl, {
      headers: {
        Accept: "application/json, text/html",
        "User-Agent": "NHS-AI-Adoption-Tool/1.0 (academic research)",
      },
      signal: AbortSignal.timeout(10000),
    });

    // If NICE returns HTML rather than JSON (which it may), try parsing
    // the structured data from the response
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Direct JSON response — parse NICE search results
      const data = await res.json();
      return handleNICEJson(data, q);
    }

    // HTML response — try to extract search results from the page
    const html = await res.text();
    return handleNICEHtml(html, q);

  } catch (e) {
    console.error("NICE lookup error:", e);
    // Graceful fallback — always give the user a manual search link
    return NextResponse.json({
      status: "manual_check",
      count: 0,
      results: [],
      searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
      error: "Unable to query NICE automatically. Use the direct link to search manually.",
    });
  }
}

function handleNICEJson(data: Record<string, unknown>, q: string) {
  try {
    // The NICE search API returns results in different shapes depending
    // on version. Handle the common patterns.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documents: any[] =
      (data as any)?.documents ??
      (data as any)?.results ??
      (data as any)?.searchResults ??
      [];

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({
        status: "not_found",
        count: 0,
        results: [],
        searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
      });
    }

    const results: NICEResult[] = documents
      .filter((doc) => {
        // Prefer guidance documents over corporate pages
        const ref = (doc.guidanceRef ?? doc.pathAndQuery ?? doc.id ?? "").toLowerCase();
        return RELEVANT_PROGRAMMES.has(ref.split(/\d/)[0]) || doc.guidanceType;
      })
      .slice(0, 10)
      .map((doc) => ({
        title: doc.title ?? doc.Title ?? "Untitled",
        url: doc.url ?? doc.pathAndQuery
          ? `https://www.nice.org.uk${doc.pathAndQuery}`
          : `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
        guidanceType: doc.guidanceType ?? doc.niceDocType ?? classifyRef(doc.guidanceRef ?? ""),
        guidanceRef: doc.guidanceRef ?? doc.id ?? "",
        publicationDate: doc.publicationDate ?? doc.lastUpdated ?? "",
        snippet: doc.teaser ?? doc.summary ?? doc.metaDescription ?? "",
      }));

    return NextResponse.json({
      status: results.length > 0 ? "found" : "not_found",
      count: results.length,
      results,
      searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
    });
  } catch {
    return NextResponse.json({
      status: "not_found",
      count: 0,
      results: [],
      searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
    });
  }
}

function handleNICEHtml(html: string, q: string) {
  try {
    // Parse search results from NICE HTML. The NICE search page renders
    // results in a fairly consistent structure. We extract titles and URLs
    // using regex (no DOM parser needed on the server).
    const results: NICEResult[] = [];

    // NICE search results are in <a> tags with class containing "results"
    // Pattern: <a href="/guidance/MTG..." class="...">Title</a>
    const linkPattern = /<a[^>]*href="(\/guidance\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null && results.length < 10) {
      const path = match[1];
      const title = match[2].trim();
      const ref = path.replace("/guidance/", "");
      const guidanceType = classifyRef(ref);

      results.push({
        title,
        url: `https://www.nice.org.uk${path}`,
        guidanceType,
        guidanceRef: ref,
        publicationDate: "",
        snippet: "",
      });
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const unique = results.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    return NextResponse.json({
      status: unique.length > 0 ? "found" : "not_found",
      count: unique.length,
      results: unique,
      searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
    });
  } catch {
    return NextResponse.json({
      status: "manual_check",
      count: 0,
      results: [],
      searchUrl: `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`,
    });
  }
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
