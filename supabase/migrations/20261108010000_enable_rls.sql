-- Lock the tables for the public anon/authenticated roles.
-- No policies on purpose: the app only reads/writes through server code that uses the
-- service role key (BYPASSRLS), so anyone holding the anon key sees and changes nothing.
--
-- Rollback (instant): alter table <table> disable row level security;
alter table public.users enable row level security;
alter table next_auth.users enable row level security;
alter table next_auth.sessions enable row level security;
alter table next_auth.accounts enable row level security;
alter table next_auth.verification_tokens enable row level security;
