# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Got Schooled** — a Hebrew (RTL) study-management web app for tracking university courses, schedules, files, grades, and deadlines. Single user per account; two real users (the developer and a friend). Deployment is automatic to Vercel on every push to `main`.

The full deployment runbook lives in [DEPLOY.md](DEPLOY.md) (Hebrew). It is the source of truth for Supabase setup, env vars, and Vercel/Resend wiring.

## Stack

- Vite 5 + React 18 + TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`)
- Tailwind 3 with a custom palette in [tailwind.config.js](tailwind.config.js) (`ink`, `cream`, `dot`, `paper`, `smoke`, etc. — DO NOT introduce ad-hoc hex colors)
- React Router v6 with **HashRouter** (matters for password-reset deep links — see `sendPasswordReset` in [src/lib/auth.tsx](src/lib/auth.tsx))
- Supabase JS client (Auth, Postgres, Realtime, Storage)
- Vercel serverless functions in [api/](api/) for the daily reminder cron
- Resend for transactional email

## Commands

```bash
npm run dev         # Vite dev server on :5173 (--host enabled for tablet testing on LAN)
npm run build       # Type-check (tsc -b across 3 tsconfigs) + Vite production build to dist/
npm run preview     # Serve the built dist/

# Manually trigger the reminder cron in production
curl https://YOUR-PROJECT.vercel.app/api/send-reminders
```

There is no test runner, no linter, and no formatter wired up. Build = `tsc -b && vite build`; rely on the TypeScript compiler for correctness.

The three tsconfig projects ([tsconfig.app.json](tsconfig.app.json), [tsconfig.node.json](tsconfig.node.json), [tsconfig.api.json](tsconfig.api.json)) split the browser app, the Vite/Node config, and the Vercel API routes — keep new files in the right one or `tsc -b` will silently skip them.

## Architecture

### Auth + first-run flow
[src/App.tsx](src/App.tsx) wraps everything in `AuthProvider` ([src/lib/auth.tsx](src/lib/auth.tsx)) and a `Gate` that swaps `<LoginPage>` for `<AuthenticatedApp>` based on `useAuth()`. Inside the authenticated tree, `<GuardedShell>` runs [useFirstRunGuard](src/hooks/useFirstRunGuard.ts), which forces:

1. `must_change_password=true` → `/change-password` (mandatory variant)
2. `bootstrapped=false` → `/settings` (until the user fills in institution + a year + semester + subjects)

Both flags live on `public.settings` and are auto-created for new users by a Supabase trigger. **Do not bypass this guard** — adding routes outside `<GuardedShell>` will let users land on a half-bootstrapped state.

### Data layer: `useTable` + Realtime
[src/lib/useRealtime.ts](src/lib/useRealtime.ts) defines `useTable<T>(table, fetcher, deps)` — every domain hook in [src/hooks/](src/hooks/) is built on it. It:
- runs the fetcher,
- subscribes to `postgres_changes` filtered by `user_id=eq.<auth.uid>`,
- re-fetches on any change,
- generates a unique channel name per call site via `useId` (multiple components subscribing to the same table must NOT share a channel — the comment in the file explains why).

When adding a new table, mirror this pattern: a hook in `src/hooks/`, a fetcher that filters by `user.id`, and the table name as the first argument. The migration must also add the table to `supabase_realtime` publication ([supabase/migrations/0002_enable_realtime.sql](supabase/migrations/0002_enable_realtime.sql)).

### Database + RLS
All tables live under `public.*` with RLS enforcing `auth.uid() = user_id`. Migrations in [supabase/migrations/](supabase/migrations/) are applied **manually via the Supabase SQL editor** — there is no migration runner. Number new files sequentially (`000N_description.sql`) and keep them idempotent (`create table if not exists`, `do $$ ... if not exists ...`).

The full schema is in [src/types/domain.ts](src/types/domain.ts). Keep TS types and SQL columns in lockstep — there is no codegen.

### File storage
Files go to the `user-files` Storage bucket at path `<user_id>/<file_id>`. RLS enforces that users can only touch their own folder. [src/hooks/useFiles.ts](src/hooks/useFiles.ts) is the canonical add/delete/download flow — note the rollback on insert failure (`storage.remove` if the DB insert fails) and the `RECENT_CAP=10` trim in `touchRecent`.

### Reminder cron (server-side)
[api/send-reminders.ts](api/send-reminders.ts) is a Vercel serverless function scheduled daily at 6:00 UTC by [vercel.json](vercel.json). It uses the **service role key** to bypass RLS and read all users' deadlines. Behaviour:
- one-time reminder → sets `reminder_sent_at`, never sends again
- recurring (`reminder_recurring_days != null`) → advances `reminder_email_at` forward (loops if multiple intervals were missed) and sets `reminder_sent_at`

`SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in any `VITE_*` var or in `src/`. Browser-side code only sees the anon key.

## Conventions

- The app is **Hebrew/RTL end-to-end**. `<html lang="he" dir="rtl">` is set in [index.html](index.html) and Tailwind logical properties (`me-*`, `ms-*`, `border-s-*`, `border-e-*`) are used instead of `mr/ml/border-l/border-r`. Keep it that way — physical properties will break the layout when mirrored.
- IDs come from [`newId()`](src/lib/ids.ts) (`nanoid(12)`), generated client-side and inserted with the row. Do not switch to DB-generated UUIDs — many tables use `text` PKs scoped by `(user_id, id)`.
- Routes are constructed via the `r` helpers in [src/lib/routes.ts](src/lib/routes.ts) — don't hand-build `/year/.../semester/...` paths in components.
- All reads/writes go through `supabase` from [src/lib/supabase.ts](src/lib/supabase.ts). Always filter by `user_id` even though RLS already enforces it (defense in depth + correct cache keys for `useTable`).
- The "current" semester is computed from date ranges by [`getCurrentSemester`](src/lib/progress.ts) — prefer that over reading `settings.current_semester_id` directly when displaying "what's happening now".

## Env vars

See [.env.example](.env.example). Two groups:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — browser-safe, required for `npm run dev`
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `RESEND_API_KEY` / `REMINDER_FROM` — server-only, used by the cron API route

`.env.local` is gitignored. In production, all four go into Vercel project env vars.
