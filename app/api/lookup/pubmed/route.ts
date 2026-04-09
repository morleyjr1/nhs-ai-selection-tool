// ---------------------------------------------------------------------------
// PubMed lookup via NCBI E-utilities.
// GET /api/lookup/pubmed?q=Dragon+Copilot
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
    // Step 1: Search for PMIDs
    // Wrap in quotes for phrase search, then also try as a broader fallback.
    // PubMed phrase search: "Hippocratic AI" will only match that exact string.
    // If phrase search returns nothing, fall back to unquoted.
    const phraseTerm = `"${q}"`;
    const searchParams = new URLSearchParams({
      db: "pubmed",
      term: phraseTerm,
      retmax: "10",
      sort: "relevance",
      retmode: "json",
    });

    const searchRes = await fetch(`${ESEARCH_URL}?${searchParams}`);
    if (!searchRes.ok) throw new Error(`PubMed esearch failed: ${searchRes.status}`);
    const searchData = await searchRes.json();

    let idList: string[] = searchData?.esearchresult?.idlist ?? [];
    let totalCount = parseInt(searchData?.esearchresult?.count ?? "0", 10);

    // If phrase search returned nothing, retry with unquoted (broader) search
    if (idList.length === 0) {
      const fallbackParams = new URLSearchParams({
        db: "pubmed",
        term: q,
        retmax: "10",
        sort: "relevance",
        retmode: "json",
      });
      const fallbackRes = await fetch(`${ESEARCH_URL}?${fallbackParams}`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        idList = fallbackData?.esearchresult?.idlist ?? [];
        totalCount = parseInt(fallbackData?.esearchresult?.count ?? "0", 10);
      }
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
