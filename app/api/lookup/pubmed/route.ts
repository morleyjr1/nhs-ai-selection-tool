// ---------------------------------------------------------------------------
// PubMed lookup via NCBI E-utilities.
// GET /api/lookup/pubmed?q=Dragon+Copilot
//
// Search strategy (in order of specificity):
//   1. Phrase search restricted to Title/Abstract: "query"[Title/Abstract]
//   2. Phrase search unrestricted: "query"
//   3. Unquoted broad search with Title/Abstract restriction: query[Title/Abstract]
//
// The [Title/Abstract] field tag is critical for product names like "Heidi"
// that would otherwise match author first names and return irrelevant
// results. PubMed treats bare terms as matching across ALL fields including
// author names; restricting to Title/Abstract ensures we find articles
// *about* the product, not *by* someone who happens to share the name.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const ESUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { status: "error", count: 0, results: [], error: "Missing query parameter" },
      { status: 400 },
    );
  }

  try {
    // Build search terms in order of specificity.
    // We try the most restrictive search first and fall back progressively.
    const searchTerms = [
      // 1. Exact phrase in title/abstract only
      `"${q}"[Title/Abstract]`,
      // 2. Exact phrase anywhere (may still match MeSH, keywords, etc.)
      `"${q}"`,
      // 3. Broad search but restricted to title/abstract
      `${q}[Title/Abstract]`,
    ];

    let idList: string[] = [];
    let totalCount = 0;

    for (const term of searchTerms) {
      const searchParams = new URLSearchParams({
        db: "pubmed",
        term: term,
        retmax: "10",
        sort: "relevance",
        retmode: "json",
      });

      const searchRes = await fetch(`${ESEARCH_URL}?${searchParams}`);
      if (!searchRes.ok) continue;

      const searchData = await searchRes.json();
      idList = searchData?.esearchresult?.idlist ?? [];
      totalCount = parseInt(searchData?.esearchresult?.count ?? "0", 10);

      if (idList.length > 0) break;
    }

    if (idList.length === 0) {
      return NextResponse.json({ status: "not_found", count: 0, results: [] });
    }

    // Step 2: Fetch summaries for the PMIDs
    const summaryParams = new URLSearchParams({
      db: "pubmed",
      id: idList.join(","),
      retmode: "json",
    });

    const summaryRes = await fetch(`${ESUMMARY_URL}?${summaryParams}`);
    if (!summaryRes.ok) throw new Error(`PubMed esummary failed: ${summaryRes.status}`);
    const summaryData = await summaryRes.json();

    const results = idList.map((pmid) => {
      const article = summaryData?.result?.[pmid];
      if (!article) return null;

      const authors = (article.authors ?? [])
        .slice(0, 3)
        .map((a: { name: string }) => a.name)
        .join(", ");

      return {
        pmid,
        title: article.title ?? "Untitled",
        authors: authors + (article.authors?.length > 3 ? " et al." : ""),
        journal: article.source ?? "",
        date: article.pubdate ?? "",
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    }).filter(Boolean);

    return NextResponse.json({
      status: "found",
      count: totalCount,
      results,
    });
  } catch (e) {
    console.error("PubMed lookup error:", e);
    return NextResponse.json({
      status: "error",
      count: 0,
      results: [],
      error: `Unable to query PubMed — check directly at https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`,
    });
  }
}
