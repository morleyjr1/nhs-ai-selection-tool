// ---------------------------------------------------------------------------
// Feedback database layer.
//
// Provider-agnostic: connects via a single DATABASE_URL (Supabase, Neon, or
// Vercel Postgres all work). For Supabase, use the connection-pooler URL
// (port 6543, "transaction" mode) — prepare:false is required for pgbouncer.
//
// Schema (run once in your provider's SQL editor):
//   create table if not exists feedback (
//     id          bigint generated always as identity primary key,
//     created_at  timestamptz not null default now(),
//     type        text not null,
//     message     text not null,
//     page        text,
//     user_agent  text
//   );
//
// See docs/SETUP_FEEDBACK.md and docs/decisions/0003-feedback-form.md.
// ---------------------------------------------------------------------------

import postgres from "postgres";

// Module-scoped client, lazily created and reused across warm invocations.
let sql: ReturnType<typeof postgres> | null = null;

/**
 * Returns a Postgres client, or null if DATABASE_URL is not configured
 * (so callers can fail gracefully rather than crash).
 */
export function getSql(): ReturnType<typeof postgres> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sql) {
    sql = postgres(url, {
      prepare: false, // required for Supabase/pgbouncer transaction pooler
      max: 1, // serverless: keep the per-instance pool small
      idle_timeout: 20,
    });
  }
  return sql;
}

export const FEEDBACK_TYPES = [
  "bug",
  "suggestion",
  "content_correction",
  "general",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
