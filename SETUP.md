# ThiranX — Next.js + Supabase (full-stack, single project)

The Spring Boot backend has been fully replaced by Next.js API routes
under `app/api/**`, backed by Supabase Postgres. This is one deployable
app (frontend + backend together) — no separate backend service.

## 1. Install
npm install

## 2. Database
Run `supabase/schema.sql` in your Supabase project's SQL editor
(or `supabase db push` if using the CLI).

## 3. Environment
Copy the placeholders already in `.env.local` (or `.env.local.example`)
and fill in real values:
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API
- `JWT_SECRET` — any long random string (signs the app's own JWTs;
  this is custom auth, not Supabase Auth, so the existing frontend
  Bearer-token flow needed zero changes)
- `GEMINI_API_KEY` — Google AI Studio
- `GITHUB_TOKEN` — optional, raises the GitHub REST API rate limit

## 4. Run
npm run dev

Then: register → login → dashboard → generate a roadmap → try the
GitHub/LeetCode username links → AI Insights → Chat.

## Architecture notes
- Auth: custom JWT (bcrypt password hashes + jsonwebtoken), verified
  per-request in `lib/server/auth.ts`. Matches the old Spring Security
  JWT filter behavior exactly.
- DB access: `lib/server/supabaseAdmin.ts` uses the Supabase
  **service role** key, server-side only. RLS is enabled on every
  table with no policies, so it's a hard default-deny for any
  accidental client-side/anon access — the API routes are the only door in.
- AI: `lib/server/gemini.ts` calls the Gemini REST API directly
  (no SDK dependency) with the same retry + JSON-fallback behavior
  the old `GeminiService` had.
- IDs are Postgres `bigserial` numbers, matching the frontend's
  existing `number`-typed IDs — no type changes needed anywhere.
