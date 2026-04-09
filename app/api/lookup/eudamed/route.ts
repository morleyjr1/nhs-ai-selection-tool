// ---------------------------------------------------------------------------
// EUDAMED device lookup.
// GET /api/lookup/eudamed?q=Brainomix&mfr=Brainomix
//
// Queries the public EUDAMED API that powers the EC's device search UI.
// No authentication required. The endpoint returns paginated JSON with
// device registration data including trade names, manufacturers, risk
// classes, UDI-DIs, and device status.
//
// Reference: https://openregulatory.github.io/eudamed-api/
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

const EUDAMED_API = "https://ec.europa.eu/tools/eudamed/api/devices/udiDiData";

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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const mfr = req.nextUrl.searchParams.get("mfr");

  if (!q && !mfr) {
    return NextResponse.json(
      { status: "error", count: 0, results: [], error: "Missing query parameter" },
      { status: 400 },
    );
  }

  try {
    // Build the EUDAMED search URL. The public API accepts several
    // query parameters; the key ones for device search are:
    //   - freeText: general text search across trade name, manufacturer, etc.
    //   - pageSize: results per page (max 300)
    //   - page: page number (0-indexed)
    //   - iso2Code: language code
    //   - sort: sort field
    //
    // We search by tool name. If manufacturer is also provided, we try
    // a combined search first, then fall back to tool name only.
    const searches: string[] = [];

    if (q && mfr) {
      // Try specific search first
      searches.push(`${q} ${mfr}`);
      // Then broader searches as fallback
      searches.push(q);
      searches.push(mfr);
    } else if (q) {
      searches.push(q);
    } else if (mfr) {
      searches.push(mfr);
    }

    let allDevices: EUDAMEDDevice[] = [];
    let totalFound = 0;

    for (const searchTerm of searches) {
      const params = new URLSearchParams({
        pageSize: "25",
        page: "0",
        sort: "tradeName,asc",
        iso2Code: "en",
        languageIso2Code: "en",
      });

      // The EUDAMED API uses different parameter names depending on
      // the endpoint version. Try the main search parameter.
      const url = `${EUDAMED_API}?${params}&freeText=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "NHS-AI-Adoption-Tool/1.0 (academic research)",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        // If freeText param isn't accepted, try alternative approaches
        if (res.status === 400) {
          // Try without freeText, using a different param structure
          const altUrl = `${EUDAMED_API}?${params}&searchText=${encodeURIComponent(searchTerm)}`;
          const altRes = await fetch(altUrl, {
            headers: {
              Accept: "application/json",
              "User-Agent": "NHS-AI-Adoption-Tool/1.0 (academic research)",
            },
            signal: AbortSignal.timeout(10000),
          });

          if (altRes.ok) {
            const altData = await altRes.json();
            const devices = parseEUDAMEDResponse(altData);
            if (devices.length > 0) {
              allDevices = devices;
              totalFound = altData?.totalElements ?? devices.length;
              break;
            }
          }
          continue;
        }
        continue;
      }

      const data = await res.json();
      const devices = parseEUDAMEDResponse(data);

      if (devices.length > 0) {
        allDevices = devices;
        totalFound = data?.totalElements ?? devices.length;
        break; // Found results, no need for broader search
      }
    }

    if (allDevices.length === 0) {
      return NextResponse.json({
        status: "not_found",
        count: 0,
        results: [],
        searchUrl: buildEUDAMEDSearchUrl(q ?? mfr ?? ""),
      });
    }

    return NextResponse.json({
      status: "found",
      count: totalFound,
      results: allDevices.slice(0, 10),
      searchUrl: buildEUDAMEDSearchUrl(q ?? mfr ?? ""),
    });

  } catch (e) {
    console.error("EUDAMED lookup error:", e);
    return NextResponse.json({
      status: "manual_check",
      count: 0,
      results: [],
      searchUrl: buildEUDAMEDSearchUrl(q ?? mfr ?? ""),
      error: "Unable to query EUDAMED automatically. Use the direct link to search manually.",
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEUDAMEDResponse(data: any): EUDAMEDDevice[] {
  // The EUDAMED API returns results in a `content` array
  const content: unknown[] = data?.content ?? [];

  if (!Array.isArray(content)) return [];

  return content
    .map((item: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = item as any;
      const deviceId = d?.id ?? d?.deviceId ?? "";
      return {
        tradeName: d?.tradeName ?? d?.deviceTradeName ?? "Unknown",
        manufacturer:
          d?.manufacturerName ??
          d?.manufacturer?.name ??
          d?.manufacturer?.organisationName ??
          "Unknown",
        manufacturerSrn: d?.manufacturerSrn ?? d?.manufacturer?.srn ?? "",
        riskClass: d?.riskClass ?? d?.deviceRiskClass ?? "",
        deviceStatusType: d?.deviceStatusType ?? d?.statusType ?? "",
        basicUdiDi: d?.basicUdiDi ?? d?.basicUdiData?.basicUdiDi ?? "",
        primaryDi: d?.primaryDi ?? "",
        authorisedRepName:
          d?.authorisedRepresentativeName ??
          d?.authorisedRepresentative?.name ??
          "",
        eudamedUrl: deviceId
          ? `https://ec.europa.eu/tools/eudamed/#/screen/device/${deviceId}`
          : `https://ec.europa.eu/tools/eudamed/#/screen/search-device`,
      };
    })
    .filter(
      (d) =>
        d.tradeName !== "Unknown" || d.manufacturer !== "Unknown",
    );
}

function buildEUDAMEDSearchUrl(query: string): string {
  return `https://ec.europa.eu/tools/eudamed/#/screen/search-device?freeText=${encodeURIComponent(query)}`;
}
