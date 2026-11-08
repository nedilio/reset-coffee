-- Esquema inicial replicado desde prod (inspeccionado en solo lectura).
-- Solo incluye lo que usa la app: public.users y el schema next_auth (@auth/supabase-adapter).
-- Nota: prod tiene RLS deshabilitado en estas tablas; se replica igual para que el comportamiento
-- local sea idéntico. Ver advisor "rls_disabled" antes de endurecerlo.

create extension if not exists "uuid-ossp" with schema extensions;

-- public.users -------------------------------------------------------------
create table public.users (
  id uuid not null default extensions.uuid_generate_v4(),
  name text,
  email text,
  "emailVerified" timestamptz,
  image text,
  role text not null default 'users',
  coffees smallint not null default 0,
  constraint users_pkey primary key (id),
  constraint email_unique unique (email)
);

-- next_auth schema ---------------------------------------------------------
create schema if not exists next_auth;
grant usage on schema next_auth to service_role;

create table next_auth.users (
  id uuid not null default extensions.uuid_generate_v4(),
  name text,
  email text,
  "emailVerified" timestamptz,
  image text,
  coffees integer not null default 0,
  role text not null default 'user',
  constraint users_pkey primary key (id),
  constraint email_unique unique (email)
);

create table next_auth.sessions (
  id uuid not null default extensions.uuid_generate_v4(),
  expires timestamptz not null,
  "sessionToken" text not null,
  "userId" uuid,
  constraint sessions_pkey primary key (id),
  constraint sessiontoken_unique unique ("sessionToken"),
  constraint "sessions_userId_fkey" foreign key ("userId")
    references next_auth.users (id) on delete cascade
);

create table next_auth.accounts (
  id uuid not null default extensions.uuid_generate_v4(),
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  oauth_token_secret text,
  oauth_token text,
  "userId" uuid,
  constraint accounts_pkey primary key (id),
  constraint provider_unique unique (provider, "providerAccountId"),
  constraint "accounts_userId_fkey" foreign key ("userId")
    references next_auth.users (id) on delete cascade
);

create table next_auth.verification_tokens (
  identifier text,
  token text not null,
  expires timestamptz not null,
  constraint verification_tokens_pkey primary key (token),
  constraint token_identifier_unique unique (token, identifier)
);

grant all on all tables in schema next_auth to service_role;
grant all on all sequences in schema next_auth to service_role;
