-- Keeps clients.updated_at current; the Wallet web service (passesUpdatedSince / Last-Modified) relies on it.
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
--> statement-breakpoint
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();
