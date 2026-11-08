# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (`pnpm-lock.yaml`).

- `pnpm dev` — start dev server (http://localhost:3000)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — `next lint`

There is no test suite configured.

## What this is

A coffee loyalty-card app for Reset Coffee (UI text is in Spanish). Customers sign in with Google and see a card of coffees; after `COFFEES_TO_EXCHANGE` (9, in `src/lib/constants.ts`) the next drink is free. Admins (baristas) search customers and add/reset/delete coffees.

Stack: Next.js 15 App Router, React 19, NextAuth v5 beta (Google), Supabase (Postgres), Tailwind + shadcn-style components (`components.json`, `src/components/ui`), PostHog analytics, deployed on Vercel (region `gru1`). Path alias `@/*` → `src/*`.

## Architecture

- **Auth & roles** (`src/auth.config.ts`, `src/auth.ts`, `src/middleware.ts`): all logic lives in `auth.config.ts`.
  - Admin status is a hardcoded `adminEmails` array — add/remove admins there. Roles are not read from the DB.
  - The `authorized` callback (run via middleware) handles redirects: logged-in `/` and `/login` → `/card`; admins hitting `/card` → `/admin`; unauthenticated `/admin` or `/card` → `/`.
  - The `session` callback has a side effect: on every session read it upserts/updates the user's row in the Supabase users table (name with accents stripped, image, role). This is how customers get rows on first login.
  - `src/app/types/next-auth.d.ts` augments the session with `user.role`.
- **Data access**: `src/clients.ts` (read queries: `getClients`, `countClients`, `getClientByEmail`) and `src/actions/coffees.ts` (server actions: `addCoffee`, `resetCoffee`, `deleteCoffee`, which `revalidatePath("/admin")`). Supabase is accessed via `createClient()` in `src/supabase-server.tsx` (SSR client with cookies, using `SUPABASE_ANON_KEY`). Types come from the generated `database.types.ts` at repo root. The table name comes from `TABLE_NAME` (`CLIENTS_TABLE` env var, default `users`), so use that constant rather than a literal.
- **Routes**: `src/app/(protected)/card` (customer view), `(protected)/admin` (admin table with `filter`/`page` search params, `CLIENTS_PER_PAGE` = 10), `login`, `resetqr` (static QR image). The admin page re-checks `session.user.role` server-side in addition to middleware.
- **Analytics**: PostHog client provider in `src/app/providers/ph-provider.tsx`; server events via `src/actions/ph-client.ts` (login, coffee_added); `CardView` fires `card_viewed`.

## Local database (dev without touching prod)

`pnpm dev` reads `.env.development.local` (gitignored), which overrides the Supabase vars in `.env.local` and points at the local Docker stack. Prod credentials stay in `.env.local`/Vercel.

- Start: `supabase start -x edge-runtime,realtime,storage-api,imgproxy,logflare,vector,mailpit,supavisor` (minimal stack: Postgres, REST, auth, Studio at http://127.0.0.1:54323). Needs Docker Desktop with a virtual disk limit well above 8 GB.
- Reset to migrations + `supabase/seed.sql` (fake users): `supabase db reset`
- Keys: `supabase status -o env` (ANON_KEY, SERVICE_ROLE_KEY, JWT_SECRET) → paste into `.env.development.local`; regenerate it if the stack is recreated.
- Schema source of truth is `supabase/migrations/` (public.users + `next_auth` schema, mirrored from prod, RLS off like prod). Add changes with `supabase migration new <name>`; never `supabase db push` to prod without review.
- Regenerate types: `supabase gen types typescript --local > database.types.ts`

## Environment

`.env.local` (not committed) is required: Supabase URL/anon key/service role key (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, NextAuth secret, PostHog keys, optional `CLIENTS_TABLE`.
