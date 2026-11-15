-- Apple Wallet: devices that installed a client's pass, and a timestamp to know when the
-- pass changed (PassKit web service "passesUpdatedSince" and Last-Modified).
--
-- Rollback:
--   drop table public.wallet_registrations;
--   drop trigger users_set_updated_at on public.users;
--   drop function public.set_updated_at();
--   alter table public.users drop column updated_at;

alter table public.users
  add column updated_at timestamptz not null default now();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create table public.wallet_registrations (
  device_library_id text not null,
  serial_number uuid not null references public.users (id) on delete cascade,
  push_token text not null,
  created_at timestamptz not null default now(),
  constraint wallet_registrations_pkey primary key (device_library_id, serial_number)
);

create index wallet_registrations_serial_idx
  on public.wallet_registrations (serial_number);

-- Same model as the other tables: only the service role (server code) can touch it.
alter table public.wallet_registrations enable row level security;
