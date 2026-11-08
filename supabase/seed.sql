-- Datos falsos para desarrollo local. Nunca copiar clientes reales.
-- Los admins se definen por la variable ADMIN_EMAILS (ver .env.development.local), no por esta tabla;
-- el callback `session` sobrescribe `role` al iniciar sesión.
insert into public.users (name, email, role, coffees) values
  ('Cliente Cero',    'cliente0@example.com', 'users', 0),
  ('Cliente Uno',     'cliente1@example.com', 'users', 1),
  ('Cliente Cinco',   'cliente5@example.com', 'users', 5),
  ('Cliente Ocho',    'cliente8@example.com', 'users', 8),
  ('Cliente Nueve',   'cliente9@example.com', 'users', 9),
  ('Maria Gonzalez',  'maria@example.com',    'users', 3),
  ('Jose Perez',      'jose@example.com',     'users', 6),
  ('Barista Admin',   'admin@example.com',    'admin', 0);

-- Relleno para probar paginación, filtros y estados (0 a 9 cafés): 45 clientes más.
insert into public.users (name, email, role, coffees)
select
  'Cliente Demo ' || lpad(n::text, 2, '0'),
  'demo' || lpad(n::text, 2, '0') || '@example.com',
  'users',
  n % 10
from generate_series(1, 45) as n;
