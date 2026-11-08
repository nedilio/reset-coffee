# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (`pnpm-lock.yaml`).

- `pnpm dev` — start dev server (http://localhost:3000)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — `next lint`
- `pnpm typecheck` — `tsc --noEmit`

There is no test suite configured.

## What this is

A coffee loyalty-card app for Reset Coffee (UI text is in Spanish). Customers sign in with Google and see a card of coffees; after `COFFEES_TO_EXCHANGE` (9, in `src/lib/constants.ts`) the next drink is free. Admins (baristas) search customers and add/reset/delete coffees.

Stack: Next.js 15 App Router, React 19, NextAuth v5 beta (Google), Supabase (Postgres), Tailwind + shadcn-style components (`components.json`, `src/components/ui`), PostHog analytics, deployed on Vercel (region `gru1`). Path alias `@/*` → `src/*`.

## Architecture

- **Auth & roles** (`src/auth.config.ts`, `src/auth.ts`, `src/middleware.ts`): all logic lives in `auth.config.ts`.
  - Admin status is a hardcoded `adminEmails` array — add/remove admins there. Roles are not read from the DB.
  - The `authorized` callback (run via middleware) handles redirects: logged-in `/` and `/login` → `/card`; admins hitting `/card` → `/admin`; unauthenticated `/admin` or `/card` → `/`.
  - The `session` callback only sets `session.user.role` in memory (it runs on every `auth()` call, so keep it free of DB access). The client row in the users table is created/refreshed once per login in the `signIn` callback via `provisionClient` (`src/clients.ts`); `/card` re-creates it if it is missing (e.g. an admin deleted the client while their session was still valid).
  - Sessions use NextAuth's default database strategy (`next_auth` schema, `@auth/supabase-adapter`), so every `auth()` still costs one adapter query.
  - Server actions are public POST endpoints: each admin action must call `isAdmin()` from `src/lib/auth-guards.ts`.
  - `src/app/types/next-auth.d.ts` augments the session with `user.role`.
- **Data access**: `src/clients.ts` (read queries: `getClients`, `countClients`, `getClientByEmail`) and `src/actions/coffees.ts` (server actions: `addCoffee`, `resetCoffee`, `deleteCoffee`, which `revalidatePath("/admin")`). Supabase is accessed via `createClient()` in `src/supabase-server.tsx`, a server-only client that uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). RLS is enabled with no policies on `public.users` and the `next_auth` tables, so the anon key can read and write nothing: never use it for these tables and never import that file from a Client Component. Types come from the generated `database.types.ts` at repo root. The table name comes from `TABLE_NAME` (`CLIENTS_TABLE` env var, default `users`), so use that constant rather than a literal.
- **Routes**: `src/app/(protected)/card` (customer view), `(protected)/admin` (admin table with `filter`/`page` search params, `CLIENTS_PER_PAGE` = 10), `login`, `resetqr` (static QR image). The admin page re-checks `session.user.role` server-side in addition to middleware.
- **Analytics**: one PostHog project is shared by every environment, so every event carries `environment` (`production` | `preview` | `development`, from `NEXT_PUBLIC_APP_ENV` set in `next.config.mjs`); dashboards must filter on `environment = production`. Browser: `src/app/providers/ph-provider.tsx` (only inits if `NEXT_PUBLIC_POSTHOG_KEY` exists) and `CardView` (`card_viewed` + `identify` by email). Server: `captureServerEvent` in `src/actions/ph-client.ts` for `login`, `signup`, `coffee_added`, `reward_earned`, `reward_redeemed`, `coffee_reset`, `client_deleted`. It flushes with `after()` (Vercel freezes the function after responding) and talks straight to `https://us.i.posthog.com` (override with `POSTHOG_SERVER_HOST`); never use `NEXT_PUBLIC_POSTHOG_HOST` on the server, it is the browser proxy (`/analytics`) and hangs from Vercel until the 10 s timeout.

## Local database (dev without touching prod)

`pnpm dev` reads `.env.development.local` (gitignored), which overrides the Supabase vars in `.env.local` and points at the local Docker stack. Prod credentials stay in `.env.local`/Vercel.

- Start: `supabase start -x edge-runtime,realtime,storage-api,imgproxy,logflare,vector,mailpit,supavisor` (minimal stack: Postgres, REST, auth, Studio at http://127.0.0.1:54323). Needs Docker Desktop with a virtual disk limit well above 8 GB.
- Reset to migrations + `supabase/seed.sql` (fake users): `supabase db reset`
- Keys: `supabase status -o env` (ANON_KEY, SERVICE_ROLE_KEY, JWT_SECRET) → paste into `.env.development.local`; regenerate it if the stack is recreated.
- Schema source of truth is `supabase/migrations/` (public.users + `next_auth` schema, then `enable_rls`). Add changes with `supabase migration new <name>`. Prod has no migration history, so never `supabase db push` to prod (it would re-apply the initial schema): apply prod changes as reviewed SQL (`supabase db query --linked` after temporarily linking), then relink staging. Keep the CLI linked to staging (`supabase projects list`, check the `●`).
- Environments: prod = Vercel Production from `main` + Supabase `resetcoffee_prod` (Postgres 17). `develop` = Vercel Preview (Preview-scoped env vars for branch `develop`) + staging Supabase `resetcoffee_develop`. Flow: local, push `develop`, test the Preview, PR `develop` → `main`. Vercel builds with pnpm 11 (`packageManager` in `package.json`); check `pnpm install --frozen-lockfile` after resolving lockfile conflicts.
- Regenerate types: `supabase gen types typescript --local > database.types.ts`

## Environment

`.env.local` (not committed) is required: Supabase URL/anon key/service role key (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, NextAuth secret, PostHog keys, optional `CLIENTS_TABLE`.
