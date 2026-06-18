// ---------------------------------------------------------------------------
// Feedback submission API route.
// POST /api/feedback
// Body: { type, message, page?, website? }   (website = honeypot, must be empty)
//
// Stores feedback in the database (see lib/feedback-db.ts). The tool owner
// reviews collated feedback directly in the database — no email address is
// exposed to the client. Requires DATABASE_URL.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { getSql, FEEDBACK_TYPES, type FeedbackType } from "../../../lib/feedback-db";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 5000;

interface FeedbackRequest {
  type?: string;
  message?: string;
  page?: string;
  /** Honeypot: real users leave this empty; bots tend to fill it. */
  website?: string;
}

export async function POST(req: NextRequest) {
  let body: FeedbackRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Honeypot: silently accept (pretend success) so bots don't retry.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const type = body.type;
  const message = (body.message ?? "").trim();

  if (!type || !FEEDBACK_TYPES.includes(type as FeedbackType)) {
    return NextResponse.json(
      { ok: false, error: "Please choose a valid feedback type." },
      { status: 400 },
    );
  }
  if (message.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Please enter some feedback." },
      { status: 400 },
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { ok: false, error: "Feedback is too long (5000 character maximum)." },
      { status: 400 },
    );
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Feedback storage is not configured. Add DATABASE_URL to the environment.",
      },
      { status: 503 },
    );
  }

  const page =
    typeof body.page === "string" ? body.page.slice(0, 500) : null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    await sql`
      insert into feedback (type, message, page, user_agent)
      values (${type}, ${message}, ${page}, ${userAgent})
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Feedback insert error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not save feedback. Please try again later." },
      { status: 500 },
    );
  }
}
