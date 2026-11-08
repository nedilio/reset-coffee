-- Datos falsos para desarrollo local. Nunca copiar clientes reales.
-- Los admins se definen por email en src/auth.config.ts (adminEmails), no por esta tabla;
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
