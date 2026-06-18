// ---------------------------------------------------------------------------
// Resource submission API route.
// POST /api/resource-submissions
// Body: { title, url, dimensions[], description?, submitter?, website? }
//        (website = honeypot, must be empty)
//
// Stores NHS-staff suggestions of readiness-building tools in a review queue
// (resource_submissions). Submissions are NOT auto-published — the team curates
// them into lib/readiness-resources.ts. Requires DATABASE_URL.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { getSql } from "../../../lib/feedback-db";

export const runtime = "nodejs";

const VALID_DIMS = new Set(
  Array.from({ length: 12 }, (_, i) => `R${i + 1}`),
);

interface SubmissionRequest {
  title?: string;
  url?: string;
  dimensions?: string[];
  description?: string;
  submitter?: string;
  /** Honeypot. */
  website?: string;
}

export async function POST(req: NextRequest) {
  let body: SubmissionRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Honeypot: silently accept.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const title = (body.title ?? "").trim();
  const url = (body.url ?? "").trim();
  const dimensions = Array.isArray(body.dimensions)
    ? body.dimensions.filter((d) => VALID_DIMS.has(d))
    : [];
  const description = (body.description ?? "").trim();
  const submitter = (body.submitter ?? "").trim();

  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Please give the tool a name." },
      { status: 400 },
    );
  }
  if (!/^https?:\/\/.+/i.test(url) || url.length > 2000) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid link (starting http:// or https://)." },
      { status: 400 },
    );
  }
  if (dimensions.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Please select at least one readiness dimension." },
      { status: 400 },
    );
  }
  if (title.length > 300 || description.length > 3000 || submitter.length > 320) {
    return NextResponse.json(
      { ok: false, error: "One of the fields is too long." },
      { status: 400 },
    );
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json(
      {
        ok: false,
        error: "Submissions storage is not configured. Add DATABASE_URL.",
      },
      { status: 503 },
    );
  }

  try {
    await sql`
      insert into resource_submissions (title, url, dimensions, description, submitter)
      values (
        ${title},
        ${url},
        ${dimensions.join(",")},
        ${description || null},
        ${submitter || null}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Resource submission insert error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not save your suggestion. Please try again later." },
      { status: 500 },
    );
  }
}
