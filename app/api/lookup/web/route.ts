// ---------------------------------------------------------------------------
// Web search via Brave Search API.
// GET /api/lookup/web?q=Dragon+Copilot&mfr=Nuance
//
// Requires BRAVE_SEARCH_API_KEY environment variable.
// Free tier: $5/month credit (~1000 searches).
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const BRAVE_API = "https://api.search.brave.com/res/v1/web/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const mfr = req.nextUrl.searchParams.get("mfr");
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!q) {
    return NextResponse.json(
      { status: "error", results: [], error: "Missing query parameter" },
      { status: 400 },
    );
  }

  if (!apiKey) {
    return NextResponse.json({
      status: "no_api_key",
      results: [],
      error: "Brave Search API key not configured. Add BRAVE_SEARCH_API_KEY to your environment variables.",
    });
  }

  try {
    // Run two searches in parallel: tool + NHS, and tool + manufacturer
    const queries = [
      `"${q}" NHS`,
      mfr ? `"${q}" "${mfr}"` : `"${q}" AI medical device`,
    ];

    const responses = await Promise.all(
      queries.map((query) =>
        fetch(`${BRAVE_API}?${new URLSearchParams({ q: query, count: "10" })}`, {
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": apiKey,
          },
        }).then((r) => {
          if (!r.ok) throw new Error(`Brave API: ${r.status}`);
          return r.json();
        }),
      ),
    );

    // Combine and deduplicate results by URL
    const seen = new Set<string>();
    const allResults: Array<{
      title: string;
      url: string;
      snippet: string;
      isNHS: boolean;
      isGovUK: boolean;
    }> = [];

    for (const data of responses) {
      const webResults = data?.web?.results ?? [];
      for (const r of webResults) {
        const url = r.url ?? "";
        if (seen.has(url)) continue;
        seen.add(url);

        const urlLower = url.toLowerCase();
        allResults.push({
          title: r.title ?? "",
          url,
          snippet: r.description ?? "",
          isNHS: urlLower.includes("nhs.uk"),
          isGovUK: urlLower.includes("gov.uk"),
        });
      }
    }

    // Sort: NHS/gov.uk results first, then by original order
    allResults.sort((a, b) => {
      const aScore = (a.isNHS ? 2 : 0) + (a.isGovUK ? 1 : 0);
      const bScore = (b.isNHS ? 2 : 0) + (b.isGovUK ? 1 : 0);
      return bScore - aScore;
    });

    return NextResponse.json({
      status: allResults.length > 0 ? "found" : "not_found",
      results: allResults.slice(0, 15), // Cap at 15 combined results
    });
  } catch (e) {
    console.error("Brave Search error:", e);
    return NextResponse.json({
      status: "error",
      results: [],
      error: "Unable to perform web search. Check your Brave Search API key and try again.",
    });
  }
}
