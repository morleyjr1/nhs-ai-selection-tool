# Feedback storage — setup

The feedback form writes submissions to a Postgres database. The tool owner
reviews collated feedback in the database directly — no email address is exposed
anywhere in the app. This is a one-time setup; the code is provider-agnostic and
needs only a `DATABASE_URL`.

## 1. Create a database (recommended: Supabase, UK/EU region)

Supabase is recommended because it gives a ready-made table viewer for reviewing
feedback, a free tier, and a UK/EU region for data residency.

1. Create a project at supabase.com. **Choose the London (eu-west-2) region** (or
   another EU region) so feedback data stays in the UK/EU.
2. In the SQL editor, run:

   ```sql
   create table if not exists feedback (
     id          bigint generated always as identity primary key,
     created_at  timestamptz not null default now(),
     type        text not null,
     message     text not null,
     page        text,
     user_agent  text
   );
   ```

3. Get the connection string: click the green **Connect** button at the top of
   the project dashboard, choose **Transaction pooler**, and copy the **URI**. It
   looks like:

   ```
   postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
   ```

   Replace `[YOUR-PASSWORD]` with your database password (set when you created the
   project; reset it under **Settings → Database → Reset database password** if
   needed). The `pooler` host and port `6543` confirm it's the transaction pooler
   — the right one for serverless. The code already sets `prepare: false` for it.

   Note: this is the **Postgres connection string**, not an API key. Supabase's
   "publishable" / "secret" API keys are for its REST/client SDK and are **not
   used** by this setup — you can ignore them.

(Neon or Vercel Postgres also work — just supply their connection string instead.)

## 2. Add the connection string to Vercel

In the Vercel project: **Settings → Environment Variables**, add:

- **Name:** `DATABASE_URL`
- **Value:** the connection string from step 1 (include the password)
- **Environments:** Production (and Preview if you want feedback there too)

Redeploy so the variable takes effect.

## 3. Give the owner access to review feedback

The form "passes feedback to the owner" by collating it in the database for
review. To let Jawad review it:

- Invite **jawad.chaudhry5@nhs.net** as a member of the Supabase project
  (Organisation → Members), then he can browse, filter, and **export CSV** from
  the **Table Editor → `feedback`**, or
- Periodically export the table to CSV and share it.

## Notes

- The form asks users not to include patient-identifiable information, and there
  is a hidden honeypot field plus a 5,000-character cap to limit spam.
- If `DATABASE_URL` is not set, the form fails gracefully with a clear message
  and nothing is stored.
- If you later want an email alert to the owner on each submission, that is a
  small add-on (a transactional email provider such as GOV.UK Notify, with the
  owner's address held only in a server-side environment variable).
