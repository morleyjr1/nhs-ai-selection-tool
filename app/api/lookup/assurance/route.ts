// ---------------------------------------------------------------------------
// Assurance auto-search via Brave Search API.
// GET /api/lookup/assurance?tool=Annalise+CXR&mfr=Annalise.ai
//
// Runs constrained web searches for the "looser" assurance signals that don't
// have a single authoritative register:
//   - iso:            company-level ISO 27001 / 13485 / 42001 certification
//   - clinicalSafety: product-level DCB0129 / DCB0160 clinical safety
//
// Dedicated registers (Cyber Essentials, NHS DSPT) are NOT queried here — they
// are surfaced as one-click register links (see lib/assurance.ts).
// Requires BRAVE_SEARCH_API_KEY.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const BRAVE_API = "https://api.search.brave.com/res/v1/web/search";

interface WebResult {
  title: string;
  url: string;
  snippet: string;
  isNHS: boolean;
  isGovUK: boolean;
}

async function braveSearch(query: string, apiKey: string): Promise<WebResult[]> {
  const res = await fetch(
    `${BRAVE_API}?${new URLSearchParams({ q: query, count: "6" })}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    },
  );
  if (!res.ok) throw new Error(`Brave API: ${res.status}`);
  const data = await res.json();
  const results = data?.web?.results ?? [];
  return results.map((r: { title?: string; url?: string; description?: string }) => {
    const url = r.url ?? "";
    const urlLower = url.toLowerCase();
    return {
      title: r.title ?? "",
      url,
      snippet: r.description ?? "",
      isNHS: urlLower.includes("nhs.uk"),
      isGovUK: urlLower.includes("gov.uk"),
    };
  });
}

export async function GET(req: NextRequest) {
  const tool = (req.nextUrl.searchParams.get("tool") ?? "").trim();
  const mfr = (req.nextUrl.searchParams.get("mfr") ?? "").trim();
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!tool && !mfr) {
    return NextResponse.json(
      { status: "error", iso: [], clinicalSafety: [], error: "Missing query" },
      { status: 400 },
    );
  }

  if (!apiKey) {
    return NextResponse.json({
      status: "no_api_key",
      iso: [],
      clinicalSafety: [],
      error:
        "Web search not configured. Add BRAVE_SEARCH_API_KEY to enable inline standards search.",
    });
  }

  const subject = mfr || tool;

  try {
    const [iso, clinicalSafety] = await Promise.all([
      braveSearch(`"${subject}" ("ISO 27001" OR "ISO 13485" OR "ISO 42001")`, apiKey),
      braveSearch(
        `("${tool}" OR "${subject}") ("DCB0129" OR "DCB0160" OR "clinical safety case")`,
        apiKey,
      ),
    ]);

    const found = iso.length > 0 || clinicalSafety.length > 0;
    return NextResponse.json({
      status: found ? "found" : "not_found",
      iso: iso.slice(0, 4),
      clinicalSafety: clinicalSafety.slice(0, 4),
    });
  } catch (e) {
    console.error("Assurance search error:", e);
    return NextResponse.json({
      status: "error",
      iso: [],
      clinicalSafety: [],
      error: "Unable to perform assurance search.",
    });
  }
}
