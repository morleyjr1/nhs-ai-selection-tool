// ---------------------------------------------------------------------------
// FDA AI/ML-enabled medical device lookup.
// GET /api/lookup/fda?q=Viz.ai
//
// Searches the full FDA AI/ML-Enabled Medical Device list (lib/fda-devices.json,
// ~1,500 devices). Server-side so the dataset never ships in the client bundle.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import fdaDevices from "../../../../lib/fda-devices.json";
import type { FDAMatch } from "../../../../lib/lookup";

export const runtime = "nodejs";

const MAX_MATCHES = 50;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase().trim();

  if (!q) {
    return NextResponse.json({ status: "not_found", matches: [] });
  }

  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const all = fdaDevices as FDAMatch[];

  const matches = all
    .filter((device) => {
      const name = device.deviceName.toLowerCase();
      const mfr = device.manufacturer.toLowerCase();
      if (name.includes(q) || mfr.includes(q)) return true;
      return (
        words.length > 1 && words.every((w) => name.includes(w) || mfr.includes(w))
      );
    })
    .slice(0, MAX_MATCHES);

  return NextResponse.json({
    status: matches.length > 0 ? "found" : "not_found",
    matches,
  });
}
