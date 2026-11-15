-- Loyalty counters: lets the app tell a redeemed reward from a manual reset (pass notification
-- text) and gives PostHog lifetime stats per customer.
--
-- Rollback:
--   alter table public.users
--     drop column total_coffees, drop column rewards_redeemed, drop column last_coffee_at,
--     drop column reward_earned_at, drop column last_change;

alter table public.users
  add column total_coffees integer not null default 0,     -- paid coffees, lifetime
  add column rewards_redeemed integer not null default 0,  -- free coffees redeemed
  add column last_coffee_at timestamptz,                   -- last coffee added
  add column reward_earned_at timestamptz,                 -- when the card hit 9 (null = no reward pending)
  add column last_change text;                             -- added | removed | redeemed | restored | reset

-- Starting point for existing customers.
update public.users set total_coffees = coffees;
