// ---------------------------------------------------------------------------
// ClinicalTrials.gov lookup via public API.
// GET /api/lookup/trials?q=Dragon+Copilot
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const CT_API = "https://clinicaltrials.gov/api/v2/studies";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { status: "error", total: 0, completed: 0, recruiting: 0, ukBased: 0, results: [], error: "Missing query parameter" },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      "query.term": q,
      pageSize: "10",
      format: "json",
      "fields": "NCTId,BriefTitle,OverallStatus,LeadSponsorName,Phase,LocationCountry,LocationCity",
    });

    const res = await fetch(`${CT_API}?${params}`);
    if (!res.ok) throw new Error(`ClinicalTrials.gov failed: ${res.status}`);
    const data = await res.json();

    const studies = data?.studies ?? [];
    if (studies.length === 0) {
      return NextResponse.json({
        status: "not_found",
        total: 0,
        completed: 0,
        recruiting: 0,
        ukBased: 0,
        results: [],
      });
    }

    let completed = 0;
    let recruiting = 0;
    let ukBased = 0;

    const results = studies.map((study: any) => {
      const proto = study?.protocolSection;
      const id = proto?.identificationModule;
      const status = proto?.statusModule;
      const sponsor = proto?.sponsorCollaboratorsModule;
      const design = proto?.designModule;
      const locations = proto?.contactsLocationsModule;

      const overallStatus = status?.overallStatus ?? "Unknown";
      if (overallStatus === "COMPLETED") completed++;
      if (overallStatus === "RECRUITING" || overallStatus === "ACTIVE_NOT_RECRUITING") recruiting++;

      // Check for UK sites
      const countries: string[] = [];
      const cities: string[] = [];
      if (locations?.locations) {
        for (const loc of locations.locations) {
          if (loc.country) countries.push(loc.country);
          if (loc.city) cities.push(loc.city);
        }
      }
      const hasUK = countries.some(
        (c) =>
          c.toLowerCase().includes("united kingdom") ||
          c.toLowerCase().includes("uk") ||
          c.toLowerCase() === "england" ||
          c.toLowerCase() === "scotland" ||
          c.toLowerCase() === "wales",
      );
      if (hasUK) ukBased++;

      const nctId = id?.nctId ?? "";
      return {
        nctId,
        title: id?.briefTitle ?? "Untitled",
        status: overallStatus,
        sponsor: sponsor?.leadSponsor?.name ?? "",
        phase: design?.phases?.join(", ") ?? "",
        locations: hasUK
          ? `UK site(s): ${cities.filter((_, i) => countries[i]?.toLowerCase().includes("united kingdom") || countries[i]?.toLowerCase().includes("uk")).join(", ") || "yes"}`
          : countries.slice(0, 3).join(", "),
        hasUKSite: hasUK,
        url: `https://clinicaltrials.gov/study/${nctId}`,
      };
    });

    return NextResponse.json({
      status: "found",
      total: data?.totalCount ?? studies.length,
      completed,
      recruiting,
      ukBased,
      results,
    });
  } catch (e) {
    console.error("ClinicalTrials.gov lookup error:", e);
    return NextResponse.json({
      status: "error",
      total: 0,
      completed: 0,
      recruiting: 0,
      ukBased: 0,
      results: [],
      error: `Unable to query ClinicalTrials.gov — check directly at https://clinicaltrials.gov/search?term=${encodeURIComponent(q)}`,
    });
  }
}
