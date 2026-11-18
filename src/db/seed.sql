-- Fake customers for local development. Never copy real customers here.
-- Admins are not customers: they live in the auth "user" table (seeded from ADMIN_EMAILS on first login).
insert into public.clients (name, email, coffees, total_coffees) values
  ('Cliente Cero',    'cliente0@example.com', 0, 0),
  ('Cliente Uno',     'cliente1@example.com', 1, 1),
  ('Cliente Cinco',   'cliente5@example.com', 5, 5),
  ('Cliente Ocho',    'cliente8@example.com', 8, 8),
  ('Cliente Nueve',   'cliente9@example.com', 9, 9),
  ('Maria Gonzalez',  'maria@example.com',    3, 3),
  ('Jose Perez',      'jose@example.com',     6, 6)
on conflict (email) do nothing;

-- Filler to try pagination, filters and states (0 to 9 coffees): 45 more customers.
insert into public.clients (name, email, coffees, total_coffees)
select
  'Cliente Demo ' || lpad(n::text, 2, '0'),
  'demo' || lpad(n::text, 2, '0') || '@example.com',
  n % 10,
  n % 10
from generate_series(1, 45) as n
on conflict (email) do nothing;
