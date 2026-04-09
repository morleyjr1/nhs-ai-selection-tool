// ---------------------------------------------------------------------------
// EUDAMED device lookup.
// GET /api/lookup/eudamed?q=Brainomix&mfr=Brainomix
//
// Queries the public EUDAMED API that powers the EC's device search UI.
// No authentication required. The endpoint returns paginated JSON with
// device registration data including trade names, manufacturers, risk
// classes, UDI-DIs, and device status.
//
// Known response structure (from OpenRegulatory reverse-engineering):
//   - Results are in the `content` array
//   - riskClass is an OBJECT with { code: "refdata.risk-class.class-iia" }
//   - tradeName is a plain string
//   - manufacturerName is a plain string (NOT nested)
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
    // Build search queries in order of specificity.
    // The EUDAMED public API accepts a `freeText` parameter that searches
    // across trade name, manufacturer, and other fields.
    const searches: string[] = [];

    if (q && mfr) {
      searches.push(`${q} ${mfr}`);
      searches.push(mfr); // manufacturer is usually more specific for device search
      searches.push(q);
    } else if (mfr) {
      searches.push(mfr);
    } else if (q) {
      searches.push(q);
    }

    let allDevices: EUDAMEDDevice[] = [];
    let totalFound = 0;

    for (const searchTerm of searches) {
      const result = await tryEUDAMEDSearch(searchTerm);
      if (result) {
        allDevices = result.devices;
        totalFound = result.total;
        break;
      }
    }

    const manualUrl = buildEUDAMEDSearchUrl(q ?? mfr ?? "");

    if (allDevices.length === 0) {
      return NextResponse.json({
        status: "not_found",
        count: 0,
        results: [],
        searchUrl: manualUrl,
      });
    }

    // If the tool name was provided, filter results to those that seem
    // relevant (trade name or manufacturer contains a query word).
    // This avoids returning 1500 unrelated devices for a generic query.
    const filtered = filterRelevant(allDevices, q, mfr);

    return NextResponse.json({
      status: "found",
      count: filtered.length > 0 ? filtered.length : totalFound,
      results: (filtered.length > 0 ? filtered : allDevices).slice(0, 10),
      searchUrl: manualUrl,
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

async function tryEUDAMEDSearch(
  searchTerm: string,
): Promise<{ devices: EUDAMEDDevice[]; total: number } | null> {
  // Try the primary parameter name first, then alternatives
  const paramNames = ["freeText", "searchText"];

  for (const param of paramNames) {
    try {
      const params = new URLSearchParams({
        pageSize: "25",
        page: "0",
        sort: "tradeName,asc",
        iso2Code: "en",
        languageIso2Code: "en",
        [param]: searchTerm,
      });

      const res = await fetch(`${EUDAMED_API}?${params}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "NHS-AI-Adoption-Tool/1.0 (academic research)",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const devices = parseEUDAMEDResponse(data);
      const total = data?.totalElements ?? devices.length;

      if (devices.length > 0) {
        return { devices, total };
      }
    } catch {
      continue;
    }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEUDAMEDResponse(data: any): EUDAMEDDevice[] {
  const content: unknown[] = data?.content ?? [];
  if (!Array.isArray(content)) return [];

  return content
    .map((item: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = item as any;
      const deviceId = d?.id ?? d?.uuid ?? d?.ulid ?? d?.deviceId ?? "";

      // riskClass is an OBJECT like { code: "refdata.risk-class.class-iia" }
      // Extract the human-readable class from the code string
      const riskClassRaw = d?.riskClass;
      let riskClass = "";
      if (typeof riskClassRaw === "string") {
        riskClass = riskClassRaw;
      } else if (riskClassRaw?.code) {
        // e.g. "refdata.risk-class.class-iia" → "Class IIa"
        riskClass = parseRiskClassCode(riskClassRaw.code);
      } else if (riskClassRaw?.label) {
        riskClass = riskClassRaw.label;
      }

      // deviceStatusType may also be an object
      const statusRaw = d?.deviceStatusType ?? d?.statusType;
      let status = "";
      if (typeof statusRaw === "string") {
        status = statusRaw;
      } else if (statusRaw?.code) {
        status = parseStatusCode(statusRaw.code);
      } else if (statusRaw?.label) {
        status = statusRaw.label;
      }

      return {
        tradeName: d?.tradeName ?? d?.deviceTradeName ?? "Unknown",
        manufacturer:
          d?.manufacturerName ??
          d?.manufacturer?.organisationName ??
          d?.manufacturer?.name ??
          "Unknown",
        manufacturerSrn: d?.manufacturerSrn ?? d?.manufacturer?.srn ?? "",
        riskClass,
        deviceStatusType: status,
        basicUdiDi:
          d?.basicUdiDi ??
          d?.basicUdiData?.basicUdiDi ??
          d?.basicUdiDiDataUlid ??
          "",
        primaryDi: d?.primaryDi ?? "",
        authorisedRepName:
          d?.authorisedRepresentativeName ??
          d?.authorisedRepresentative?.organisationName ??
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

/**
 * Parse risk class from EUDAMED code strings.
 * e.g. "refdata.risk-class.class-iia" → "Class IIa"
 *      "refdata.risk-class.class-i"   → "Class I"
 *      "refdata.risk-class.class-iii" → "Class III"
 */
function parseRiskClassCode(code: string): string {
  const match = code.match(/class[.-]?(i{1,3}[ab]?)/i);
  if (!match) return code.split(".").pop() ?? code;

  const raw = match[1].toLowerCase();
  // Capitalise properly: "iia" → "IIa", "iii" → "III", "i" → "I"
  const roman = raw.replace(/^(i+)/, (m) => m.toUpperCase());
  return `Class ${roman}`;
}

/**
 * Parse device status from EUDAMED code strings.
 * e.g. "refdata.device-status.on-the-market" → "On the market"
 */
function parseStatusCode(code: string): string {
  const last = code.split(".").pop() ?? code;
  return last
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Filter EUDAMED results to those that are relevant to the query.
 * Without this, a search for "Heidi" returns 1500 unrelated devices
 * because the EUDAMED freeText search is extremely broad.
 */
function filterRelevant(
  devices: EUDAMEDDevice[],
  toolName: string | null,
  manufacturer: string | null,
): EUDAMEDDevice[] {
  if (!toolName && !manufacturer) return devices;

  const terms: string[] = [];
  if (toolName) terms.push(toolName.toLowerCase());
  if (manufacturer) terms.push(manufacturer.toLowerCase());

  return devices.filter((d) => {
    const name = d.tradeName.toLowerCase();
    const mfr = d.manufacturer.toLowerCase();

    return terms.some(
      (term) =>
        name.includes(term) ||
        mfr.includes(term) ||
        // Also check if any word from the term (>3 chars) appears
        term
          .split(/\s+/)
          .filter((w) => w.length > 3)
          .some((w) => name.includes(w) || mfr.includes(w)),
    );
  });
}

function buildEUDAMEDSearchUrl(query: string): string {
  return `https://ec.europa.eu/tools/eudamed/#/screen/search-device?freeText=${encodeURIComponent(query)}`;
}
