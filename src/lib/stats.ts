import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// Owner stats for /admin/stats, read from card_events (written with every card change).
// Days are counted in the café's local time zone, set per deployment.
export const STATS_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? "America/Santiago";

// Net counts: an undone coffee ("removed") or an undone redemption ("restored") cancels the original.
const NET_COFFEES = sql`case type when 'added' then 1 when 'removed' then -1 else 0 end`;
const NET_REDEEMED = sql`case type when 'redeemed' then 1 when 'restored' then -1 else 0 end`;
const localDay = sql`(created_at at time zone ${STATS_TIMEZONE})::date`;
const today = sql`(now() at time zone ${STATS_TIMEZONE})::date`;
const shopFilter = (shop?: string | null) => (shop ? sql`and shop = ${shop}` : sql``);

const rows = async <T>(query: ReturnType<typeof sql>) =>
  (await db.execute(query)).rows as T[];

export type StatsSummary = {
  coffeesToday: number;
  coffees7d: number;
  coffees30d: number;
  redeemedToday: number;
  redeemed7d: number;
  redeemed30d: number;
  activeClients30d: number;
  newClients30d: number;
  totalClients: number;
  lifetimeCoffees: number;
  lifetimeRedeemed: number;
  // First recorded event: the stats only go back to when card_events was deployed.
  since: string | null;
};

export const getSummary = async (shop?: string | null): Promise<StatsSummary> => {
  const [events] = await rows<Omit<StatsSummary, "newClients30d" | "totalClients" | "lifetimeCoffees" | "lifetimeRedeemed" | "since">>(sql`
    select
      coalesce(sum(${NET_COFFEES}) filter (where ${localDay} = ${today}), 0)::int as "coffeesToday",
      coalesce(sum(${NET_COFFEES}) filter (where ${localDay} > ${today} - 7), 0)::int as "coffees7d",
      coalesce(sum(${NET_COFFEES}), 0)::int as "coffees30d",
      coalesce(sum(${NET_REDEEMED}) filter (where ${localDay} = ${today}), 0)::int as "redeemedToday",
      coalesce(sum(${NET_REDEEMED}) filter (where ${localDay} > ${today} - 7), 0)::int as "redeemed7d",
      coalesce(sum(${NET_REDEEMED}), 0)::int as "redeemed30d",
      count(distinct client_id) filter (where type = 'added')::int as "activeClients30d"
    from card_events
    where ${localDay} > ${today} - 30 ${shopFilter(shop)}
  `);
  // Clients are not tied to a shop, so these ignore the filter. Lifetime totals come from the
  // counters on clients, which predate card_events.
  const [clientStats] = await rows<{
    newClients30d: number;
    totalClients: number;
    lifetimeCoffees: number;
    lifetimeRedeemed: number;
  }>(sql`
    select
      count(*) filter (where (created_at at time zone ${STATS_TIMEZONE})::date > ${today} - 30)::int as "newClients30d",
      count(*)::int as "totalClients",
      coalesce(sum(total_coffees), 0)::int as "lifetimeCoffees",
      coalesce(sum(rewards_redeemed), 0)::int as "lifetimeRedeemed"
    from clients
  `);
  const [first] = await rows<{ since: string | null }>(sql`
    select to_char(min(${localDay}), 'YYYY-MM-DD') as since from card_events
  `);
  return { ...events, ...clientStats, since: first?.since ?? null };
};

// Net coffees per local day for the last `days` days, oldest first, with empty days as 0.
export const getDailyCoffees = async (shop?: string | null, days = 30) =>
  rows<{ day: string; coffees: number }>(sql`
    with days as (
      select generate_series(${today} - ${days - 1}::int, ${today}, interval '1 day')::date as day
    ),
    totals as (
      select ${localDay} as day, sum(${NET_COFFEES})::int as coffees
      from card_events
      where ${localDay} > ${today} - ${days}::int ${shopFilter(shop)}
      group by 1
    )
    select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(t.coffees, 0)::int as coffees
    from days d left join totals t on t.day = d.day
    order by d.day
  `);

export type Breakdown = { label: string | null; coffees: number; redeemed: number };

// Last 30 days by shop (label null = no shop recorded, e.g. a single-shop café).
export const getByShop = async () =>
  rows<Breakdown>(sql`
    select shop as label,
      sum(${NET_COFFEES})::int as coffees,
      sum(${NET_REDEEMED})::int as redeemed
    from card_events
    where ${localDay} > ${today} - 30
    group by shop
    order by coffees desc
  `);

// Last 30 days by barista (label null = the admin account was deleted).
export const getByAdmin = async (shop?: string | null) =>
  rows<Breakdown>(sql`
    select u.name as label, e.coffees, e.redeemed
    from (
      -- Aggregate first: "user" also has created_at, which would make the helpers ambiguous.
      select admin_id,
        sum(${NET_COFFEES})::int as coffees,
        sum(${NET_REDEEMED})::int as redeemed
      from card_events
      where ${localDay} > ${today} - 30 ${shopFilter(shop)}
      group by admin_id
    ) e
    left join "user" u on u.id = e.admin_id
    order by e.coffees desc
  `);
